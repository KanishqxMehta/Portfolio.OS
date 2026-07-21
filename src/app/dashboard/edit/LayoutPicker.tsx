"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { LAYOUTS } from "@/lib/layouts";
import { CheckCircle2, AlignJustify, LayoutGrid, GalleryHorizontalEnd, Columns2, TerminalSquare } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  AlignJustify,
  LayoutGrid,
  GalleryHorizontalEnd,
  Columns2,
  TerminalSquare,
};

export const LayoutPicker = () => {
  const layout = usePortfolioStore((state) => state.layout);
  const setLayout = usePortfolioStore((state) => state.setLayout);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2 transition-colors">Design Template</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 transition-colors">Select the structural layout paradigm for your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(LAYOUTS).map((t) => {
          const isActive = layout === t.id;
          const Icon = ICON_MAP[t.iconName] || AlignJustify;
          return (
            <button
              key={t.id}
              onClick={() => setLayout(t.id)}
              className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-zinc-100 dark:bg-zinc-800/80 border-violet-500 shadow-md shadow-violet-500/10 scale-[1.02]" 
                  : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 shadow-sm dark:shadow-none"
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 text-violet-500 animate-in fade-in zoom-in">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              
              <div 
                className="w-10 h-10 rounded-lg mb-4 shadow-sm flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
              >
                <Icon className="w-5 h-5" />
              </div>
              
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1 transition-colors">{t.name}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-tight transition-colors">{t.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
