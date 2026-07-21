"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, ExternalLink, ArrowLeft, Code2, Filter } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface PortfolioResult {
  publicSlug: string;
  fullName: string;
  bio: string;
  skills: string[];
  theme: string;
  updatedAt: string;
}

const POPULAR_TAGS = ["React", "TypeScript", "Node.js", "Python", "Full Stack", "Frontend", "UI/UX"];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [results, setResults] = useState<PortfolioResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolios/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.portfolios || []);
      }
    } catch (err) {
      console.error("Failed to search portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(query);
      if (query) {
        router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
      } else {
        router.replace("/search", { scroll: false });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
      setQuery("");
    } else {
      setActiveTag(tag);
      setQuery(tag);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-violet-500/30 transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/edit"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-all"
            >
              Create Portfolio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Search Hero */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Explore Developer Portfolios
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover Talent & Inspiration
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Search published developer portfolios built with Portfolio.OS by name, bio, or technical skills.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, role, or skill (e.g. React, Full Stack)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (activeTag && e.target.value !== activeTag) {
                  setActiveTag(null);
                }
              }}
              className="w-full h-13 pl-12 pr-4 bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/60 shadow-xl transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Popular:
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
                  activeTag === tag
                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-violet-500/40"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {loading ? "Searching..." : `${results.length} ${results.length === 1 ? "Portfolio" : "Portfolios"} Found`}
            </p>
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTag(null);
                }}
                className="text-xs text-violet-500 hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Portfolio Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((portfolio) => (
                <div
                  key={portfolio.publicSlug}
                  className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Author & Theme Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {portfolio.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-500 transition-colors line-clamp-1">
                            {portfolio.fullName}
                          </h3>
                          <p className="text-xs font-mono text-zinc-400 truncate">
                            /p/{portfolio.publicSlug}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                        {portfolio.theme}
                      </span>
                    </div>

                    {/* Bio */}
                    {portfolio.bio && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {portfolio.bio}
                      </p>
                    )}

                    {/* Skill Badges */}
                    {portfolio.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {portfolio.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                        {portfolio.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                            +{portfolio.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Updated {new Date(portfolio.updatedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/p/${portfolio.publicSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                    >
                      View Portfolio <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-16 space-y-4 bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                  No portfolios found
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {query
                    ? `No published developer portfolios matched "${query}". Try searching for another skill like React or Node.`
                    : "No published developer portfolios yet. Be the first to build and publish yours!"}
                </p>
              </div>
              <Link
                href="/dashboard/edit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-md"
              >
                Create Your Portfolio
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
