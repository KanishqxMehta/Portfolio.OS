"use server";

import { z } from "zod";
import { pool } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { headers } from "next/headers";
import { checkPersistentRateLimit } from "@/lib/persistent-rate-limit";
import { getClientIp } from "@/lib/rate-limit";

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

  const email = validatedFields.data.email.toLowerCase().trim();

  try {
    const requestHeaders = await headers();
    const ip = getClientIp({ headers: requestHeaders } as Request);
    const ipLimit = await checkPersistentRateLimit(`reset:ip:${ip}`, { limit: 10, windowMs: 15 * 60_000 });
    if (!ipLimit.allowed) return { error: "Too many requests. Please try again later." };
    const emailLimit = await checkPersistentRateLimit(`reset:email:${email}`, { limit: 3, windowMs: 60 * 60_000 });
    if (!emailLimit.allowed) return { error: "Too many requests. Please try again later." };

    const localBypass = process.env.NODE_ENV === "development" && process.env.APP_ENV === "development";
    // Check delivery configuration before looking up the account, preserving
    // the same response for existing and unknown addresses.
    if (!localBypass && !process.env.SMTP_HOST) {
      return { error: "Password reset is temporarily unavailable. Please try again later." };
    }
    const existingUserResult = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    );

    const existingUser = existingUserResult.rows[0];

    // If user doesn't exist or uses OAuth (no password), we still return success 
    // to prevent email enumeration attacks.
    if (!existingUser || !existingUser.passwordHash) {
      return { success: "If an eligible account exists, you’ll receive a reset email shortly." };
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
    const delivered = await sendPasswordResetEmail(email, token);
    if (!delivered) {
      await pool.query('DELETE FROM "PasswordResetToken" WHERE token = $1', [token]);
      return { error: "We couldn’t send the reset email. Please try again later." };
    }

    return { success: "If an eligible account exists, you’ll receive a reset email shortly." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Something went wrong" };
  }
};
