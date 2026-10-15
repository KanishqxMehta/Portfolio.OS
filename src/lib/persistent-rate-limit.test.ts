import { beforeEach, describe, expect, it, vi } from "vitest";
const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { query } }));
import { checkPersistentRateLimit } from "./persistent-rate-limit";

describe("persistent rate limiting", () => {
  beforeEach(() => { query.mockReset(); });
  it("allows requests within the shared counter and hashes identifiers", async () => {
    query.mockResolvedValue({ rows: [{ count: 3, retryAfterSeconds: 60 }] });
    expect(await checkPersistentRateLimit("login:email:person@example.com", { limit: 3, windowMs: 60_000 })).toEqual({ allowed: true });
    expect(query.mock.calls[0][1][0]).toMatch(/^[a-f0-9]{64}$/);
    expect(query.mock.calls[0][0]).toContain("ON CONFLICT (key) DO UPDATE");
  });
  it("blocks requests above the shared counter", async () => {
    query.mockResolvedValue({ rows: [{ count: 4, retryAfterSeconds: 32 }] });
    expect(await checkPersistentRateLimit("key", { limit: 3, windowMs: 60_000 })).toEqual({ allowed: false, retryAfterSeconds: 32 });
  });
  it("fails closed if the database is unavailable", async () => {
    query.mockRejectedValue(new Error("Database unavailable"));
    await expect(checkPersistentRateLimit("key", { limit: 3, windowMs: 60_000 })).rejects.toThrow("Database unavailable");
  });
});
