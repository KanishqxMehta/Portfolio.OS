import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { slug, visitorSessionId } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!visitorSessionId) {
      return NextResponse.json({ error: "visitorSessionId is required" }, { status: 400 });
    }

    // Get the portfolio ID and owner userId for this slug
    const portfolioResult = await pool.query(
      'SELECT id, "userId" FROM "Portfolio" WHERE "publicSlug" = $1',
      [slug]
    );

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const portfolio = portfolioResult.rows[0];
    const portfolioId = portfolio.id;
    const ownerUserId = portfolio.userId;

    // Check if the current user is the owner of the portfolio
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (currentUserId && currentUserId === ownerUserId) {
      return NextResponse.json({ success: true, message: "Ignored self-view by owner" });
    }

    // Capture visitor country from Vercel header
    const visitorCountry = req.headers.get("x-vercel-ip-country") || null;

    // 1. Manage/Upsert the ProfileVisit record
    const visitCheckResult = await pool.query(
      'SELECT id, count, "visitorId" FROM "ProfileVisit" WHERE "portfolioId" = $1 AND "visitorSessionId" = $2',
      [portfolioId, visitorSessionId]
    );

    if (visitCheckResult.rows.length > 0) {
      const existingVisit = visitCheckResult.rows[0];
      const newCount = existingVisit.count + 1;
      
      // Update existing record: increment count, update lastSeen, capture country, and associate visitorId if logged in now
      const finalVisitorId = existingVisit.visitorId || currentUserId || null;
      await pool.query(
        `UPDATE "ProfileVisit"
         SET count = $1, "lastSeen" = NOW(), "visitorCountry" = $2, "visitorId" = $3
         WHERE id = $4`,
        [newCount, visitorCountry || existingVisit.visitorCountry, finalVisitorId, existingVisit.id]
      );
    } else {
      // Insert new ProfileVisit record
      const newVisitId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO "ProfileVisit" (id, "portfolioId", "visitorId", "visitorSessionId", count, "lastSeen", "createdAt", "visitorCountry")
         VALUES ($1, $2, $3, $4, 1, NOW(), NOW(), $5)`,
        [newVisitId, portfolioId, currentUserId || null, visitorSessionId, visitorCountry]
      );
    }

    // 2. Manage/Rate-limit PageView record (only insert if no view recorded from this session in last 2 hours)
    const recentViewResult = await pool.query(
      `SELECT id FROM "PageView"
       WHERE "portfolioId" = $1
         AND "visitorSessionId" = $2
         AND "createdAt" > NOW() - INTERVAL '2 hours'`,
      [portfolioId, visitorSessionId]
    );

    if (recentViewResult.rows.length === 0) {
      const newViewId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO "PageView" (id, "portfolioId", "visitorSessionId", "createdAt")
         VALUES ($1, $2, $3, NOW())`,
        [newViewId, portfolioId, visitorSessionId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record view:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
