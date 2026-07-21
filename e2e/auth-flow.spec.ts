import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Suite", () => {
  test("should render login page with email and password inputs", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should render signup page with registration fields", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const usernameInput = page.locator("input[placeholder='your-name']");
    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");

    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should render forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");

    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible();
  });
});
