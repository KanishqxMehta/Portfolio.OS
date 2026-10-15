import { pool } from "@/lib/db";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

/**
 * The single source of truth for AI access limits. The public global limit
 * deliberately reserves two provider requests for operations outside the app.
 */
export const AI_USAGE_LIMITS = {
  resumeImportsPerDay: 1,
  textReplacementsPerDay: 5,
  requestsPerMinute: 5,
  providerRequestsPerDay: 20,
  providerRequestSafetyReserve: 2,
  busyCooldownSeconds: 300,
} as const;

export type AiUsageAction = "resume_import" | "text_replacement";
export type AiUsageOutcome = "succeeded" | "failed";

export type AiServiceAvailability = {
  available: boolean;
  resetsAt: string;
  reason?: "busy" | "daily_capacity";
};

type UsageRow = { count: number };
type GlobalUsageRow = { count: number; unavailableUntil: Date | null };
type UsageLimit = { limit: number };
type UsageSummaryRow = { action: AiUsageAction; count: number };

const ACTION_LIMITS: Record<AiUsageAction, UsageLimit> = {
  resume_import: { limit: AI_USAGE_LIMITS.resumeImportsPerDay },
  text_replacement: { limit: AI_USAGE_LIMITS.textReplacementsPerDay },
};

function nextUtcMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

function publicProviderRequestLimit(): number {
  return Math.max(
    0,
    AI_USAGE_LIMITS.providerRequestsPerDay - AI_USAGE_LIMITS.providerRequestSafetyReserve,
  );
}

function getAvailability(count: number, unavailableUntil: Date | null): AiServiceAvailability {
  const unavailableByProvider = Boolean(
    unavailableUntil && unavailableUntil.getTime() > Date.now(),
  );

  return {
    available: !unavailableByProvider && count < publicProviderRequestLimit(),
    resetsAt: count >= publicProviderRequestLimit() ? nextUtcMidnight() : unavailableByProvider ? unavailableUntil!.toISOString() : nextUtcMidnight(),
    ...((unavailableByProvider || count >= publicProviderRequestLimit()) ? {
      reason: count >= publicProviderRequestLimit() || unavailableUntil!.getTime() >= new Date(nextUtcMidnight()).getTime()
        ? "daily_capacity" as const : "busy" as const,
    } : {}),
  };
}

export function checkAiBurstLimit(userId: string, action: AiUsageAction) {
  return checkRateLimit(
    buildRateLimitKey(`ai:${action}`, userId),
    { limit: AI_USAGE_LIMITS.requestsPerMinute, windowMs: 60_000 },
  );
}

export async function getAiServiceAvailability(): Promise<AiServiceAvailability> {
  const result = await pool.query<GlobalUsageRow>(
    `SELECT count, "unavailableUntil"
     FROM "AiGlobalUsage"
     WHERE "usageDate" = CURRENT_DATE`,
  );

  const usage = result.rows[0];
  return getAvailability(usage?.count ?? 0, usage?.unavailableUntil ?? null);
}

/** Reserve each additional outbound call, including fallback models. */
export async function reserveAiProviderAttempt(): Promise<boolean> {
  const result = await pool.query<UsageRow>(
    `INSERT INTO "AiGlobalUsage" (id, "usageDate", count, "createdAt", "updatedAt")
     SELECT $1, CURRENT_DATE, 1, NOW(), NOW() WHERE $2 > 0
     ON CONFLICT ("usageDate") DO UPDATE
       SET count = "AiGlobalUsage".count + 1, "updatedAt" = NOW()
       WHERE "AiGlobalUsage".count < $2
         AND ("AiGlobalUsage"."unavailableUntil" IS NULL OR "AiGlobalUsage"."unavailableUntil" <= NOW())
     RETURNING count`,
    [crypto.randomUUID(), publicProviderRequestLimit()],
  );
  return result.rows.length > 0;
}

export async function getAiUsageSummary(userId: string) {
  const [usageResult, service] = await Promise.all([
    pool.query<UsageSummaryRow>(
      `SELECT action, count
       FROM "AiUsage"
       WHERE "userId" = $1 AND "usageDate" = CURRENT_DATE`,
      [userId],
    ),
    getAiServiceAvailability(),
  ]);

  const counts = new Map(usageResult.rows.map((row) => [row.action, row.count]));
  const resumeImportsUsed = counts.get("resume_import") ?? 0;
  const textReplacementsUsed = counts.get("text_replacement") ?? 0;

  return {
    resumeImport: {
      used: resumeImportsUsed,
      limit: AI_USAGE_LIMITS.resumeImportsPerDay,
      remaining: Math.max(0, AI_USAGE_LIMITS.resumeImportsPerDay - resumeImportsUsed),
    },
    textReplacement: {
      used: textReplacementsUsed,
      limit: AI_USAGE_LIMITS.textReplacementsPerDay,
      remaining: Math.max(0, AI_USAGE_LIMITS.textReplacementsPerDay - textReplacementsUsed),
    },
    service,
  };
}

export async function startAiUsage(
  userId: string,
  action: AiUsageAction,
  inputCharacters: number,
): Promise<
  | {
      allowed: true;
      eventId: string;
      limit: number;
      remaining: number;
      service: AiServiceAvailability;
    }
  | { allowed: false; reason: "user_quota"; limit: number; resetsAt: string }
  | { allowed: false; reason: "service_unavailable"; resetsAt: string; service: AiServiceAvailability }
> {
  const { limit } = ACTION_LIMITS[action];
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const globalUsageResult = await client.query<UsageRow>(
      `INSERT INTO "AiGlobalUsage" (id, "usageDate", count, "createdAt", "updatedAt")
       VALUES ($1, CURRENT_DATE, 1, NOW(), NOW())
       ON CONFLICT ("usageDate") DO UPDATE
         SET count = "AiGlobalUsage".count + 1, "updatedAt" = NOW()
         WHERE "AiGlobalUsage".count < $2
           AND ("AiGlobalUsage"."unavailableUntil" IS NULL OR "AiGlobalUsage"."unavailableUntil" <= NOW())
       RETURNING count`,
      [crypto.randomUUID(), publicProviderRequestLimit()],
    );

    if (globalUsageResult.rows.length === 0) {
      await client.query("ROLLBACK");
      const current = await client.query<GlobalUsageRow>('SELECT count, "unavailableUntil" FROM "AiGlobalUsage" WHERE "usageDate" = CURRENT_DATE');
      const service = getAvailability(current.rows[0]?.count ?? 0, current.rows[0]?.unavailableUntil ?? null);
      return { allowed: false, reason: "service_unavailable", resetsAt: service.resetsAt, service };
    }

    const usageResult = await client.query<UsageRow>(
      `INSERT INTO "AiUsage" (id, "userId", action, "usageDate", count, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, CURRENT_DATE, 1, NOW(), NOW())
       ON CONFLICT ("userId", action, "usageDate") DO UPDATE
         SET count = "AiUsage".count + 1, "updatedAt" = NOW()
         WHERE "AiUsage".count < $4
       RETURNING count`,
      [crypto.randomUUID(), userId, action, limit],
    );

    if (usageResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { allowed: false, reason: "user_quota", limit, resetsAt: nextUtcMidnight() };
    }

    const eventId = crypto.randomUUID();
    await client.query(
      `INSERT INTO "AiUsageEvent" (id, "userId", action, status, "inputCharacters", "createdAt")
       VALUES ($1, $2, $3, 'started', $4, NOW())`,
      [eventId, userId, action, inputCharacters],
    );
    await client.query("COMMIT");

    const count = usageResult.rows[0].count;
    return {
      allowed: true,
      eventId,
      limit,
      remaining: Math.max(0, limit - count),
      service: getAvailability(globalUsageResult.rows[0].count, null),
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Opens a daily circuit breaker when the AI provider reports its own quota.
 * This prevents subsequent users from reaching the same provider error.
 */
export async function markAiServiceUnavailable(busy = false): Promise<AiServiceAvailability> {
  const resetsAt = busy ? new Date(Date.now() + AI_USAGE_LIMITS.busyCooldownSeconds * 1000).toISOString() : nextUtcMidnight();
  await pool.query(
    `INSERT INTO "AiGlobalUsage" (id, "usageDate", count, "unavailableUntil", "createdAt", "updatedAt")
     VALUES ($1, CURRENT_DATE, 0, $2, NOW(), NOW())
     ON CONFLICT ("usageDate") DO UPDATE
       SET "unavailableUntil" = GREATEST("AiGlobalUsage"."unavailableUntil", EXCLUDED."unavailableUntil"), "updatedAt" = NOW()`,
    [crypto.randomUUID(), resetsAt],
  );

  return { available: false, resetsAt, reason: busy ? "busy" : "daily_capacity" };
}

export function isAiProviderBusyError(error: unknown): boolean {
  const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
  const message = error instanceof Error ? error.message : String(error);
  return status === 503 || /\b503\b|high\s*demand|"status"\s*:\s*"UNAVAILABLE"/i.test(message);
}

/** Refund personal quota exactly once; provider attempts remain counted. */
export async function refundFailedAiUsage(eventId: string, durationMs: number): Promise<void> {
  await pool.query(
    `WITH refunded AS (
       UPDATE "AiUsageEvent" SET status = 'failed_refunded', "durationMs" = $2
       WHERE id = $1 AND status = 'started'
       RETURNING "userId", action, "createdAt"
     )
     UPDATE "AiUsage" AS usage SET count = GREATEST(0, usage.count - 1), "updatedAt" = NOW()
     FROM refunded WHERE usage."userId" = refunded."userId" AND usage.action = refunded.action
       AND usage."usageDate" = refunded."createdAt"::date`,
    [eventId, durationMs],
  );
}

export function isAiProviderCapacityError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /(?:\b429\b|quota|resource[\s_-]*exhausted|rate[\s_-]*limit)/i.test(message);
}

export async function completeAiUsage(
  eventId: string,
  outcome: AiUsageOutcome,
  durationMs: number,
  outputCharacters?: number,
): Promise<void> {
  await pool.query(
    `UPDATE "AiUsageEvent"
     SET status = $1, "durationMs" = $2, "outputCharacters" = $3
     WHERE id = $4`,
    [outcome, durationMs, outputCharacters ?? null, eventId],
  );
}
