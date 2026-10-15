import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { query, limit, send, token } = vi.hoisted(() => ({ query: vi.fn(), limit: vi.fn(), send: vi.fn(), token: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { query } }));
vi.mock("@/lib/persistent-rate-limit", () => ({ checkPersistentRateLimit: limit }));
vi.mock("@/lib/mail", () => ({ sendPasswordResetEmail: send }));
vi.mock("@/lib/tokens", () => ({ generatePasswordResetToken: token }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "203.0.113.1" }) }));
import { reset } from "./reset";

describe("password reset protection", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("SMTP_HOST", "smtp.example.com");
    query.mockReset(); limit.mockReset(); send.mockReset(); token.mockReset();
    limit.mockResolvedValue({ allowed: true }); token.mockResolvedValue("test-token");
  });
  afterEach(() => vi.unstubAllEnvs());
  it("rejects throttled requests before looking up accounts or sending mail", async () => {
    limit.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    expect(await reset({ email: "person@example.com" })).toHaveProperty("error");
    expect(query).not.toHaveBeenCalled(); expect(send).not.toHaveBeenCalled();
  });
  it("returns an unavailable message without account lookup when production SMTP is missing", async () => {
    vi.stubEnv("SMTP_HOST", "");
    expect(await reset({ email: "person@example.com" })).toHaveProperty("error");
    expect(query).not.toHaveBeenCalled(); expect(token).not.toHaveBeenCalled();
  });
  it("invalidates the undelivered token and reports failure", async () => {
    query.mockResolvedValue({ rows: [{ passwordHash: "hash" }] }); send.mockResolvedValue(false);
    expect(await reset({ email: "person@example.com" })).toHaveProperty("error");
    expect(query).toHaveBeenLastCalledWith('DELETE FROM "PasswordResetToken" WHERE token = $1', ["test-token"]);
  });
  it("uses the same generic success message for delivered mail and unknown accounts", async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ passwordHash: "hash" }] });
    send.mockResolvedValue(true);
    const unknown = await reset({ email: "unknown@example.com" });
    const known = await reset({ email: "person@example.com" });
    expect(known).toEqual(unknown); expect(known).toHaveProperty("success");
  });
});
