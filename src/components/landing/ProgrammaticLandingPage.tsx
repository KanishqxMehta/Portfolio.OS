"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Palette,
  FileText,
  FileUp,
  FileCode,
  Cpu,
  BrainCircuit,
  Wand2,
  Layers,
  Code2,
  Terminal,
  GitCompare,
  GitBranch,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FAQJsonLd, HowToJsonLd } from "@/components/JsonLd";
import { cn } from "@/lib/utils";

export type LandingIconName =
  | "sparkles"
  | "shield"
  | "zap"
  | "globe"
  | "palette"
  | "file-text"
  | "file-up"
  | "file-code"
  | "cpu"
  | "brain"
  | "wand"
  | "layers"
  | "code"
  | "terminal"
  | "git-compare"
  | "git-branch";

const ICON_MAP: Record<LandingIconName, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  shield: Shield,
  zap: Zap,
  globe: Globe,
  palette: Palette,
  "file-text": FileText,
  "file-up": FileUp,
  "file-code": FileCode,
  cpu: Cpu,
  brain: BrainCircuit,
  wand: Wand2,
  layers: Layers,
  code: Code2,
  terminal: Terminal,
  "git-compare": GitCompare,
  "git-branch": GitBranch,
};

export interface LandingFeature {
  title: string;
  description: string;
  icon: LandingIconName;
}

export interface LandingStep {
  step: string;
  title: string;
  description: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface ProgrammaticLandingPageProps {
  badgeText: string;
  badgeIcon?: LandingIconName;
  h1Title: string;
  h1Highlight: string;
  subheading: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: LandingFeature[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: LandingStep[];
  faqs: LandingFaq[];
  comparisonRows?: {
    feature: string;
    portfolioOs: string | boolean;
    others: string | boolean;
  }[];
  jsonLdType?: "WebApplication" | "SoftwareApplication";
  canonicalPath: string;
}

export function ProgrammaticLandingPage({
  badgeText,
  badgeIcon = "sparkles",
  h1Title,
  h1Highlight,
  subheading,
  primaryCtaText = "Build Your Free Portfolio",
  primaryCtaHref = "/dashboard/edit",
  secondaryCtaText = "Explore Examples",
  featuresTitle,
  featuresSubtitle,
  features,
  stepsTitle,
  stepsSubtitle,
  steps,
  faqs,
  comparisonRows,
  canonicalPath,
}: ProgrammaticLandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev";
  const BadgeIcon = ICON_MAP[badgeIcon] || Sparkles;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-violet-500/20 selection:text-violet-600 transition-colors">
      {/* Inject Structured Data */}
      <FAQJsonLd faqs={faqs} />
      <HowToJsonLd
        baseUrl={baseUrl}
        name={h1Title + " " + h1Highlight}
        description={subheading}
        steps={steps.map((s) => ({
          name: s.title,
          text: s.description,
          url: `${baseUrl}${canonicalPath}`,
        }))}
      />

      {/* Header Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl py-3 transition-all">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Home
            </Link>
            <Link href="/search" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Explore
            </Link>
            <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/20 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-medium mb-6 animate-fade-in">
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.15] mb-6">
            {h1Title}{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {h1Highlight}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {subheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={primaryCtaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-xl shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all"
            >
              <span>{secondaryCtaText}</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-zinc-200 dark:border-zinc-800/80 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Needed</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Ready in 60 Seconds</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>ATS & Mobile Friendly</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-6 mt-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              {featuresTitle}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              {featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = ICON_MAP[feat.icon] || Sparkles;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works (Step by Step for HowToJsonLd match) */}
        <section className="max-w-5xl mx-auto px-6 mt-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-wider text-violet-600 dark:text-violet-400 uppercase mb-2 block">
              Effortless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              {stepsTitle}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              {stepsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-mono uppercase text-zinc-400">
                    {st.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        {comparisonRows && comparisonRows.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 mt-28">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
                Why Developers Choose Portfolio.OS
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Compare Portfolio.OS with generic website builders and manual coding.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="py-4 px-6 font-semibold text-zinc-900 dark:text-zinc-100">Capability</th>
                    <th className="py-4 px-6 font-semibold text-violet-600 dark:text-violet-400">Portfolio.OS</th>
                    <th className="py-4 px-6 font-semibold text-zinc-500">Generic Builders / Manual Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-zinc-800 dark:text-zinc-200">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-6 text-zinc-900 dark:text-zinc-100 font-semibold">
                        {typeof row.portfolioOs === "boolean" ? (
                          row.portfolioOs ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
                              <Check className="w-4 h-4" /> Included
                            </span>
                          ) : (
                            "—"
                          )
                        ) : (
                          row.portfolioOs
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-zinc-500 dark:text-zinc-400 text-xs">
                        {typeof row.others === "boolean" ? (
                          row.others ? (
                            "Supported"
                          ) : (
                            <span className="text-rose-500">Not supported / Paid plugin</span>
                          )
                        ) : (
                          row.others
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 mt-28">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Everything you need to know about building your portfolio.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-zinc-100 text-sm hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0",
                        isOpen && "rotate-180 text-violet-600"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="max-w-5xl mx-auto px-6 mt-28">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-8 sm:p-12 text-center text-white shadow-2xl shadow-violet-500/20">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Launch Your Developer Portfolio Today
            </h2>
            <p className="text-violet-100 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Join thousands of developers showcasing their projects, skills, and experience with modern themes and live visitor analytics.
            </p>
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-violet-900 hover:bg-violet-50 font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <span>Build My Portfolio Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer with SEO internal links */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The free, open, and AI-powered portfolio maker crafted specifically for developers and software engineers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-xs uppercase tracking-wider">
              Free Tools
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/free-portfolio-maker" className="hover:text-violet-600 transition-colors">
                  Free Portfolio Maker
                </Link>
              </li>
              <li>
                <Link href="/ai-portfolio-builder" className="hover:text-violet-600 transition-colors">
                  AI Portfolio Builder
                </Link>
              </li>
              <li>
                <Link href="/resume-to-portfolio" className="hover:text-violet-600 transition-colors">
                  Resume to Portfolio Converter
                </Link>
              </li>
              <li>
                <Link href="/developer-portfolio-builder" className="hover:text-violet-600 transition-colors">
                  Developer Portfolio Builder
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-xs uppercase tracking-wider">
              Explore & Resources
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/search" className="hover:text-violet-600 transition-colors">
                  Portfolio Directory
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-violet-600 transition-colors">
                  Developer Blog
                </Link>
              </li>
              <li>
                <Link href="/dashboard/edit" className="hover:text-violet-600 transition-colors">
                  Portfolio Editor
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-violet-600 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-violet-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-violet-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-violet-600 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Portfolio.OS. All rights reserved.</p>
          <p>Built for developers with Next.js, Tailwind CSS & AI.</p>
        </div>
      </footer>
    </div>
  );
}
