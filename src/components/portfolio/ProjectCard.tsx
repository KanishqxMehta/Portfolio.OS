"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Code2, Loader2 } from "lucide-react";
import type { ProjectsContent } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";
import { ProjectCardActions } from "./ProjectCardActions";
import { ProjectMetadata } from "./ProjectMetadata";
import { Iphone } from "./Iphone";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { draftSnapshot, writeLocalDraft } from "@/lib/draft-storage";

interface Props {
  project: ProjectsContent["items"][number];
  projectId: string;
  index: number;
  caseStudyHref?: string;
  headingLevel?: 2 | 3;
  isPreview?: boolean;
}

/**
 * Option 03 — Full-bleed project card with a solid sliding caption panel.
 * Features instant preloaded carousel switching, blackout loading states,
 * full iPhone containment for mobile apps, and zero GPU-compositor hazards (no skew, mask, or backdrop-blur).
 */
export function ProjectCard({ project, projectId, index, caseStudyHref, headingLevel = 3, isPreview = false }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [isNavigating, setIsNavigating] = useState(false);

  const isTargetPreview = isPreview || !caseStudyHref || Boolean(caseStudyHref?.includes("preview=true"));
  const baseCaseStudyHref = caseStudyHref || `/p/me/projects/${encodeURIComponent(projectId)}`;
  const targetCaseStudyHref =
    isTargetPreview && !baseCaseStudyHref.includes("preview=true")
      ? `${baseCaseStudyHref}${baseCaseStudyHref.includes("?") ? "&" : "?"}preview=true`
      : baseCaseStudyHref;

  const validScreenshots = (project.screenshots ?? []).filter((shot) => {
    if (!shot?.url) return false;
    const renderUrl = shot.thumbnailUrl || shot.url;
    if (failedUrls[renderUrl] || failedUrls[shot.url]) return false;
    try {
      return ["http:", "https:"].includes(new URL(shot.url).protocol);
    } catch {
      return false;
    }
  });

  const Heading = headingLevel === 2 ? "h2" : "h3";
  const hasCover = validScreenshots.length > 0;
  const totalPhotos = validScreenshots.length;
  const activePhoto = validScreenshots[currentPhotoIndex] || validScreenshots[0];
  const isCurrentLoading = Boolean(activePhoto?.url && !loadedUrls[activePhoto.url]);

  return (
    <motion.div
      role="article"
      data-project-card
      data-project-id={projectId}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "theme-card project-card group relative isolate flex aspect-[4/3.4] min-h-[340px] w-full min-w-0 flex-col self-stretch overflow-hidden rounded-[var(--p-radius)] border-[length:var(--p-border-width)] border-[var(--p-border)] [border-style:var(--p-border-style)] bg-[var(--p-bg-secondary)] shadow-[var(--p-shadow)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--p-primary)] hover:shadow-[var(--p-shadow-hover)]",
        "[--card-overlay-bg:rgba(18,18,22,0.88)] [--card-overlay-bg-hover:rgba(12,12,16,0.96)] [--card-overlay-border:rgba(255,255,255,0.16)] [--card-overlay-divider:rgba(255,255,255,0.14)] [--card-overlay-pill:rgba(255,255,255,0.06)] [--card-overlay-fg:#ffffff] [--card-overlay-muted:var(--p-fg-muted)]",
        "[[data-theme=light]_&]:[--card-overlay-bg:rgba(255,255,255,0.88)] [[data-theme=light]_&]:[--card-overlay-bg-hover:rgba(255,255,255,0.96)] [[data-theme=light]_&]:[--card-overlay-border:rgba(255,255,255,0.85)] [[data-theme=light]_&]:[--card-overlay-divider:rgba(0,0,0,0.1)] [[data-theme=light]_&]:[--card-overlay-pill:rgba(0,0,0,0.04)] [[data-theme=light]_&]:[--card-overlay-fg:var(--p-fg)]",
        "[[data-theme=paper]_&]:[--card-overlay-bg:rgba(255,255,255,0.88)] [[data-theme=paper]_&]:[--card-overlay-bg-hover:rgba(255,255,255,0.96)] [[data-theme=paper]_&]:[--card-overlay-border:rgba(255,255,255,0.85)] [[data-theme=paper]_&]:[--card-overlay-divider:rgba(0,0,0,0.1)] [[data-theme=paper]_&]:[--card-overlay-pill:rgba(0,0,0,0.04)] [[data-theme=paper]_&]:[--card-overlay-fg:var(--p-fg)]",
        "[[data-theme=neobrutalism]_&]:[--card-overlay-bg:rgba(255,255,255,0.90)] [[data-theme=neobrutalism]_&]:[--card-overlay-bg-hover:rgba(255,255,255,0.98)] [[data-theme=neobrutalism]_&]:[--card-overlay-border:var(--p-border)] [[data-theme=neobrutalism]_&]:[--card-overlay-divider:rgba(0,0,0,0.15)] [[data-theme=neobrutalism]_&]:[--card-overlay-pill:rgba(0,0,0,0.05)] [[data-theme=neobrutalism]_&]:[--card-overlay-fg:var(--p-fg)]"
      )}
    >
      {/* Full-bleed Media Stage */}
      {!hasCover ? (
        // 0 photos: Full-bleed themed code illustration centered above the resting caption bar
        <div
          data-project-cover
          data-project-fallback
          aria-hidden="true"
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[var(--p-bg-secondary)] px-6 pt-12 pb-28 text-[var(--p-primary)] select-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 35%, color-mix(in srgb, var(--p-primary) 22%, transparent), transparent 75%)",
          }}
        >
          <div className="w-3/5 max-w-[260px] -rotate-6 overflow-hidden rounded-xl border border-current/25 bg-[var(--p-bg-card)] shadow-[var(--p-shadow)] transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:-rotate-3">
            <div className="flex items-center gap-1.5 border-b border-current/15 px-3 py-2.5">
              <span className="size-1.5 rounded-full bg-current opacity-60" />
              <span className="size-1.5 rounded-full bg-current opacity-40" />
              <span className="size-1.5 rounded-full bg-current opacity-20" />
              <span className="ml-3 h-1 w-2/5 rounded-full bg-current opacity-15" />
            </div>
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <Code2 className="size-10 shrink-0 opacity-75 sm:size-12" />
              <div className="flex flex-1 flex-col gap-2">
                <span className="h-1.5 w-4/5 rounded-full bg-current opacity-35" />
                <span className="h-1.5 w-full rounded-full bg-current opacity-15" />
                <span className="h-1.5 w-3/5 rounded-full bg-current opacity-25" />
              </div>
            </div>
          </div>
        </div>
      ) : project.isMobile ? (
        // Mobile App project: Full-bleed radial stage with iPhone framed above the resting caption panel
        <div
          data-project-cover
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-zinc-950 px-4 pt-5 pb-28 select-none"
          style={{
            background: "radial-gradient(ellipse at 50% 35%, #1e293b 0%, #09090b 75%)",
          }}
        >
          <div className="relative h-full w-auto max-w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <Iphone className="h-full w-auto">
              {validScreenshots.map((shot, idx) => {
                const isActive = idx === currentPhotoIndex;
                return (
                  <Image
                    key={`${shot.url}-${idx}`}
                    src={shot.thumbnailUrl || shot.url}
                    alt={shot.caption || `${project.title} mobile screenshot ${idx + 1}`}
                    fill
                    unoptimized
                    priority={idx === 0}
                    onLoad={() => {
                      if (shot.url) {
                        setLoadedUrls((prev) => (prev[shot.url] ? prev : { ...prev, [shot.url]: true }));
                      }
                    }}
                    onError={() => {
                      const renderUrl = shot.thumbnailUrl || shot.url;
                      if (renderUrl) {
                        setFailedUrls((prev) => (prev[renderUrl] ? prev : { ...prev, [renderUrl]: true }));
                      }
                    }}
                    className={cn(
                      "absolute inset-0 block h-full w-full object-cover object-top transition-opacity duration-200 ease-out",
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    )}
                  />
                );
              })}

              {/* Blackout loading overlay inside the iPhone screen if active image is still downloading */}
              {isCurrentLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-2 text-center transition-opacity duration-200">
                  <div className="mb-1.5 size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span className="text-[10px] font-medium tracking-wider text-zinc-300">Loading...</span>
                </div>
              )}
            </Iphone>
          </div>
        </div>
      ) : (
        // Desktop / Web project: Full-bleed screenshot filling the entire card
        <div
          data-project-cover
          className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 select-none"
        >
          {validScreenshots.map((shot, idx) => {
            const isActive = idx === currentPhotoIndex;
            return (
              <Image
                key={`${shot.url}-${idx}`}
                src={shot.thumbnailUrl || shot.url}
                alt={shot.caption || `${project.title} screenshot ${idx + 1}`}
                fill
                unoptimized
                priority={index < 2 && idx === 0}
                onLoad={() => {
                  if (shot.url) {
                    setLoadedUrls((prev) => (prev[shot.url] ? prev : { ...prev, [shot.url]: true }));
                  }
                }}
                onError={() => {
                  const renderUrl = shot.thumbnailUrl || shot.url;
                  if (renderUrl) {
                    setFailedUrls((prev) => (prev[renderUrl] ? prev : { ...prev, [renderUrl]: true }));
                  }
                }}
                className={cn(
                  "h-full w-full object-cover object-top transition-[opacity,transform] duration-300 ease-out group-hover:scale-[1.03]",
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              />
            );
          })}

          {/* Blackout loading overlay if active screenshot is still downloading */}
          {isCurrentLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/90 pb-20 transition-opacity duration-200">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 shadow-xl">
                <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Loading image...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prev / Next Carousel Controls (positioned in the upper media zone above the sliding caption) */}
      {totalPhotos > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous screenshot"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
            }}
            className="absolute left-3 top-[38%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] text-[var(--card-overlay-fg)] opacity-0 shadow-lg transition-all hover:scale-110 hover:bg-[var(--card-overlay-bg-hover)] active:scale-95 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary)] group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next screenshot"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
            }}
            className="absolute right-3 top-[38%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] text-[var(--card-overlay-fg)] opacity-0 shadow-lg transition-all hover:scale-110 hover:bg-[var(--card-overlay-bg-hover)] active:scale-95 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary)] group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Top Header Actions (Index + Photo Counter on left, Live & Source buttons on right) */}
      <ProjectCardActions
        title={project.title}
        link={project.link}
        sourceUrl={project.sourceUrl}
        projectId={projectId}
        index={index}
        hasCover={hasCover}
        photoCounter={totalPhotos > 1 ? `${currentPhotoIndex + 1}/${totalPhotos}` : undefined}
      />

      {/* Sliding Caption Panel (.fb-panel): translucent-white in light themes, translucent-dark in dark themes */}
      <div
        data-project-content
        className="absolute inset-x-3 bottom-3 z-20 flex flex-col rounded-xl border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] px-4 py-3.5 text-left text-[var(--card-overlay-fg)] shadow-[0_8px_30px_rgba(0,0,0,0.22)] transition-colors duration-200 sm:px-[18px] sm:py-4"
      >
        {/* Resting visible header: Title row, followed by Tags + Year */}
        <div className="flex items-baseline justify-between gap-3">
          <Heading className="m-0 min-w-0 truncate text-lg font-bold leading-snug tracking-tight text-[var(--card-overlay-fg)] transition-colors group-hover:text-[var(--p-primary)] sm:text-xl">
            {project.title || "Untitled Project"}
          </Heading>
        </div>

        <ProjectMetadata tags={project.tags} year={project.year} variant="overlay" className="my-0 mt-2" />

        {/* Sliding Drawer: Reveals description & case study link on hover / focus / touch */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="mt-2.5 flex flex-col items-start gap-2.5 border-t border-[var(--card-overlay-divider)] pt-2.5">
              <p className="m-0 line-clamp-3 w-full break-words text-sm leading-relaxed text-[var(--card-overlay-muted)]">
                {project.description || "Project description will appear here once added in the editor."}
              </p>
              <a
                href={targetCaseStudyHref}
                data-project-id={projectId}
                onClick={async (e) => {
                  if (e.defaultPrevented) return;
                  if (isTargetPreview) {
                    e.preventDefault();
                    setIsNavigating(true);
                    try {
                      const store = usePortfolioStore.getState();
                      if (store.draftOwnerId) {
                        writeLocalDraft(store.draftOwnerId, draftSnapshot(store), store.draftRevision, store.lastDraftSnapshot);
                        await store.saveDraft();
                      }
                    } catch {
                      // Fall through to navigation
                    }
                    window.location.href = targetCaseStudyHref;
                  } else if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    setIsNavigating(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--p-primary)] transition-colors hover:underline"
              >
                {isNavigating ? (
                  <>
                    <span>{isTargetPreview ? "Opening preview..." : "Opening case study..."}</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>View case study</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/*
 * REFERENCE: Slanted Slash Accordion implementation preserved below for future reference:
 * 
 * const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
 * const sliceCount = Math.min(3, validScreenshots.length);
 * const displaySlices = validScreenshots.slice(0, sliceCount);
 * 
 * <div className="flex h-full w-[calc(100%+80px)] -ml-[40px] overflow-hidden bg-black/60">
 *   {displaySlices.map((shot, idx) => {
 *     const isLast = idx === displaySlices.length - 1;
 *     const isHovered = hoveredSlice === idx;
 *     const isOtherHovered = hoveredSlice !== null && !isHovered;
 *     const flexValue = isHovered ? 2.0 : isOtherHovered ? 0.7 : 1;
 *     return (
 *       <div
 *         key={`${shot.url}-${idx}`}
 *         onMouseEnter={() => setHoveredSlice(idx)}
 *         onMouseLeave={() => setHoveredSlice(null)}
 *         style={{ flex: flexValue, transform: "skewX(-14deg)", marginRight: isLast ? undefined : "2px" }}
 *         className="relative h-full overflow-hidden transition-[flex] duration-300 ease-out cursor-pointer"
 *       >
 *         {!isLast && <div className="absolute right-0 top-0 bottom-0 z-10 w-[2px] bg-white/40 pointer-events-none" />}
 *         <div
 *           className="absolute left-1/2 top-1/2 h-[150%] w-[260%] pointer-events-none"
 *           style={{ transform: `translate(-50%, -50%) skewX(14deg) scale(${isHovered ? 1.15 : 1})`, transformOrigin: "center center" }}
 *         >
 *           <Image src={shot.thumbnailUrl || shot.url} alt="" fill unoptimized className="h-full w-full object-cover object-center" />
 *         </div>
 *       </div>
 *     );
 *   })}
 * </div>
 */
