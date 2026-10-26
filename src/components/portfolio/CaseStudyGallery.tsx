"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Screenshot {
  url: string;
  caption?: string;
  thumbnailUrl?: string;
}

interface CaseStudyGalleryProps {
  screenshots: Screenshot[];
  title: string;
}

export function CaseStudyGallery({ screenshots, title }: CaseStudyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const active = screenshots[currentIndex] || screenshots[0];
  const total = screenshots.length;

  return (
    <section aria-label="Project screenshots" className="my-8 space-y-3">
      {/* Contained Laptop Ratio Frame (16:10) centered without oversized black side bars */}
      <div className="group relative isolate mx-auto aspect-[16/10] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--p-border)] bg-zinc-950 shadow-2xl select-none flex items-center justify-center">
        
        {/* Active Screenshot in full-bleed laptop aspect ratio */}
        <Image
          src={active.url}
          alt={active.caption || `${title} screenshot ${currentIndex + 1}`}
          fill
          unoptimized
          priority={currentIndex === 0}
          className="h-full w-full object-cover"
        />

        {/* Minimalist "1/5" Counter Badge */}
        {total > 1 && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-white shadow-lg tracking-wider">
              {currentIndex + 1}/{total}
            </span>
          </div>
        )}

        {/* Prev / Next Navigation Arrows Hovering Directly Above the Image */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + total) % total)}
              aria-label="Previous screenshot"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % total)}
              aria-label="Next screenshot"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Caption if present */}
      {active.caption && (
        <figcaption className="text-center text-sm italic text-[var(--p-fg-muted)]">
          {active.caption}
        </figcaption>
      )}
    </section>
  );
}
