import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), auth: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { query: mocks.query } }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/persistent-rate-limit", () => ({ checkPersistentRateLimit: mocks.limit }));
import { POST } from "@/app/api/engagement/route";

describe("engagement endpoint", () => {
  const event = () => ({ id: crypto.randomUUID(), slug: "jane", visitorSessionId: crypto.randomUUID(), action: "project_open", projectId: "p1" });
  const request = (data: unknown, origin = "http://localhost") => new Request("http://localhost/api/engagement", { method: "POST", headers: { origin }, body: JSON.stringify(data) });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limit.mockResolvedValue({ allowed: true });
    mocks.auth.mockResolvedValue(null);
    mocks.query.mockResolvedValue({ rows: [{ id: "portfolio", userId: "owner", content: { sections: [{ type: "PROJECTS", content: { items: [{ id: "p1", caseStudy: { problem: "A problem" } }] } }] } }] });
  });
  it("records only allowlisted action fields and a hashed session", async () => {
    const data = event();
    expect((await POST(request(data))).status).toBe(200);
    const [sql, params] = mocks.query.mock.calls[1];
    expect(sql).toContain("ON CONFLICT (id) DO NOTHING");
    expect(params).toEqual([data.id, "portfolio", "project_open", "p1", null, expect.stringMatching(/^[a-f0-9]{64}$/)]);
    expect(JSON.stringify(params)).not.toContain(data.visitorSessionId);
  });
  it("ignores owner actions", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "owner" } });
    expect((await POST(request(event()))).status).toBe(200);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });
  it("rejects hidden or nonexistent actions, invalid events and cross-origin requests", async () => {
    expect((await POST(request({ ...event(), projectId: "hidden" }))).status).toBe(400);
    expect((await POST(request({ ...event(), action: "arbitrary" }))).status).toBe(400);
    expect((await POST(request({ ...event(), href: "https://attacker.test" }))).status).toBe(400);
    expect((await POST(request(event(), "https://attacker.test"))).status).toBe(403);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });
  it("enforces rate limits before recording", async () => {
    mocks.limit.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    const response = await POST(request(event()));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON and oversized payloads", async () => {
    expect((await POST(new Request("http://localhost/api/engagement", { method: "POST", body: "{" }))).status).toBe(400);
    expect((await POST(request({ ...event(), slug: "x".repeat(3000) }))).status).toBe(413);
  });
});
