import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { draftWriteSchema } from "@/lib/validations/draft";
import { assertUploadsAvailable, RetiredUploadError, withPortfolioWrite } from "@/lib/portfolio-write";
import { checkPersistentRateLimit } from "@/lib/persistent-rate-limit";
import { rateLimitExceededResponse } from "@/lib/api/rate-limit-response";

const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const result = await pool.query('SELECT snapshot, revision, "updatedAt" FROM "PortfolioDraft" WHERE "userId" = $1', [session.user.id]);
    return NextResponse.json(result.rows[0] ?? { revision: 0, snapshot: null }, { headers });
  } catch (error) {
    console.error('Draft recovery failed', error);
    return NextResponse.json({ error: 'Draft sync is temporarily unavailable. Keep editing on this device and retry before publishing.' }, { status: 503, headers });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const userId = session.user.id;
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  try {
    const limit = await checkPersistentRateLimit(`draft:${session.user.id}`, { limit: 120, windowMs: 60_000 });
    if (!limit.allowed) return rateLimitExceededResponse(limit);
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Missing draft." }, { status: 400, headers });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_000_000) { await reader.cancel(); return NextResponse.json({ error: "Draft is too large." }, { status: 413, headers }); }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    const body = draftWriteSchema.safeParse(JSON.parse(raw));
    if (!body.success) return NextResponse.json({ error: "Draft has invalid fields." }, { status: 400, headers });
    const result = await withPortfolioWrite(async (client) => {
      await assertUploadsAvailable(client, body.data.snapshot);
      const current = await client.query('SELECT revision FROM "PortfolioDraft" WHERE "userId" = $1', [userId]);
      if ((current.rows[0]?.revision ?? 0) !== body.data.revision) return null;
      return client.query(`INSERT INTO "PortfolioDraft" ("userId", snapshot, revision) VALUES ($1, $2::jsonb, 1)
        ON CONFLICT ("userId") DO UPDATE SET snapshot = EXCLUDED.snapshot, revision = "PortfolioDraft".revision + 1, "updatedAt" = NOW() RETURNING revision, "updatedAt"`, [userId, JSON.stringify(body.data.snapshot)]);
    });
    if (!result) return NextResponse.json({ error: "Your draft changed in another tab. Copy any unsynced edits before reloading the latest saved draft." }, { status: 409, headers });
    return NextResponse.json(result.rows[0], { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid draft." }, { status: 400, headers });
    if (error instanceof RetiredUploadError) return NextResponse.json({ error: error.message }, { status: 409, headers });
    console.error("Draft save failed", error);
    return NextResponse.json({ error: "Draft could not be saved. Keep this page open and try again." }, { status: 503, headers });
  }
}
