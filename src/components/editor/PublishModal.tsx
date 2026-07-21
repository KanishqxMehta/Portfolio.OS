"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string;
}

export function PublishModal({ isOpen, onOpenChange, publicUrl }: PublishModalProps) {
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
