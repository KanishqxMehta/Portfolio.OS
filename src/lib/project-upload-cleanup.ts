import { createHash } from "node:crypto";
import { pool } from "./db";
import { collectStrings, withPortfolioWrite } from "./portfolio-write";

export const UPLOAD_GRACE_DAYS = 7;
export const CLEANUP_BATCH_SIZE = 50;
const CLEANUP_CONCURRENCY = 5;
type Upload = { id: string; ownerId: string; paths: string[]; urls: string[]; status: string; unusedSince: Date | null };

export async function cleanupProjectUploads(dryRun = true) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PROJECT_IMAGES_BUCKET || "project-images";
  if (!base || !key) return { configured: false, dryRun, eligible: 0, deleted: 0, failed: 0 };
  const candidates = await withPortfolioWrite(async (client) => {
    // Check all saved references, not just this uploader: public URLs can be reused.
    const documents = await client.query('SELECT content FROM "Portfolio" UNION ALL SELECT snapshot AS content FROM "PortfolioDraft"');
    const references = new Set<string>();
    documents.rows.forEach((row) => collectStrings(row.content, references));
    const uploads = await client.query<Upload>('SELECT id, "ownerId", paths, urls, status, "unusedSince" FROM "ProjectUpload" WHERE "storageBase" = $1 AND bucket = $2 AND status <> \'deleted\' ORDER BY "unusedSince" ASC NULLS LAST', [base, bucket]);
    const eligible: Upload[] = [];
    const cutoff = Date.now() - UPLOAD_GRACE_DAYS * 86400_000;
    for (const upload of uploads.rows) {
      const used = upload.urls.some((url) => references.has(url));
      if (used) {
        if (!dryRun && upload.status === 'active') await client.query('UPDATE "ProjectUpload" SET "unusedSince" = NULL WHERE id = $1', [upload.id]);
        continue;
      }
      if (!upload.unusedSince) {
        if (!dryRun) await client.query('UPDATE "ProjectUpload" SET "unusedSince" = NOW() WHERE id = $1', [upload.id]);
        continue;
      }
      if (upload.status === 'deleting' || new Date(upload.unusedSince).getTime() <= cutoff) eligible.push(upload);
    }
    const batch = eligible.slice(0, CLEANUP_BATCH_SIZE);
    if (!dryRun) for (const upload of batch) await client.query('UPDATE "ProjectUpload" SET status = \'deleting\' WHERE id = $1', [upload.id]);
    return { batch, eligible: eligible.length };
  });
  let deleted = 0;
  let failed = 0;
  const remove = async (upload: Upload) => {
    try {
      const folder = createHash('sha256').update(upload.ownerId).digest('hex');
      const stem = `${folder}/${upload.id}`;
      // Never turn a malformed registry record into a broad storage deletion.
      if (!/^[a-f0-9-]{36}$/.test(upload.id) || upload.paths.length !== 2 || !['png', 'jpg', 'webp'].some((extension) => upload.paths[0] === `${stem}.${extension}`) || upload.paths[1] !== `${stem}-preview.webp`) throw new Error('Invalid managed upload paths');
      const response = await fetch(`${base}/storage/v1/object/${encodeURIComponent(bucket)}`, {
        method: 'DELETE',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: upload.paths }),
        signal: AbortSignal.timeout(5000), redirect: 'error',
      });
      if (!response.ok) throw new Error(`Storage cleanup returned ${response.status}`);
      await pool.query('UPDATE "ProjectUpload" SET status = \'deleted\' WHERE id = $1 AND status = \'deleting\'', [upload.id]);
      deleted++;
    } catch (error) {
      // Keep the tombstone; retry next run, never resurrect a partially deleted pair.
      console.error('Project upload cleanup failed', { id: upload.id, error });
      failed++;
    }
  };
  if (!dryRun) {
    const started = Date.now();
    for (let index = 0; index < candidates.batch.length && Date.now() - started < 45_000; index += CLEANUP_CONCURRENCY) {
      await Promise.all(candidates.batch.slice(index, index + CLEANUP_CONCURRENCY).map(remove));
    }
  }
  return { configured: true, dryRun, eligible: candidates.eligible, deleted, failed };
}
