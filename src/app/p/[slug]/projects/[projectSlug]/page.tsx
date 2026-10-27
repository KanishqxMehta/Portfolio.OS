import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPortfolioContent } from "@/lib/public-portfolio";
import { CASE_STUDY_FIELDS, getProjectKey } from "@/lib/project-collection";
import { ProjectMetadata } from "@/components/portfolio/ProjectMetadata";
import type { ProjectsContent } from "@/lib/validations/portfolio";
import { THEMES } from "@/lib/themes";
import { CaseStudyGallery } from "@/components/portfolio/CaseStudyGallery";
import { ActionTracker } from "@/components/portfolio/ActionTracker";
import { getEngagementTargets } from "@/lib/engagement";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ slug: string; projectSlug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

async function getProject(slug: string, projectSlug: string, isPreview = false) {
  let userId: string | null = null;
  if (isPreview) {
    const session = await auth();
    userId = session?.user?.id ?? null;
  }
  const { content, isDraft } = await getPortfolioContent({ slug, isPreview, userId });
  if (!content) return null;
  const section = content?.sections?.find((item) => item.type === "PROJECTS" && (isPreview || item.isVisible !== false));
  const items = (section?.content?.items ?? []) as ProjectsContent["items"];
  const project = items.find((item, index) => {
    const matchesSlug = getProjectKey(item, index) === projectSlug;
    if (!matchesSlug) return false;
    if (isPreview) return true;
    return item.isVisible !== false;
  });
  if (!project) return null;
  return { content, project, isDraft, isPreview };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const search = await searchParams;
  const isPreview = search?.preview === "true";
  const result = await getProject(slug, projectSlug, isPreview);
  if (!result) return { title: "Project not found", robots: { index: false } };
  if (result.isPreview) {
    return {
      title: `[Preview] ${result.project.title || "Untitled Project"} — Case study`,
      robots: { index: false, follow: false },
    };
  }
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev").replace(/\/$/, "");
  return {
    title: `${result.project.title} — Case study`,
    description: result.project.description.slice(0, 160),
    alternates: { canonical: `${baseUrl}/p/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectSlug)}` },
  };
}

export default async function ProjectCaseStudyPage({ params, searchParams }: PageProps) {
  const { slug, projectSlug } = await params;
  const search = await searchParams;
  const isPreview = search?.preview === "true";
  const result = await getProject(slug, projectSlug, isPreview);
  if (!result) notFound();
  const { content, project } = result;
  const theme = content.theme || "classic";
  const activeTheme = THEMES[theme] || THEMES.classic;
  const entries = project.caseStudyEnabled === false
    ? []
    : (Object.entries(CASE_STUDY_FIELDS) as Array<[keyof typeof CASE_STUDY_FIELDS, string]>).filter(([key]) => project.caseStudy?.[key]?.trim());
  return (
    <main data-theme={theme} className="min-h-screen bg-[var(--p-bg)] text-[var(--p-fg)]" style={{ ...activeTheme.cssVars, fontFamily: activeTheme.cssVars["--p-font"] } as React.CSSProperties}>
      {result.isPreview && (
        <aside
          aria-label="Draft preview notice"
          className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-6 py-2.5 backdrop-blur-md text-amber-950 dark:text-amber-200"
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft Preview · Showing your current unpublished edits</span>
          </div>
          <Link
            href="/dashboard/edit"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-950 dark:text-amber-100 transition-colors hover:bg-amber-500/30"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Editor
          </Link>
        </aside>
      )}
      <div className="px-6 py-12 sm:px-10">
        {!result.isPreview && <ActionTracker slug={slug} targets={getEngagementTargets(content, slug)} />}
        <article className="mx-auto max-w-4xl space-y-10">
          <div className="flex items-center gap-3">
            <Link
              href={result.isPreview ? "/dashboard/edit" : `/p/${encodeURIComponent(slug)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-fg-muted)] hover:text-[var(--p-primary)]"
            >
              <ArrowLeft className="h-4 w-4" /> {result.isPreview ? "Back to editor" : "Back to portfolio"}
            </Link>
            <span className="text-xs text-[var(--p-fg-muted)] opacity-50">·</span>
            <Link
              href={result.isPreview ? `/p/${encodeURIComponent(slug)}/projects?preview=true` : `/p/${encodeURIComponent(slug)}/projects`}
              className="inline-flex items-center text-xs font-medium text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:underline"
            >
              All projects
            </Link>
          </div>
          <header className="space-y-5 border-b border-[var(--p-border)] pb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--p-primary)]">
              {result.isPreview ? "Draft case study" : "Project case study"}{project.year ? ` · ${project.year}` : ""}
            </p>
            <h1 className="break-words text-4xl font-black tracking-tight sm:text-6xl">{project.title || "Untitled Project"}</h1>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--p-fg-muted)]">{project.description || "No project description provided."}</p>
            <ProjectMetadata tags={project.tags} year={project.year} />
            <div className="flex flex-wrap gap-4">
              {project.link && <a href={project.link} data-project-id={projectSlug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)]">View live project <ExternalLink className="h-4 w-4" /></a>}
              {project.sourceUrl && <a href={project.sourceUrl} data-project-id={projectSlug} data-engagement-action="project_source" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)]">View source code <ExternalLink className="h-4 w-4" /></a>}
            </div>
          </header>
          {!!project.screenshots?.length && (
            <CaseStudyGallery screenshots={project.screenshots} title={project.title} isMobile={Boolean(project.isMobile)} />
          )}
          {entries.length === 0 ? (
            <section aria-label="Case study status" className="rounded-xl border border-dashed border-[var(--p-border)] p-8 text-center">
              <p className="text-base font-semibold text-[var(--p-fg)]">
                Case study has not been published or updated yet
              </p>
              <p className="mt-1 text-sm text-[var(--p-fg-muted)]">
                {result.isPreview
                  ? "In the editor, open this project, enable the case study toggle, and add sections like Problem, Role, Solution, or Results to see your case study story appear here."
                  : "The detailed case study breakdown for this project has not been published or updated yet."}
              </p>
              {result.isPreview && (
                <Link
                  href="/dashboard/edit"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-primary)] hover:underline"
                >
                  Back to editor &rarr;
                </Link>
              )}
            </section>
          ) : (
            entries.map(([key, label]) => (
              <section key={key} className="space-y-3">
                <h2 className="text-2xl font-bold">{label}</h2>
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[var(--p-fg-muted)]">{project.caseStudy?.[key]}</p>
              </section>
            ))
          )}
        </article>
      </div>
    </main>
  );
}
