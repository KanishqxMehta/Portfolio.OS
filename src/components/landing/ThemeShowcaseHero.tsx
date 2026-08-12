"use client";

import { useState, useEffect, useRef } from "react";
import { THEMES } from "@/lib/themes";
import {
  Moon,
  Sun,
  Zap,
  Sparkles,
  Terminal,
  FileText,
  ExternalLink,
  Briefcase,
  Code2,
  CheckCircle2,
  Globe,
  MapPin,
  Layers,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Curated best combinations of Layout Template + Theme Palette
const bestCombinations = [
  {
    id: "combo-bento-neo",
    name: "Neo-Brutal Bento",
    tagline: "Grid Layout + Neo-Brutalism",
    layout: "bento",
    layoutName: "Bento Grid",
    themeId: "neobrutalism",
    icon: Zap,
    badge: "Top Combo",
  },
  {
    id: "combo-sidebar-glass",
    name: "Glassmorphic Sidebar",
    tagline: "Split-Screen + Glassmorphism",
    layout: "sidebar",
    layoutName: "Split Sidebar",
    themeId: "liquidglass",
    icon: Sparkles,
    badge: "Popular",
  },
  {
    id: "combo-terminal-cli",
    name: "Cyberpunk CLI",
    tagline: "Terminal Prompt + Hacker Green",
    layout: "terminal",
    layoutName: "CLI Terminal",
    themeId: "terminal",
    icon: Terminal,
    badge: "Retro",
  },
  {
    id: "combo-minimal-paper",
    name: "Modern Ink Minimal",
    tagline: "Minimal Layout + Warm Ink Paper",
    layout: "minimal",
    layoutName: "Minimal Stacked",
    themeId: "paper",
    icon: FileText,
    badge: "Clean",
  },
];

const standaloneThemes = [
  { id: "neobrutalism", label: "Neo-Brutalism", icon: Zap },
  { id: "liquidglass", label: "Glassmorphism", icon: Sparkles },
  { id: "terminal", label: "Hacker Terminal", icon: Terminal },
  { id: "paper", label: "Modern Ink", icon: FileText },
  { id: "classic", label: "Classic Dark", icon: Moon },
  { id: "light", label: "Minimal Light", icon: Sun },
];

export function ThemeShowcaseHero() {
  const [mode, setMode] = useState<"combos" | "themes">("combos");
  const [comboIndex, setComboIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play timer (cycles every 6 seconds randomly or sequentially)
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (mode === "combos") {
        setComboIndex((prev) => (prev + 1) % bestCombinations.length);
      } else {
        setThemeIndex((prev) => (prev + 1) % standaloneThemes.length);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, mode]);

  const activeCombo = bestCombinations[comboIndex] || bestCombinations[0];
  const activeStandalone = standaloneThemes[themeIndex] || standaloneThemes[0];

  const currentThemeId = mode === "combos" ? activeCombo.themeId : activeStandalone.id;
  const currentLayout = mode === "combos" ? activeCombo.layout : "minimal";
  const currentLayoutName = mode === "combos" ? activeCombo.layoutName : "Minimal Stacked";
  const activeTheme = THEMES[currentThemeId] || THEMES.neobrutalism;

  const handleSelectCombo = (index: number) => {
    setComboIndex(index);
    // Briefly pause auto-play on user click to prioritize user intent
    setIsAutoPlaying(false);
  };

  const handleSelectTheme = (index: number) => {
    setThemeIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 text-left">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        
        {/* Toggle Pills: Best Combinations vs Individual Themes */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => {
                setMode("combos");
                setIsAutoPlaying(true);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5",
                mode === "combos"
                  ? "bg-violet-600 text-white shadow-md font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Best Combinations (Layout + Theme)</span>
            </button>
            <button
              onClick={() => {
                setMode("themes");
                setIsAutoPlaying(true);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5",
                mode === "themes"
                  ? "bg-violet-600 text-white shadow-md font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Themes</span>
            </button>
          </div>

          {/* Auto-Play Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer shadow-sm"
            title={isAutoPlaying ? "Pause auto-switch" : "Play auto-switch"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-violet-500 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Option Bar for Combos */}
        {mode === "combos" ? (
          <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl shadow-inner max-w-full">
            {bestCombinations.map((combo, idx) => {
              const Icon = combo.icon;
              const isActive = comboIndex === idx;
              return (
                <button
                  key={combo.id}
                  onClick={() => handleSelectCombo(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer text-left relative",
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md ring-2 ring-violet-500/50 scale-105"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-500")} />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{combo.name}</span>
                      <span className="text-[9px] px-1.5 py-0.1 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 uppercase font-extrabold tracking-wider">
                        {combo.badge}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75 font-normal">{combo.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Standalone Theme Pills */
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl shadow-inner">
            {standaloneThemes.map((theme, idx) => {
              const Icon = theme.icon;
              const isActive = themeIndex === idx;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer",
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md ring-2 ring-violet-500/50 scale-105"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-500")} />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Browser Window Mockup Container */}
      <div className="relative rounded-3xl p-1 sm:p-2 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950 border border-zinc-300 dark:border-zinc-800 shadow-2xl shadow-violet-500/10 overflow-hidden">
        
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>

          {/* Subdomain URL Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 max-w-[260px] sm:max-w-md truncate">
            <Globe className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span className="truncate">portfolioos.dev/p/alex-morgan</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
              LIVE
            </span>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 hidden sm:block">
            {mode === "combos" ? activeCombo.name : activeTheme.name}
          </div>
        </div>

        {/* Dynamic Theme & Layout Render Area */}
        <div
          className="p-6 sm:p-8 transition-all duration-500 rounded-b-2xl min-h-[440px] flex flex-col justify-between"
          style={{
            ...(activeTheme.cssVars as React.CSSProperties),
            background: activeTheme.cssVars["--p-bg"],
            color: activeTheme.cssVars["--p-fg"],
            fontFamily: activeTheme.cssVars["--p-font"] || "sans-serif",
          }}
        >
          {/* LAYOUT RENDERER SWITCH */}

          {/* 1. BENTO GRID LAYOUT */}
          {currentLayout === "bento" && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-[var(--p-border)] pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold tracking-tight text-[var(--p-fg)]">Alex Morgan</h3>
                  <CheckCircle2 className="w-5 h-5 text-[var(--p-primary)]" />
                </div>
                <span
                  className="px-3 py-1 text-xs font-bold rounded-full border border-[var(--p-border)]"
                  style={{ backgroundColor: activeTheme.cssVars["--p-pill-bg"] }}
                >
                  Full-Stack Engineer
                </span>
              </div>

              {/* Bento Grid Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Hero / Bio Bento Card */}
                <div
                  className="sm:col-span-2 p-5 border border-[var(--p-border)] transition-all"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <h4 className="text-sm font-bold text-[var(--p-fg)] mb-2 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[var(--p-primary)]" />
                    <span>Developer Overview</span>
                  </h4>
                  <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                    Building scalable cloud systems and AI workflows. Expert in Next.js, TypeScript, PostgreSQL, and distributed frontend architectures.
                  </p>
                </div>

                {/* Tech Stack Bento Card */}
                <div
                  className="p-5 border border-[var(--p-border)] flex flex-col justify-between"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--p-fg-muted)]">Core Stack</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Next.js", "TypeScript", "Prisma", "Docker", "Python"].map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-medium rounded border border-[var(--p-border)]"
                        style={{ backgroundColor: activeTheme.cssVars["--p-bg-secondary"] }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Project Bento Card */}
                <div
                  className="sm:col-span-3 p-5 border border-[var(--p-border)] transition-all"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[var(--p-primary)]" />
                      <span className="text-sm font-bold text-[var(--p-fg)]">AI Resume Parser Pipeline</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--p-fg-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                    Extracted semantic document parsing engine converting raw PDF resume text into structured layout components.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SIDEBAR SPLIT LAYOUT */}
          {currentLayout === "sidebar" && (
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Left Fixed Sidebar Mockup */}
              <div
                className="p-5 border border-[var(--p-border)] space-y-4"
                style={{
                  backgroundColor: activeTheme.cssVars["--p-bg-card"],
                  borderRadius: activeTheme.cssVars["--p-radius"],
                  boxShadow: activeTheme.cssVars["--p-shadow"],
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--p-primary)] text-[var(--p-bg)] flex items-center justify-center font-bold text-lg">
                  AM
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--p-fg)]">Alex Morgan</h3>
                  <p className="text-xs text-[var(--p-fg-muted)]">San Francisco, CA</p>
                </div>
                <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                  Passionate about clean code, UI interactions, and high-volume backend infrastructure.
                </p>
              </div>

              {/* Right Content Stream */}
              <div className="sm:col-span-2 space-y-4">
                <div
                  className="p-5 border border-[var(--p-border)] space-y-2"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--p-fg)]">
                    <span>Lead Developer @ TechCorp</span>
                    <span className="font-mono text-[var(--p-fg-muted)]">2023 - Present</span>
                  </div>
                  <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                    Engineered real-time synchronization services handling 2M+ monthly active API queries.
                  </p>
                </div>

                <div
                  className="p-5 border border-[var(--p-border)] space-y-2"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--p-fg)]">
                    <span>Distributed Microservices Architecture</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--p-fg-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                    Designed low-latency Go &amp; PostgreSQL backend engines deployed on Docker clusters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TERMINAL HACKER CLI LAYOUT */}
          {currentLayout === "terminal" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="text-[var(--p-fg-muted)]">
                Portfolio.OS Terminal CLI [Version 2.4.0]<br />
                Type &apos;help&apos; for a list of available system commands.
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--p-primary)]">alex@portfolioos:~$</span>
                  <span className="text-[var(--p-fg)]">whoami</span>
                </div>
                <div className="pl-4 text-[var(--p-fg-muted)] border-l border-[var(--p-border)]">
                  Alex Morgan &mdash; Full-Stack Software Engineer &amp; Systems Architect
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[var(--p-primary)]">alex@portfolioos:~$</span>
                  <span className="text-[var(--p-fg)]">cat skills.json</span>
                </div>
                <div className="pl-4 text-[var(--p-fg-muted)] border-l border-[var(--p-border)]">
                  &#123; &quot;languages&quot;: [&quot;TypeScript&quot;, &quot;Go&quot;, &quot;Python&quot;], &quot;frameworks&quot;: [&quot;Next.js&quot;, &quot;Node&quot;, &quot;Docker&quot;] &#125;
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[var(--p-primary)]">alex@portfolioos:~$</span>
                  <span className="text-[var(--p-fg)] animate-pulse">_</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. MINIMAL STACKED LAYOUT */}
          {currentLayout === "minimal" && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[var(--p-border)] pb-6">
                <div className="w-12 h-1 bg-[var(--p-primary)] rounded-full mb-4" />
                <h3 className="text-3xl font-black text-[var(--p-fg)] tracking-tight">Alex Morgan</h3>
                <p className="text-sm text-[var(--p-fg-muted)] max-w-xl leading-relaxed">
                  Building scalable cloud infrastructure and AI-native web tools. Passionate about clean code, developer experience, and high-performance frontend architecture.
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className="p-5 border border-[var(--p-border)] transition-all"
                  style={{
                    backgroundColor: activeTheme.cssVars["--p-bg-card"],
                    borderRadius: activeTheme.cssVars["--p-radius"],
                    boxShadow: activeTheme.cssVars["--p-shadow"],
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[var(--p-fg)] flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[var(--p-primary)]" />
                      <span>AI Resume Ingestion Engine</span>
                    </h4>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--p-fg-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--p-fg-muted)] leading-relaxed">
                    Extracted semantic document parsing engine converting raw PDF resume text into structured layout components.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer inside mockup */}
          <div className="mt-8 pt-4 border-t border-[var(--p-border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--p-fg-muted)]">
            <div className="flex items-center gap-2">
              <span>Layout Template: <strong className="uppercase font-mono text-[var(--p-primary)]">{currentLayoutName}</strong></span>
              <span>&bull;</span>
              <span>Theme Palette: <strong className="font-mono text-[var(--p-primary)]">{activeTheme.name}</strong></span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--p-primary)]">
              {isAutoPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              <span>{isAutoPlaying ? "Auto-Switching Every 6s" : "Manual Selection"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
