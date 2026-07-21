import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/api/rate-limit-response";

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`search:${clientIp}`, {
    limit: 30,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit);
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  try {
    let queryText = `
      SELECT "publicSlug", content, "updatedAt"
      FROM "Portfolio"
      WHERE "isPublished" = true
    `;
    const params: any[] = [];

    if (q) {
      queryText += `
        AND (
          "publicSlug" ILIKE $1
          OR content::text ILIKE $1
        )
      `;
      params.push(`%${q}%`);
    }

    queryText += ` ORDER BY "updatedAt" DESC LIMIT 24`;

    const result = await pool.query(queryText, params);

    const portfolios = result.rows.map((row) => {
      const content = row.content || {};
      const sections = content.sections || [];
      const hero = sections.find((s: any) => s.type === "HERO");
      const skillsSection = sections.find((s: any) => s.type === "SKILLS");

      return {
        publicSlug: row.publicSlug,
        fullName: hero?.content?.fullName || row.publicSlug,
        bio: hero?.content?.bio || "",
        skills: skillsSection?.content?.items || [],
        theme: content.theme || "classic",
        updatedAt: row.updatedAt,
      };
    });

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
