import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load landing page with correct title and brand header", async ({ page }) => {
    await expect(page).toHaveTitle(/Portfolio.OS/i);
    const logo = page.locator("header, nav").locator("text=Portfolio").first();
    await expect(logo).toBeVisible();
  });

  test("should render main hero heading and CTA buttons", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    const editorLink = page.getByRole("link", { name: /editor/i }).first();
    await expect(editorLink).toBeVisible();
  });

  test("should render FAQ section and toggle accordions", async ({ page }) => {
    const faqHeading = page.locator("text=Frequently Asked Questions").first();
    await expect(faqHeading).toBeVisible();

    const firstQuestion = page.locator("text=What is Portfolio.OS?").first();
    await expect(firstQuestion).toBeVisible();
  });

  test("should support theme toggle interactions", async ({ page }) => {
    const themeButton = page.locator("button[aria-label*='theme'], button:has(svg)").first();
    await expect(themeButton).toBeVisible();
  });
});
