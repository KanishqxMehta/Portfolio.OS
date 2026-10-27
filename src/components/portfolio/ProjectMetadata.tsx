import type { ProjectsContent } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

type Props = Pick<ProjectsContent["items"][number], "tags" | "year"> & { className?: string };

export function ProjectMetadata({ tags, year, className }: Props) {
  const uniqueTags = [...new Set(tags ?? [])];
  if (!year && uniqueTags.length === 0) return null;

  const visibleTags = uniqueTags.slice(0, 3);
  const extraTags = uniqueTags.slice(3);

  return (
    <div
      className={cn(
        "my-2.5 flex w-full items-center justify-between gap-3 text-xs text-[var(--p-fg-muted)]",
        className
      )}
      aria-label="Project details"
    >
      {/* Left side: Tags list + "+N" hover tooltip */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--p-border)] px-2 py-0.5 text-[11px] leading-tight"
          >
            {tag}
          </span>
        ))}

        {extraTags.length > 0 && (
          <div className="group/extra relative inline-flex items-center">
            <button
              type="button"
              tabIndex={0}
              aria-label={`${extraTags.length} more tags`}
              className="rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--p-fg-muted)] transition-colors hover:border-[var(--p-primary)] hover:text-[var(--p-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--p-primary)] cursor-default"
            >
              +{extraTags.length}
            </button>

            {/* Floating popover tooltip revealing extra tags on hover/focus */}
            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-0 mb-2 z-40 flex flex-wrap gap-1.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg-card)] p-2 shadow-xl [backdrop-filter:var(--p-blur)] opacity-0 -translate-y-1 group-hover/extra:opacity-100 group-hover/extra:translate-y-0 group-hover/extra:pointer-events-auto group-focus-within/extra:opacity-100 group-focus-within/extra:translate-y-0 group-focus-within/extra:pointer-events-auto transition-all duration-150 max-w-[240px] whitespace-normal"
            >
              {extraTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--p-fg)] whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Year/Date aligned with space-between */}
      {year && (
        <span className="shrink-0 font-mono text-xs text-[var(--p-fg-muted)]">
          {year}
        </span>
      )}
    </div>
  );
}
