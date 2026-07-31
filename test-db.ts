import { pool } from "./src/lib/db";
import { portfolioSchema } from "./src/lib/validations/portfolio";

async function main() {
  const result = await pool.query('SELECT * FROM "Portfolio" WHERE "publicSlug" = $1', ['kanishq-mehta']);
  if (result.rows.length === 0) {
    console.log("Portfolio not found for kanishq-mehta");
    process.exit(0);
  }
  
  const content = result.rows[0].content;
  const username = result.rows[0].publicSlug;
  
  const testData = {
    username,
    content
  };
  
  const validation = portfolioSchema.safeParse(testData);
  if (!validation.success) {
    console.log(JSON.stringify(validation.error.issues, null, 2));
  } else {
    console.log("Success! The data in DB is valid.");
  }
  process.exit(0);
}
main();
