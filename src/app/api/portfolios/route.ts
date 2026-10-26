import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { assertUploadsAvailable, RetiredUploadError, withPortfolioWrite } from "@/lib/portfolio-write";

class DraftConflictError extends Error {}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const userId = session.user.id;
    const body = portfolioSchema.parse(json);
    const published = await withPortfolioWrite(async (client) => {
    const draft = await client.query('SELECT revision FROM "PortfolioDraft" WHERE "userId" = $1', [userId]);
    if (draft.rows[0] && json.draftRevision !== draft.rows[0].revision) throw new DraftConflictError();
    await assertUploadsAvailable(client, body.content);

    // Check slug ownership — only allow overwriting own portfolio
    const existing = await client.query(
      'SELECT id, "userId" FROM "Portfolio" WHERE "publicSlug" = $1',
      [body.username]
    );

    if (existing.rows.length > 0 && existing.rows[0].userId !== userId) {
      return NextResponse.json(
        { error: "This username is already taken by another user" },
        { status: 409 }
      );
    }

    const contentJSON = JSON.stringify(body.content);
    const isPublicOnSearch = body.isPublicOnSearch ?? false;

    let result;
    if (existing.rows.length > 0) {
      result = await client.query(
        `UPDATE "Portfolio" SET content = $1::jsonb, "isPublicOnSearch" = $2, "updatedAt" = NOW()
         WHERE "publicSlug" = $3
         RETURNING id, content, "publicSlug", "userId", "isPublicOnSearch"`,
        [contentJSON, isPublicOnSearch, body.username]
      );
    } else {
      const id = crypto.randomUUID();
      result = await client.query(
        `INSERT INTO "Portfolio" (id, content, "publicSlug", "userId", "isPublicOnSearch", "createdAt", "updatedAt")
         VALUES ($1, $2::jsonb, $3, $4, $5, NOW(), NOW())
         RETURNING id, content, "publicSlug", "userId", "isPublicOnSearch"`,
        [id, contentJSON, body.username, userId, isPublicOnSearch]
      );
    }

    const revision = (draft.rows[0]?.revision ?? 0) + 1;
    await client.query(`INSERT INTO "PortfolioDraft" ("userId", snapshot, revision) VALUES ($1, $2::jsonb, $3)
      ON CONFLICT ("userId") DO UPDATE SET snapshot = EXCLUDED.snapshot, revision = EXCLUDED.revision, "updatedAt" = NOW()`,
      [userId, JSON.stringify({ username: body.username, theme: body.content.theme, layout: body.content.layout || 'classic', sections: body.content.sections }), revision]);
    return NextResponse.json({ ...result.rows[0], draftRevision: revision }, { status: 200 });
    });
    return published;
  } catch (error: any) {
    if (error instanceof DraftConflictError) return NextResponse.json({ error: "Your draft changed in another tab. Reload before publishing." }, { status: 409 });
    if (error instanceof RetiredUploadError) return NextResponse.json({ error: error.message }, { status: 409 });
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

