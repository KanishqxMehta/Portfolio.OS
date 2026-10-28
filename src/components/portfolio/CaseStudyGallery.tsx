"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Iphone } from "@/components/portfolio/Iphone";

interface Screenshot {
  url: string;
  caption?: string;
  thumbnailUrl?: string;
}

interface CaseStudyGalleryProps {
  screenshots: Screenshot[];
  title: string;
  isMobile?: boolean;
}

export function CaseStudyGallery({ screenshots, title, isMobile = false }: CaseStudyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const active = screenshots[currentIndex] || screenshots[0];
  const total = screenshots.length;
  const isCurrentLoading = Boolean(active?.url && !loadedUrls[active.url]);

  return (
    <section aria-label="Project screenshots" className="my-8 space-y-4">
      {isMobile ? (
        /* Real iPhone 15 Pro Showcase for Mobile Projects */
        <div className="group relative isolate mx-auto flex w-full max-w-md items-center justify-center py-4 select-none">
          <div className="w-[280px] sm:w-[320px] drop-shadow-2xl transition-transform duration-300">
            <Iphone className="w-full">
              {screenshots.map((shot, idx) => {
                const isActive = idx === currentIndex;
                const isFullLoaded = Boolean(loadedUrls[shot.url]);
                return (
                  <div
                    key={`${shot.url}-${idx}`}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-300 ease-out",
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    )}
                  >
                    {/* Instant WebP preview thumbnail */}
                    {shot.thumbnailUrl && (
                      <Image
                        src={shot.thumbnailUrl}
                        alt=""
                        fill
                        unoptimized
                        priority={idx === 0}
                        className="h-full w-full object-cover object-top blur-[0.5px] transition-opacity duration-300"
                      />
                    )}
                    {/* Full resolution original image */}
                    <Image
                      src={shot.url}
                      alt={shot.caption || `${title} mobile screenshot ${idx + 1}`}
                      fill
                      unoptimized
                      priority={idx === 0}
                      onLoad={() => {
                        if (shot.url) {
                          setLoadedUrls((prev) => (prev[shot.url] ? prev : { ...prev, [shot.url]: true }));
                        }
                      }}
                      className={cn(
                        "h-full w-full object-cover object-top transition-opacity duration-300 ease-out",
                        isFullLoaded || !shot.thumbnailUrl ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                );
              })}

              {/* Minimal spinner overlay if neither thumbnail nor full image has loaded yet */}
              {isCurrentLoading && !active.thumbnailUrl && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/80 transition-opacity duration-200 p-2 text-center">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white mb-1.5" />
                  <span className="text-[10px] font-medium text-zinc-300 tracking-wider">Loading...</span>
                </div>
              )}
            </Iphone>
          </div>

          {/* Minimalist "1/N" Counter Badge */}
          {total > 1 && (
            <div className="absolute top-2 right-2 sm:right-4 z-20 pointer-events-none">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-950/90 border border-white/15 text-xs font-mono font-bold text-white shadow-lg tracking-wider">
                {currentIndex + 1}/{total}
              </span>
            </div>
          )}

          {/* Prev / Next Navigation Arrows Hovering around the Phone */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + total) % total)}
                aria-label="Previous screenshot"
                className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-xl transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % total)}
                aria-label="Next screenshot"
                className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-xl transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      ) : (
        /* Contained Laptop Ratio Frame (16:10) centered without oversized black side bars */
        <div className="group relative isolate mx-auto aspect-[16/10] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--p-border)] bg-zinc-950 shadow-2xl select-none flex items-center justify-center">
          {screenshots.map((shot, idx) => {
            const isActive = idx === currentIndex;
            const isFullLoaded = Boolean(loadedUrls[shot.url]);
            return (
              <div
                key={`${shot.url}-${idx}`}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300 ease-out",
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                {/* Instant WebP preview thumbnail */}
                {shot.thumbnailUrl && (
                  <Image
                    src={shot.thumbnailUrl}
                    alt=""
                    fill
                    unoptimized
                    priority={idx === 0}
                    className="h-full w-full object-cover blur-[0.5px] transition-opacity duration-300"
                  />
                )}
                {/* Full resolution original image */}
                <Image
                  src={shot.url}
                  alt={shot.caption || `${title} screenshot ${idx + 1}`}
                  fill
                  unoptimized
                  priority={idx === 0}
                  onLoad={() => {
                    if (shot.url) {
                      setLoadedUrls((prev) => (prev[shot.url] ? prev : { ...prev, [shot.url]: true }));
                    }
                  }}
                  className={cn(
                    "h-full w-full object-cover transition-opacity duration-300 ease-out",
                    isFullLoaded || !shot.thumbnailUrl ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            );
          })}

          {/* Minimal spinner overlay only if neither thumbnail nor full image has loaded yet */}
          {isCurrentLoading && !active.thumbnailUrl && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 transition-opacity duration-200">
              <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 border border-white/10 shadow-xl">
                <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Loading image...</span>
              </div>
            </div>
          )}

          {/* Minimalist "1/5" Counter Badge */}
          {total > 1 && (
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-950/90 border border-white/15 text-xs font-mono font-bold text-white shadow-lg tracking-wider">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-xl transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % total)}
                aria-label="Next screenshot"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-xl transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Caption if present */}
      {active.caption && (
        <figcaption className="text-center text-sm italic text-[var(--p-fg-muted)]">
          {active.caption}
        </figcaption>
      )}
    </section>
  );
}
