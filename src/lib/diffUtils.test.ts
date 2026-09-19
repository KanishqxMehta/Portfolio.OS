import { describe, expect, it } from "vitest";
import {
  calculatePortfolioDiff,
  getItemDiffsForSection,
  applyDecisionsToSections,
  BlockDecision,
} from "@/lib/diffUtils";
import { Section } from "@/lib/validations/portfolio";

describe("diffUtils", () => {
  describe("getItemDiffsForSection", () => {
    it("detects added, modified, and removed string fields", () => {
      const orig = { fullName: "Alice", bio: "Engineer" };
      const proposed = { fullName: "Alice Smith", bio: "", github: "https://github.com/alice" };

      const diffs = getItemDiffsForSection(orig, proposed);
      const nameDiff = diffs.find((d) => d.id === "fullName");
      const bioDiff = diffs.find((d) => d.id === "bio");
      const ghDiff = diffs.find((d) => d.id === "github");

      expect(nameDiff?.status).toBe("MODIFIED");
      expect(bioDiff?.status).toBe("REMOVED");
      expect(ghDiff?.status).toBe("ADDED");
    });

    it("detects array changes for skills", () => {
      const orig = { items: ["React", "CSS"] };
      const proposed = { items: ["React", "TypeScript"] };

      const diffs = getItemDiffsForSection(orig, proposed);
      const react = diffs.find((d) => d.id === "React");
      const css = diffs.find((d) => d.id === "CSS");
      const ts = diffs.find((d) => d.id === "TypeScript");

      expect(react?.status).toBe("UNCHANGED");
      expect(css?.status).toBe("REMOVED");
      expect(ts?.status).toBe("ADDED");
    });
  });

  describe("calculatePortfolioDiff", () => {
    it("computes block diffs across sections", () => {
      const orig: Section[] = [
        {
          id: "hero-1",
          type: "HERO",
          title: "About",
          content: { fullName: "Alex" },
          isVisible: true,
        },
        {
          id: "skills-1",
          type: "SKILLS",
          title: "Skills",
          content: { items: ["React"] },
          isVisible: true,
        },
      ];

      const proposed: Section[] = [
        {
          id: "hero-proposed",
          type: "HERO",
          title: "About",
          content: { fullName: "Alex Edited" },
          isVisible: true,
        },
        {
          id: "proj-proposed",
          type: "PROJECTS",
          title: "Projects",
          content: { items: [{ title: "New Project", description: "Awesome" }] },
          isVisible: true,
        },
      ];

      const diffs = calculatePortfolioDiff(orig, proposed);
      expect(diffs.length).toBe(3);

      const hero = diffs.find((d) => d.type === "HERO");
      const skills = diffs.find((d) => d.type === "SKILLS");
      const projects = diffs.find((d) => d.type === "PROJECTS");

      expect(hero?.status).toBe("MODIFIED");
      expect(skills?.status).toBe("REMOVED");
      expect(projects?.status).toBe("ADDED");
    });
  });

  describe("applyDecisionsToSections", () => {
    const baseline: Section[] = [
      {
        id: "hero-1",
        type: "HERO",
        title: "About",
        content: { fullName: "Original" },
        isVisible: true,
      },
      {
        id: "skills-1",
        type: "SKILLS",
        title: "Skills",
        content: { items: ["React"] },
        isVisible: true,
      },
    ];

    const proposed: Section[] = [
      {
        id: "hero-prop",
        type: "HERO",
        title: "About",
        content: { fullName: "Updated" },
        isVisible: true,
      },
      {
        id: "skills-prop",
        type: "SKILLS",
        title: "Skills",
        content: { items: ["React", "TypeScript"] },
        isVisible: true,
      },
      {
        id: "proj-prop",
        type: "PROJECTS",
        title: "Projects",
        content: { items: [{ title: "Proj 1", description: "Desc" }] },
        isVisible: true,
      },
    ];

    it("applies accepted changes and keeps original for rejected", () => {
      const decisions: Record<string, BlockDecision> = {
        "hero-1": "accepted",
        "skills-1": "rejected",
        "proj-prop": "accepted",
      };

      const result = applyDecisionsToSections(baseline, proposed, decisions);

      expect(result.length).toBe(3);
      const hero = result.find((s) => s.type === "HERO");
      const skills = result.find((s) => s.type === "SKILLS");
      const proj = result.find((s) => s.type === "PROJECTS");

      expect((hero?.content as any).fullName).toBe("Updated");
      expect(hero?.id).toBe("hero-1"); // preserves ID
      expect((skills?.content as any).items).toEqual(["React"]); // original kept
      expect(proj).toBeDefined();
    });

    it("never produces duplicate sections even if decision is toggled multiple times", () => {
      const decisions: Record<string, BlockDecision> = {
        "skills-1": "rejected",
      };
      let res = applyDecisionsToSections(baseline, proposed, decisions);
      expect(res.filter((s) => s.type === "SKILLS").length).toBe(1);

      decisions["skills-1"] = "accepted";
      res = applyDecisionsToSections(baseline, proposed, decisions);
      expect(res.filter((s) => s.type === "SKILLS").length).toBe(1);

      decisions["skills-1"] = "accepted";
      decisions["skills-1"] = "accepted";
      res = applyDecisionsToSections(baseline, proposed, decisions);
      expect(res.filter((s) => s.type === "SKILLS").length).toBe(1);
    });
  });
});
