import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientIp,
  resetRateLimitStore,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
  afterEach(() => {
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = buildRateLimitKey("signup", "1.2.3.4");

    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const key = buildRateLimitKey("contact", "1.2.3.4");
    const options = { limit: 2, windowMs: 60_000 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(true);

    const blocked = checkRateLimit(key, options);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("resets the window after it expires", () => {
    vi.useFakeTimers();
    const key = buildRateLimitKey("views", "1.2.3.4");
    const options = { limit: 1, windowMs: 1_000 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(checkRateLimit(key, options).allowed).toBe(true);
  });

  it("extracts the first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 70.41.3.18" },
    });

    expect(getClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip or unknown", () => {
    const realIpReq = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.10" },
    });
    expect(getClientIp(realIpReq)).toBe("198.51.100.10");

    expect(getClientIp(new Request("http://localhost"))).toBe("unknown");
  });
});
