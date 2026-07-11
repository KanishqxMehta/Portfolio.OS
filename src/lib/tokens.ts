import { v4 as uuidv4 } from "uuid";
import { pool } from "./db";

/**
 * Generate a secure password reset token, save it to the DB,
 * and return it. Automatically invalidates any existing tokens for that email.
 */
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  // Expire in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  try {
    // Delete any existing tokens for this email
    await pool.query(
      `DELETE FROM "PasswordResetToken" WHERE email = $1`,
      [email]
    );

    // Insert new token
    const id = uuidv4();
    await pool.query(
      `INSERT INTO "PasswordResetToken" (id, email, token, expires) VALUES ($1, $2, $3, $4)`,
      [id, email, token, expires]
    );

    return token;
  } catch (error) {
    console.error("Failed to generate password reset token:", error);
    throw new Error("Failed to generate token");
  }
};

/**
 * Fetch a password reset token from the DB.
 */
export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "PasswordResetToken" WHERE token = $1`,
      [token]
    );
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    return null;
  }
};

/**
 * Fetch a password reset token from the DB using an email.
 */
export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "PasswordResetToken" WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    return null;
  }
};
