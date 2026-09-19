"use client";

import { useState, useRef, useEffect } from "react";
import * as motion from "framer-motion/client";
import { THEMES } from "@/lib/themes";
import {
  Sparkles,
  Layers,
  Layout,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Phone,
  ArrowUpDown,
  Wand2,
  Check,
  X,
  CheckCircle2,
  LayoutGrid,
  Columns2,
  AlignJustify,
  TerminalSquare,
  Zap,
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
  { id: "dnd", title: "Drag & Drop Canvas", badge: "Live Reorder" },
  { id: "themes", title: "Dynamic Theme Palettes", badge: "6+ Presets" },
  { id: "layouts", title: "Structural Layouts", badge: "Bento & Sidebar" },
];

export function ShowcaseStackSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeThemeId, setActiveThemeId] = useState("neobrutalism");
  const [activeLayout, setActiveLayout] = useState("sidebar");
  const [mobileDiffTab, setMobileDiffTab] = useState<"proposed" | "live">("proposed");
  const [mobileDndTab, setMobileDndTab] = useState<"editor" | "preview">("editor");
  const [mobileThemeTab, setMobileThemeTab] = useState<"picker" | "preview">("picker");
  const [mobileLayoutTab, setMobileLayoutTab] = useState<"picker" | "preview">("picker");
  const [diffDecisions, setDiffDecisions] = useState<Record<string, "accepted" | "rejected" | "pending">>({
    skills: "accepted",
    project: "pending",
  });
  const [isReordered, setIsReordered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [liftingCardId, setLiftingCardId] = useState<string | null>(null);
  const [liftDirection, setLiftDirection] = useState<"left" | "right">("left");
  const suppressCardClick = useRef(false);
  const cycleLock = useRef(false);
  const hasTriggeredSwipe = useRef(false);
  const cycleTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeTheme = THEMES[activeThemeId] || THEMES.neobrutalism;
  const diffAcceptedCount = Object.values(diffDecisions).filter((d) => d === "accepted").length;
  const diffKeptCount = Object.values(diffDecisions).filter((d) => d === "rejected").length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      cycleTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  // Auto-play the drag & drop animation whenever the user lands on the dnd feature card
  useEffect(() => {
    if (cards[activeCardIndex]?.id === "dnd") {
      setIsReordered(false);
      const timer = setTimeout(() => {
        setIsReordered(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [activeCardIndex]);

  const handleNext = () => {
    if (isCycling || cycleLock.current) return;

    cycleLock.current = true;
    setIsCycling(true);
    setLiftDirection("left");
    setLiftingCardId(cards[activeCardIndex].id);

    cycleTimeouts.current = [
      setTimeout(() => {
        setLiftingCardId(null);
        setActiveCardIndex((prev) => (prev + 1) % cards.length);
      }, 300),
      setTimeout(() => {
        setIsCycling(false);
        cycleLock.current = false;
      }, 620),
    ];
  };

  const handlePrev = () => {
    if (isCycling || cycleLock.current) return;

    cycleLock.current = true;
    setIsCycling(true);
    setLiftDirection("right");
    setLiftingCardId(cards[activeCardIndex].id);

    cycleTimeouts.current = [
      setTimeout(() => {
        setLiftingCardId(null);
        setActiveCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
      }, 300),
      setTimeout(() => {
        setIsCycling(false);
        cycleLock.current = false;
      }, 620),
    ];
  };

  const selectCard = (index: number) => {
    if (!isCycling && !cycleLock.current && index !== activeCardIndex) {
      const dir = index > activeCardIndex ? "left" : "right";
      cycleLock.current = true;
      setIsCycling(true);
      setLiftDirection(dir);
      setLiftingCardId(cards[activeCardIndex].id);

      cycleTimeouts.current = [
        setTimeout(() => {
          setLiftingCardId(null);
          setActiveCardIndex(index);
        }, 300),
        setTimeout(() => {
          setIsCycling(false);
          cycleLock.current = false;
        }, 620),
      ];
    }
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
          Interactive Portfolio Builder Suite
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-4">
          The All-in-One AI Portfolio Maker
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Turn your static resume into an interactive developer portfolio. Explore selective diff version control, 6+ modern themes, and versatile structural layouts.
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
        className="relative w-full max-w-5xl mx-auto h-[460px] sm:h-[650px] flex items-center justify-center touch-pan-y perspective-[1200px]"
      >
        {cards.map((card, idx) => {
          const total = cards.length;
          const offset = (idx - activeCardIndex + total) % total;
          const isTop = offset === 0;
          const isLifting = liftingCardId === card.id;
          const stackPositions = isMobile
            ? [
                { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
                { x: 0, y: 12, rotate: 0, scale: 0.97, opacity: 0.8 },
                { x: 0, y: 24, rotate: 0, scale: 0.94, opacity: 0.6 },
                { x: 0, y: 36, rotate: 0, scale: 0.91, opacity: 0.4 },
              ]
            : [
                { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
                { x: 0, y: 18, rotate: 1.6, scale: 0.96, opacity: 0.88 },
                { x: 0, y: 36, rotate: -1.4, scale: 0.92, opacity: 0.72 },
                { x: 0, y: 52, rotate: 0.8, scale: 0.88, opacity: 0.55 },
              ];
          const position = stackPositions[Math.min(offset, stackPositions.length - 1)];
          const target = isLifting
            ? (isMobile
                ? {
                    x: liftDirection === "right" ? 180 : -180,
                    y: -20,
                    rotate: liftDirection === "right" ? 4 : -4,
                    scale: 0.9,
                    opacity: 0,
                  }
                : {
                    x: liftDirection === "right" ? 280 : -280,
                    y: -50,
                    rotate: liftDirection === "right" ? 14 : -14,
                    scale: 0.85,
                    opacity: 0,
                  })
            : position;

          // Per-card staggered floating - background cards bob independently, top card stays stable for clicking & dragging
          const floatConfigs = [
            { amp: 0, dur: 4.0 }, // Top card: stationary (amp: 0) to prevent layout jumps during demo clicks and sliding
            { amp: isMobile ? 0 : 3.5, dur: 4.6 }, // 2nd card
            { amp: isMobile ? 0 : 2.5, dur: 5.2 }, // 3rd card
            { amp: isMobile ? 0 : 1.5, dur: 5.8 }, // 4th card
          ];
          const cardFloat = floatConfigs[Math.min(offset, floatConfigs.length - 1)];
          const shouldFloat = !isCycling && !isLifting && !isMobile && cardFloat.amp > 0;

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
                  cycleLock.current
                ) {
                  return;
                }

                if (Math.abs(info.offset.x) >= SWIPE_THRESHOLD) {
                  hasTriggeredSwipe.current = true;
                  if (info.offset.x < 0) handleNext();
                  else handlePrev();
                }
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
                y: shouldFloat ? [target.y, target.y - cardFloat.amp, target.y] : target.y,
              }}
              transition={{
                duration: isLifting ? 0.32 : 0.4,
                ease: isLifting ? [0.4, 0, 0.2, 1] : [0.77, 0, 0.175, 1],
                y: shouldFloat
                  ? { duration: cardFloat.dur, repeat: Infinity, ease: "easeInOut", delay: offset * 0.4 }
                  : { duration: isLifting ? 0.32 : 0.4 },
              }}
              style={{
                zIndex: isLifting ? total + 1 : total - offset,
              }}
              className={cn(
                "absolute inset-0 rounded-2xl border p-3.5 sm:p-8 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 cursor-pointer overflow-hidden will-change-transform",
                isTop
                  ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 shadow-[0_32px_80px_-18px_rgba(24,24,27,0.35)] dark:shadow-[0_32px_80px_-18px_rgba(0,0,0,0.7)] ring-1 ring-violet-500/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30 shadow-[0_22px_60px_-24px_rgba(24,24,27,0.28)] dark:shadow-[0_22px_60px_-24px_rgba(0,0,0,0.55)]"
              )}
            >
              {(isTop || isLifting) && (
                <>
              {/* CARD 1: SELECTIVE DIFF MODE */}
              {card.id === "diff" && (
                <>
                  <div>
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between mb-1.5 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
                          <Wand2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-violet-400" />
                        </span>
                        <div className="flex items-center gap-1.5 sm:flex-nowrap flex-wrap min-w-0">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-400 whitespace-nowrap">
                            Selective Diff &amp; Review Mode
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold bg-violet-950/80 text-violet-300 border border-violet-800/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                            3 Changes
                          </span>
                          {diffAcceptedCount > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Check className="w-2.5 h-2.5 text-emerald-400" /> {diffAcceptedCount} Accepted
                            </span>
                          )}
                          {diffKeptCount > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <X className="w-2.5 h-2.5 text-zinc-400" /> {diffKeptCount} Kept
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top Action buttons */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiffDecisions({ skills: "rejected", project: "rejected" });
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3 text-zinc-400" />
                          Discard All
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiffDecisions({ skills: "accepted", project: "accepted" });
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="px-3 py-1 rounded-full border border-violet-700/60 bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3 text-violet-400" />
                          Accept All
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-3xl font-bold tracking-tight mb-0.5 sm:mb-1.5">
                      Granular Diff Version Control
                    </h3>
                    <p className="text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-1.5 sm:mb-4 line-clamp-1 sm:line-clamp-none">
                      Compare live portfolio baseline against AI resume imports side-by-side with per-block approval controls.
                    </p>
                  </div>

                  {/* Mobile Tab Switcher */}
                  <div className="flex md:hidden items-center justify-center p-0.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl mb-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDiffTab("proposed");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileDiffTab === "proposed"
                          ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Proposed AI Diff (+2)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDiffTab("live");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileDiffTab === "live"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      Baseline Live
                    </button>
                  </div>

                  {/* Dual Pane Grid */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-2 sm:p-3.5 grid md:grid-cols-2 gap-2 sm:gap-3 flex-1 shadow-sm overflow-hidden text-white">
                    {/* Left Column: Baseline */}
                    <div className={cn("rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 sm:p-3 flex flex-col justify-between space-y-2 overflow-hidden", mobileDiffTab === "live" ? "flex" : "hidden md:flex")}>
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-xs font-bold text-zinc-400 shrink-0">
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <span className="w-2 h-2 rounded-full bg-zinc-500" />
                          Current Live Version
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono">Baseline</span>
                      </div>

                      <div className="space-y-2 flex-1 overflow-hidden opacity-80 text-left">
                        <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40">
                          <div className="text-[11px] sm:text-xs font-bold text-zinc-200">John Doe</div>
                          <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Senior Full-Stack Engineer</div>
                        </div>
                        <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40">
                          <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 mb-1">Skills (Baseline)</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-zinc-800 text-zinc-300">React</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-zinc-800 text-zinc-300">Next.js</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-zinc-800 text-zinc-300">TypeScript</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40">
                          <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 mb-0.5">Experience</div>
                          <div className="text-[9px] sm:text-[10px] text-zinc-300 font-medium">Voxyn · Full Stack Lead</div>
                          <div className="text-[8px] sm:text-[9px] text-zinc-500 truncate font-mono">Audio capture and playback</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Proposed Version with Granular Item Diff */}
                    <div className={cn("rounded-lg border border-violet-900/40 bg-zinc-900/80 p-2 sm:p-3 flex flex-col justify-between space-y-2 overflow-hidden", mobileDiffTab === "proposed" ? "flex" : "hidden md:flex")}>
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-xs font-bold text-violet-300 shrink-0">
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                          Proposed Version (Item Diff)
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono font-bold">+2 Added</span>
                      </div>

                      <div className="space-y-2 flex-1 overflow-hidden text-left">
                        {/* Skills Block with Accept/Reject buttons */}
                        <div className="p-2 rounded-lg border border-zinc-800 bg-black/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-200">Skills Block</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiffDecisions((prev) => ({ ...prev, skills: "rejected" }));
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-5 px-1.5 rounded text-[8px] font-semibold border flex items-center gap-0.5 cursor-pointer transition-colors",
                                  diffDecisions.skills === "rejected"
                                    ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                                    : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                )}
                              >
                                <X className="w-2.5 h-2.5" />
                                <span>Keep</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiffDecisions((prev) => ({ ...prev, skills: "accepted" }));
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-5 px-1.5 rounded text-[8px] font-semibold border flex items-center gap-0.5 cursor-pointer transition-colors",
                                  diffDecisions.skills === "accepted"
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                    : "border-emerald-600/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50"
                                )}
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>Accept</span>
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-zinc-800 text-zinc-300">React</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] border border-emerald-500/80 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500/40 font-bold">
                              + PostgreSQL
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] border border-emerald-500/80 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500/40 font-bold">
                              + Docker
                            </span>
                          </div>
                        </div>

                        {/* Experience Item Block with Accept/Reject buttons */}
                        <div className="p-2 rounded-lg border-2 border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/40 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-amber-300">
                            <span className="truncate pr-1">Voxyn – AI Coach</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/40 font-bold">
                                ~ Modified
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiffDecisions((prev) => ({ ...prev, project: "rejected" }));
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-5 px-1.5 rounded text-[8px] font-semibold border flex items-center gap-0.5 cursor-pointer transition-colors",
                                  diffDecisions.project === "rejected"
                                    ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                                    : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                )}
                              >
                                <X className="w-2.5 h-2.5" />
                                <span>Keep</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiffDecisions((prev) => ({ ...prev, project: "accepted" }));
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-5 px-1.5 rounded text-[8px] font-semibold border flex items-center gap-0.5 cursor-pointer transition-colors",
                                  diffDecisions.project === "accepted"
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                    : "border-emerald-600/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50"
                                )}
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>Accept</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-[9px] text-zinc-300 font-mono truncate">
                            <span className="text-amber-400 font-semibold">[desc]:</span> Audio pipeline &amp; AI coach
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CARD: DRAG & DROP REORDERING */}
              {card.id === "dnd" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <GripVertical className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-indigo-400" />
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-400">
                          Canvas Reorder Engine
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsReordered((prev) => !prev);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={cn(
                          "relative z-30 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 hover:scale-105",
                          isReordered
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                            : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/25 ring-2 ring-violet-400/40 animate-pulse"
                        )}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>{isReordered ? "↺ Reset Order" : "⚡ Simulate Drag"}</span>
                      </button>
                    </div>

                    <h3 className="text-lg sm:text-3xl font-bold tracking-tight mb-0.5 sm:mb-2">
                      Live Drag &amp; Drop Block Canvas
                    </h3>
                    <p className="text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-1.5 sm:mb-6 line-clamp-1 sm:line-clamp-none">
                      Reorder portfolio sections on the fly. Drag handles let you restructure your profile while the preview updates live.
                    </p>
                  </div>

                  {/* Mobile Tab Switcher */}
                  <div className="flex md:hidden items-center justify-center p-0.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl mb-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDndTab("editor");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileDndTab === "editor"
                          ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <GripVertical className="w-3 h-3 text-indigo-400" />
                      Editor Canvas (Dragging)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDndTab("preview");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileDndTab === "preview"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Preview Sync
                    </button>
                  </div>

                  {/* Split Visual: Left Editor Sidebar Mockup, Right macOS Live Preview */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 p-2 sm:p-4 grid md:grid-cols-12 gap-2 sm:gap-4 flex-1 shadow-sm overflow-hidden">
                    {/* LEFT: Editor Sidebar Mockup with exact layout from photo */}
                    <div className={cn("md:col-span-6 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/60 p-2 sm:p-3 flex flex-col justify-between space-y-1.5 sm:space-y-2 overflow-hidden", mobileDndTab === "editor" ? "flex" : "hidden md:flex")}>
                      {/* Tabs */}
                      <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-1 shrink-0">
                        <div className="flex-1 text-center py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 border-b-2 border-violet-500">
                          Content Blocks
                        </div>
                        <div className="flex-1 text-center py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Theme &amp; Design
                        </div>
                      </div>

                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {["MongoDB", "Firebase", "Jenkins", "Kubernetes", "JWT Auth", "Xcode"].map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-medium">
                            {tag}
                            <span className="text-zinc-400 text-[8px]">×</span>
                          </span>
                        ))}
                      </div>

                      {/* Interactive Drag & Drop Area */}
                      <div className="space-y-2 flex-1 relative min-h-[140px] sm:min-h-[165px] overflow-hidden pt-1">
                        {/* Placeholder Ghost Slot (Where Education originates) */}
                        <div className={cn(
                          "rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/10 p-1.5 sm:p-2 space-y-1 transition-opacity duration-300",
                          isReordered ? "opacity-0 pointer-events-none" : "opacity-40"
                        )}>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40">
                              EDUCATION
                            </span>
                            <span className="text-[9px] text-zinc-400">#3</span>
                          </div>
                          <div className="h-4 sm:h-5 rounded bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 px-1.5 flex items-center text-[8px] sm:text-[9px] text-zinc-500">
                            Stanford University
                          </div>
                        </div>

                        {/* Floating Dragged Element (Smoothly animates from top to bottom) */}
                        <motion.div
                          animate={{
                            y: isReordered ? 66 : 0,
                            rotate: isReordered ? 0 : -1.5,
                            scale: isReordered ? 1 : 1.02,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 24,
                          }}
                          className={cn(
                            "absolute top-1 left-0 right-0 z-20 rounded-xl border p-2 sm:p-2.5 transition-all",
                            isReordered
                              ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm"
                              : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-[0_16px_32px_-6px_rgba(0,0,0,0.22)] dark:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.65)] ring-1 ring-violet-500/30"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className={cn("w-4 h-4 text-zinc-500", !isReordered && "cursor-grabbing")} />
                              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm">
                                EDUCATION
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                                {isReordered ? "#4" : "#3"}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Mouse cursor pointer overlay: matches the site's custom SmoothCursor */}
                          <motion.div
                            animate={{
                              opacity: isReordered ? 0 : 1,
                              scale: isReordered ? 0.75 : 0.95,
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute -top-1.5 left-2 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] z-30"
                          >
                            <svg
                              width="20"
                              height="24"
                              viewBox="0 0 20 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-6"
                            >
                              <path
                                d="M3 2L19 10.5L11.5 13L8 21Q7.4 22.2 6.5 20.8L3 2Z"
                                className="fill-zinc-900 stroke-zinc-900 dark:fill-white dark:stroke-white"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                              />
                            </svg>
                          </motion.div>
                        </motion.div>

                        {/* Experience Block (Slides up when Education drops below it) */}
                        <motion.div
                          animate={{
                            y: isReordered ? -62 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 24,
                          }}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-800/40 p-1.5 sm:p-2 space-y-1 mt-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40">
                                EXPERIENCE
                              </span>
                              <span className="text-[9px] text-zinc-400">
                                {isReordered ? "#3" : "#4"}
                              </span>
                            </div>
                          </div>
                          <div className="h-4 sm:h-5 rounded bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 px-1.5 flex items-center text-[8px] sm:text-[9px] font-medium text-zinc-800 dark:text-zinc-200">
                            TechCorp · Full Stack Engineer
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* RIGHT: Live Preview macOS Window Mockup */}
                    <div className={cn("md:col-span-6 rounded-lg border border-zinc-800 bg-zinc-950 text-white p-2 sm:p-3.5 flex flex-col justify-between overflow-hidden shadow-inner", mobileDndTab === "preview" ? "flex" : "hidden md:flex")}>
                      {/* Browser Mockup Top Bar */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full truncate max-w-[170px]">
                          portfolioos.dev/p/john-doe
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Synced" />
                      </div>

                      {/* Portfolio Hero Layout (matches photo) */}
                      <div className="my-auto py-1.5 space-y-1.5 sm:space-y-2">
                        {/* Purple Accent bar */}
                        <div className="w-7 h-1 bg-violet-500 rounded-full" />

                        {/* Title */}
                        <h4 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-none text-white">
                          John<br />Doe
                        </h4>

                        {/* Subtitle / Bio */}
                        <p className="text-[9px] sm:text-[10px] text-zinc-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          Software Engineering graduate with full-stack development experience building production applications using NestJS, Next.js, and React.
                        </p>

                        {/* Social Buttons from photo */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <Phone className="w-2.5 h-2.5" />
                          </div>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                              <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                          </div>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                            </svg>
                          </div>
                        </div>

                        {/* Live Section Order Sync Stream */}
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[8px] text-zinc-400 font-mono">
                            <span>Canvas Sync Stream</span>
                            <span className="text-emerald-400 font-sans font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Real-Time
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-bold border transition-all duration-300",
                              isReordered
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            )}>
                              {isReordered ? "1. Experience #3" : "1. Education #3"}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-bold border transition-all duration-300",
                              isReordered
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            )}>
                              {isReordered ? "2. Education #4" : "2. Experience #4"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Brand from photo */}
                      <div className="pt-1.5 border-t border-zinc-900 flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-mono shrink-0">
                        <span>PORTFOLIO OS</span>
                        <span className="text-emerald-400 font-sans normal-case tracking-normal">Live Synchronized</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CARD 3: THEMES */}
              {card.id === "themes" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-violet-400" />
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-400">
                          Theme Palette Engine
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold bg-violet-500/20 text-violet-400 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-violet-500/30 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.previewColor }} />
                        {activeTheme.name}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-3xl font-bold tracking-tight mb-0.5 sm:mb-2">
                      Dynamic Theme Presets
                    </h3>
                    <p className="text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-1.5 sm:mb-6 line-clamp-1 sm:line-clamp-none">
                      Select a color palette and aesthetic for your public portfolio with instantaneous live rendering.
                    </p>
                  </div>

                  {/* Mobile Tab Switcher */}
                  <div className="flex md:hidden items-center justify-center p-0.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl mb-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileThemeTab("picker");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileThemeTab === "picker"
                          ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      Theme Picker (4)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileThemeTab("preview");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileThemeTab === "preview"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Browser Preview
                    </button>
                  </div>

                  {/* 12-col Editor Layout: Left ThemePicker, Right Browser Preview */}
                  <div className="grid md:grid-cols-12 gap-2 sm:gap-4 flex-1 shadow-sm overflow-hidden text-left">
                    {/* LEFT: ThemePicker matching src/app/dashboard/edit/ThemePicker.tsx */}
                    <div className={cn("md:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-2 sm:p-3 flex flex-col justify-between overflow-hidden", mobileThemeTab === "picker" ? "flex" : "hidden md:flex")}>
                      <div>
                        <div className="mb-2">
                          <h4 className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Design Theme
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-zinc-500 truncate">
                            Select a color palette and aesthetic for your public portfolio.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {[
                            { id: "neobrutalism", name: "Neo-Brutalism", desc: "High contrast pop bold", color: "#FFE500" },
                            { id: "liquidglass", name: "Glassmorphism", desc: "Frosted translucent glass", color: "#8B5CF6" },
                            { id: "terminal", name: "Hacker Terminal", desc: "Monochrome CRT green", color: "#22C55E" },
                            { id: "paper", name: "Modern Ink", desc: "Minimalist editorial serif", color: "#18181B" },
                          ].map((t) => {
                            const isActive = activeThemeId === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveThemeId(t.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "relative flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                                  isActive
                                    ? "bg-zinc-100 dark:bg-zinc-800/80 border-violet-500 shadow-md shadow-violet-500/10 scale-[1.01]"
                                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                              >
                                {isActive && (
                                  <div className="absolute top-2 right-2 text-violet-500">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </div>
                                )}

                                <div
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full mb-1.5 shadow-inner flex overflow-hidden border border-black/10 dark:border-zinc-800/80 shrink-0"
                                  style={{ backgroundColor: t.color }}
                                >
                                  <div className="w-1/2 h-full bg-black/15" />
                                </div>

                                <span className="text-[11px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full">
                                  {t.name}
                                </span>
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 leading-tight truncate w-full">
                                  {t.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[9px] text-zinc-400 flex items-center justify-between shrink-0">
                        <span>Active: <strong className="text-violet-400">{activeTheme.name}</strong></span>
                        <span className="text-zinc-500">Auto-applies</span>
                      </div>
                    </div>

                    {/* RIGHT: Live Browser Preview rendered in active theme */}
                    <div className={cn("md:col-span-6 rounded-lg border border-zinc-800 bg-zinc-950 text-white p-2 sm:p-3.5 flex flex-col justify-between overflow-hidden shadow-inner", mobileThemeTab === "preview" ? "flex" : "hidden md:flex")}>
                      {/* Browser Mockup Top Bar */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full truncate max-w-[170px]">
                          portfolioos.dev/p/john-doe
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Synced" />
                      </div>

                      {/* Live Styled Canvas */}
                      <div
                        className="my-auto p-3 sm:p-4 rounded-xl border transition-all duration-300 space-y-2 sm:space-y-3"
                        style={{
                          ...(activeTheme.cssVars as React.CSSProperties),
                          background: activeTheme.cssVars["--p-bg"],
                          color: activeTheme.cssVars["--p-fg"],
                          fontFamily: activeTheme.cssVars["--p-font"] || "sans-serif",
                          borderColor: activeTheme.cssVars["--p-border"],
                        }}
                      >
                        <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: activeTheme.cssVars["--p-border"] }}>
                          <div>
                            <h4 className="text-sm sm:text-base font-extrabold leading-tight">John Doe</h4>
                            <p className="text-[9px] sm:text-[10px] opacity-75">Senior Software Engineer</p>
                          </div>
                          <span
                            className="px-2 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-full border"
                            style={{
                              borderColor: activeTheme.cssVars["--p-border"],
                              backgroundColor: activeTheme.cssVars["--p-pill-bg"],
                              color: activeTheme.cssVars["--p-primary"] || activeTheme.cssVars["--p-fg"],
                            }}
                          >
                            Live Theme
                          </span>
                        </div>

                        <p className="text-[9px] sm:text-[10px] leading-relaxed opacity-80 line-clamp-2">
                          Software Engineering graduate with full-stack development experience building production applications using NestJS, Next.js, and React.
                        </p>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <div
                            className="p-1.5 sm:p-2 rounded-lg border"
                            style={{
                              backgroundColor: activeTheme.cssVars["--p-bg-card"],
                              borderColor: activeTheme.cssVars["--p-border"],
                            }}
                          >
                            <div className="text-[9px] font-bold mb-0.5">Skills</div>
                            <div className="text-[8px] opacity-75 truncate">Next.js · TS · Docker</div>
                          </div>
                          <div
                            className="p-1.5 sm:p-2 rounded-lg border"
                            style={{
                              backgroundColor: activeTheme.cssVars["--p-bg-card"],
                              borderColor: activeTheme.cssVars["--p-border"],
                            }}
                          >
                            <div className="text-[9px] font-bold mb-0.5">Experience</div>
                            <div className="text-[8px] opacity-75 truncate">TechCorp · Lead</div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-1.5 border-t border-zinc-900 flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-mono shrink-0">
                        <span>THEME: {activeTheme.name}</span>
                        <span className="text-emerald-400 font-sans normal-case tracking-normal">Live Preview</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CARD 4: LAYOUTS */}
              {card.id === "layouts" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <Layout className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-indigo-400" />
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-400">
                          Structural Layout Engine
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                        {activeLayout}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-3xl font-bold tracking-tight mb-0.5 sm:mb-2">
                      Bento, Split Sidebar &amp; Minimal Layouts
                    </h3>
                    <p className="text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-1.5 sm:mb-6 line-clamp-1 sm:line-clamp-none">
                      Select the structural layout paradigm for your portfolio: Bento Grid, Split Sidebar, or Minimal Stack.
                    </p>
                  </div>

                  {/* Mobile Tab Switcher */}
                  <div className="flex md:hidden items-center justify-center p-0.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl mb-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileLayoutTab("picker");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileLayoutTab === "picker"
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      Layout Picker (4)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileLayoutTab("preview");
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px] font-semibold cursor-pointer",
                        mobileLayoutTab === "preview"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Browser Preview
                    </button>
                  </div>

                  {/* 12-col Editor Layout: Left LayoutPicker, Right Browser Preview */}
                  <div className="grid md:grid-cols-12 gap-2 sm:gap-4 flex-1 shadow-sm overflow-hidden text-left">
                    {/* LEFT: LayoutPicker matching src/app/dashboard/edit/LayoutPicker.tsx */}
                    <div className={cn("md:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-2 sm:p-3 flex flex-col justify-between overflow-hidden", mobileLayoutTab === "picker" ? "flex" : "hidden md:flex")}>
                      <div>
                        {/* Tab header from photo */}
                        <div className="flex items-center gap-3 pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800 text-[9px] sm:text-[10px] font-bold">
                          <span className="text-zinc-400">CONTENT BLOCKS</span>
                          <span className="text-violet-500 pb-0.5 border-b-2 border-violet-500">THEME &amp; DESIGN</span>
                        </div>

                        <div className="mb-2">
                          <h4 className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Design Template
                          </h4>
                          <p className="text-[8.5px] sm:text-[9.5px] text-zinc-500 truncate">
                            Select the structural layout paradigm for your portfolio.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {[
                            { id: "classic", name: "Classic", desc: "Standard vertical stacked layout.", icon: AlignJustify },
                            { id: "bento", name: "Bento Box", desc: "Modular dashboard grid layout.", icon: LayoutGrid },
                            { id: "sidebar", name: "Sidebar", desc: "IDE-style sidebar navigation.", icon: Columns2 },
                            { id: "terminal", name: "Terminal", desc: "Interactive command-line interface.", icon: TerminalSquare },
                          ].map((l) => {
                            const isActive = activeLayout === l.id;
                            const Icon = l.icon;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLayout(l.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "relative flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                                  isActive
                                    ? "bg-zinc-100 dark:bg-zinc-800/80 border-violet-500 shadow-md shadow-violet-500/10 scale-[1.01]"
                                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                              >
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg mb-1 sm:mb-1.5 shadow-sm flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 shrink-0">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>

                                <span className="text-[11px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full">
                                  {l.name}
                                </span>
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 leading-tight truncate w-full">
                                  {l.desc}
                                </span>

                                {isActive && (
                                  <div className="text-violet-500 absolute top-2 right-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[9px] text-zinc-400 flex items-center justify-between shrink-0">
                        <span>Active: <strong className="text-violet-400 uppercase">{activeLayout}</strong></span>
                        <span className="text-zinc-500">Click to switch</span>
                      </div>
                    </div>

                    {/* RIGHT: Live Browser Preview of Layout */}
                    <div className={cn("md:col-span-7 rounded-lg border border-zinc-800 bg-[#09090b] text-white p-2 sm:p-3 flex flex-col justify-between overflow-hidden shadow-inner", mobileLayoutTab === "preview" ? "flex" : "hidden md:flex")}>
                      {/* Browser Mockup Top Bar */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full truncate max-w-[170px]">
                          portfolioos.dev/p/john-doe
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Synced" />
                      </div>

                      {/* Dynamic Structural Layout Content */}
                      <div className="my-auto py-1 flex-1 flex flex-col justify-center overflow-hidden">
                        {/* 1. SPLIT SIDEBAR LAYOUT (Matches Photo 1) */}
                        {activeLayout === "sidebar" && (
                          <div className="flex h-full min-h-[220px] sm:min-h-[260px] divide-x divide-zinc-800/80 -m-2 sm:-m-3 overflow-hidden">
                            {/* Left Pane (~34%): Sidebar */}
                            <div className="w-[36%] sm:w-[32%] p-2.5 sm:p-3.5 flex flex-col justify-between overflow-hidden bg-[#09090b] shrink-0">
                              <div>
                                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight mb-1">
                                  John Doe
                                </div>
                                <p className="text-[7.5px] sm:text-[8.5px] text-zinc-400 leading-tight line-clamp-3 mb-2.5">
                                  Software Engineering graduate with expertise in full-stack development, mobile...
                                </p>

                                {/* Social Icons */}
                                <div className="flex items-center gap-1.5 text-zinc-400 mb-3">
                                  <Phone className="w-2.5 h-2.5" />
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                  </svg>
                                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                                  </svg>
                                </div>

                                {/* Navigation List */}
                                <div>
                                  <div className="text-[6.5px] sm:text-[7.5px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1.5">
                                    Navigation
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[7.5px] sm:text-[8.5px] font-bold text-white">
                                      <span className="w-3.5 sm:w-4.5 h-[2px] bg-violet-500 rounded-full" />
                                      HERO
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-semibold text-zinc-500">
                                      <span className="w-2.5 sm:w-3.5 h-[1px] bg-zinc-700" />
                                      SKILLS
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-semibold text-zinc-500">
                                      <span className="w-2.5 sm:w-3.5 h-[1px] bg-zinc-700" />
                                      EXPERIENCE
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-semibold text-zinc-500">
                                      <span className="w-2.5 sm:w-3.5 h-[1px] bg-zinc-700" />
                                      EDUCATION
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-semibold text-zinc-500">
                                      <span className="w-2.5 sm:w-3.5 h-[1px] bg-zinc-700" />
                                      PROJECTS
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Pane (~66%): Main Stream */}
                            <div className="flex-1 p-3 sm:p-5 flex flex-col justify-center relative bg-[#09090b]">
                              <div className="relative">
                                <h4 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-none mb-2">
                                  John Doe
                                </h4>
                                {/* SmoothCursor hovering on name matching photo */}
                                <div className="absolute top-1 left-16 sm:left-24 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                                  <svg width="15" height="18" viewBox="0 0 20 24" fill="none" className="w-3.5 h-4.5">
                                    <path
                                      d="M3 2L19 10.5L11.5 13L8 21Q7.4 22.2 6.5 20.8L3 2Z"
                                      fill="white"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-[8px] sm:text-[9.5px] text-zinc-400 leading-relaxed max-w-sm">
                                Software Engineering graduate with expertise in full-stack development, mobile applications, and AI integration. Proven experience in leading teams and deploying production-ready software.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 2. CLASSIC / MINIMAL STACK LAYOUT (Matches Photo 2) */}
                        {activeLayout === "classic" && (
                          <div className="flex flex-col justify-center h-full min-h-[220px] sm:min-h-[260px] p-2.5 sm:p-4 relative bg-[#09090b]">
                            <div className="max-w-sm w-full mx-auto space-y-2 sm:space-y-2.5">
                              {/* Purple Accent Bar */}
                              <div className="w-8 sm:w-10 h-1 bg-violet-500 rounded-full" />

                              {/* Giant Name */}
                              <div className="relative">
                                <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                                  John Doe
                                </h4>
                                {/* SmoothCursor hovering under the name matching Photo 2 */}
                                <div className="absolute -bottom-2.5 left-24 sm:left-32 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                                  <svg width="15" height="18" viewBox="0 0 20 24" fill="none" className="w-3.5 h-4.5">
                                    <path
                                      d="M3 2L19 10.5L11.5 13L8 21Q7.4 22.2 6.5 20.8L3 2Z"
                                      fill="white"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Bio */}
                              <p className="text-[8px] sm:text-[9px] text-zinc-400 leading-relaxed line-clamp-3">
                                Software Engineering graduate with expertise in full-stack development, mobile applications, and AI integration. Proven experience in leading teams and deploying production-ready software.
                              </p>

                              {/* Social Buttons */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                                  <Phone className="w-2.5 h-2.5" />
                                </div>
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                  </svg>
                                </div>
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <div className="flex-1 h-[1px] bg-zinc-800" />
                                <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-zinc-500 uppercase">PORTFOLIO OS</span>
                                <div className="flex-1 h-[1px] bg-zinc-800" />
                              </div>

                              {/* Technical Stack Section */}
                              <div className="space-y-1">
                                <div className="text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-violet-400" />
                                  Technical Stack
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <span className="px-1.5 py-0.5 rounded text-[7px] sm:text-[7.5px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">Next.js</span>
                                  <span className="px-1.5 py-0.5 rounded text-[7px] sm:text-[7.5px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">TypeScript</span>
                                  <span className="px-1.5 py-0.5 rounded text-[7px] sm:text-[7.5px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">React</span>
                                  <span className="px-1.5 py-0.5 rounded text-[7px] sm:text-[7.5px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">PostgreSQL</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. BENTO BOX LAYOUT */}
                        {activeLayout === "bento" && (
                          <div className="space-y-1.5 p-2 sm:p-3">
                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="col-span-2 p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                                <div className="w-5 h-0.5 bg-indigo-500 rounded-full" />
                                <div className="text-xs sm:text-sm font-bold text-white">John Doe</div>
                                <p className="text-[7.5px] sm:text-[8.5px] text-zinc-400 line-clamp-1">Full-Stack Software Engineer building scalable cloud apps.</p>
                              </div>
                              <div className="col-span-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                                <span className="text-[7.5px] font-bold text-indigo-400 uppercase">Stack</span>
                                <div className="flex flex-wrap gap-0.5">
                                  <span className="px-1 py-0.5 rounded text-[6.5px] bg-zinc-800 text-zinc-300">Next</span>
                                  <span className="px-1 py-0.5 rounded text-[6.5px] bg-zinc-800 text-zinc-300">TS</span>
                                  <span className="px-1 py-0.5 rounded text-[6.5px] bg-zinc-800 text-zinc-300">Tailwind</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="col-span-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-0.5">
                                <div className="text-[8.5px] font-bold text-white">Featured Project: Portfolio.OS</div>
                                <p className="text-[7.5px] text-zinc-400 truncate">AI resume portfolio builder platform</p>
                              </div>
                              <div className="col-span-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-center text-center">
                                <span className="text-xs font-bold text-emerald-400">99.9%</span>
                                <span className="text-[6.5px] text-zinc-500">Uptime</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. TERMINAL LAYOUT */}
                        {activeLayout === "terminal" && (
                          <div className="p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] space-y-2 text-zinc-300 bg-zinc-950 rounded-lg">
                            <div className="text-emerald-400">developer@portfolioos:~$ cat bio.txt</div>
                            <div className="text-zinc-400 leading-relaxed">
                              John Doe — Full-Stack Engineer specializing in TypeScript, Next.js, and cloud systems.
                            </div>
                            <div className="text-emerald-400">developer@portfolioos:~$ ls -la projects/</div>
                            <div className="flex gap-2 text-violet-400 font-semibold">
                              <span>portfolio.os/</span>
                              <span>voxyn-ai/</span>
                              <span>cloud-engine/</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-1.5 border-t border-zinc-900 flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-mono shrink-0">
                        <span>LAYOUT: {activeLayout}</span>
                        <span className="text-emerald-400 font-sans normal-case tracking-normal">Live Preview</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                <span className="truncate">Swipe or click to browse</span>
                <span className="text-violet-400 font-semibold shrink-0 ml-2">
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
