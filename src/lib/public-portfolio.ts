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
}): Promise<{ content: PublicPortfolioContent | null; isDraft: boolean; hasUnpublishedChanges: boolean }> {
  if (isPreview && userId) {
    const draftRes = await pool.query<{ snapshot: PublicPortfolioContent; published_content: PublicPortfolioContent | null }>(
      `SELECT d.snapshot, p.content as published_content
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
      const snapshot = draftRes.rows[0].snapshot;
      const published = draftRes.rows[0].published_content;
      const normSnapshot = JSON.stringify({
        theme: snapshot.theme,
        layout: snapshot.layout || "classic",
        sections: snapshot.sections,
      });
      const normPublished = published
        ? JSON.stringify({
            theme: published.theme,
            layout: published.layout || "classic",
            sections: published.sections,
          })
        : null;
      const hasUnpublishedChanges = normSnapshot !== normPublished;
      return { content: snapshot, isDraft: true, hasUnpublishedChanges };
    }
  }

  const content = await getPublicPortfolio(slug);
  return { content, isDraft: false, hasUnpublishedChanges: false };
}
