import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { ENGAGEMENT_LABELS, getEngagementTargets } from "@/lib/engagement";
import { checkPersistentRateLimit } from "@/lib/persistent-rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/api/rate-limit-response";
import type { PublicPortfolioContent } from "@/lib/public-portfolio";

const EventSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1).max(100),
  visitorSessionId: z.uuid(),
  action: z.enum(Object.keys(ENGAGEMENT_LABELS) as [keyof typeof ENGAGEMENT_LABELS, ...Array<keyof typeof ENGAGEMENT_LABELS>]),
  projectId: z.string().max(200).optional(),
  target: z.enum(["github", "linkedin", "instagram", "twitter", "phone", "email"]).optional(),
}).strict();

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkPersistentRateLimit(`engagement:${getClientIp(request)}`, { limit: 120, windowMs: 60_000 });
    if (!limit.allowed) return rateLimitExceededResponse(limit);
    if (Number(request.headers.get("content-length")) > 2048) return NextResponse.json({ error: "Event too large" }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2048) {
        await reader.cancel();
        return NextResponse.json({ error: "Event too large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    let payload: unknown;
    try { payload = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid event" }, { status: 400 }); }
    const parsed = EventSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    const event = parsed.data;
    const result = await pool.query<{ id: string; userId: string; content: PublicPortfolioContent }>(
      'SELECT id, "userId", content FROM "Portfolio" WHERE "publicSlug" = $1', [event.slug],
    );
    const portfolio = result.rows[0];
    if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    const allowed = getEngagementTargets(portfolio.content, event.slug).some((item) =>
      item.action === event.action && item.projectId === event.projectId && item.target === event.target,
    );
    if (!allowed) return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    const session = await auth();
    if (session?.user?.id === portfolio.userId) return NextResponse.json({ success: true });
    // Anonymous, portfolio-scoped identifier; no email, IP, or destination URL is stored.
    const visitorHash = createHash("sha256").update(`${portfolio.id}:${event.visitorSessionId}`).digest("hex");
    await pool.query(
      `INSERT INTO "PortfolioAction" (id, "portfolioId", action, "projectId", target, "visitorHash")
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [event.id, portfolio.id, event.action, event.projectId ?? null, event.target ?? null, visitorHash],
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to record portfolio action:", error);
    return NextResponse.json({ error: "Analytics temporarily unavailable" }, { status: 503 });
  }
}
