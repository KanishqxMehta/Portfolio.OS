"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Globe,
  LogOut,
  LayoutDashboard,
  UserCircle,
  TrendingUp,
  Sun,
  Moon,
  ChevronDown,
  CheckCircle2,
  Edit3,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  currentPage: "editor" | "analytics" | "profile";
  publicSlug?: string;
  isSaving?: boolean;
  isDirty?: boolean;
  onSave?: () => void;
  initialUser?: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardHeader({
  currentPage,
  publicSlug,
  isSaving,
  isDirty,
  onSave,
  initialUser
}: DashboardHeaderProps) {
  const { data: clientSession, status: clientStatus } = useSession();
  const { theme: activeMode, setTheme: setActiveMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const router = useRouter();
  const [backUrl, setBackUrl] = useState("/dashboard/edit");
  const [backLabel, setBackLabel] = useState("Back to Editor");

  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrer = document.referrer;
        if (referrer.includes("/dashboard/analytics")) {
          setBackUrl("/dashboard/analytics");
          setBackLabel("Back to Analytics");
        } else if (referrer.includes("/dashboard/edit")) {
          setBackUrl("/dashboard/edit");
          setBackLabel("Back to Editor");
        } else {
          const url = new URL(referrer);
          if (url.origin === window.location.origin) {
            if (url.pathname === "/") {
              setBackUrl("/");
              setBackLabel("Back to Home");
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse referrer URL", err);
      }
    }
  }, []);

  // Use initialUser (server preloaded) if available to avoid layout shift, otherwise client session
  const session = initialUser ? { user: initialUser } : clientSession;
  const status = initialUser ? "authenticated" : clientStatus;

  const userInitial =
    session?.user?.name?.charAt(0)?.toUpperCase() ||
    session?.user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors duration-500">
      <div className="flex items-center gap-3 md:gap-6">
        {currentPage === "profile" ? (
          <Link
            href={backUrl}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{backLabel}</span>
          </Link>
        ) : (
          /* Wordmark */
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 shadow-md shadow-violet-500/20 transition-all">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors hidden md:block">
              Portfolio<span className="text-zinc-500 dark:text-zinc-400">.os</span>
            </span>
          </Link>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800/80 hidden md:block" />

        {/* Navigation Switch */}
        {currentPage !== "profile" && (
          <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg">
          <Link
            href="/dashboard/edit"
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
              currentPage === "editor"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            Editor
          </Link>
          <Link
            href="/dashboard/analytics"
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
              currentPage === "analytics"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            Analytics
          </Link>
        </div>
        )}

        {/* Username field (Read-only, hidden on mobile/tablet) */}
        {currentPage === "editor" && publicSlug && (
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 transition-colors cursor-default">
            <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-zinc-500 text-sm font-medium">p/</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 max-w-[150px] truncate">
              {publicSlug}
            </span>
          </div>
        )}
      </div>

      {/* Group Actions on the Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Save/Publish controls (Editor only) */}
        {currentPage === "editor" && onSave && (
          <>
            <Button
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className="h-8 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full bg-violet-600 hover:bg-violet-500 text-white border-0 transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:shadow-none cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="hidden xs:inline">Saving</span>
                </span>
              ) : (
                <>
                  <span className="md:hidden">Publish</span>
                  <span className="hidden md:inline">Publish Changes</span>
                </>
              )}
            </Button>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium mr-1">
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-zinc-600 border-t-zinc-300 animate-spin" />
                  Saving...
                </span>
              ) : isDirty ? (
                <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Saved
                </span>
              )}
            </div>
          </>
        )}

        {/* View Live link (Analytics only) */}
        {currentPage === "analytics" && publicSlug && (
          <Link
            href={`/p/${publicSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live</span>
          </Link>
        )}

        {/* Theme Toggle (Desktop only) */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* User Menu Avatar */}
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        ) : (
          <div data-user-menu className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 transition-all cursor-pointer ring-2 ring-transparent hover:ring-violet-500/20"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner shadow-violet-400/20">
                {userInitial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl shadow-black/10 dark:shadow-black/80 overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {session?.user?.email}
                  </p>
                </div>
                <div className="p-1.5">
                  {/* Mobile-only Switch to Analytics */}
                  {(currentPage === "editor" || currentPage === "profile") && (
                    <Link
                      href="/dashboard/analytics"
                      onClick={() => setMenuOpen(false)}
                      className="md:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-zinc-500 shrink-0" />
                      View Analytics
                    </Link>
                  )}

                  {/* Mobile-only Switch to Editor */}
                  {(currentPage === "analytics" || currentPage === "profile") && (
                    <Link
                      href="/dashboard/edit"
                      onClick={() => setMenuOpen(false)}
                      className="md:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-zinc-500 shrink-0" />
                      Go to Editor
                    </Link>
                  )}

                  {/* Mobile-only Theme Toggle */}
                  <button
                    onClick={() => {
                      setActiveMode(activeMode === "dark" ? "light" : "dark");
                      setMenuOpen(false);
                    }}
                    className="md:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                  >
                    {activeMode === "dark" ? (
                      <span className="flex items-center gap-2.5">
                        <Sun className="w-4 h-4 text-zinc-500 shrink-0" />
                        Light Mode
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <Moon className="w-4 h-4 text-zinc-500 shrink-0" />
                        Dark Mode
                      </span>
                    )}
                  </button>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                    Edit Profile
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
                    Home
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left mt-1"
                  >
                    <LogOut className="w-4 h-4 text-zinc-500 shrink-0" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
