import { afterAll, describe, expect, it } from "vitest";
import { pool } from "./db";
import { checkPersistentRateLimit } from "./persistent-rate-limit";
import { reserveAiProviderAttempt, startAiUsage, refundFailedAiUsage, getAiServiceAvailability, markAiServiceUnavailable } from "./ai-usage";

// Explicitly opt into a disposable database; never run destructive fixtures on development data.
const enabled = process.env.RUN_DB_TESTS === "1" && process.env.DATABASE_URL?.endsWith("/portfolio_verification");
describe.skipIf(!enabled)("PostgreSQL protection integration", () => {
  const ids = Array.from({ length: 4 }, () => crypto.randomUUID());
  afterAll(async () => {
    await pool.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [ids]);
    await pool.end();
  });
  it("enforces a shared limit under concurrent requests and resets expired windows", async () => {
    const key = `integration:${crypto.randomUUID()}`;
    const results = await Promise.all(Array.from({ length: 12 }, () => checkPersistentRateLimit(key, { limit: 3, windowMs: 60_000 })));
    expect(results.filter((result) => result.allowed)).toHaveLength(3);
    const { createHash } = await import("node:crypto");
    await pool.query('UPDATE "RateLimitBucket" SET "resetAt" = NOW() - INTERVAL \'1 second\' WHERE key = $1', [createHash("sha256").update(key).digest("hex")]);
    expect((await checkPersistentRateLimit(key, { limit: 3, windowMs: 60_000 })).allowed).toBe(true);
  });
  it("admits only one concurrent operation into the final provider slot", async () => {
    for (const id of ids) await pool.query('INSERT INTO "User" (id, email, username, "updatedAt") VALUES ($1, $2, $1, NOW())', [id, `${id}@example.test`]);
    await pool.query('INSERT INTO "AiGlobalUsage" (id, "usageDate", count, "updatedAt") VALUES ($1, CURRENT_DATE, 17, NOW()) ON CONFLICT ("usageDate") DO UPDATE SET count = 17, "unavailableUntil" = NULL', [crypto.randomUUID()]);
    const results = await Promise.all(ids.map((id) => startAiUsage(id, "resume_import", 100)));
    expect(results.filter((result) => result.allowed)).toHaveLength(1);
    expect((await pool.query('SELECT count FROM "AiGlobalUsage" WHERE "usageDate" = CURRENT_DATE')).rows[0].count).toBe(18);
    expect((await pool.query('SELECT SUM(count)::int AS count FROM "AiUsage" WHERE "userId" = ANY($1::text[])', [ids])).rows[0].count).toBe(1);
    expect(await reserveAiProviderAttempt()).toBe(false);
    const allowed = results.find((result) => result.allowed);
    if (!allowed?.allowed) throw new Error("No admitted operation");
    await Promise.all([refundFailedAiUsage(allowed.eventId, 100), refundFailedAiUsage(allowed.eventId, 100)]);
    expect((await pool.query('SELECT SUM(count)::int AS count FROM "AiUsage" WHERE "userId" = ANY($1::text[])', [ids])).rows[0].count).toBe(0);
    expect((await pool.query('SELECT count FROM "AiGlobalUsage" WHERE "usageDate" = CURRENT_DATE')).rows[0].count).toBe(18);
    await pool.query('DELETE FROM "AiGlobalUsage" WHERE "usageDate" = CURRENT_DATE');
  });
  it("recovers automatically after a short busy cooldown", async () => {
    const busy = await markAiServiceUnavailable(true);
    expect(busy.reason).toBe("busy");
    expect((await getAiServiceAvailability()).available).toBe(false);
    await pool.query('UPDATE "AiGlobalUsage" SET "unavailableUntil" = NOW() - INTERVAL \'1 second\' WHERE "usageDate" = CURRENT_DATE');
    expect((await getAiServiceAvailability()).available).toBe(true);
    await pool.query('DELETE FROM "AiGlobalUsage" WHERE "usageDate" = CURRENT_DATE');
  });
});
