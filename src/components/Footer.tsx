import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 py-16 text-zinc-500 dark:text-zinc-400 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand & Description (spans 2 columns on mobile and tablet) */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              The AI-powered portfolio platform designed specifically for software engineers to turn their static resumes into interactive, high-converting developer websites.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Built for Modern Developers
            </div>
          </div>

          {/* Column 1: Free Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Free Tools
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/free-portfolio-maker"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Free Portfolio Maker
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-portfolio-builder"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  AI Portfolio Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/resume-to-portfolio"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Resume to Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/developer-portfolio-builder"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Dev Portfolios
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/search"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Explore Portfolios
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Developer Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/edit"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Workspace Editor
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-4 text-center sm:text-left">
          <p>© {currentYear} Portfolio.OS. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with Next.js, Tailwind CSS & AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
