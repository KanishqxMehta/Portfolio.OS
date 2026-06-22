"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { BlockEditor } from "../BlockEditor";
import { ThemePicker } from "./ThemePicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useRef } from "react";
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
  Eye,
  Edit3,
  Sun,
  Moon,
  TrendingUp,
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
  { type: "SKILLS", label: "Skills", description: "List of tech" },
  { type: "EXPERIENCE", label: "Experience", description: "Work history" },
  { type: "PROJECTS", label: "Projects", description: "Your portfolio" },
  { type: "EDUCATION", label: "Education", description: "Degrees & certs" },
  { type: "TESTIMONIALS", label: "Testimonials", description: "Quotes from peers" },
  { type: "CONTACT_FORM", label: "Contact Form", description: "Email you directly" },
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
  const { theme: activeMode, setTheme: setActiveMode } = useTheme();
  const [activeSidebarTab, setActiveSidebarTab] = useState<"content" | "design">("content");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
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
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadRef = useRef(true);

  // Auth redirection is handled by middleware.ts, client side only loads when authenticated.

  useEffect(() => {
    if (status === "authenticated") {
      const sessionUsername = (session?.user as any)?.username;
      if (sessionUsername && !username) {
        setUsername(sessionUsername);
      }
      loadPortfolio();
    }
  }, [status]);

  // Monitor changes to sections or theme to mark form as dirty
  useEffect(() => {
    if (isLoading) {
      initialLoadRef.current = true;
      setIsDirty(false);
      return;
    }

    // If we finished loading, ignore the first state sync
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    setIsDirty(true);
  }, [sections, theme, isLoading]);

  // Prevent browser closing / reloading when page is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async () => {
    const success = await savePortfolio();
    if (success) {
      setIsSuccessOpen(true);
      setIsDirty(false);
    }
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL}p/${username}`;

  return (
    <div className="h-[100dvh] bg-white dark:bg-zinc-950 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500 overflow-hidden">
      {/* Shared Responsive Header */}
      <DashboardHeader
        currentPage="editor"
        publicSlug={username}
        isSaving={isSaving}
        isDirty={isDirty}
        onSave={handleSave}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-3 transition-opacity">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">Loading portfolio...</p>
          </div>
        )}
        {/* Left Sidebar */}
        <aside className={cn("w-full md:w-[360px] border-r border-zinc-200 dark:border-zinc-900 flex flex-col bg-zinc-50/80 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-30 shadow-lg dark:shadow-2xl dark:shadow-black/40 transition-colors duration-500", mobileView === "edit" ? "flex" : "hidden md:flex")}>
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
                    {section.type !== "HERO" && section.type !== "CONTACT_FORM" && (
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
                            const isLast = index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM");
                            if (!isLast) moveBlock!(section.id, "down");
                          }}
                          disabled={index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM")}
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center transition-colors",
                            (index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM"))
                              ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed opacity-30"
                              : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                          )}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {section.type !== "HERO" && (
                      <button
                        onClick={() => removeBlock!(section.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Add Block
              </p>
              <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                {sections.length}/{BLOCK_TYPES.length} Active
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(({ type, label }) => {
                const isAdded = sections.some((s) => s.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => !isAdded && addBlock(type, label)}
                    disabled={isAdded}
                    className={cn(
                      "group flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all whitespace-nowrap",
                      isAdded
                        ? "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer shadow-sm hover:shadow"
                    )}
                  >
                    {isAdded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500/50" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-violet-500 group-hover:scale-110 transition-transform" />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
            </>
          )}
        </aside>

        {/* Preview pane */}
        <main className={cn("flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-6 md:py-10 px-4 md:px-8 transition-colors duration-500", mobileView === "preview" ? "flex" : "hidden md:flex")} data-lenis-prevent>
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

              {sections.length === 0 && !isLoading && (
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl pt-10">
          <DialogHeader className="flex flex-col items-center space-y-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Portfolio Published
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
              Your portfolio is live and ready to share.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-3 rounded-xl mt-2">
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
                Public URL
              </p>
              <p className="text-sm font-mono text-zinc-600 dark:text-zinc-300 truncate">
                {publicUrl}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-xl font-medium cursor-pointer">
                View Live Site <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={() => setIsSuccessOpen(false)}
              className="w-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              Back to Editor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile view toggle floating button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <button
          onClick={() => setMobileView(mobileView === "edit" ? "preview" : "edit")}
          className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all border border-zinc-800 dark:border-zinc-200/85 cursor-pointer"
        >
          {mobileView === "edit" ? (
            <>
              <Eye className="w-4 h-4 shrink-0" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 shrink-0" />
              <span>Edit Blocks</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}