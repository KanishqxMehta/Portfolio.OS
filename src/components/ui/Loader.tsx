"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

interface LoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const cardSizes = {
  sm: "w-12 h-12 rounded-xl mb-3",
  md: "w-16 h-16 rounded-2xl mb-4",
  lg: "w-20 h-20 rounded-2xl mb-4",
  xl: "w-24 h-24 rounded-[20px] mb-5",
};

const logoSizes = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
  xl: "xl" as const,
};

const loadingTexts = ["Loading", "Loading.", "Loading..", "Loading..."];

export function Loader({ text = "Loading...", className, size = "lg" }: LoaderProps) {
  const [dotIndex, setDotIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (text !== "Loading...") return;
    const interval = setInterval(() => {
      setDotIndex((i) => (i + 1) % loadingTexts.length);
    }, 500);
    return () => clearInterval(interval);
  }, [text]);

  const displayText = text === "Loading..." ? loadingTexts[dotIndex] : text;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center font-sans transition-all duration-700 ${
        mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${className || ""}`}
    >
      <style>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes loader-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 0 24px -8px rgba(139, 92, 246, 0.15); }
        }
        .shimmer-sweep {
          animation: shimmer-sweep 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .loader-breathe {
          animation: loader-breathe 3s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
      `}</style>

      <div className={`${cardSizes[size]} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center relative overflow-hidden shadow-sm dark:shadow-none loader-breathe`}>
        {/* Shimmer sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="shimmer-sweep absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-950/5 dark:via-white/8 to-transparent" />
        </div>
        <Logo showText={false} animating={true} size={logoSizes[size]} />
      </div>

      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-3 min-h-[1em] transition-opacity duration-300">
        {displayText}
      </p>
    </div>
  );
}
