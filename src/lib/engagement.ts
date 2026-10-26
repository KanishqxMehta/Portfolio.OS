import type { PublicPortfolioContent } from "@/lib/public-portfolio";
import type { HeroContent, ProjectsContent } from "@/lib/validations/portfolio";
import { getProjectKey, isCaseStudyPublished } from "@/lib/project-collection";

export const ENGAGEMENT_LABELS = {
  project_open: "Case studies opened",
  project_live: "Live project clicks",
  project_source: "Source code clicks",
  social: "Social link clicks",
  contact: "Contact clicks",
  resume: "Resume link clicks",
} as const;
export type EngagementAction = keyof typeof ENGAGEMENT_LABELS;
export type EngagementTarget = { href: string; action: EngagementAction; projectId?: string; target?: string };

/** Allowlist is derived from published, visible content on both client and server. */
export function getEngagementTargets(content: PublicPortfolioContent, slug: string): EngagementTarget[] {
  const sections = (content.sections ?? []).filter((section) => section.isVisible !== false);
  const targets: EngagementTarget[] = [];
  const hero = sections.find((section) => section.type === "HERO")?.content as HeroContent | undefined;
  for (const target of ["github", "linkedin", "instagram", "twitter"] as const) {
    if (hero?.[target]) targets.push({ href: hero[target], action: "social", target });
  }
  if (hero?.resumeUrl) targets.push({ href: hero.resumeUrl, action: "resume" });
  if (hero?.phone) targets.push({ href: `tel:${hero.phone}`, action: "contact", target: "phone" });
  const contact = sections.find((section) => section.type === "CONTACT_FORM")?.content;
  if (contact?.emailTarget) targets.push({ href: `mailto:${contact.emailTarget}`, action: "contact", target: "email" });
  const projects = sections.find((section) => section.type === "PROJECTS")?.content as ProjectsContent | undefined;
  (projects?.items ?? []).forEach((project, index) => {
    if (project.isVisible === false) return;
    const projectId = getProjectKey(project, index);
    if (isCaseStudyPublished(project)) targets.push({ href: `/p/${encodeURIComponent(slug)}/projects/${encodeURIComponent(projectId)}`, action: "project_open", projectId });
    if (project.link) targets.push({ href: project.link, action: "project_live", projectId });
    if (project.sourceUrl) targets.push({ href: project.sourceUrl, action: "project_source", projectId });
  });
  return targets;
}
