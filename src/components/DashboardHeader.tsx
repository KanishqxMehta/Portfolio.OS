"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import {
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
  ArrowLeft,
  AlertTriangle,
  FileText,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { useToastStore } from "@/store/useToastStore";
import { Split } from "lucide-react";

interface DashboardHeaderProps {
  currentPage: "editor" | "analytics" | "profile";
  publicSlug?: string;
  isSaving?: boolean;
  isDirty?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
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
  onDiscard,
  initialUser
}: DashboardHeaderProps) {
  const { data: clientSession, status: clientStatus } = useSession();
  const { theme: activeMode, setTheme: setActiveMode } = useTheme();
  const {
    isDiffMode,
    enableDiffMode,
    disableDiffMode,
    proposedSections,
    isPublicOnSearch,
    updatePublicSearch,
  } = usePortfolioStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);

  const handleTogglePublicSearch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !isPublicOnSearch;
    setIsUpdatingPublic(true);
    const success = await updatePublicSearch(nextVal);
    setIsUpdatingPublic(false);
    if (success) {
      useToastStore.getState().toast(
        nextVal
          ? "Portfolio is now visible on public search!"
          : "Portfolio is now unlisted from public search.",
        "success"
      );
    } else {
      useToastStore.getState().toast("Failed to update search visibility", "error");
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setMenuOpen(false);
      if (!target.closest("[data-actions-menu]")) setActionsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
          <Link href="/">
            <Logo textClassName="hidden md:flex" />
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
            {isDirty && onDiscard && (
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-8 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-900/50 transition-colors shadow-sm"
                    >
                      Discard
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <DialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Discard Changes?</DialogTitle>
                        </div>
                      </div>
                      <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        This will permanently delete all the changes you've made since your last publish. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end p-4 gap-2 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
                    <DialogClose
                      render={
                        <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">Cancel</Button>
                      }
                    />
                    <DialogClose
                      render={
                        <Button 
                          variant="default"
                          className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md shadow-red-500/20"
                          onClick={onDiscard}
                        >
                          Yes, Discard
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className="h-8 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full bg-violet-600 hover:bg-violet-500 text-white border-0 transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:shadow-none cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Publishing...</span>
                </span>
              ) : (
                <>
                  <span className="md:hidden">Publish</span>
                  <span className="hidden md:inline">Publish Changes</span>
                </>
              )}
            </Button>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium mr-1 select-none">
              {!isSaving && (
                isDirty ? (
                  <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                    Unsaved Changes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Saved
                  </span>
                )
              )}
            </div>

            {/* More Actions Dropdown (Editor only) */}
            <div data-actions-menu className="relative">
              <button
                type="button"
                onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                className={cn(
                  "h-8 w-8 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                  actionsMenuOpen
                    ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 ring-2 ring-violet-500/20"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 shadow-sm"
                )}
                title="More Actions"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {actionsMenuOpen && (
                <div className="absolute right-[-3.5rem] sm:right-0 top-10 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl shadow-black/10 dark:shadow-black/80 overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      Portfolio Actions
                    </p>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {/* View Analytics (Highlighted at top of menu) */}
                    <Link
                      href="/dashboard/analytics"
                      onClick={() => setActionsMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25 dark:border-violet-500/35 transition-all cursor-pointer shadow-sm group"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="p-1 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </span>
                        <span>View Analytics</span>
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-sm shadow-violet-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </Link>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1" />

                    {/* Public on Search Toggle */}
                    <div className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-violet-500 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Public on Search
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isPublicOnSearch}
                          disabled={isUpdatingPublic}
                          onClick={handleTogglePublicSearch}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            isPublicOnSearch ? "bg-violet-600" : "bg-zinc-300 dark:bg-zinc-700",
                            isUpdatingPublic && "opacity-60 cursor-wait"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                              isPublicOnSearch ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 pl-6">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {isPublicOnSearch ? "Listed on Explore" : "Unlisted"}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                            isPublicOnSearch
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          )}
                        >
                          {isPublicOnSearch ? "Public" : "Unlisted"}
                        </span>
                      </div>
                    </div>

                    {/* View Live link */}
                    {publicSlug && (
                      <Link
                        href={`/p/${publicSlug}`}
                        target="_blank"
                        onClick={() => setActionsMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          View Live
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[80px]">
                          p/{publicSlug}
                        </span>
                      </Link>
                    )}

                    {/* Export PDF Link */}
                    {publicSlug && (
                      <Link
                        href="/dashboard/pdf-export"
                        target="_blank"
                        onClick={() => setActionsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Download ATS-Friendly PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        Export ATS PDF
                      </Link>
                    )}
                  </div>
                </div>
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

        {/* Diff Mode Toggle (Editor only) */}
        {currentPage === "editor" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isDiffMode) {
                disableDiffMode();
              } else {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  useToastStore.getState().toast(
                    "Split-Screen Diff View is available on desktop view only.",
                    "info"
                  );
                  return;
                }
                enableDiffMode();
              }
            }}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 border",
              isDiffMode
                ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/30 hover:bg-violet-700"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            <Split className="w-3.5 h-3.5 text-violet-400" />
            <span>{isDiffMode ? "Exit Diff" : "Diff View"}</span>
            {proposedSections && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </Button>
        )}

        {/* Theme Toggle (Desktop only, hidden when in editor) */}
        {currentPage !== "editor" && (
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        )}

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
                <div className="p-1.5 space-y-0.5">
                  {/* Dark Mode Toggle: always in menu when in editor; mobile-only otherwise */}
                  <button
                    onClick={() => {
                      setActiveMode(activeMode === "dark" ? "light" : "dark");
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left",
                      currentPage === "editor" ? "flex" : "md:hidden"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      {activeMode === "dark" ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Dark Mode
                        </>
                      )}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {activeMode === "dark" ? "Dark" : "Light"}
                    </span>
                  </button>

                  {/* Mobile-only Switch to Editor */}
                  {(currentPage === "analytics" || currentPage === "profile") && (
                    <Link
                      href="/dashboard/edit"
                      onClick={() => setMenuOpen(false)}
                      className="md:hidden flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      Go to Editor
                    </Link>
                  )}

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <UserCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    Edit Profile
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    Home
                  </Link>

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
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
