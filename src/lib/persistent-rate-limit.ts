import { createHash } from "node:crypto";
import { pool } from "@/lib/db";
import type { RateLimitOptions, RateLimitResult } from "@/lib/rate-limit";

/** Atomic across server instances; identifiers are hashed to avoid storing PII. */
export async function checkPersistentRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const keyHash = createHash("sha256").update(key).digest("hex");
  const result = await pool.query<{ count: number; retryAfterSeconds: number }>(
    `INSERT INTO "RateLimitBucket" (key, count, "resetAt")
     VALUES ($1, 1, NOW() + $2 * INTERVAL '1 millisecond')
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
                    ELSE LEAST("RateLimitBucket".count + 1, $3 + 1) END,
       "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= NOW()
                        THEN NOW() + $2 * INTERVAL '1 millisecond'
                        ELSE "RateLimitBucket"."resetAt" END
     RETURNING count, CEIL(EXTRACT(EPOCH FROM ("resetAt" - NOW())))::int AS "retryAfterSeconds"`,
    [keyHash, options.windowMs, options.limit],
  );
  const row = result.rows[0];
  return row.count <= options.limit
    ? { allowed: true }
    : { allowed: false, retryAfterSeconds: Math.max(1, row.retryAfterSeconds) };
}
