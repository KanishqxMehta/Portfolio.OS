import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Developer Portfolios | Portfolio.OS",
  description: "Discover developer portfolios, software engineers, and full-stack projects built with Portfolio.OS. Search by tech stack, skills, and design themes.",
  keywords: [
    "developer portfolio examples",
    "software engineer portfolio search",
    "developer portfolio directory",
    "react developer portfolios",
    "free portfolio maker examples",
    "portfolioos search",
  ],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Explore Developer Portfolios | Portfolio.OS",
    description: "Discover developer portfolios, software engineers, and full-stack projects built with Portfolio.OS.",
    url: "/search",
    type: "website",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
