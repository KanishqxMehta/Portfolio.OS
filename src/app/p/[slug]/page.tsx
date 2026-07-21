import { pool } from "@/lib/db";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { THEMES } from "@/lib/themes";
import { ViewTracker } from "@/components/portfolio/ViewTracker";
import { Suspense } from "react";
import Loading from "./loading";

import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev";
  const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/p/${slug}`;

  try {
    const result = await pool.query(
      'SELECT content FROM "Portfolio" WHERE "publicSlug" = $1',
      [slug]
    );

    if (result.rows.length > 0) {
      const content = result.rows[0].content || {};
      const sections = content.sections || [];
      const hero = sections.find((s: any) => s.type === "HERO");
      const name = hero?.content?.fullName || slug;
      const bio = hero?.content?.bio || "View my professional developer portfolio.";

      return {
        title: `${name} — Portfolio.os`,
        description: bio.substring(0, 160),
        alternates: {
          canonical: canonicalUrl,
        },
        robots: {
          index: true,
          follow: true,
        },
        openGraph: {
          title: `${name} — Portfolio.os`,
          description: bio.substring(0, 160),
          url: canonicalUrl,
          type: "profile",
          username: slug,
        },
        twitter: {
          card: "summary",
          title: `${name} — Portfolio.os`,
          description: bio.substring(0, 160),
        },
      };
    }
  } catch (e) {
    // Fallback on database error
  }

  return {
    title: `${slug} — Portfolio.os`,
    description: "View this developer portfolio on Portfolio.os.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}


export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <PortfolioContent slug={slug} />
    </Suspense>
  );
}

async function PortfolioContent({ slug }: { slug: string }) {
  const result = await pool.query(
    'SELECT content FROM "Portfolio" WHERE "publicSlug" = $1',
    [slug]
  );

  if (result.rows.length === 0) {
    notFound();
  }

  const content = result.rows[0].content || {};
  let sections = content.sections || [];
  
  // Extract details for JSON-LD Structured Data
  const hero = sections.find((s: any) => s.type === "HERO");
  const name = hero?.content?.fullName || slug;
  const bio = hero?.content?.bio || "Professional Developer Portfolio";

  // Extract skills for structured data
  const skillsSection = sections.find((s: any) => s.type === "SKILLS");
  const skills = skillsSection?.content?.items || [];

  const sameAs = [
    hero?.content?.github,
    hero?.content?.linkedin,
    hero?.content?.instagram,
    hero?.content?.twitter,
  ].filter(Boolean);

  const personJsonLd: Record<string, any> = {
    "@type": "Person",
    name,
    description: bio,
    url: `${(process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev").replace(/\/$/, "")}/p/${slug}`,
  };

  if (sameAs.length > 0) {
    personJsonLd.sameAs = sameAs;
  }

  if (skills.length > 0) {
    personJsonLd.knowsAbout = skills;
  }

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personJsonLd,
  };

  const heroIdx = sections.findIndex((s: any) => s.type === "HERO");
  if (heroIdx === -1) {
    const defaultHero = {
      id: crypto.randomUUID(),
      type: "HERO",
      title: "About Me",
      content: { fullName: "", bio: "", github: "", linkedin: "", instagram: "", twitter: "" },
      isVisible: true,
    };
    sections = [defaultHero, ...sections];
  } else if (heroIdx > 0) {
    const [heroBlock] = sections.splice(heroIdx, 1);
    sections = [heroBlock, ...sections];
  }
  const theme = content.theme || "classic";
  const layout = content.layout || "classic";
  const activeTheme = THEMES[theme] || THEMES["classic"];

  return (
    <div 
      data-theme={theme}
      className="min-h-screen theme-bg font-sans transition-colors duration-500 flex flex-col justify-between relative selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100"
      style={{
        ...activeTheme.cssVars,
        fontFamily: activeTheme.cssVars["--p-font"],
        color: "var(--p-fg)",
      } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewTracker slug={slug} />

      {/* Hero watermark — "Made with Portfolio.os" top-right */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--p-bg)]/60 backdrop-blur-sm border border-[var(--p-border)]/50 shadow-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <Logo showText={false} size={14} />
          <span className="text-[9px] font-medium text-[var(--p-fg-muted)] tracking-tight">
            Made with <span className="text-[var(--p-fg)] font-semibold">Portfolio<span className="opacity-60">.os</span></span>
          </span>
        </Link>
      </div>

      {/* Publicly visible main content */}
      <main className="flex-1 w-full">
        <PortfolioRenderer sections={sections} theme={theme} layout={layout} />
      </main>

      {/* Upgraded Footer CTA */}
      <footer className="py-16 text-center border-t border-[var(--p-border)] theme-bg-secondary flex flex-col items-center justify-center gap-4 relative z-10 transition-colors duration-500">
        <div className="text-sm text-[var(--p-fg-muted)] font-medium flex items-center gap-1.5 justify-center transition-colors">
          Created with 
          <span className="text-[var(--p-fg)] font-semibold tracking-tight inline-flex items-center gap-1 transition-colors">
            <Logo showText={false} size={16} />
            Portfolio<span className="text-[var(--p-fg-muted)] font-normal">.os</span>
          </span>
        </div>
        <Link
          href="/"
          className="theme-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[var(--p-fg)] rounded-full transition-all shadow-xl shadow-black/10 hover:opacity-90 group/btn"
        >
          Build your own portfolio 
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
        <p className="text-[10px] text-[var(--p-fg-muted)] mt-1 transition-colors">
          &copy; {new Date().getFullYear()} Portfolio.os. All rights reserved.
        </p>
      </footer>

      {/* Floating Brand Badge — pulse radiates outward from the button */}
      <style>{`
        @keyframes fab-pulse {
          0%, 20% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.25), 0 0 0 0 rgba(139, 92, 246, 0.08); }
          100% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0), 0 0 0 20px rgba(139, 92, 246, 0); }
        }
        .fab-pulse {
          animation: fab-pulse 3s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
      `}</style>
      <div className="fixed bottom-5 right-5 z-50">
        <Link
          href="/"
          className="fab-pulse flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border border-violet-500/30 theme-bg-secondary backdrop-blur-md shadow-xl hover:border-violet-500/60 hover:shadow-violet-500/10 transition-all group"
        >
          <Logo showText={false} size={18} className="group-hover:scale-105 transition-transform" />
          <span className="text-[10px] font-medium text-[var(--p-fg-muted)] group-hover:text-[var(--p-fg)] transition-colors whitespace-nowrap">
            Built with <span className="text-[var(--p-fg)] font-semibold">Portfolio<span className="opacity-60">.os</span></span>
          </span>
          <span className="text-[9px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1 whitespace-nowrap">
            Create Yours
          </span>
        </Link>
      </div>
    </div>
  );
}
