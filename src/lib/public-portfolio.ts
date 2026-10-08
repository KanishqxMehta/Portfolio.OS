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
