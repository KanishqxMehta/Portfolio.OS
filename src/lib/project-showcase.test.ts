import { describe, expect, it } from "vitest";
import { ProjectItemSchema, HeroContentSchema } from "./validations/portfolio";
import { getEngagementTargets } from "./engagement";
import { getProjectKey, hasCaseStudyContent, isCaseStudyPublished } from "./project-collection";
import { imageExtension } from "./project-media";

describe("project showcase compatibility and validation", () => {
  const oldProject = { title: "Example", description: "Existing project" };
  it("keeps existing project and hero content valid", () => {
    expect(ProjectItemSchema.safeParse(oldProject).success).toBe(true);
    expect(HeroContentSchema.safeParse({ fullName: "Example" }).success).toBe(true);
  });
  it("retains screenshots, source code and case-study content", () => {
    const content = { ...oldProject, sourceUrl: "https://example.test/code", screenshots: [{ url: "https://example.test/image.png", caption: "Dashboard" }], caseStudy: { problem: "A problem", results: "A result" } };
    expect(ProjectItemSchema.parse(content)).toMatchObject(content);
  });
  it("rejects unsafe URLs, oversized galleries and long case studies", () => {
    for (const url of ["javascript:alert(1)", "data:image/png;base64,abc", "file:///etc/passwd", "not a url"]) {
      expect(ProjectItemSchema.safeParse({ ...oldProject, screenshots: [{ url }] }).success).toBe(false);
      expect(HeroContentSchema.safeParse({ fullName: "Example", resumeUrl: url }).success).toBe(false);
    }
    expect(ProjectItemSchema.safeParse({ ...oldProject, screenshots: Array(9).fill({ url: "https://example.test/image.png" }) }).success).toBe(false);
    expect(ProjectItemSchema.safeParse({ ...oldProject, caseStudy: { role: "a".repeat(10001) } }).success).toBe(false);
  });
  it("uses stable project IDs and supports legacy projects", () => {
    expect(getProjectKey({ id: "abc" }, 4)).toBe("abc");
    expect(getProjectKey({}, 4)).toBe("project-5");
  });
  it("requires written content even when enabled and preserves legacy written studies", () => {
    expect(isCaseStudyPublished({})).toBe(false);
    expect(isCaseStudyPublished({ caseStudyEnabled: true })).toBe(false);
    expect(isCaseStudyPublished({ caseStudyEnabled: true, caseStudy: { problem: " \n " } })).toBe(false);
    expect(isCaseStudyPublished({ caseStudy: { results: "A result" } })).toBe(true);
    const disabled = { caseStudyEnabled: false, caseStudy: { results: "A result" } };
    expect(hasCaseStudyContent(disabled)).toBe(true);
    expect(isCaseStudyPublished(disabled)).toBe(false);
    expect(ProjectItemSchema.parse({ ...oldProject, ...disabled })).toMatchObject(disabled);
  });
  it("validates actual image signatures rather than trusting MIME alone", () => {
    expect(imageExtension(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), "image/png")).toBe("png");
    expect(imageExtension(Uint8Array.from([255, 216, 255]), "image/jpeg")).toBe("jpg");
    expect(imageExtension(new TextEncoder().encode("RIFFxxxxWEBP"), "image/webp")).toBe("webp");
    expect(imageExtension(new TextEncoder().encode("<svg>"), "image/png")).toBeNull();
    expect(imageExtension(Uint8Array.from([255, 216, 255]), "image/png")).toBeNull();
  });
});

describe("published engagement targets", () => {
  it("ignores hidden sections and projects, retaining original legacy indices", () => {
    const targets = getEngagementTargets({ sections: [
      { type: "HERO", isVisible: false, content: { github: "https://example.test/hidden" } },
      { type: "PROJECTS", content: { items: [{ id: "hidden", isVisible: false }, { link: "https://example.test/live", sourceUrl: "https://example.test/code", caseStudy: { problem: "A problem" } }] } },
    ] }, "jane");
    expect(targets).toHaveLength(3);
    expect(targets[0]).toEqual({ href: "/p/jane/projects/project-2", action: "project_open", projectId: "project-2" });
    expect(targets.some((target) => target.projectId === "hidden" || target.action === "social")).toBe(false);
  });
  it("does not accept case-study actions for blank or disabled studies", () => {
    const targets = getEngagementTargets({ sections: [{ type: "PROJECTS", content: { items: [
      { id: "empty", caseStudyEnabled: true, caseStudy: { role: " " }, link: "https://example.test/live" },
      { id: "disabled", caseStudyEnabled: false, caseStudy: { problem: "A problem" } },
    ] } }] }, "jane");
    expect(targets).toEqual([{ href: "https://example.test/live", action: "project_live", projectId: "empty" }]);
  });
  it("supports optional social, contact and resume links and empty legacy content", () => {
    expect(getEngagementTargets({}, "jane")).toEqual([]);
    expect(getEngagementTargets({ sections: [{ type: "PROJECTS", content: {} }] }, "jane")).toEqual([]);
    const targets = getEngagementTargets({ sections: [
      { type: "HERO", content: { github: "https://example.test/social", phone: "+123", resumeUrl: "https://example.test/resume.pdf" } },
      { type: "CONTACT_FORM", content: { emailTarget: "hello@example.test" } },
    ] }, "jane");
    expect(targets.map((target) => target.action)).toEqual(["social", "resume", "contact", "contact"]);
  });
});
