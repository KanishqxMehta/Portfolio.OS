import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Get the portfolio ID for this slug
    const portfolioResult = await pool.query(
      'SELECT id FROM "Portfolio" WHERE "publicSlug" = $1',
      [slug]
    );

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const portfolioId = portfolioResult.rows[0].id;

    // We can generate a generic CUID for the page view
    // Or we can rely on Prisma later if we use it, but since we use pg directly here for speed:
    const cuid = require("crypto").randomBytes(12).toString("hex");

    await pool.query(
      'INSERT INTO "PageView" (id, "portfolioId", "createdAt") VALUES ($1, $2, NOW())',
      [cuid, portfolioId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record view:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
