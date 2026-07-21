import { test, expect } from "@playwright/test";

test.describe("Search & Explorer E2E Suite", () => {
  test("should render search page with hero, search input, and popular skill tags", async ({ page }) => {
    await page.goto("/search");

    const heading = page.getByRole("heading", { name: /discover|explore/i });
    await expect(heading).toBeVisible();

    const searchInput = page.locator("input[placeholder*='Search']");
    await expect(searchInput).toBeVisible();

    const tagButton = page.getByRole("button", { name: "React" });
    await expect(tagButton).toBeVisible();
  });

  test("should update input when tag is clicked", async ({ page }) => {
    await page.goto("/search");

    const tagButton = page.getByRole("button", { name: "React" });
    await tagButton.click();

    const searchInput = page.locator("input[placeholder*='Search']");
    await expect(searchInput).toHaveValue("React");
  });
});
