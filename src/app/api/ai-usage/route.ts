import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiUsageSummary } from "@/lib/ai-usage";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await getAiUsageSummary(session.user.id));
  } catch (error: unknown) {
    console.error("AI_USAGE_GET_ERROR:", error);
    return NextResponse.json({ error: "Unable to load AI usage" }, { status: 500 });
  }
}
