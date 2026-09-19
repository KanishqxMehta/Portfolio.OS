"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, Globe } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string;
}

export function PublishModal({ isOpen, onOpenChange, publicUrl }: PublishModalProps) {
  const isPublicOnSearch = usePortfolioStore((state) => state.isPublicOnSearch);
  const updatePublicSearch = usePortfolioStore((state) => state.updatePublicSearch);
  const [isUpdatingSearch, setIsUpdatingSearch] = useState(false);

  const handleToggleSearch = async () => {
    const nextVal = !isPublicOnSearch;
    setIsUpdatingSearch(true);
    const success = await updatePublicSearch(nextVal);
    setIsUpdatingSearch(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl pt-10">
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

        {/* Public URL Box */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-3 rounded-xl mt-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
              Public URL
            </p>
            <p className="text-sm font-mono text-zinc-600 dark:text-zinc-300 truncate break-all">
              {publicUrl}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              useToastStore.getState().toast("URL copied to clipboard!", "success");
            }}
            className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Copy URL"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Public Search Toggle Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-start gap-3 pr-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Show on Public Search
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    isPublicOnSearch
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600"
                  )}
                >
                  {isPublicOnSearch ? "Public" : "Unlisted"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Allow this portfolio to be discovered by recruiters on the public search directory.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublicOnSearch}
            disabled={isUpdatingSearch}
            onClick={handleToggleSearch}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              isPublicOnSearch ? "bg-violet-600" : "bg-zinc-300 dark:bg-zinc-700",
              isUpdatingSearch && "opacity-60 cursor-wait"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                isPublicOnSearch ? "translate-x-5" : "translate-x-0"
              )}
            />
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
            onClick={() => onOpenChange(false)}
            className="w-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Back to Editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
