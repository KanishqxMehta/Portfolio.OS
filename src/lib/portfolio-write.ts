import type { PoolClient } from "pg";
import { pool } from "./db";

/** Serialize reference changes with cleanup's mark phase, not its network requests. */
export async function withPortfolioWrite<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(8675309)");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export function collectStrings(value: unknown, result = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    result.add(value);
    // Query/hash decorations still refer to the same stored object.
    try { const url = new URL(value); if (['http:', 'https:'].includes(url.protocol)) { url.search = ''; url.hash = ''; result.add(url.toString()); } } catch { /* Not a URL. */ }
  }
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, result));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, result));
  return result;
}

export class RetiredUploadError extends Error {}
export async function assertUploadsAvailable(client: PoolClient, content: unknown) {
  const strings = [...collectStrings(content)];
  const retired = await client.query('SELECT id FROM "ProjectUpload" WHERE status <> \'active\' AND urls && $1::text[] LIMIT 1', [strings]);
  if (retired.rowCount) throw new RetiredUploadError("A removed image is no longer available. Please upload it again.");
  // Start an unused grace period only after the last saved reference disappears.
  await client.query('UPDATE "ProjectUpload" SET "unusedSince" = NULL WHERE status = \'active\' AND urls && $1::text[]', [strings]);
}
