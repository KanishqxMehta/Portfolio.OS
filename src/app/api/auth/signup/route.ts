import { NextResponse } from "next/server";
import { hash } from "argon2";
import { pool } from "@/lib/db";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/api/rate-limit-response";
import {
  isValidEmail,
  normalizeEmail,
  slugifyUsername,
  validatePassword,
  validateUsername,
} from "@/lib/validations/user";

const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(buildRateLimitKey("signup", ip), SIGNUP_RATE_LIMIT);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }

    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    const sanitizedUsername = slugifyUsername(username);
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 });
    }

    const emailCheck = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [normalizedEmail]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const usernameCheck = await pool.query(
      'SELECT id FROM "User" WHERE username = $1',
      [sanitizedUsername]
    );
    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password);

    await pool.query(
      `INSERT INTO "User" (id, email, username, "passwordHash", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [crypto.randomUUID(), normalizedEmail, sanitizedUsername, passwordHash]
    );

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("SIGNUP_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
