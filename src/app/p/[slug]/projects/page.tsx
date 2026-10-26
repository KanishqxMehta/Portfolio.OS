import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectKey, getVisibleProjects } from "@/lib/project-collection";
import { ActionTracker } from "@/components/portfolio/ActionTracker";
import { getEngagementTargets } from "@/lib/engagement";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { THEMES } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProjectsContent } from "@/lib/validations/portfolio";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicPortfolio(slug);
  const sections = content?.sections ?? [];
  const hero = sections.find((section: any) => section.type === "HERO");
  const name = hero?.content?.fullName || slug;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev").replace(/\/$/, "");

  return {
    title: `${name} — Projects`,
    description: `Explore all projects in ${name}'s portfolio.`,
    alternates: { canonical: `${baseUrl}/p/${slug}/projects` },
  };
}

export default async function PublicProjectArchivePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const content = await getPublicPortfolio(slug);
  if (!content) notFound();

  const sections = content.sections ?? [];
  const projectsSection = sections.find((section: any) => section.type === "PROJECTS");
  if (!projectsSection || projectsSection.isVisible === false) notFound();
  const allItems = (projectsSection.content?.items ?? []) as ProjectsContent["items"];
  const projects = getVisibleProjects(allItems);
  const filters = await searchParams ?? {};
  const query = typeof filters.q === "string" ? filters.q.trim() : "";
  const tag = typeof filters.tag === "string" ? filters.tag : "";
  const year = typeof filters.year === "string" ? filters.year : "";
  const tags = [...new Set(projects.flatMap((project) => project.tags ?? []))].sort();
  const years = [...new Set(projects.map((project) => project.year).filter((value): value is string => Boolean(value)))].sort().reverse();
  const filtered = projects.filter((project) =>
    (!query || `${project.title} ${project.description} ${(project.tags ?? []).join(" ")}`.toLowerCase().includes(query.toLowerCase())) &&
    (!tag || project.tags?.includes(tag)) && (!year || project.year === year),
  );
  const hero = sections.find((section: any) => section.type === "HERO");
  const name = hero?.content?.fullName || slug;
  const theme = content.theme || "classic";
  const activeTheme = THEMES[theme] || THEMES.classic;

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-[var(--p-bg)] px-6 py-16 font-sans text-[var(--p-fg)] sm:px-10"
      style={{
        ...activeTheme.cssVars,
        fontFamily: activeTheme.cssVars["--p-font"],
      } as React.CSSProperties}
    >
      <div className="mx-auto max-w-5xl">
        <ActionTracker slug={slug} targets={getEngagementTargets(content, slug)} />
        <Link
          href={`/p/${slug}`}
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-fg-muted)] transition-colors hover:text-[var(--p-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {name}&apos;s portfolio
        </Link>

        <header className="mb-12 border-b border-[var(--p-border)] pb-8">
          <div className="mb-4 flex items-center gap-3 text-[var(--p-primary)]">
            <FolderKanban className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Project archive</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">All projects</h1>
          <p className="mt-3 text-base text-[var(--p-fg-muted)]">
            {projects.length} project{projects.length === 1 ? "" : "s"} by {name}
          </p>
        </header>

        <form className="mb-8 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" action={`/p/${slug}/projects`}>
          <Input aria-label="Search projects" name="q" placeholder="Search projects" defaultValue={query} className="border-[var(--p-border)] bg-[var(--p-bg-card)] text-[var(--p-fg)]" />
          <select aria-label="Filter by technology" name="tag" defaultValue={tag} className="rounded-md border border-[var(--p-border)] bg-[var(--p-bg-card)] px-3 py-2 text-sm">
            <option value="">All technologies</option>
            {tags.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select aria-label="Filter by year" name="year" defaultValue={year} className="rounded-md border border-[var(--p-border)] bg-[var(--p-bg-card)] px-3 py-2 text-sm">
            <option value="">All years</option>
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <Button type="submit">Apply filters</Button>
        </form>
        {(query || tag || year) && <p className="mb-6 text-sm text-[var(--p-fg-muted)]">Showing {filtered.length} of {projects.length} projects · <Link href={`/p/${slug}/projects`} className="underline">Clear filters</Link></p>}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {filtered.map((project, index) => {
              const projectId = getProjectKey(project, allItems.indexOf(project));
              return <ProjectCard key={projectId} project={project} projectId={projectId} index={index} headingLevel={2} caseStudyHref={`/p/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}`} />;
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--p-border)] px-6 py-12 text-center text-[var(--p-fg-muted)]">
            {projects.length ? "No projects match these filters." : "No public projects have been added yet."}
          </p>
        )}
      </div>
    </main>
  );
}
