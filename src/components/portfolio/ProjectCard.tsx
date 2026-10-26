"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ProjectsContent } from "@/lib/validations/portfolio";
import { isCaseStudyPublished } from "@/lib/project-collection";
import { ProjectCardActions } from "./ProjectCardActions";
import { ProjectImage } from "./ProjectImage";
import { ProjectMetadata } from "./ProjectMetadata";

interface Props {
  project: ProjectsContent["items"][number];
  projectId: string;
  index: number;
  caseStudyHref?: string;
  headingLevel?: 2 | 3;
}

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/** 
 * Self-contained card with dynamic slanted slash accordion for multi-photo projects,
 * with consistent header action alignment between cards with and without photos.
 */
export function ProjectCard({ project, projectId, index, caseStudyHref, headingLevel = 3 }: Props) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [windowStart, setWindowStart] = useState(0);

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

  // Decide slices to display (up to 3)
  const sliceCount = Math.min(3, validScreenshots.length);
  const displaySlices: typeof validScreenshots = [];
  if (sliceCount > 0) {
    for (let i = 0; i < sliceCount; i++) {
      const targetIdx = (windowStart + i) % validScreenshots.length;
      displaySlices.push(validScreenshots[targetIdx]);
    }
  }

  return (
    <motion.div
      role="article"
      data-project-card
      data-project-id={projectId}
      variants={reveal}
      className="theme-card project-card group relative isolate flex min-w-0 flex-col self-stretch overflow-hidden rounded-[var(--p-radius)] border-[length:var(--p-border-width)] border-[var(--p-border)] [border-style:var(--p-border-style)] bg-[var(--p-bg-card)] shadow-[var(--p-shadow)] [backdrop-filter:var(--p-blur)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--p-primary)] hover:bg-[var(--p-bg-secondary)] hover:shadow-[var(--p-shadow-hover)]"
    >
      {/* Top Media / Cover Area (Always aspect-16/10 for strict row alignment) */}
      {validScreenshots.length <= 1 ? (
        // 0 photos (fallback) or 1 photo (standard cover)
        <ProjectImage
          cover
          url={validScreenshots[0]?.url}
          thumbnailUrl={validScreenshots[0]?.thumbnailUrl}
          alt={validScreenshots[0]?.caption || `${project.title} screenshot`}
        />
      ) : (
        // 2 or more photos: Dynamic Slanted Slices Accordion with 2px separation channel
        <div
          data-project-cover
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-950 select-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
          }}
        >
          <div className="flex h-full w-full overflow-hidden bg-black/60">
            {displaySlices.map((shot, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === displaySlices.length - 1;
              const isHovered = hoveredSlice === idx;
              const isOtherHovered = hoveredSlice !== null && !isHovered;

              // Expand hovered slice, shrink siblings
              let flexValue = 1;
              if (displaySlices.length === 2) {
                if (isHovered) flexValue = 2.0;
                else if (isOtherHovered) flexValue = 0.6;
              } else if (displaySlices.length >= 3) {
                if (isHovered) flexValue = 2.2;
                else if (isOtherHovered) flexValue = 0.75;
              }

              const isBorderActive = hoveredSlice === idx || hoveredSlice === idx + 1;

              return (
                <div
                  key={`${shot.url}-${idx}`}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    flex: flexValue,
                    transform: "skewX(-16deg)",
                    marginLeft: isFirst ? "-32px" : undefined,
                    paddingLeft: isFirst ? "32px" : undefined,
                    marginRight: isLast ? "-32px" : "2px", // 2px physical gap to prevent color merge
                    paddingRight: isLast ? "32px" : undefined,
                  }}
                  className="relative h-full overflow-hidden transition-[flex,opacity,filter] duration-300 ease-out cursor-pointer"
                >
                  {/* High-Contrast Dynamic Slash Line (Dual-tone for light & dark backgrounds) */}
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none transition-all duration-300"
                      style={{
                        width: isBorderActive ? "2.5px" : "2px",
                        background: isBorderActive
                          ? "linear-gradient(180deg, var(--p-primary) 0%, #c4b5fd 50%, var(--p-primary) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.25) 100%)",
                        boxShadow: isBorderActive
                          ? "0 0 12px var(--p-primary), 0 0 3px #ffffff"
                          : "0 0 3px rgba(0,0,0,0.85), -1px 0 2px rgba(0,0,0,0.7)",
                      }}
                    />
                  )}

                  {/* Counter-skewed photo */}
                  <Image
                    src={shot.thumbnailUrl || shot.url}
                    alt={shot.caption || `${project.title} screenshot ${idx + 1}`}
                    width={900}
                    height={600}
                    unoptimized
                    style={{
                      transform: isHovered
                        ? "skewX(16deg) scale(1.22)"
                        : "skewX(16deg) scale(1.12)",
                    }}
                    className={`absolute inset-0 h-full w-[140%] -left-[20%] object-cover transition-transform duration-500 ease-out ${
                      isOtherHovered ? "brightness-70 opacity-75" : "brightness-100 opacity-100"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Scrubber indicator if more than 3 photos exist */}
          {validScreenshots.length > 3 && (
            <div
              className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-mono font-medium text-white shadow-md backdrop-blur-md border border-white/15 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <span>
                {windowStart + 1}–{Math.min(windowStart + 3, validScreenshots.length)} of {validScreenshots.length}
              </span>
              <button
                type="button"
                aria-label="Previous photos"
                onClick={() =>
                  setWindowStart(
                    (prev) => (prev - 1 + validScreenshots.length) % validScreenshots.length
                  )
                }
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photos"
                onClick={() =>
                  setWindowStart((prev) => (prev + 1) % validScreenshots.length)
                }
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              >
                ›
              </button>
            </div>
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
        className="relative z-[2] -mt-4 flex min-w-0 flex-col items-start gap-4 px-6 pb-6 text-left sm:px-8 sm:pb-8"
      >
        <Heading className="m-0 w-full break-words text-2xl font-bold leading-tight tracking-tight text-[var(--p-fg)] transition-colors group-hover:text-[var(--p-primary)]">
          {project.title || "Untitled Project"}
        </Heading>
        <ProjectMetadata tags={project.tags} year={project.year} className="my-0" />
        <p className="m-0 line-clamp-3 w-full break-words text-sm leading-relaxed text-[var(--p-fg-muted)]">
          {project.description || "Project description will appear here once added in the editor."}
        </p>
        {caseStudyHref && isCaseStudyPublished(project) && (
          <a
            href={caseStudyHref}
            data-project-id={projectId}
            className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)] hover:underline"
          >
            View case study <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
