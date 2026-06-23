"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  className?: string;
  textClassName?: string;
  animating?: boolean;
  size?: number | "sm" | "md" | "lg" | "xl" | "xxl";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
  xxl: "w-20 h-20",
};

export function Logo({
  showText = true,
  className,
  textClassName,
  animating = false,
  size = "md",
}: LogoProps) {
  const isPreset = typeof size === "string";

  return (
    <div className={`flex items-center gap-2.5 group/logo select-none ${className || ""}`}>
      <style>{`
        @keyframes logo-float-middle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-1.5px) scale(1.01); }
        }
        @keyframes logo-float-top {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes logo-pulse-dot {
          0%, 100% { r: 1.2; opacity: 0.6; }
          50% { r: 1.6; opacity: 1; }
        }
        .logo-middle-float {
          animation: logo-float-middle 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .logo-top-float {
          animation: logo-float-top 1.3s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .logo-dot-pulse {
          animation: logo-pulse-dot 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
      `}</style>

      {/* Dynamic Stacked Isometric Logo */}
      <svg
        width={!isPreset ? size : undefined}
        height={!isPreset ? size : undefined}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "shrink-0 overflow-visible",
          isPreset ? sizeClasses[size] : ""
        )}
      >
        {/* Base Layer - Dashed bounding polygon */}
        <path
          d="M 16,18 L 24,22 L 16,26 L 8,22 Z"
          className="stroke-zinc-400/60 dark:stroke-zinc-700/80 fill-none"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Middle Layer - Solid semi-transparent prism */}
        <g className={cn(
          "transition-transform duration-300 ease-out will-change-transform",
          animating ? "logo-middle-float" : "group-hover/logo:-translate-y-[1.5px]"
        )}>
          <path
            d="M 16,12 L 24,16 L 16,20 L 8,16 Z"
            className="stroke-zinc-400 dark:stroke-zinc-650 fill-zinc-100/50 dark:fill-zinc-950/40"
            strokeWidth="1"
          />
        </g>

        {/* Top Layer - Clean high-contrast shape with glow and focal dot */}
        <g className={cn(
          "transition-transform duration-300 ease-out will-change-transform",
          animating ? "logo-top-float" : "group-hover/logo:-translate-y-[3px]"
        )}>
          <path
            d="M 16,6 L 24,10 L 16,14 L 8,10 Z"
            className={cn(
              "transition-colors duration-500",
              animating
                ? "stroke-violet-400 dark:stroke-violet-300 fill-violet-500/10 dark:fill-violet-500/20"
                : "stroke-zinc-700 dark:stroke-zinc-200 fill-violet-500/5 dark:fill-violet-500/10"
            )}
            strokeWidth="1"
          />
          {animating ? (
            <circle
              cx="16"
              cy="10"
              r="1.2"
              className="fill-violet-500 dark:fill-violet-400 logo-dot-pulse"
              style={{ animationDelay: "0.2s" }}
            />
          ) : (
            <circle
              cx="16"
              cy="10"
              r="1.2"
              className="fill-violet-500 dark:fill-violet-400"
            />
          )}
        </g>
      </svg>

      {/* Wordmark Typography */}
      {showText && (
        <div className={`flex items-center gap-1.5 leading-none ${textClassName || ""}`}>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight text-lg">
            Portfolio
          </span>
          <span className="text-zinc-500 bg-zinc-100 dark:bg-zinc-900 font-mono text-[10px] uppercase border border-zinc-200 dark:border-zinc-800/40 px-1.5 py-0.5 rounded leading-none">
            .os
          </span>
        </div>
      )}
    </div>
  );
}
