"use client";

import { useState, useRef, useEffect } from "react";
import * as motion from "framer-motion/client";
import { THEMES } from "@/lib/themes";
import {
  Sparkles,
  GitCompare,
  Layers,
  Layout,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseCard {
  id: string;
  title: string;
  badge: string;
}

const SWIPE_THRESHOLD = 112;

// Add or remove a feature here. The stack order and controls update automatically.
const cards: ShowcaseCard[] = [
  { id: "diff", title: "Selective Diff Engine", badge: "Version Control" },
  { id: "themes", title: "Dynamic Theme Palettes", badge: "6+ Presets" },
  { id: "layouts", title: "Structural Layouts", badge: "Bento & Sidebar" },
];

export function ShowcaseStackSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeThemeId, setActiveThemeId] = useState("neobrutalism");
  const [activeLayout, setActiveLayout] = useState("bento");
  const [isCycling, setIsCycling] = useState(false);
  const [liftingCardId, setLiftingCardId] = useState<string | null>(null);
  const suppressCardClick = useRef(false);
  const cycleLock = useRef(false);
  const hasTriggeredSwipe = useRef(false);
  const cycleTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeTheme = THEMES[activeThemeId] || THEMES.neobrutalism;

  useEffect(() => {
    return () => cycleTimeouts.current.forEach(clearTimeout);
  }, []);

  const handleNext = () => {
    if (isCycling || cycleLock.current) return;

    cycleLock.current = true;
    setIsCycling(true);
    setLiftingCardId(cards[activeCardIndex].id);

    cycleTimeouts.current = [
      setTimeout(() => {
        setLiftingCardId(null);
        setActiveCardIndex((prev) => (prev + 1) % cards.length);
      }, 180),
      setTimeout(() => {
        setIsCycling(false);
        cycleLock.current = false;
      }, 520),
    ];
  };

  const handlePrev = () => {
    if (isCycling || cycleLock.current) return;

    cycleLock.current = true;
    setIsCycling(true);
    setActiveCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    cycleTimeouts.current = [
      setTimeout(() => {
        setIsCycling(false);
        cycleLock.current = false;
      }, 340),
    ];
  };

  const selectCard = (index: number) => {
    if (!isCycling) setActiveCardIndex(index);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only capture strong horizontal trackpad swipes so vertical page scroll is strictly prioritized
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 40) {
      if (e.deltaX > 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-left select-none overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Card Stack
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-4">
          Tilted Card Stack Experience
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          The cards tilt dynamically to reveal layers underneath. Swipe or click to flip the top card to the back of the stack.
        </p>
      </div>

      {/* Navigation Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {cards.map((c, idx) => {
          const isActive = activeCardIndex === idx;
          return (
            <button
              key={c.id}
              onClick={() => selectCard(idx)}
              disabled={isCycling}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 sm:gap-2",
                isActive
                  ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/30 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <span>{c.title}</span>
              <span className={cn("hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase", isActive ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500")}>
                {c.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Physical card stack: the active card lifts away before it is returned to the back. */}
      <div
        onWheel={handleWheel}
        className="relative w-full max-w-5xl mx-auto min-h-[760px] sm:min-h-[660px] flex items-center justify-center touch-pan-y perspective-[1200px]"
      >
        {cards.map((card, idx) => {
          const total = cards.length;
          const offset = (idx - activeCardIndex + total) % total;
          const isTop = offset === 0;
          const isLifting = liftingCardId === card.id;
          const stackPositions = [
            { x: -10, y: 0, rotate: -2, scale: 1, opacity: 1 },
            { x: 10, y: 18, rotate: 2.5, scale: 0.965, opacity: 0.92 },
            { x: -4, y: 34, rotate: -1, scale: 0.93, opacity: 0.84 },
          ];
          const position = stackPositions[Math.min(offset, stackPositions.length - 1)];
          const target = isLifting
            ? { x: -18, y: -86, rotate: -5, scale: 1.015, opacity: 1 }
            : position;
          const isFloating = isTop && !isCycling;

          return (
            <motion.div
              key={card.id}
              drag={isTop && !isCycling ? "x" : false}
              dragConstraints={{ left: -SWIPE_THRESHOLD, right: SWIPE_THRESHOLD }}
              dragElastic={0.04}
              dragMomentum={false}
              dragSnapToOrigin
              onDragStart={() => {
                suppressCardClick.current = true;
                hasTriggeredSwipe.current = false;
              }}
              onDrag={(_, info) => {
                if (
                  !isTop ||
                  hasTriggeredSwipe.current ||
                  Math.abs(info.offset.x) < SWIPE_THRESHOLD ||
                  cycleLock.current
                ) {
                  return;
                }

                hasTriggeredSwipe.current = true;
                if (info.offset.x < 0) handleNext();
                else handlePrev();
              }}
              onDragEnd={() => {
                hasTriggeredSwipe.current = false;
              }}
              onClick={() => {
                if (suppressCardClick.current) {
                  suppressCardClick.current = false;
                  return;
                }

                if (isTop) handleNext();
                else selectCard(idx);
              }}
              animate={{
                ...target,
                y: isFloating ? [target.y, target.y - 6, target.y] : target.y,
              }}
              transition={{
                duration: isLifting ? 0.18 : 0.34,
                ease: isLifting ? [0.23, 1, 0.32, 1] : [0.77, 0, 0.175, 1],
                y: isFloating
                  ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: isLifting ? 0.18 : 0.34 },
              }}
              style={{
                zIndex: isLifting ? total + 1 : total - offset,
              }}
              className={cn(
                "absolute inset-0 rounded-2xl border p-4 sm:p-8 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 cursor-pointer overflow-hidden will-change-transform",
                isTop
                  ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 shadow-[0_24px_70px_-34px_rgba(24,24,27,0.28)] dark:shadow-black/40 ring-1 ring-violet-500/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30 shadow-[0_18px_50px_-36px_rgba(24,24,27,0.22)]"
              )}
            >
              {(isTop || isLifting) && (
                <>
              {/* CARD 1: SELECTIVE DIFF MODE */}
              {card.id === "diff" && (
                <>
                  <div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <GitCompare className="w-5 h-5 text-emerald-400" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                          Version Control Engine
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        Granular Per-Item Diff
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                      Selective Split-Screen Diff View
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-6">
                      Compare your live portfolio against AI resume uploads or draft edits side-by-side. Review green (+ Added), yellow (~ Modified), and red (- Removed) item rings before accepting changes.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 p-3 sm:p-4 grid md:grid-cols-2 gap-3 sm:gap-4 flex-1 shadow-sm min-h-[360px]">
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700/60 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-500" />
                          Current Live Version
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">Original Baseline</span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-hidden opacity-75">
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40">
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Alex Morgan</div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-500">Full-Stack Software Engineer & System Architect</div>
                        </div>
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40">
                          <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60">React</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60">Next.js</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60">TypeScript</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40">
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Portfolio.OS Core Platform</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">Developer web builder engine</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-violet-200 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-950/20 p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-violet-200 dark:border-violet-900/40 text-xs font-bold text-violet-700 dark:text-violet-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                          Proposed AI Resume Draft
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">+2 Items Added</span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-hidden">
                        <div className="p-3 rounded-lg border border-violet-200 dark:border-violet-900/40 bg-white dark:bg-zinc-900/60">
                          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">React</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400/80 font-bold">+ PostgreSQL</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400/80 font-bold">+ Docker</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-400/30 shadow-sm">
                          <div className="flex justify-between items-center text-xs font-bold text-amber-700 dark:text-amber-300">
                            <span>Voxyn – AI Public Speaking Coach</span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">~ Modified Item</span>
                          </div>
                          <div className="text-[10px] text-zinc-600 dark:text-zinc-300 mt-1 font-mono">
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">[description]:</span> Updated audio analytics pipeline
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-400/30 shadow-sm">
                          <div className="flex justify-between items-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <span>Quantum RAG Vector Engine</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">+ Added Item</span>
                          </div>
                          <div className="text-[10px] text-zinc-600 dark:text-zinc-300 mt-1">Python, LangChain, Pinecone</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CARD 2: THEMES */}
              {card.id === "themes" && (
                <>
                  <div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <span className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <Layers className="w-5 h-5 text-violet-400" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                          Theme Palette Engine
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[
                          { id: "neobrutalism", label: "Neo-Brutalism" },
                          { id: "liquidglass", label: "Glassmorphism" },
                          { id: "terminal", label: "Hacker Terminal" },
                          { id: "paper", label: "Modern Ink" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveThemeId(t.id);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={cn(
                              "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border transition-all cursor-pointer",
                              activeThemeId === t.id
                                ? "bg-violet-600 text-white border-violet-500 shadow-md"
                                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                      6+ Custom Design Presets
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-6">
                      Switch themes with a single click. From Neo-Brutal high contrast to Glassmorphism and Hacker CLI terminals.
                    </p>
                  </div>

                  <div
                    className="flex-1 rounded-xl p-4 sm:p-6 border transition-all duration-500 flex flex-col justify-between shadow-sm min-h-[320px]"
                    style={{
                      ...(activeTheme.cssVars as React.CSSProperties),
                      background: activeTheme.cssVars["--p-bg"],
                      color: activeTheme.cssVars["--p-fg"],
                      fontFamily: activeTheme.cssVars["--p-font"] || "sans-serif",
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center border-b border-[var(--p-border)] pb-3">
                        <h4 className="text-xl font-bold">Kanishq Mehta</h4>
                        <span className="px-3 py-1 text-xs font-bold rounded-full border border-[var(--p-border)] bg-[var(--p-pill-bg)]">
                          Senior Full-Stack Engineer
                        </span>
                      </div>
                      <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed max-w-lg">
                        Architecting modern web portals, real-time analytics engines, and AI document parsing workflows.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border border-[var(--p-border)] bg-[var(--p-bg-card)]">
                          <div className="text-xs font-bold mb-1">Featured Product</div>
                          <div className="text-[11px] text-[var(--p-fg-muted)]">Portfolio.OS Developer Platform</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--p-border)] bg-[var(--p-bg-card)]">
                          <div className="text-xs font-bold mb-1">Core Stack</div>
                          <div className="text-[11px] text-[var(--p-fg-muted)]">Next.js, TypeScript, PostgreSQL</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[var(--p-fg-muted)] pt-3 border-t border-[var(--p-border)] flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                      <span>Active Palette: <strong>{activeTheme.name}</strong></span>
                      <span className="text-[var(--p-primary)] font-bold">1-Click Live Switch</span>
                    </div>
                  </div>
                </>
              )}

              {/* CARD 3: LAYOUTS */}
              {card.id === "layouts" && (
                <>
                  <div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <span className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <Layout className="w-5 h-5 text-indigo-400" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                          Structural Layout Engine
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {["bento", "sidebar", "minimal"].map((l) => (
                          <button
                            key={l}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLayout(l);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={cn(
                              "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border transition-all cursor-pointer uppercase",
                              activeLayout === l
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                      Bento, Split Sidebar &amp; Minimal Layouts
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-6">
                      Arrange your developer blocks using specialized grid layouts designed for mobile, tablet, and desktop screens.
                    </p>
                  </div>

                  <div className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 p-3 sm:p-5 flex flex-col justify-between min-h-[420px] sm:min-h-[360px] shadow-sm">
                    {activeLayout === "bento" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                          <span>Bento Grid Layout Preview</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Grid Alignment</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 shadow-sm">
                            <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Bento Hero Component</div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Prominent grid placement for full-stack developer intro, social badges, and quick CTA links.</p>
                          </div>
                          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1 shadow-sm">
                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Tech Stack Grid</div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Next.js</span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">TS</span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Prisma</span>
                            </div>
                          </div>
                          <div className="sm:col-span-3 p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1 shadow-sm">
                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-between">
                              <span>Featured Projects Grid Cards</span>
                              <span className="text-[10px] text-zinc-500">2 Columns</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2 pt-1">
                              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Project Alpha</div>
                              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Project Beta</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeLayout === "sidebar" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                          <span>Split Sidebar Layout Preview</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Fixed Sidebar</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">KM</div>
                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Sticky Profile Sidebar</div>
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Fixed social links & contact card</div>
                          </div>
                          <div className="sm:col-span-2 p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2 shadow-sm">
                            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Main Content Stream</div>
                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">Experience Timeline & Work History</div>
                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">Project Showcases</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeLayout === "minimal" && (
                      <div className="space-y-3 max-w-2xl mx-auto w-full">
                        <div className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                          <span>Minimal Stacked Layout Preview</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Centered Stack</span>
                        </div>
                        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2 shadow-sm">
                          <div className="w-10 h-1 bg-violet-500 rounded-full" />
                          <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Clean Minimal Headline</div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Focused single-column vertical layout with spacious typography and subtle item borders.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2 shadow-sm">
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Stacked Experience Cards</div>
                          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">Lead Full-Stack Engineer (2024 - Present)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Click card or swipe left/right to flip top card to back</span>
                <span className="text-violet-400 font-semibold flex items-center gap-1">
                  Card {activeCardIndex + 1} of {cards.length}
                </span>
              </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
          title="Previous Card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="p-3 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
          title="Next Card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
