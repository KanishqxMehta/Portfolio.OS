import { expect, test } from "./fixtures";

test("shows the remaining daily AI resume-import allowance in the editor", async ({ page }) => {
  test.setTimeout(60_000);
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
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await page.locator("input[type='email']").fill(email);
  await page.locator("input[type='password']").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\/edit/, { timeout: 15_000 });

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  const continueEditing = page.getByRole("link", { name: "Continue editing" });
  await expect(continueEditing).toBeVisible();
  await expect(continueEditing).toHaveAttribute("href", "/dashboard/edit");
  await continueEditing.click();
  await expect(page).toHaveURL(/\/dashboard\/edit/, { timeout: 15_000 });

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

  // A focus refresh must pick up a temporary provider outage, then recover at
  // its reset time without requiring a page reload.
  await page.keyboard.press("Escape");
  const nameInput = page.getByPlaceholder("Enter your full name");
  await nameInput.fill("Unsaved edit survives focus");
  const busyUntil = Date.now() + 2500;
  await page.route("**/api/ai-usage", async (route) => {
    const busy = Date.now() < busyUntil;
    await route.fulfill({ json: {
      resumeImport: { used: 0, remaining: 1, limit: 1 },
      service: { available: !busy, reason: busy ? "busy" : undefined, resetsAt: busy ? new Date(busyUntil).toISOString() : new Date(Date.now() + 86_400_000).toISOString() },
    } });
  });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(importButton).toContainText("AI is busy");
  await expect(importButton).toBeDisabled();
  await expect(importButton).toBeEnabled({ timeout: 8000 });
  await expect(importButton).toContainText("1 left today");
  await expect(nameInput).toHaveValue("Unsaved edit survives focus");
});
