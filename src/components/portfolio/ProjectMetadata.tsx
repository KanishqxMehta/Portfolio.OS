import type { ProjectsContent } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

type Props = Pick<ProjectsContent["items"][number], "tags" | "year"> & {
  className?: string;
  variant?: "default" | "overlay";
};

export function ProjectMetadata({ tags, year, className, variant = "default" }: Props) {
  const uniqueTags = [...new Set(tags ?? [])];
  if (!year && uniqueTags.length === 0) return null;

  const visibleTags = uniqueTags.slice(0, 3);
  const extraTags = uniqueTags.slice(3);
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "my-2.5 flex w-full items-center justify-between gap-3 text-xs",
        isOverlay ? "text-[var(--card-overlay-muted)]" : "text-[var(--p-fg-muted)]",
        className
      )}
      aria-label="Project details"
    >
      {/* Left side: Tags list + "+N" hover tooltip */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] leading-tight",
              isOverlay
                ? "border-[var(--card-overlay-divider)] bg-[var(--card-overlay-pill)] text-[var(--card-overlay-fg)]"
                : "border-[var(--p-border)]"
            )}
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
              className={cn(
                "cursor-default rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1",
                isOverlay
                  ? "border-[var(--card-overlay-divider)] bg-[var(--card-overlay-pill)] text-[var(--card-overlay-muted)] hover:border-[var(--p-primary)] hover:text-[var(--p-primary)] focus-visible:ring-[var(--p-primary)]"
                  : "border-[var(--p-border)] bg-[var(--p-bg-secondary)] text-[var(--p-fg-muted)] hover:border-[var(--p-primary)] hover:text-[var(--p-primary)] focus-visible:ring-[var(--p-primary)]"
              )}
            >
              +{extraTags.length}
            </button>

            {/* Floating popover tooltip revealing extra tags on hover/focus */}
            <div
              role="tooltip"
              className={cn(
                "pointer-events-none absolute bottom-full left-0 z-40 mb-2 flex max-w-[240px] -translate-y-1 flex-wrap gap-1.5 whitespace-normal rounded-lg border p-2 opacity-0 shadow-xl transition-all duration-150 group-focus-within/extra:pointer-events-auto group-focus-within/extra:translate-y-0 group-focus-within/extra:opacity-100 group-hover/extra:pointer-events-auto group-hover/extra:translate-y-0 group-hover/extra:opacity-100",
                isOverlay
                  ? "border-[var(--card-overlay-border)] bg-[var(--card-overlay-bg-hover)]"
                  : "border-[var(--p-border)] bg-[var(--p-bg-card)]"
              )}
            >
              {extraTags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px]",
                    isOverlay
                      ? "border-[var(--card-overlay-divider)] bg-[var(--card-overlay-pill)] text-[var(--card-overlay-fg)]"
                      : "border-[var(--p-border)] bg-[var(--p-bg-secondary)] text-[var(--p-fg)]"
                  )}
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
        <span
          className={cn(
            "shrink-0 font-mono text-xs",
            isOverlay ? "text-[var(--card-overlay-muted)]" : "text-[var(--p-fg-muted)]"
          )}
        >
          {year}
        </span>
      )}
    </div>
  );
}
