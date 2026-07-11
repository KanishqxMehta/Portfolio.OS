import { generatePasswordResetToken } from "./src/lib/tokens.js";
import { pool } from "./src/lib/db.js";

async function test() {
  try {
    console.log("Testing generation...");
    const token = await generatePasswordResetToken("test@example.com");
    console.log("Success:", token);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}

test();
