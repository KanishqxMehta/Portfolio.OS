import Link from "next/link";
import { ArrowLeft, ExternalLink, FolderKanban } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVisibleProjects } from "@/lib/project-collection";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { THEMES } from "@/lib/themes";

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function PublicProjectArchivePage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicPortfolio(slug);
  if (!content) notFound();

  const sections = content.sections ?? [];
  const projectsSection = sections.find((section: any) => section.type === "PROJECTS");
  const projects = getVisibleProjects(projectsSection?.content?.items);
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

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project: any, index) => (
              <article
                key={project.id || `${project.title}-${index}`}
                className="rounded-[var(--p-radius)] border border-[var(--p-border)] bg-[var(--p-bg-card)] p-6 shadow-[var(--p-shadow)] sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <span className="font-mono text-xs text-[var(--p-fg-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--p-primary)] transition-colors hover:opacity-75"
                    >
                      View project <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{project.title || "Untitled Project"}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--p-fg-muted)]">
                  {project.description || "Project description will appear here."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--p-border)] px-6 py-12 text-center text-[var(--p-fg-muted)]">
            No public projects have been added yet.
          </p>
        )}
      </div>
    </main>
  );
}
