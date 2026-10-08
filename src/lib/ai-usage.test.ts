import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/rate-limit";

const { query, connect, transactionQuery, release } = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  transactionQuery: vi.fn(),
  release: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  pool: { query, connect },
}));

import {
  AI_USAGE_LIMITS,
  checkAiBurstLimit,
  completeAiUsage,
  getAiServiceAvailability,
  getAiUsageSummary,
  markAiServiceUnavailable,
  startAiUsage,
} from "./ai-usage";

describe("AI usage protection", () => {
  beforeEach(() => {
    query.mockReset();
    connect.mockReset();
    transactionQuery.mockReset();
    release.mockReset();
    connect.mockResolvedValue({ query: transactionQuery, release });
    resetRateLimitStore();
  });

  it("keeps user and provider limits in one central configuration object", () => {
    expect(AI_USAGE_LIMITS).toMatchObject({
      resumeImportsPerDay: 1,
      textReplacementsPerDay: 5,
      requestsPerMinute: 5,
      providerRequestsPerDay: 20,
      providerRequestSafetyReserve: 2,
    });
  });

  it("reserves global and user capacity together before calling the provider", async () => {
    transactionQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await startAiUsage("user-1", "resume_import", 3200);

    expect(result).toMatchObject({
      allowed: true,
      limit: AI_USAGE_LIMITS.resumeImportsPerDay,
      remaining: 0,
      service: { available: true },
    });
    expect(transactionQuery).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(transactionQuery).toHaveBeenNthCalledWith(5, "COMMIT");
    expect(release).toHaveBeenCalledOnce();
  });

  it("keeps the provider safety reserve by rejecting the public request limit", async () => {
    transactionQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(startAiUsage("user-1", "resume_import", 3200)).resolves.toMatchObject({
      allowed: false,
      reason: "service_unavailable",
    });
    expect(transactionQuery).toHaveBeenNthCalledWith(3, "ROLLBACK");
    expect(transactionQuery).toHaveBeenCalledTimes(3);
  });

  it("rolls back the global reservation when the user has exhausted their own quota", async () => {
    transactionQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 4 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(startAiUsage("user-1", "resume_import", 3200)).resolves.toMatchObject({
      allowed: false,
      reason: "user_quota",
      limit: AI_USAGE_LIMITS.resumeImportsPerDay,
    });
    expect(transactionQuery).toHaveBeenNthCalledWith(4, "ROLLBACK");
  });

  it("reports global service availability without exposing provider usage counts", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: 18, unavailableUntil: null }] });

    await expect(getAiServiceAvailability()).resolves.toMatchObject({ available: false });
  });

  it("opens the daily service circuit breaker after a provider capacity error", async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await expect(markAiServiceUnavailable()).resolves.toMatchObject({ available: false });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "AiGlobalUsage"'),
      expect.any(Array),
    );
  });

  it("applies the per-user burst limit separately from daily quotas", () => {
    for (let request = 0; request < AI_USAGE_LIMITS.requestsPerMinute; request += 1) {
      expect(checkAiBurstLimit("user-1", "text_replacement").allowed).toBe(true);
    }

    expect(checkAiBurstLimit("user-1", "text_replacement").allowed).toBe(false);
  });

  it("records the final outcome and metrics for an AI request", async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await completeAiUsage("event-1", "succeeded", 450, 120);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE "AiUsageEvent"'),
      ["succeeded", 450, 120, "event-1"],
    );
  });

  it("returns personal quota and service availability for the editor UI", async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          { action: "resume_import", count: 1 },
          { action: "text_replacement", count: 2 },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ count: 3, unavailableUntil: null }] });

    await expect(getAiUsageSummary("user-1")).resolves.toMatchObject({
      resumeImport: { used: 1, limit: 1, remaining: 0 },
      textReplacement: { used: 2, limit: 5, remaining: 3 },
      service: { available: true },
    });
  });
});
