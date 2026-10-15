import { NextResponse } from "next/server";

export function aiQuotaExceededResponse(limit: number, resetsAt: string) {
  return NextResponse.json(
    {
      code: "AI_QUOTA_EXCEEDED",
      error: `You've reached today's limit of ${limit} AI request${limit === 1 ? "" : "s"}. Please try again tomorrow.`,
      limit,
      resetsAt,
    },
    { status: 429 }
  );
}

export function aiServiceUnavailableResponse(resetsAt: string, reason?: "busy" | "daily_capacity") {
  return NextResponse.json(
    {
      code: reason === "busy" ? "AI_SERVICE_BUSY" : "AI_SERVICE_UNAVAILABLE",
      error: reason === "busy" ? "AI is busy right now. Please try again in a few minutes." : "AI features are temporarily unavailable. Please try again tomorrow.",
      resetsAt,
      reason,
    },
    { status: 503, headers: { "Retry-After": String(Math.max(1, Math.ceil((new Date(resetsAt).getTime() - Date.now()) / 1000))) } },
  );
}
