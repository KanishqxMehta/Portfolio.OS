import { test, expect } from "@playwright/test";

test.describe("Public Portfolio E2E Suite", () => {
  test("should handle non-existent portfolio gracefully with 404 or error boundary", async ({ page }) => {
    const response = await page.goto("/p/this-portfolio-slug-definitely-does-not-exist-12345");
    expect([200, 404, 500]).toContain(response?.status());

    // Matches 404 not found, error boundary fallback UI ("Temporary Connection Issue" / "Try Again")
    const errorOrNotFoundText = page.locator("text=/404|not found|Page Error|Something went wrong|Connection Issue|Try Again/i").first();
    await expect(errorOrNotFoundText).toBeVisible({ timeout: 10000 });
  });
});
