import Link from "next/link";
import { StaticHeader } from "@/components/StaticHeader";
import { ChevronRight, PenTool, Layout, TrendingUp } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Portfolio.OS — The Free Portfolio Making Website for Developers",
  description: "Learn about Portfolio.OS, the free portfolio builder designed for developers. Create stunning, responsive developer portfolios with beautiful themes and block-based editing.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Portfolio.OS — The Free Portfolio Making Website for Developers",
    description: "Learn about Portfolio.OS, the free portfolio builder designed for developers.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <StaticHeader />

        {/* Hero section */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 md:py-24 space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider">
              About Portfolio.os
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              An operating system for your professional story.
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Portfolio.os is a high-performance web building platform for developers to compile, design, and host premium single-page portfolios with zero drag-and-drop complexity.
            </p>
          </div>

          {/* Brand values grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900/50 shadow-sm transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Layout className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Block-Based Simplicity</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No canvas grids or absolute layouts. Just pre-designed, responsive, structured blocks (Hero, Projects, Experience, Skills) ready to go.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900/50 shadow-sm transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Premium Aesthetics</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Toggle between carefully curated design palettes like Neo-Brutalism, Hacker Terminal, Ink Splashes, and Glassmorphism in one click.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900/50 shadow-sm transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Integrated Analytics</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Monitor pageviews and user engagement directly from your private analytics dashboard. Know when a recruiter visits your page.
              </p>
            </div>
          </div>

          {/* Narrative Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-16 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Our Philosophy</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Why we built another site builder.</p>
            </div>
            <div className="md:col-span-2 space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>
                Traditional website builders fall into two categories: either they force you to learn complex, absolute-positioning editor interfaces, or they lock you into generic templates that look identical to every other website on the web.
              </p>
              <p>
                We built Portfolio.os to provide a middle ground. By constraining layouts into structured blocks, we guarantee that your website will always look perfect on any screen size. By enabling custom themes and design tokens, we give you the flexibility to stand out.
              </p>
              <p>
                Best of all, Portfolio.os is free to try during our beta. Create your account, choose a custom username link, and deploy your site in minutes.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-all group"
                >
                  Create your portfolio now
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 py-12 text-zinc-500 dark:text-zinc-500 transition-colors duration-500 mt-auto">
          <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 font-medium text-zinc-400 dark:text-zinc-500">
              <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Home</Link>
              <Link href="/contact" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
