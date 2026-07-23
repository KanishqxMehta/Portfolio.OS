import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const baseUrl = envUrl && envUrl.startsWith("http") ? envUrl.replace(/\/$/, "") : "https://portfolioos.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/signup", "/forgot-password", "/reset-password", "/setup-username"],
      },
      {
        // Block AI scrapers from stealing content (excluding Google-Extended so Google tools pass)
        userAgent: ["GPTBot", "CCBot", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
