import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { CASE_STUDY_FIELDS, getProjectKey, isCaseStudyPublished } from "@/lib/project-collection";
import { ProjectMetadata } from "@/components/portfolio/ProjectMetadata";
import type { ProjectsContent } from "@/lib/validations/portfolio";
import { THEMES } from "@/lib/themes";
import { CaseStudyGallery } from "@/components/portfolio/CaseStudyGallery";
import { ActionTracker } from "@/components/portfolio/ActionTracker";
import { getEngagementTargets } from "@/lib/engagement";

interface PageProps { params: Promise<{ slug: string; projectSlug: string }> }

async function getProject(slug: string, projectSlug: string) {
  const content = await getPublicPortfolio(slug);
  const section = content?.sections?.find((item) => item.type === "PROJECTS" && item.isVisible !== false);
  const items = (section?.content?.items ?? []) as ProjectsContent["items"];
  const project = items.find((item, index) => item.isVisible !== false && isCaseStudyPublished(item) && getProjectKey(item, index) === projectSlug);
  if (!content || !project) return null;
  return { content, project };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const result = await getProject(slug, projectSlug);
  if (!result) return { title: "Project not found", robots: { index: false } };
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev").replace(/\/$/, "");
  return {
    title: `${result.project.title} — Case study`,
    description: result.project.description.slice(0, 160),
    alternates: { canonical: `${baseUrl}/p/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectSlug)}` },
  };
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { slug, projectSlug } = await params;
  const result = await getProject(slug, projectSlug);
  if (!result) notFound();
  const { content, project } = result;
  const theme = content.theme || "classic";
  const activeTheme = THEMES[theme] || THEMES.classic;
  const entries = (Object.entries(CASE_STUDY_FIELDS) as Array<[keyof typeof CASE_STUDY_FIELDS, string]>).filter(([key]) => project.caseStudy?.[key]?.trim());
  return (
    <main data-theme={theme} className="min-h-screen bg-[var(--p-bg)] px-6 py-12 text-[var(--p-fg)] sm:px-10" style={{ ...activeTheme.cssVars, fontFamily: activeTheme.cssVars["--p-font"] } as React.CSSProperties}>
      <ActionTracker slug={slug} targets={getEngagementTargets(content, slug)} />
      <article className="mx-auto max-w-4xl space-y-10">
        <Link href={`/p/${encodeURIComponent(slug)}/projects`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-fg-muted)] hover:text-[var(--p-primary)]"><ArrowLeft className="h-4 w-4" />All projects</Link>
        <header className="space-y-5 border-b border-[var(--p-border)] pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--p-primary)]">Project case study{project.year ? ` · ${project.year}` : ""}</p>
          <h1 className="break-words text-4xl font-black tracking-tight sm:text-6xl">{project.title}</h1>
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--p-fg-muted)]">{project.description}</p>
          <ProjectMetadata tags={project.tags} />
          <div className="flex flex-wrap gap-4">
            {project.link && <a href={project.link} data-project-id={projectSlug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)]">View live project <ExternalLink className="h-4 w-4" /></a>}
            {project.sourceUrl && <a href={project.sourceUrl} data-project-id={projectSlug} data-engagement-action="project_source" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)]">View source code <ExternalLink className="h-4 w-4" /></a>}
          </div>
        </header>
        {!!project.screenshots?.length && (
          <CaseStudyGallery screenshots={project.screenshots} title={project.title} />
        )}
        {entries.map(([key, label]) => <section key={key} className="space-y-3"><h2 className="text-2xl font-bold">{label}</h2><p className="whitespace-pre-wrap break-words leading-relaxed text-[var(--p-fg-muted)]">{project.caseStudy?.[key]}</p></section>)}
      </article>
    </main>
  );
}
