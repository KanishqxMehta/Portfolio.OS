import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { cleanupProjectUploads } from "@/lib/project-upload-cleanup";

export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cleanup is not configured." }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get('authorization') || '');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const dryRun = process.env.PROJECT_UPLOAD_CLEANUP_ENABLED !== 'true' || new URL(request.url).searchParams.get('dryRun') === '1';
    return NextResponse.json(await cleanupProjectUploads(dryRun), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Project upload cleanup failed', error);
    return NextResponse.json({ error: 'Cleanup could not finish; it can be retried safely.' }, { status: 503 });
  }
}
