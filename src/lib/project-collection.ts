export const MAIN_PORTFOLIO_PROJECT_LIMIT = 4;

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
