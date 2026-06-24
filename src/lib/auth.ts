import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import Google from "next-auth/providers/google";
// import GitHub from "next-auth/providers/github";
import { verify } from "argon2";
import { pool } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const result = await pool.query(
          'SELECT id, email, username, name, image, "passwordHash" FROM "User" WHERE email = $1',
          [email.toLowerCase()]
        );

        if (result.rows.length === 0) return null;

        const user = result.rows[0];
        if (!user.passwordHash) return null;

        const isValid = await verify(user.passwordHash, password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.image,
          username: user.username,
        };
      },
    }),
    // Google({ allowDangerousEmailAccountLinking: true }),
    // GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existing = await pool.query(
          'SELECT id, username FROM "User" WHERE email = $1',
          [email]
        );

        let userId: string;
        if (existing.rows.length === 0) {
          const baseUsername = email.split("@")[0].replace(/[^a-z0-9-]/g, "").substring(0, 20);
          const check = await pool.query(
            'SELECT id FROM "User" WHERE username = $1',
            [baseUsername]
          );
          const username = check.rows.length > 0
            ? `${baseUsername}-${Math.random().toString(36).slice(2, 6)}`
            : baseUsername;

          const created = await pool.query(
            `INSERT INTO "User" (id, name, email, image, username, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
            [crypto.randomUUID(), user.name, email, user.image, username]
          );
          userId = created.rows[0].id;
        } else {
          userId = existing.rows[0].id;
        }

        const linkCheck = await pool.query(
          'SELECT id FROM "Account" WHERE provider = $1 AND "providerAccountId" = $2',
          [account.provider, account.providerAccountId]
        );

        if (linkCheck.rows.length === 0) {
          await pool.query(
            `INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId", access_token, expires_at, token_type, scope, id_token)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              crypto.randomUUID(), userId, account.type,
              account.provider, account.providerAccountId,
              account.access_token, account.expires_at,
              account.token_type, account.scope, account.id_token,
            ]
          );
        }

        user.id = userId;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.name = user.name;
      }
      if (trigger === "update" && session) {
        if (session.username !== undefined) token.username = session.username;
        if (session.name !== undefined) token.name = session.name;
      }
      if (!token.username || !token.name) {
        const result = await pool.query(
          'SELECT username, name FROM "User" WHERE id = $1',
          [token.id]
        );
        if (result.rows.length > 0) {
          if (!token.username) token.username = result.rows[0].username;
          if (!token.name && result.rows[0].name) token.name = result.rows[0].name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
});
