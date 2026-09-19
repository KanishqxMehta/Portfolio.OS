import pg from "pg";
import "dotenv/config";

const migrationSql = `
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "isPublicOnSearch" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "idx_portfolio_isPublicOnSearch" ON "Portfolio"("isPublicOnSearch") WHERE "isPublicOnSearch" = true;
`;

async function runMigration(url, label) {
  if (!url) {
    console.log(`[${label}] URL not provided, skipping.`);
    return;
  }

  let cleanUrl = url.replace(/[\?&]sslmode=[^&]+/g, "");
  const isLocal = cleanUrl.includes("127.0.0.1") || cleanUrl.includes("localhost");

  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`Connecting to ${label}...`);
    await client.connect();
    console.log(`Connected to ${label}. Running migration...`);
    await client.query(migrationSql);
    console.log(`Migration successful on ${label}!`);

    // Verify column exists
    const checkRes = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Portfolio' AND column_name = 'isPublicOnSearch';
    `);
    console.log(`Column details on ${label}:`, checkRes.rows);
  } catch (err) {
    console.error(`Migration error on ${label}:`, err.message);
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

async function main() {
  console.log("=== Running Supabase and Database Migration ===");
  if (process.env.PROD_DATABASE_URL) {
    await runMigration(process.env.PROD_DATABASE_URL, "PROD (Supabase)");
  } else {
    console.log("No PROD_DATABASE_URL found.");
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== process.env.PROD_DATABASE_URL) {
    await runMigration(process.env.DATABASE_URL, "LOCAL / DEFAULT DB");
  }
  console.log("=== Migration script finished ===");
}

main();
