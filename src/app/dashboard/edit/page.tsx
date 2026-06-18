"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { BlockEditor } from "../BlockEditor";
import { ThemePicker } from "./ThemePicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ExternalLink,
  CheckCircle2,
  Copy,
  ChevronUp,
  ChevronDown,
  Trash2,
  Layers,
  Globe,
  LogOut,
  LayoutDashboard,
  Check,
  UserCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const BLOCK_TYPES = [
  { type: "HERO", label: "Hero", description: "Name & bio" },
  { type: "PROJECTS", label: "Projects", description: "Work showcase" },
  { type: "SKILLS", label: "Skills", description: "Tech stack" },
  { type: "EXPERIENCE", label: "Experience", description: "Work history" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  HERO: "bg-violet-50 text-violet-600 border-violet-100",
  PROJECTS: "bg-sky-50 text-sky-600 border-sky-100",
  SKILLS: "bg-emerald-50 text-emerald-600 border-emerald-100",
  EXPERIENCE: "bg-amber-50 text-amber-600 border-amber-100",
};

export default function EditPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSidebarTab, setActiveSidebarTab] = useState<"content" | "design">("content");
  const {
    sections,
    theme,
    addBlock,
    username,
    setUsername,
    savePortfolio,
    isSaving,
    isLoading,
    loadPortfolio,
    moveBlock,
    removeBlock,
  } = usePortfolioStore();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const sessionUsername = (session?.user as any)?.username;
      if (sessionUsername && !username) {
        setUsername(sessionUsername);
      }
      loadPortfolio();
    }
  }, [status]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSave = async () => {
    await savePortfolio();
    setIsSuccessOpen(true);
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL}p/${username}`;
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200 transition-colors duration-500">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-900/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-500">
        <div className="flex items-center gap-6">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 shadow-md shadow-violet-500/20 transition-all">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
              Portfolio<span className="text-zinc-500 dark:text-zinc-400">.os</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800/80" />

          {/* Username field */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 transition-colors cursor-default">
            <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-zinc-500 text-sm font-medium">p/</span>
            <Input
              placeholder="username"
              value={username}
              readOnly
              className="h-auto w-auto min-w-[80px] max-w-[150px] border-none bg-transparent p-0 text-sm shadow-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-zinc-200 cursor-default focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Group Actions on the Right */}
        <div className="flex items-center gap-5">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 px-4 text-sm font-medium rounded-full bg-violet-600 hover:bg-violet-500 text-white border-0 transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving
              </span>
            ) : (
              "Publish Changes"
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-500 mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-zinc-600 border-t-zinc-300 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <ThemeToggle />

          {/* User menu */}
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
                <div
                  className="absolute right-0 top-11 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl shadow-black/10 dark:shadow-black/80 overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">{session?.user?.name || session?.user?.email}</p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{session?.user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Home
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[360px] border-r border-zinc-200 dark:border-zinc-900 flex flex-col bg-zinc-50/80 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-30 shadow-lg dark:shadow-2xl dark:shadow-black/40 transition-colors duration-500">
          {/* Sidebar header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-500">
            <button
              onClick={() => setActiveSidebarTab("content")}
              className={cn(
                "flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest border-b-2 transition-colors",
                activeSidebarTab === "content" ? "border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-400"
              )}
            >
              Content Blocks
            </button>
            <button
              onClick={() => setActiveSidebarTab("design")}
              className={cn(
                "flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest border-b-2 transition-colors",
                activeSidebarTab === "design" ? "border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-400"
              )}
            >
              Theme & Design
            </button>
          </div>

          {activeSidebarTab === "design" ? (
            <div className="flex-1 overflow-y-auto p-4" data-lenis-prevent>
              <ThemePicker />
            </div>
          ) : (
            <>
              {/* Blocks list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" data-lenis-prevent>
                {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-500">No blocks yet</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Add one below to get started
                </p>
              </div>
            ) : null}

            {sections.map((section, index) => (
              <div
                key={section.id}
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "rounded-xl border transition-all duration-200",
                  hoveredId === section.id
                    ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30"
                )}
              >
                {/* Block header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        TYPE_COLORS[section.type] ??
                          "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600"
                      )}
                    >
                      {section.type}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      #{index + 1}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-0.5 transition-opacity",
                      hoveredId === section.id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {section.type !== "HERO" && (
                      <>
                        <button
                          onClick={() => {
                            const isFirst = index === 0 || (index === 1 && sections[0].type === "HERO");
                            if (!isFirst) moveBlock!(section.id, "up");
                          }}
                          disabled={index === 0 || (index === 1 && sections[0].type === "HERO")}
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center transition-colors",
                            (index === 0 || (index === 1 && sections[0].type === "HERO"))
                              ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed opacity-30"
                              : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                          )}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const isLast = index === sections.length - 1;
                            if (!isLast) moveBlock!(section.id, "down");
                          }}
                          disabled={index === sections.length - 1}
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center transition-colors",
                            (index === sections.length - 1)
                              ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed opacity-30"
                              : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                          )}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeBlock!(section.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block content */}
                <div className="px-4 pb-4">
                  <BlockEditor block={section} />
                </div>
              </div>
            ))}
          </div>

          {/* Add block panel */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-3 px-1">
              Add Block
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_TYPES.map(({ type, label, description }) => {
                const isAdded = sections.some((s) => s.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => !isAdded && addBlock(type, label)}
                    disabled={isAdded}
                    className={cn(
                      "flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border text-left transition-all",
                      isAdded
                        ? "border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/10 cursor-not-allowed opacity-40"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer group"
                    )}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      {isAdded ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Plus className="w-3 h-3 text-violet-500 group-hover:text-violet-400 transition-colors" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        isAdded ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-300"
                      )}>
                        {label}
                      </span>
                    </div>
                    </button>
                  );
                })}
              </div>
            </div>
            </>
          )}
        </aside>

        {/* Preview pane */}
        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-10 px-8 transition-colors duration-500" data-lenis-prevent>
          {/* Preview Container Wrapper */}
          <div className="max-w-[1000px] mx-auto w-full">
            {/* macOS window chrome */}
            <div className="rounded-t-2xl bg-zinc-200 dark:bg-zinc-900 border-x border-t border-zinc-300 dark:border-zinc-800 flex items-center px-4 h-10 gap-2 transition-colors duration-500">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <div className="mx-auto bg-zinc-300/50 dark:bg-zinc-950 px-3 py-1 rounded text-[10px] text-zinc-500 dark:text-zinc-500 font-mono flex-1 max-w-[300px] text-center ml-4 border border-zinc-300 dark:border-zinc-800 shadow-inner transition-colors duration-500 truncate">
                {publicUrl}
              </div>
            </div>

            {/* Preview content */}
            <div className="border border-zinc-300 dark:border-zinc-800 rounded-b-2xl overflow-hidden bg-white dark:bg-black shadow-2xl shadow-black/10 dark:shadow-black/60 relative min-h-[600px] transition-colors duration-500">
              <PortfolioRenderer sections={sections} theme={theme} />

              {sections.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                    <Layers className="w-7 h-7 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-base font-semibold text-zinc-400">
                    Your portfolio is empty
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Add blocks from the left panel
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Success dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader className="flex flex-col items-center space-y-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-zinc-100">
              Portfolio Published
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-sm">
              Your portfolio is live and ready to share.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 bg-zinc-800/60 border border-zinc-700/60 p-3 rounded-xl mt-2">
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                Public URL
              </p>
              <p className="text-sm font-mono text-zinc-300 truncate">
                {publicUrl}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-xl font-medium">
                View Live Site <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={() => setIsSuccessOpen(false)}
              className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl"
            >
              Back to Editor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}