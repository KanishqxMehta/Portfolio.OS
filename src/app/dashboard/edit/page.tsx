"use client";
import { useState } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { BlockEditor } from "../BlockEditor";
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
  const {
    sections,
    addBlock,
    username,
    setUsername,
    savePortfolio,
    isSaving,
    moveBlock,
    removeBlock,
  } = usePortfolioStore();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSave = async () => {
    await savePortfolio();
    setIsSuccessOpen(true);
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL + "p/" + username}`;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="h-13 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-5">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Portfolio<span className="text-zinc-500">.os</span>
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-800" />

          {/* Username field */}
          <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700/60 rounded-md px-2.5 py-1.5 focus-within:border-violet-500/50 transition-colors">
            <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-zinc-600 text-sm">p/</span>
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-auto w-28 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-zinc-600 font-medium text-zinc-200"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 px-4 text-sm font-medium rounded-md bg-violet-600 hover:bg-violet-500 text-white border-0 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving
            </span>
          ) : (
            "Publish"
          )}
        </Button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        <aside className="w-[360px] bg-zinc-900 border-r border-zinc-800 flex flex-col z-10">
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-zinc-800">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Content Blocks
            </p>
          </div>

          {/* Blocks list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-500">No blocks yet</p>
                <p className="text-xs text-zinc-700 mt-1">
                  Add one below to get started
                </p>
              </div>
            )}

            {sections.map((section, index) => (
              <div
                key={section.id}
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "rounded-xl border transition-all duration-200",
                  hoveredId === section.id
                    ? "border-zinc-700 bg-zinc-800/60"
                    : "border-zinc-800 bg-zinc-800/30"
                )}
              >
                {/* Block header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        TYPE_COLORS[section.type] ??
                          "bg-zinc-700 text-zinc-300 border-zinc-600"
                      )}
                    >
                      {section.type}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      #{index + 1}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-0.5 transition-opacity",
                      hoveredId === section.id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <button
                      onClick={() => moveBlock!(section.id, "up")}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveBlock!(section.id, "down")}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeBlock!(section.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
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
          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3 px-1">
              Add Block
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_TYPES.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type, label)}
                  className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700 transition-all text-left group"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <Plus className="w-3 h-3 text-violet-500 group-hover:text-violet-400 transition-colors" />
                    <span className="text-sm font-medium text-zinc-300">
                      {label}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 pl-4">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Preview pane */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 flex flex-col items-center py-10 px-8">
          {/* Browser chrome */}
          <div className="w-full max-w-3xl">
            <div className="bg-zinc-900 rounded-t-xl border border-zinc-800 h-10 flex items-center px-4 gap-2">
              <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              </div>
              <div className="ml-3 flex-1 bg-zinc-800/80 rounded px-3 py-1 text-[10px] text-zinc-500 font-mono truncate border border-zinc-700/50">
                {publicUrl}
              </div>
            </div>

            {/* Preview content */}
            <div className="bg-zinc-950 border-x border-b border-zinc-800 rounded-b-xl overflow-hidden shadow-2xl shadow-black/50 min-h-[40rem] relative">
              <PortfolioRenderer sections={sections} />

              {sections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <Layers className="w-7 h-7 text-zinc-400" />
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