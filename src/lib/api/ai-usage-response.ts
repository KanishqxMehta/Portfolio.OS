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

export function aiServiceUnavailableResponse(resetsAt: string) {
  return NextResponse.json(
    {
      code: "AI_SERVICE_UNAVAILABLE",
      error: "AI features are temporarily unavailable. Please try again tomorrow.",
      resetsAt,
    },
    { status: 503 },
  );
}
