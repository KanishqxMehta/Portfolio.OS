import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { generate, construct, reserve, start, complete } = vi.hoisted(() => ({ generate: vi.fn(), construct: vi.fn(), reserve: vi.fn(), start: vi.fn(), complete: vi.fn() }));
const { refund, report } = vi.hoisted(() => ({ refund: vi.fn(), report: vi.fn() }));
vi.mock("@/lib/error-logger", () => ({ captureException: report }));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class { models = { generateContent: generate }; constructor(options: unknown) { construct(options); } },
  Type: { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY" },
}));
vi.mock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "user" } }) }));
vi.mock("@/lib/ai-usage", () => ({
  checkAiBurstLimit: () => ({ allowed: true }), startAiUsage: start, completeAiUsage: complete,
  refundFailedAiUsage: refund,
  reserveAiProviderAttempt: reserve,
  getAiServiceAvailability: async () => ({ available: true, resetsAt: "tomorrow" }),
  isAiProviderCapacityError: (error: Error) => /quota|429/.test(error.message),
  isAiProviderBusyError: (error: Error) => /503/.test(error.message),
  markAiServiceUnavailable: async (busy: boolean) => ({ available: false, resetsAt: new Date(Date.now() + 300_000).toISOString(), reason: busy ? "busy" : "daily_capacity" }),
}));
import { POST as parse } from "@/app/api/parse-resume/route";
import { POST as enhance } from "@/app/api/enhance-text/route";

describe.each([["parser", parse], ["enhancer", enhance]] as const)("%s provider accounting", (_name, post) => {
  beforeEach(() => {
    vi.resetAllMocks(); vi.stubEnv("GEMINI_API_KEY", "fake-key"); vi.useFakeTimers();
    start.mockResolvedValue({ allowed: true, eventId: "event", remaining: 0, limit: 1 });
    complete.mockResolvedValue(undefined); reserve.mockResolvedValue(true);
    refund.mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  const request = () => new Request("http://localhost/api/ai", { method: "POST", body: JSON.stringify({ text: "resume", type: "project" }) });
  it("refunds a busy failure and returns a short cooldown without a Sentry error", async () => {
    generate.mockRejectedValueOnce(new Error("503 high demand"));
    const response = await post(request());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("AI_SERVICE_BUSY");
    expect(refund).toHaveBeenCalledOnce(); expect(report).not.toHaveBeenCalled();
  });
  it("reports unexpected failures with safe metadata and refunds personal quota", async () => {
    generate.mockRejectedValue(new Error("Private resume content must not be reported"));
    expect((await post(request())).status).toBe(500);
    expect(refund).toHaveBeenCalledOnce(); expect(report).toHaveBeenCalledOnce();
    expect(report.mock.calls[0][0].message).not.toContain("Private resume");
  });
  it("budgets the fallback and disables SDK retries", async () => {
    generate.mockRejectedValueOnce(new Error("Model unavailable")).mockResolvedValueOnce({ text: '{"name":"Test"}' });
    expect((await post(request())).status).toBe(200);
    expect(generate).toHaveBeenCalledTimes(2); expect(reserve).toHaveBeenCalledTimes(1);
    expect(construct).toHaveBeenCalledWith(expect.objectContaining({ httpOptions: expect.objectContaining({ retryOptions: { attempts: 1 } }) }));
  });
  it("never sends a fallback request if the shared budget is exhausted", async () => {
    generate.mockRejectedValueOnce(new Error("Model unavailable")); reserve.mockResolvedValueOnce(false);
    const response = await post(request());
    expect(response.status).toBe(503); expect((await response.json()).code).toBe("AI_SERVICE_UNAVAILABLE");
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it("stops immediately on provider quota exhaustion", async () => {
    generate.mockRejectedValueOnce(new Error("429 quota exceeded"));
    expect((await post(request())).status).toBe(503);
    expect(generate).toHaveBeenCalledTimes(1); expect(reserve).not.toHaveBeenCalled();
  });
});
