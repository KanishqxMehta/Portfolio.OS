import { beforeEach, describe, expect, it, vi } from "vitest";
const { state, limit, query, verify } = vi.hoisted(() => ({ state: { authorize: undefined as unknown }, limit: vi.fn(), query: vi.fn(), verify: vi.fn() }));
vi.mock("next-auth", () => ({ default: (config: { providers: Array<{ authorize: unknown }> }) => { state.authorize = config.providers[0].authorize; return {}; } }));
vi.mock("next-auth/providers/credentials", () => ({ default: (config: unknown) => config }));
vi.mock("@/lib/db", () => ({ pool: { query } }));
vi.mock("@/lib/persistent-rate-limit", () => ({ checkPersistentRateLimit: limit }));
vi.mock("argon2", () => ({ verify }));
import "./auth";

describe("login throttling", () => {
  const authorize = (credentials: unknown) => (state.authorize as (credentials: unknown, request: Request) => Promise<unknown>)(credentials, new Request("http://localhost/login"));
  beforeEach(() => { vi.clearAllMocks(); limit.mockResolvedValue({ allowed: true }); });
  it("rejects malformed credentials before accessing the database", async () => {
    expect(await authorize({})).toBeNull(); expect(query).not.toHaveBeenCalled();
  });
  it("stops an IP-limited login before checking credentials", async () => {
    limit.mockResolvedValueOnce({ allowed: false });
    expect(await authorize({ email: "a@example.com", password: "password" })).toBeNull();
    expect(query).not.toHaveBeenCalled(); expect(verify).not.toHaveBeenCalled();
  });
  it("stops an account-limited login before checking the password", async () => {
    limit.mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false });
    expect(await authorize({ email: "a@example.com", password: "password" })).toBeNull(); expect(query).not.toHaveBeenCalled();
  });
  it("allows normal login and normalizes the email", async () => {
    query.mockResolvedValue({ rows: [{ id: "user", email: "a@example.com", username: "person", passwordHash: "hash" }] });
    verify.mockResolvedValue(true);
    expect(await authorize({ email: " A@example.com ", password: "password" })).toMatchObject({ id: "user" });
    expect(query).toHaveBeenCalledWith(expect.any(String), ["a@example.com"]);
  });
});
