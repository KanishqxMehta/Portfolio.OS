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
} as const;

export type AiUsageAction = "resume_import" | "text_replacement";
export type AiUsageOutcome = "succeeded" | "failed";

export type AiServiceAvailability = {
  available: boolean;
  resetsAt: string;
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
    resetsAt: nextUtcMidnight(),
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
  | { allowed: false; reason: "service_unavailable"; resetsAt: string }
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
      return { allowed: false, reason: "service_unavailable", resetsAt: nextUtcMidnight() };
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
export async function markAiServiceUnavailable(): Promise<AiServiceAvailability> {
  const resetsAt = nextUtcMidnight();
  await pool.query(
    `INSERT INTO "AiGlobalUsage" (id, "usageDate", count, "unavailableUntil", "createdAt", "updatedAt")
     VALUES ($1, CURRENT_DATE, 0, $2, NOW(), NOW())
     ON CONFLICT ("usageDate") DO UPDATE
       SET "unavailableUntil" = EXCLUDED."unavailableUntil", "updatedAt" = NOW()`,
    [crypto.randomUUID(), resetsAt],
  );

  return { available: false, resetsAt };
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
