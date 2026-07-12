import { MetadataRoute } from "next";
import { pool } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://portfolioos.dev";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  try {
    const result = await pool.query(
      'SELECT "publicSlug", "updatedAt" FROM "Portfolio" ORDER BY "updatedAt" DESC LIMIT 5000'
    );

    const portfolioRoutes = result.rows.map((row) => ({
      url: `${baseUrl}/p/${row.publicSlug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...portfolioRoutes];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return staticRoutes;
  }
}
