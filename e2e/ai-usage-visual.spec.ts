import { expect, test } from "@playwright/test";

test("shows the remaining daily AI resume-import allowance in the editor", async ({ page }) => {
  const identifier = `quota-${Date.now()}`;
  const email = `${identifier}@example.test`;
  const password = "QuotaTest123";
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const workerRequests: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    if (request.url().includes("pdf.worker")) workerRequests.push(request.url());
  });

  await page.goto("/signup");
  await page.locator("input[placeholder='your-name']").fill(identifier);
  await page.locator("input[type='email']").fill(email);
  await page.locator("input[placeholder='Create a strong password']").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Account created" })).toBeVisible();
  await page.waitForURL(/\/login/, { timeout: 10_000 });

  await page.locator("input[type='email']").fill(email);
  await page.locator("input[type='password']").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard\/edit/, { timeout: 10_000 });

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  const continueEditing = page.getByRole("link", { name: "Continue editing" });
  await expect(continueEditing).toBeVisible();
  await expect(continueEditing).toHaveAttribute("href", "/dashboard/edit");
  await continueEditing.click();
  await page.waitForURL(/\/dashboard\/edit/, { timeout: 10_000 });

  const importButton = page.getByRole("button", { name: /AI Resume Import/i });
  await expect(importButton).toBeVisible();
  await expect(importButton).toContainText("1 left today");
  await expect(importButton).toBeEnabled();
  await importButton.click();
  const parserModal = page.getByRole("dialog");
  await expect(parserModal).toBeVisible();
  await expect(parserModal.getByText("1 left today")).toBeVisible();

  await parserModal.locator("input[type='file']").setInputFiles({
    name: "invalid-resume.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("This is not a real PDF file."),
  });

  await expect(
    parserModal.getByText("We couldn’t read this PDF. Please try another PDF file."),
  ).toBeVisible();
  expect(workerRequests.some((url) => url.includes("cdn.jsdelivr.net"))).toBe(false);
  expect(parserModal.getByText("Setting up fake worker failed:")).toHaveCount(0);
  await expect(page.getByText("Page Error Detected")).toHaveCount(0);
  await expect(page.getByText("Something went wrong")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.some((message) => message.includes("AI resume import failed"))).toBe(true);
});
