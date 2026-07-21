"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { BlockEditor } from "@/app/dashboard/BlockEditor";
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  HERO: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900/40",
  PROJECTS: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900/40",
  SKILLS: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
  EXPERIENCE: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
  EDUCATION: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
  CONTACT_FORM: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
};

interface BlockUIProps {
  section: any;
  index: number;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  sections: any[];
  dragHandleProps?: any;
  setNodeRef?: any;
  style?: any;
  isDraggingOverlay?: boolean;
}

export function BlockUI({
  section,
  index,
  hoveredId,
  setHoveredId,
  sections,
  dragHandleProps,
  setNodeRef,
  style,
  isDraggingOverlay = false,
}: BlockUIProps) {
  const removeBlock = usePortfolioStore((state) => state.removeBlock);
  const moveBlock = usePortfolioStore((state) => state.moveBlock);
  const toggleBlockVisibility = usePortfolioStore((state) => state.toggleBlockVisibility);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHoveredId(section.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={cn(
        "rounded-xl border transition-colors duration-200",
        hoveredId === section.id
          ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60"
          : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30",
        isDraggingOverlay && "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl"
      )}
    >
      {/* Block header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          {dragHandleProps && (
            <button
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 transition-colors -ml-1.5 touch-none"
              tabIndex={-1}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
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
          {/* Visibility toggle */}
          {section.type !== "HERO" && (
            <button
              onClick={() => toggleBlockVisibility(section.id)}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center transition-colors",
                section.isVisible
                  ? "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  : "text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500"
              )}
              title={section.isVisible ? "Hide from preview" : "Show in preview"}
            >
              {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}
          {section.type !== "HERO" && section.type !== "CONTACT_FORM" && (
            <>
              <button
                onClick={() => {
                  const isFirst = index === 0 || (index === 1 && sections[0].type === "HERO");
                  if (!isFirst) moveBlock(section.id, "up");
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
                  if (!isLast) moveBlock(section.id, "down");
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
              onClick={() => removeBlock(section.id)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Block content — dim if hidden */}
      {!isDraggingOverlay && (
        <div className={cn("px-4 pb-4", !section.isVisible && "opacity-40")}>
          {section.isVisible ? (
            <BlockEditor block={section} />
          ) : (
            <p className="text-[11px] text-zinc-500 italic">Block is hidden from preview. Toggle the eye icon to show it.</p>
          )}
        </div>
      )}
    </div>
  );
}
