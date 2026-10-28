import { beforeEach, describe, expect, it, vi } from "vitest";
const { getPortfolio } = vi.hoisted(() => ({ getPortfolio: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => null) }));
vi.mock("@/lib/public-portfolio", () => ({
  getPublicPortfolio: getPortfolio,
  getPortfolioContent: vi.fn(async ({ slug }: { slug: string }) => ({ content: await getPortfolio(slug), isDraft: false, hasUnpublishedChanges: false })),
}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
import ArchivePage from "@/app/p/[slug]/projects/page";

describe("project archive visibility", () => {
  beforeEach(() => { getPortfolio.mockReset(); });
  it("rejects a hidden Projects section even when its items are individually visible", async () => {
    getPortfolio.mockResolvedValue({ sections: [{ type: "PROJECTS", isVisible: false, content: { items: [{ title: "Private project", isVisible: true }] } }] });
    await expect(ArchivePage({ params: Promise.resolve({ slug: "test" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("rejects an absent Projects section", async () => {
    getPortfolio.mockResolvedValue({ sections: [] });
    await expect(ArchivePage({ params: Promise.resolve({ slug: "test" }) })).rejects.toThrow("NOT_FOUND");
  });
});
