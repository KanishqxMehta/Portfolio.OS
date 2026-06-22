import "dotenv/config";
import { Pool } from "pg";

const connectionString = 
  process.env.APP_ENV === "production"
    ? process.env.PROD_DATABASE_URL
    : (process.env.DEV_DATABASE_URL || process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
});

export { pool };

