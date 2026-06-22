"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Layers } from "lucide-react";

export function StaticHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-500 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 group-hover:shadow-violet-500/40 transition-all duration-300">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight text-lg transition-colors">
            Portfolio<span className="text-zinc-500 dark:text-zinc-400 transition-colors">.os</span>
          </span>
        </Link>

        {/* Navigation links for consistency */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/#features"
            className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full transition-all"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full transition-all"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {status !== "loading" && (
            <Link
              href={session ? "/dashboard/edit" : "/login"}
              className="px-5 py-2 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-full transition-all shadow hover:scale-105 active:scale-95"
            >
              {session ? "Dashboard" : "Get Started"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
