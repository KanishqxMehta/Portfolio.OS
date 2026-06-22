import { NextResponse } from "next/server";
import { hash } from "argon2";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const sanitizedUsername = username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
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
  } catch (error: any) {
    console.error("SIGNUP_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
