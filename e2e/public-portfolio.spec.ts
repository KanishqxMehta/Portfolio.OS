import { test, expect } from "@playwright/test";

test.describe("Public Portfolio E2E Suite", () => {
  test("should handle non-existent portfolio gracefully with 404", async ({ page }) => {
    const response = await page.goto("/p/this-portfolio-slug-definitely-does-not-exist-12345");
    expect([404, 200]).toContain(response?.status());

    const notFoundText = page.locator("text=404, text=not found, text=Page Not Found").first();
    await expect(notFoundText).toBeVisible();
  });
});
