import { pool } from "@/lib/db";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { THEMES } from "@/lib/themes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;

  const result = await pool.query(
    'SELECT content FROM "Portfolio" WHERE "publicSlug" = $1',
    [slug]
  );

  if (result.rows.length === 0) {
    notFound();
  }

  const content = result.rows[0].content || {};
  const sections = content.sections || [];
  const theme = content.theme || "classic";
  const activeTheme = THEMES[theme] || THEMES["classic"];

  return (
    <div 
      data-theme={theme}
      className="min-h-screen theme-bg font-sans transition-colors duration-500 flex flex-col justify-between relative selection:bg-violet-500/30 selection:text-violet-200"
      style={{
        ...activeTheme.cssVars,
        fontFamily: activeTheme.cssVars["--p-font"],
        color: "var(--p-fg)",
      } as React.CSSProperties}
    >
      {/* Publicly visible main content */}
      <main className="flex-1 w-full">
        <PortfolioRenderer sections={sections} theme={theme} />
      </main>

      {/* Upgraded Footer CTA */}
      <footer className="py-16 text-center border-t border-[var(--p-border)] theme-bg-secondary flex flex-col items-center justify-center gap-4 relative z-10 transition-colors duration-500">
        <p className="text-sm text-[var(--p-fg-muted)] font-medium flex items-center gap-1.5 justify-center transition-colors">
          Created with 
          <span className="text-[var(--p-fg)] font-semibold tracking-tight inline-flex items-center gap-1 transition-colors">
            <span className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/10">
              <Layers className="w-2.5 h-2.5 text-white" />
            </span>
            Portfolio<span className="text-[var(--p-fg-muted)] font-normal">.os</span>
          </span>
        </p>
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

      {/* Floating Brand Badge with transition-expansion */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--p-border)] theme-bg-secondary backdrop-blur-md shadow-xl hover:theme-bg hover:border-[var(--p-primary)] transition-all group"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Layers className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-[var(--p-fg-muted)] group-hover:text-[var(--p-fg)] transition-colors">
            Built with <span className="text-[var(--p-fg)] font-semibold tracking-tight">Portfolio<span className="opacity-70">.os</span></span>
          </span>
          <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block max-w-0 group-hover:max-w-[120px] overflow-hidden group-hover:ml-1 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            Create Yours
          </span>
        </Link>
      </div>
    </div>
  );
}
