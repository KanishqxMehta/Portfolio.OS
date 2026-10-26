export const MAIN_PORTFOLIO_PROJECT_LIMIT = 4;

export const CASE_STUDY_FIELDS = {
  problem: "The problem",
  role: "My role",
  approach: "Approach and solution",
  challenges: "Challenges and lessons",
  results: "Results and impact",
} as const;

type CaseStudyProject = {
  caseStudyEnabled?: boolean;
  caseStudy?: Partial<Record<keyof typeof CASE_STUDY_FIELDS, string>>;
};

export function hasCaseStudyContent(project: CaseStudyProject): boolean {
  return Object.keys(CASE_STUDY_FIELDS).some((key) =>
    Boolean(project.caseStudy?.[key as keyof typeof CASE_STUDY_FIELDS]?.trim()),
  );
}

/** Keep previously written studies accessible, but never expose empty pages. */
export function isCaseStudyPublished(project: CaseStudyProject): boolean {
  return project.caseStudyEnabled !== false && hasCaseStudyContent(project);
}

export type ProjectCollectionItem = {
  id?: string;
  isVisible?: boolean;
  featured?: boolean;
};

/**
 * Keeps the public portfolio concise while preserving the user's editor order.
 * Featured projects are promoted first; unfeatured projects fill the remaining
 * slots in their existing order.
 */
export function selectMainPortfolioProjects<T extends ProjectCollectionItem>(
  items: T[] | undefined,
): T[] {
  const visible = (items ?? []).filter((item) => item.isVisible !== false);
  const featured = visible.filter((item) => item.featured === true);
  const remaining = visible.filter((item) => item.featured !== true);

  return [...featured, ...remaining].slice(0, MAIN_PORTFOLIO_PROJECT_LIMIT);
}

export function getVisibleProjects<T extends ProjectCollectionItem>(items: T[] | undefined): T[] {
  return (items ?? []).filter((item) => item.isVisible !== false);
}

/** IDs are stable for new projects; the index fallback keeps legacy records reachable. */
export function getProjectKey(project: ProjectCollectionItem, index: number): string {
  return project.id || `project-${index + 1}`;
}
