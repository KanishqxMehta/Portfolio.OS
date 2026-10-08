import { describe, expect, it } from "vitest";
import {
  MAIN_PORTFOLIO_PROJECT_LIMIT,
  getVisibleProjects,
  selectMainPortfolioProjects,
} from "./project-collection";

const projects = Array.from({ length: 6 }, (_, index) => ({
  id: `project-${index + 1}`,
  title: `Project ${index + 1}`,
  isVisible: true,
}));

describe("project collection", () => {
  it("limits the public portfolio to four projects", () => {
    expect(MAIN_PORTFOLIO_PROJECT_LIMIT).toBe(4);
    expect(selectMainPortfolioProjects(projects).map((project) => project.id)).toEqual([
      "project-1",
      "project-2",
      "project-3",
      "project-4",
    ]);
  });

  it("promotes featured projects without changing their relative editor order", () => {
    const featuredProjects = projects.map((project) =>
      project.id === "project-5" || project.id === "project-2"
        ? { ...project, featured: true }
        : project,
    );

    expect(selectMainPortfolioProjects(featuredProjects).map((project) => project.id)).toEqual([
      "project-2",
      "project-5",
      "project-1",
      "project-3",
    ]);
  });

  it("excludes hidden projects from the main portfolio and archive", () => {
    const withHiddenProject = [
      ...projects,
      { id: "hidden", title: "Hidden", isVisible: false, featured: true },
    ];

    expect(getVisibleProjects(withHiddenProject)).toHaveLength(6);
    expect(selectMainPortfolioProjects(withHiddenProject).map((project) => project.id)).not.toContain("hidden");
  });
});
