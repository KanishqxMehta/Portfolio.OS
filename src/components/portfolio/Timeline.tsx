import React from "react";
import * as motion from "framer-motion/client";

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

interface TimelineProps {
  children: React.ReactNode;
}

export const Timeline = ({ children }: TimelineProps) => (
  <div className="space-y-0 relative ml-3 transition-colors duration-500">
    {children}
  </div>
);

interface TimelineItemProps {
  title: string;
  subtitle: string;
  badgeText: string;
  subtitleClassName?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}

export const TimelineItem = ({ title, subtitle, badgeText, subtitleClassName, isLast, children }: TimelineItemProps) => (
  <motion.div
    variants={fadeInUp}
    className="relative pb-12 last:pb-0 group pl-8 sm:pl-12"
  >
    {/* Connector line to next item */}
    <div 
      className="absolute bg-[var(--p-border)] transition-colors duration-500"
      style={{
        top: '14px',
        bottom: isLast ? '0px' : '-14px',
        left: 'calc(var(--p-border-width) / 2)',
        transform: 'translateX(-50%)',
        width: 'var(--p-border-width)',
      }}
    />

    {/* Timeline dot */}
    <div 
      className="theme-dot absolute top-1.5 w-4 h-4 bg-[var(--p-bg-secondary)] border-[var(--p-border)] group-hover:border-[var(--p-primary)] group-hover:bg-[var(--p-primary)] transition-colors shadow-[0_0_0_4px_var(--p-bg)] z-10" 
      style={{ left: 'calc(var(--p-border-width) / 2)', transform: 'translateX(-50%)', borderRadius: 'var(--p-radius)' }} 
    />

    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
      <h3 className="text-xl font-bold text-[var(--p-fg)] transition-colors duration-500">
        {title}
      </h3>
      <span className="text-xs font-mono text-[var(--p-fg-muted)] bg-[var(--p-bg-secondary)] border border-[var(--p-border)] px-3 py-1 rounded-full w-fit transition-colors duration-500">
        {badgeText}
      </span>
    </div>
    
    <p className={`text-base text-[var(--p-fg-muted)] group-hover:text-[var(--p-fg)] transition-colors ${subtitleClassName || ""}`}>
      {subtitle}
    </p>

    {children}
  </motion.div>
);
