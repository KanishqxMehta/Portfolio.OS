import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { portfolioSchema } from "@/lib/validations/portfolio";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = portfolioSchema.parse(json);

    // Check slug ownership — only allow overwriting own portfolio
    const existing = await pool.query(
      'SELECT id, "userId" FROM "Portfolio" WHERE "publicSlug" = $1',
      [body.username]
    );

    if (existing.rows.length > 0 && existing.rows[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: "This username is already taken by another user" },
        { status: 409 }
      );
    }

    const contentJSON = JSON.stringify(body.content);
    const isPublicOnSearch = body.isPublicOnSearch ?? false;

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE "Portfolio" SET content = $1::jsonb, "isPublicOnSearch" = $2, "updatedAt" = NOW()
         WHERE "publicSlug" = $3
         RETURNING id, content, "publicSlug", "userId", "isPublicOnSearch"`,
        [contentJSON, isPublicOnSearch, body.username]
      );
    } else {
      const id = crypto.randomUUID();
      result = await pool.query(
        `INSERT INTO "Portfolio" (id, content, "publicSlug", "userId", "isPublicOnSearch", "createdAt", "updatedAt")
         VALUES ($1, $2::jsonb, $3, $4, $5, NOW(), NOW())
         RETURNING id, content, "publicSlug", "userId", "isPublicOnSearch"`,
        [id, contentJSON, body.username, session.user.id, isPublicOnSearch]
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("PORTFOLIO_POST_ERROR:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      'SELECT id, content, "publicSlug", "userId", "isPublicOnSearch" FROM "Portfolio" WHERE "userId" = $1 LIMIT 1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("PORTFOLIO_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    if (typeof json.isPublicOnSearch !== "boolean") {
      return NextResponse.json(
        { error: "isPublicOnSearch must be a boolean" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE "Portfolio"
       SET "isPublicOnSearch" = $1, "updatedAt" = NOW()
       WHERE "userId" = $2
       RETURNING id, "publicSlug", "isPublicOnSearch"`,
      [json.isPublicOnSearch, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("PORTFOLIO_PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

