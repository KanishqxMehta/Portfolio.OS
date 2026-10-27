import { pool } from "@/lib/db";

export type PublicPortfolioContent = {
  // Portfolio content is saved as JSON and is validated on write. It is kept
  // flexible here so older published portfolios remain readable.
  sections?: Array<Record<string, any>>;
  theme?: string;
  layout?: string;
};

export async function getPublicPortfolio(slug: string): Promise<PublicPortfolioContent | null> {
  const result = await pool.query<{ content: PublicPortfolioContent | null }>(
    'SELECT content FROM "Portfolio" WHERE "publicSlug" = $1',
    [slug],
  );

  return result.rows[0]?.content ?? null;
}

export async function getPortfolioContent({
  slug,
  isPreview = false,
  userId,
}: {
  slug: string;
  isPreview?: boolean;
  userId?: string | null;
}): Promise<{ content: PublicPortfolioContent | null; isDraft: boolean }> {
  if (isPreview && userId) {
    const draftRes = await pool.query<{ snapshot: PublicPortfolioContent }>(
      `SELECT d.snapshot
       FROM "PortfolioDraft" d
       JOIN "User" u ON d."userId" = u.id
       LEFT JOIN "Portfolio" p ON p."userId" = u.id
       WHERE d."userId" = $1 AND (
         LOWER(u.username) = LOWER($2) OR
         LOWER(COALESCE(p."publicSlug", '')) = LOWER($2) OR
         LOWER(COALESCE(d.snapshot->>'username', '')) = LOWER($2) OR
         $2 = 'me' OR
         $2 = 'preview'
       )`,
      [userId, slug],
    );
    if (draftRes.rows[0]?.snapshot) {
      return { content: draftRes.rows[0].snapshot, isDraft: true };
    }
  }

  const content = await getPublicPortfolio(slug);
  return { content, isDraft: false };
}
