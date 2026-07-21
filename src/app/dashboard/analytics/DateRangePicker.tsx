"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export type DateRangeOption = "24h" | "7d" | "1m" | "6m" | "all";

const RANGE_OPTIONS: { id: DateRangeOption; label: string }[] = [
  { id: "24h", label: "24 Hrs" },
  { id: "7d", label: "7 Days" },
  { id: "1m", label: "1 Mo" },
  { id: "6m", label: "6 Mo" },
  { id: "all", label: "All Time" },
];

interface DateRangePickerProps {
  currentRange: DateRangeOption;
  onChange: (range: DateRangeOption) => void;
}

export function DateRangePicker({ currentRange, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 shadow-inner">
      <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500 border-r border-zinc-200 dark:border-zinc-700/60">
        <Clock className="w-3.5 h-3.5" />
        <span>Range</span>
      </div>
      {RANGE_OPTIONS.map((opt) => {
        const isActive = currentRange === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              isActive
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/50"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
