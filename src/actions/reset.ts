"use server";

import { z } from "zod";
import { pool } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validatedFields.data;

  try {
    const existingUserResult = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    );

    const existingUser = existingUserResult.rows[0];

    // If user doesn't exist or uses OAuth (no password), we still return success 
    // to prevent email enumeration attacks.
    if (!existingUser || !existingUser.passwordHash) {
      return { success: "Reset email sent!" };
    }

    // Generate token and save to DB
    const token = await generatePasswordResetToken(email);

    // Local-only bypass: never expose reset tokens unless both env flags are development
    if (
      process.env.NODE_ENV === "development" &&
      process.env.APP_ENV === "development"
    ) {
      return {
        success: "Bypassing email in development...",
        redirect: `/reset-password?token=${token}`,
      };
    }

    // Send email (Production / Staging)
    await sendPasswordResetEmail(email, token);

    return { success: "Reset email sent!" };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Something went wrong" };
  }
};
