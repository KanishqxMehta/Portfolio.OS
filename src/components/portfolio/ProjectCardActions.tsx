import { Code2, ExternalLink } from "lucide-react";

interface Props {
  title: string;
  link?: string;
  sourceUrl?: string;
  projectId: string;
  index: number;
  hasCover?: boolean;
  photoCounter?: string;
}

/**
 * Top-bar controls for the full-bleed project card:
 * index + optional photo counter on the top-left, live & source links on the top-right.
 * Inherits `--card-overlay-*` tokens from `[data-project-card]` so light themes render matching
 * translucent-white pills and dark themes render matching translucent-dark pills.
 */
export function ProjectCardActions({ title, link, sourceUrl, projectId, index, photoCounter }: Props) {
  const controlClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] text-[var(--card-overlay-fg)] shadow-md transition-all hover:bg-[var(--card-overlay-bg-hover)] hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-primary)]";

  return (
    <div
      data-project-actions
      className="pointer-events-none absolute inset-x-3.5 top-3.5 z-20 flex items-center justify-between gap-2"
    >
      {/* Top-left: Project index + optional 1/N screenshot counter */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <span
          aria-label={`Project ${index + 1}`}
          className="inline-flex h-7 items-center rounded-full border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] px-2.5 font-mono text-[11px] font-bold text-[var(--card-overlay-fg)] shadow-md"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {photoCounter && (
          <span
            aria-label={`Screenshot ${photoCounter}`}
            className="inline-flex h-7 items-center rounded-full border border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg)] px-2.5 font-mono text-[10px] font-bold text-[var(--card-overlay-muted)] shadow-md"
          >
            {photoCounter}
          </span>
        )}
      </div>

      {/* Top-right (.fb-actions): Live link & Source code buttons */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {sourceUrl && (
          <a
            href={sourceUrl}
            data-project-id={projectId}
            data-engagement-action="project_source"
            aria-label={`View ${title} source code`}
            target="_blank"
            rel="noreferrer"
            className={controlClass}
          >
            <Code2 className="h-4 w-4" />
          </a>
        )}
        {link ? (
          <a
            href={link}
            data-project-id={projectId}
            aria-label={`View ${title} live project`}
            target="_blank"
            rel="noreferrer"
            className={controlClass}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          !sourceUrl && (
            <span aria-hidden="true" className={controlClass}>
              <Code2 className="h-4 w-4" />
            </span>
          )
        )}
      </div>
    </div>
  );
}
