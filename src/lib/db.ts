import "dotenv/config";
import { Pool, QueryResult, QueryResultRow } from "pg";

let connectionString =
  process.env.APP_ENV === "production"
    ? process.env.PROD_DATABASE_URL
    : process.env.DATABASE_URL || process.env.DEV_DATABASE_URL;

if (connectionString) {
  connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");
}

const isLocal =
  connectionString?.includes("127.0.0.1") ||
  connectionString?.includes("localhost");

// Prevent multiple connection pool instances in Next.js development hot-reloading
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

/**
 * Standardized database query helper with TypeScript generics support.
 */
export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> => {
    return pool.query<T>(text, params);
  },
  pool,
};
