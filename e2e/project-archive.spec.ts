import { test, expect } from "./fixtures";
import { Pool } from "pg";

const isolatedDatabase = process.env.DATABASE_URL?.endsWith("/portfolio_verification");
test.describe("project archive protection", () => {
  test.skip(!isolatedDatabase, "Requires the disposable portfolio_verification database");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const userId = crypto.randomUUID();
  const slug = `archive-${Date.now()}`;
  const content = (isVisible: boolean, layout = "classic") => ({
    theme: "classic", layout,
    sections: [
      { id: "hero", type: "HERO", title: "About", isVisible: true, content: { fullName: "Archive Test", bio: "Test portfolio" } },
      { id: "projects", type: "PROJECTS", title: "Projects", isVisible, content: { items: Array.from({ length: 7 }, (_, index) => ({ id: `p-${index}`, title: index === 6 ? "Hidden item" : `Visible project ${index + 1}`, description: "Project description", isVisible: index !== 6, tags: [index % 2 ? "React" : "AI"], year: "2026" })) } },
    ],
  });
  test.beforeAll(async () => {
    await pool.query('INSERT INTO "User" (id, email, username, "updatedAt") VALUES ($1, $2, $3, NOW())', [userId, `${slug}@example.test`, slug]);
    await pool.query('INSERT INTO "Portfolio" (id, "userId", "publicSlug", content, "updatedAt") VALUES ($1, $1, $2, $3, NOW())', [userId, slug, content(true)]);
  });
  test.afterAll(async () => {
    await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
    await pool.end();
  });
  test("shows four projects and a complete archive without browser errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`/p/${slug}`);
    await expect(page.getByRole("heading", { level: 3, name: /Visible project/ })).toHaveCount(4);
    await page.getByRole("link", { name: "View all 6 projects" }).click();
    await expect(page.getByRole("heading", { level: 2, name: /Visible project/ })).toHaveCount(6);
    await expect(page.getByText("Hidden item")).toHaveCount(0);
    await page.getByRole("combobox", { name: "Filter by technology" }).selectOption("React");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("heading", { level: 2, name: /Visible project/ })).toHaveCount(3);
    await page.getByRole("textbox", { name: "Search projects" }).fill("project 2");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("heading", { level: 2, name: /Visible project/ })).toHaveCount(1);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
    await expect(page.getByText("Page Error Detected")).toHaveCount(0);
  });
  test("denies direct archive access when the entire section is hidden", async ({ page }) => {
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(false), userId]);
    await page.goto(`/p/${slug}/projects`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText("Visible project 1", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});
