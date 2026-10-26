import { Code2, ExternalLink } from "lucide-react";

interface Props {
  title: string;
  link?: string;
  projectId: string;
  index: number;
  hasCover?: boolean;
}

/** 
 * Opaque controls with consistent top-corner positioning across all cards
 * (both with uploaded photos and with the fallback illustration) to guarantee perfect horizontal alignment.
 */
export function ProjectCardActions({ title, link, projectId, index }: Props) {
  const controlClass =
    "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-zinc-950/85 text-white shadow-md backdrop-blur-md transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <>
      {/* Subtle top scrim to guarantee high contrast over light images or backgrounds */}
      <div
        data-project-actions
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-black/75 via-black/35 to-transparent"
      />

      <div
        data-project-actions
        className="absolute inset-x-5 top-5 z-10 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6"
      >
        {link ? (
          <a
            href={link}
            data-project-id={projectId}
            aria-label={`View ${title} live project`}
            target="_blank"
            rel="noreferrer"
            className={controlClass}
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        ) : (
          <span aria-hidden="true" className={controlClass}>
            <Code2 className="h-5 w-5" />
          </span>
        )}

        <span
          aria-label={`Project ${index + 1}`}
          className="rounded-xl border border-white/20 bg-zinc-950/85 px-3 py-2 font-mono text-xs font-semibold text-white shadow-md backdrop-blur-md"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
