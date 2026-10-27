"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ProjectsContent } from "@/lib/validations/portfolio";
import { isCaseStudyPublished } from "@/lib/project-collection";
import { cn } from "@/lib/utils";
import { ProjectCardActions } from "./ProjectCardActions";
import { ProjectImage } from "./ProjectImage";
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
 * Self-contained project card with full-image showcase, instant preloaded carousel navigation,
 * blackout loading states, complete iPhone containment for mobile apps, and robust GPU layer isolation.
 */
export function ProjectCard({ project, projectId, index, caseStudyHref, headingLevel = 3, isPreview = false }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});
  const [isNavigating, setIsNavigating] = useState(false);

  const isTargetPreview = isPreview || Boolean(caseStudyHref?.includes("preview=true"));
  const targetCaseStudyHref = caseStudyHref
    ? isTargetPreview && !caseStudyHref.includes("preview=true")
      ? `${caseStudyHref}${caseStudyHref.includes("?") ? "&" : "?"}preview=true`
      : caseStudyHref
    : undefined;

  const validScreenshots = (project.screenshots ?? []).filter((shot) => {
    if (!shot?.url) return false;
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
      className="theme-card project-card group relative isolate flex min-w-0 flex-col self-stretch overflow-hidden rounded-[var(--p-radius)] border-[length:var(--p-border-width)] border-[var(--p-border)] [border-style:var(--p-border-style)] bg-[var(--p-bg-card)] shadow-[var(--p-shadow)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--p-primary)] hover:bg-[var(--p-bg-secondary)] hover:shadow-[var(--p-shadow-hover)]"
    >
      {/* Top Media / Cover Area (Always aspect-16/10 for strict row alignment) */}
      {!hasCover ? (
        // 0 photos: fallback code illustration
        <ProjectImage
          cover
          alt={`${project.title} screenshot`}
        />
      ) : project.isMobile ? (
        // Mobile App project: Fully Contained iPhone Showcase with ambient radial backdrop
        <div
          data-project-cover
          className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden bg-zinc-950 p-3 select-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(10, 10, 14, 0.98) 100%)",
          }}
        >
          {/* Entire iPhone is cleanly contained (h-[86%]) so top island, curved chassis, and bottom dock are fully visible */}
          <div className="relative h-[86%] w-auto max-w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-[1.02]">
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
                    className={cn(
                      "absolute inset-0 block h-full w-full object-cover object-top transition-opacity duration-200 ease-out",
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    )}
                  />
                );
              })}

              {/* Blackout loading overlay inside the iPhone screen if active image is still downloading */}
              {isCurrentLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-200 p-2 text-center">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white mb-1.5" />
                  <span className="text-[10px] font-medium text-zinc-300 tracking-wider">Loading...</span>
                </div>
              )}
            </Iphone>
          </div>

          {/* Minimalist 1/N counter badge for multi-photo mobile projects */}
          {totalPhotos > 1 && (
            <div className="absolute bottom-3 right-4 z-20 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-zinc-950/90 px-2.5 py-1 text-[10px] font-mono font-bold text-white shadow-md border border-white/15">
                {currentPhotoIndex + 1}/{totalPhotos}
              </span>
            </div>
          )}

          {/* Prev / Next buttons for mobile project */}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-lg transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-lg transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        // Desktop / Web project: Full 16:10 Image Showcase with instant preloaded switching
        <div
          data-project-cover
          className="group/gallery relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-950 select-none"
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
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-200 ease-out",
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              />
            );
          })}

          {/* Blackout loading overlay if active screenshot is still downloading */}
          {isCurrentLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/90 transition-opacity duration-200">
              <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 border border-white/10 shadow-xl">
                <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Loading image...</span>
              </div>
            </div>
          )}

          {/* Minimalist 1/N counter badge */}
          {totalPhotos > 1 && (
            <div className="absolute bottom-3 right-4 z-20 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-zinc-950/90 px-2.5 py-1 text-[10px] font-mono font-bold text-white shadow-md border border-white/15">
                {currentPhotoIndex + 1}/{totalPhotos}
              </span>
            </div>
          )}

          {/* Prev / Next buttons for multi-photo cards */}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-lg transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-950/90 text-white shadow-lg transition-all hover:bg-black hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Top Header Actions (Live link & Index badge - aligned for ALL cards) */}
      <ProjectCardActions
        title={project.title}
        link={project.link}
        projectId={projectId}
        index={index}
        hasCover={hasCover}
      />

      {/* Card Content Area */}
      <div
        data-project-content
        className="relative z-[2] flex min-w-0 flex-col items-start gap-4 p-6 text-left sm:p-8"
      >
        <Heading className="m-0 w-full break-words text-2xl font-bold leading-tight tracking-tight text-[var(--p-fg)] transition-colors group-hover:text-[var(--p-primary)]">
          {project.title || "Untitled Project"}
        </Heading>
        <ProjectMetadata tags={project.tags} year={project.year} className="my-0" />
        <p className="m-0 line-clamp-3 w-full break-words text-sm leading-relaxed text-[var(--p-fg-muted)]">
          {project.description || "Project description will appear here once added in the editor."}
        </p>
        {(isCaseStudyPublished(project) || project.caseStudyEnabled || isPreview) && (
          <a
            href={targetCaseStudyHref || "#"}
            data-project-id={projectId}
            target={isTargetPreview ? undefined : "_blank"}
            rel={isTargetPreview ? undefined : "noreferrer"}
            onClick={async (e) => {
              if (!targetCaseStudyHref || targetCaseStudyHref === "#") {
                e.preventDefault();
                return;
              }
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
              }
            }}
            className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)] hover:underline"
          >
            {isNavigating ? (
              <>
                <span>Opening preview...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <span>View case study</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </a>
        )}
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
