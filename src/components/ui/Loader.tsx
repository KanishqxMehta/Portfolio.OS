"use client";

import React from "react";
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
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
} as const;

export function Loader({ text = "Loading...", className, size = "lg" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center font-sans ${className || ""}`}>
      <div className={`${cardSizes[size]} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center relative overflow-hidden shadow-sm dark:shadow-none`}>
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-zinc-950/5 dark:via-white/5 to-transparent animate-pulse" />
        <Logo showText={false} animating={true} size={logoSizes[size]} />
      </div>
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse uppercase tracking-wider">
        {text}
      </p>
    </div>
  );
}
