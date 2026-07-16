import "dotenv/config";
import { Pool } from "pg";

let connectionString = 
  process.env.APP_ENV === "production"
    ? process.env.PROD_DATABASE_URL
    : (process.env.DATABASE_URL || process.env.DEV_DATABASE_URL);

if (connectionString) {
  connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");
}

const isLocal = connectionString?.includes("127.0.0.1") || connectionString?.includes("localhost");

const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

export { pool };

