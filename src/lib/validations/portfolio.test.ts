import { describe, expect, it } from "vitest";
import { portfolioSchema, type Section } from "@/lib/validations/portfolio";

const validHero: Section = {
  id: "hero-1",
  type: "HERO",
  title: "About Me",
  content: {
    fullName: "Jane Developer",
    bio: "Building things on the web.",
    github: "https://github.com/jane",
    linkedin: "",
    instagram: "",
    twitter: "",
  },
  isVisible: true,
};

function buildPortfolio(sections: Section[]) {
  return {
    username: "jane-dev",
    content: {
      theme: "classic",
      sections,
    },
  };
}

describe("portfolioSchema", () => {
  it("accepts a valid minimal portfolio", () => {
    const result = portfolioSchema.safeParse(buildPortfolio([validHero]));
    expect(result.success).toBe(true);
  });

  it("rejects usernames shorter than 3 characters", () => {
    const result = portfolioSchema.safeParse({
      ...buildPortfolio([validHero]),
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects usernames with invalid characters", () => {
    const result = portfolioSchema.safeParse({
      ...buildPortfolio([validHero]),
      username: "Jane_Dev",
    });
    expect(result.success).toBe(false);
  });

  it("rejects hero blocks without a full name", () => {
    const result = portfolioSchema.safeParse(
      buildPortfolio([
        {
          ...validHero,
          content: { ...validHero.content, fullName: "" },
        },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("rejects invalid social URLs on hero blocks", () => {
    const result = portfolioSchema.safeParse(
      buildPortfolio([
        {
          ...validHero,
          content: { ...validHero.content, github: "not-a-url" },
        },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("accepts a skills block with at least one item", () => {
    const result = portfolioSchema.safeParse(
      buildPortfolio([
        validHero,
        {
          id: "skills-1",
          type: "SKILLS",
          title: "Skills",
          content: { items: ["TypeScript", "React"] },
          isVisible: true,
        },
      ])
    );
    expect(result.success).toBe(true);
  });

  it("rejects contact form blocks with invalid target email", () => {
    const result = portfolioSchema.safeParse(
      buildPortfolio([
        validHero,
        {
          id: "contact-1",
          type: "CONTACT_FORM",
          title: "Contact",
          content: {
            emailTarget: "not-an-email",
            buttonText: "Send",
          },
          isVisible: true,
        },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("defaults isPublicOnSearch to false when omitted", () => {
    const result = portfolioSchema.safeParse(buildPortfolio([validHero]));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublicOnSearch).toBe(false);
    }
  });

  it("accepts isPublicOnSearch when explicitly set to true or false", () => {
    const trueResult = portfolioSchema.safeParse({
      ...buildPortfolio([validHero]),
      isPublicOnSearch: true,
    });
    expect(trueResult.success).toBe(true);
    if (trueResult.success) {
      expect(trueResult.data.isPublicOnSearch).toBe(true);
    }

    const falseResult = portfolioSchema.safeParse({
      ...buildPortfolio([validHero]),
      isPublicOnSearch: false,
    });
    expect(falseResult.success).toBe(true);
    if (falseResult.success) {
      expect(falseResult.data.isPublicOnSearch).toBe(false);
    }
  });

  it("rejects non-boolean isPublicOnSearch", () => {
    const result = portfolioSchema.safeParse({
      ...buildPortfolio([validHero]),
      isPublicOnSearch: "yes",
    });
    expect(result.success).toBe(false);
  });
});
