"use server";

import { z } from "zod";
import * as argon2 from "argon2";
import { pool } from "@/lib/db";
import { getPasswordResetTokenByToken } from "@/lib/tokens";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/user";

const NewPasswordSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH, {
    message: `Minimum of ${PASSWORD_MIN_LENGTH} characters required`,
  }),
});

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid password" };
  }

  const { password } = validatedFields.data;

  try {
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: "Invalid or expired token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    const existingUserResult = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [existingToken.email]
    );

    const existingUser = existingUserResult.rows[0];

    if (!existingUser) {
      return { error: "User does not exist!" };
    }

    const hashedPassword = await argon2.hash(password);

    // Update password
    await pool.query(
      `UPDATE "User" SET "passwordHash" = $1 WHERE id = $2`,
      [hashedPassword, existingUser.id]
    );

    // Delete token so it can't be reused
    await pool.query(
      `DELETE FROM "PasswordResetToken" WHERE id = $1`,
      [existingToken.id]
    );

    return { success: "Password updated successfully!" };
  } catch (error) {
    console.error("New password error:", error);
    return { error: "Something went wrong" };
  }
};
