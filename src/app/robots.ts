import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/signup", "/forgot-password", "/reset-password", "/setup-username"],
      },
      {
        // Block AI training bots from scraping content
        userAgent: ["GPTBot", "CCBot", "anthropic-ai", "Google-Extended"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
