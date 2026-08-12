import Link from "next/link";
import { StaticHeader } from "@/components/StaticHeader";
import { ChevronRight, Layout, TrendingUp, Sparkles, FileText, Cpu, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Portfolio.OS — Free AI Resume to Portfolio Converter",
  description: "Discover how Portfolio.OS transforms static PDF resumes into live, high-performance developer portfolio websites in 3 seconds with AI. Learn about our mission, themes, and platform features.",
  keywords: [
    "about portfolioos",
    "ai resume to portfolio converter",
    "developer portfolio builder",
    "resume to website",
    "free developer portfolio"
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Portfolio.OS — Free AI Resume to Portfolio Converter",
    description: "Discover how Portfolio.OS transforms static PDF resumes into live, high-performance developer portfolio websites in 3 seconds with AI.",
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

        {/* Main Content Container */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 md:py-24 space-y-20">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span>About Portfolio.OS</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Turn your static resume into a live developer website.
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Portfolio.OS is the premier AI-powered platform designed for developers to convert PDF resumes, design block-based layouts, track recruiter views, and export ATS-friendly files in seconds.
            </p>
          </div>

          {/* Key Metrics / Highlights Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl">
            <div className="text-center p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">3 Secs</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">AI Resume Conversion</div>
            </div>
            <div className="text-center p-4 border-l border-zinc-200 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">6 Themes</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">1-Click Style Switch</div>
            </div>
            <div className="text-center p-4 border-l border-zinc-200 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">100% ATS</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Clean PDF Exports</div>
            </div>
            <div className="text-center p-4 border-l border-zinc-200 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">Real-Time</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Visitor Analytics</div>
            </div>
          </div>

          {/* Product Pillars Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Built Specifically for Developers
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Everything you need to showcase your craft, land interviews, and stand out.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">1. AI Resume Parser</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Drop your existing PDF resume directly into our workspace. Our AI ingestion pipeline extracts your work experience, projects, skills, and bio—mapping them into clean structured blocks automatically.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layout className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">2. Block-Based Simplicity</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  No absolute-positioning canvas headaches or broken mobile layouts. Choose from carefully curated themes (Neo-Brutalism, Hacker Terminal, Glassmorphism, and Modern Ink) with instant 1-click previewing.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">3. Real-Time Recruiter Analytics</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Never wonder if an employer opened your portfolio link. Our privacy-first analytics dashboard tracks unique visitor sessions and page views so you know exactly when your applications get traction.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">4. ATS-Friendly PDF Export</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Need a standard file for corporate job portals? Generate a crisp, 100% extractable black-and-white PDF directly from your live portfolio data using our native browser print engine.
                </p>
              </div>
            </div>
          </div>

          {/* Narrative / Philosophy Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-16 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Our Philosophy</h2>
              <p className="text-xs text-zinc-500">Why traditional site builders fail software engineers.</p>
            </div>
            <div className="md:col-span-2 space-y-5 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>
                Traditional website builders fall into two extremes: either they force you to spend days learning complex drag-and-drop canvas editors, or they lock you into rigid static templates that look identical to thousands of other candidate profiles.
              </p>
              <p>
                We created <strong>Portfolio.OS</strong> to deliver the perfect balance. By structuring content into modular layout blocks, your website is guaranteed to look impeccable across desktop and mobile devices. By providing instant AI parsing and theme swapping, you save hours of repetitive typing.
              </p>
              <p>
                Best of all, Portfolio.OS is completely free during our public beta. Create your account, upload your resume, get a custom public link (`portfolioos.dev/p/yourname`), and publish in minutes.
              </p>
            </div>
          </div>

          {/* Interactive CTA Banner */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-900 text-white relative overflow-hidden shadow-2xl shadow-violet-500/20">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to build your developer portfolio?</h3>
                <p className="text-sm sm:text-base text-violet-100/90">
                  Upload your resume or start from scratch. Free forever during beta.
                </p>
              </div>
              <Link
                href="/login"
                className="px-6 py-3.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0 inline-flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 py-12 text-zinc-500 transition-colors duration-500 mt-auto">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span>© {new Date().getFullYear()} Portfolio.OS</span>
            </div>
            <div className="flex gap-6 font-medium text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Home</Link>
              <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</Link>
              <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Blog</Link>
              <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
