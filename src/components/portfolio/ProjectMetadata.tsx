import type { ProjectsContent } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

type Props = Pick<ProjectsContent["items"][number], "tags" | "year"> & { className?: string };

export function ProjectMetadata({ tags, year, className }: Props) {
  if (!year && !tags?.length) return null;
  return (
    <div className={cn("my-3 flex flex-wrap items-center gap-2 text-xs text-[var(--p-fg-muted)]", className)} aria-label="Project details">
      {year && <span className="mr-1 font-mono">{year}</span>}
      {[...new Set(tags ?? [])].map((tag) => <span key={tag} className="rounded-full border border-[var(--p-border)] px-2 py-1">{tag}</span>)}
    </div>
  );
}
