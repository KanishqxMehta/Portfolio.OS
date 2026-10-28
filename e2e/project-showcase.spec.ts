import { test, expect } from "./fixtures";
import { encode } from "next-auth/jwt";
import { Pool } from "pg";

test.describe("project showcase and visitor actions", () => {
  test.skip(!process.env.DATABASE_URL?.endsWith("/portfolio_verification"), "Requires the isolated verification database");
  test.describe.configure({ mode: "serial" });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const owner = crypto.randomUUID();
  const slug = `s-${Date.now()}`;
  const project = { id: "project-one", title: "Showcase dashboard", description: "A dashboard that makes complex reports easy to understand.", isVisible: true, tags: ["React", "PostgreSQL"], year: "2026", link: "https://example.test/live", sourceUrl: "https://example.test/source", screenshots: [{ url: "https://example.test/screenshot.png", caption: "The reporting dashboard" }], caseStudy: { problem: "Reports took hours to prepare.", role: "Product engineer", approach: "Built a reusable reporting pipeline.", challenges: "Made large reports fast and accessible.", results: "Reduced preparation time by 80%." } };
  const content = (layout = "classic", visible = true) => ({ theme: "classic", layout, sections: [
    { id: "hero", type: "HERO", title: "Hero", isVisible: true, content: { fullName: "Showcase Owner", bio: "Product engineer", github: "https://example.test/github", resumeUrl: "https://example.test/resume.pdf" } },
    { id: "projects", type: "PROJECTS", title: "Projects", isVisible: visible, content: { items: [{ ...project, screenshots: project.screenshots.map((shot) => ({ ...shot })), caseStudy: { ...project.caseStudy } },
      { id: "empty", title: "Simple project", description: "No written case study", isVisible: true, caseStudyEnabled: true },
      { id: "disabled", title: "Disabled study", description: "A regular project", isVisible: true, caseStudyEnabled: false, caseStudy: { problem: "Not published" } },
      { id: "hidden", title: "Hidden project", description: "Hidden", isVisible: false }] } },
    { id: "contact", type: "CONTACT_FORM", title: "Contact", isVisible: true, content: { emailTarget: "hello@example.test", buttonText: "Get in Touch" } },
  ] });
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR2kAAAAASUVORK5CYII=", "base64");
  test.beforeEach(async ({ page }) => {
    await page.route("https://example.test/screenshot.png", (route) => route.fulfill({ body: png, contentType: "image/png" }));
  });
  test.beforeAll(async () => {
    await pool.query('INSERT INTO "User" (id, email, username, name, "updatedAt") VALUES ($1, $2, $3, $4, NOW())', [owner, `${slug}@example.test`, slug, "Showcase Owner"]);
    await pool.query('INSERT INTO "Portfolio" (id, "userId", "publicSlug", content, "updatedAt") VALUES ($1, $1, $2, $3, NOW())', [owner, slug, content()]);
  });
  test.afterAll(async () => {
    await pool.query('DELETE FROM "User" WHERE id = $1', [owner]);
    await pool.end();
  });
  test("renders screenshots and case studies across layouts and records visitor clicks", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    await page.route("https://example.test/screenshot.png", (route) => route.fulfill({ body: png, contentType: "image/png" }));
    for (const layout of ["classic", "bento", "sidebar", "terminal"]) {
      await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(layout), owner]);
      await page.goto(`/p/${slug}`);
      await page.waitForLoadState("networkidle");
      if (layout === "sidebar") {
        await page.getByRole("button", { name: /Projects|Selected Work/i }).first().click();
      }
      if (layout === "terminal") {
        await page.locator("#term-input").fill("cat projects");
        await page.locator("#term-input").press("Enter");
      }
      await expect(page.getByRole("img", { name: "The reporting dashboard" })).toBeVisible();
      await expect(page.locator("[data-project-fallback]")).toHaveCount(2);
      const cover = page.locator("[data-project-cover]").first();
      const frame = await cover.boundingBox();
      expect(frame).not.toBeNull();
      expect(frame!.width / frame!.height).toBeCloseTo(4 / 3.4, 1);
      const edge = await cover.evaluate((element) => {
        const card = element.closest(".theme-card")!;
        const frame = element.getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        return { left: frame.left - rect.left, top: frame.top - rect.top };
      });
      expect(edge.left).toBeLessThanOrEqual(2);
      expect(edge.top).toBeLessThanOrEqual(2);
      await expect(page.getByRole("link", { name: "View case study" }).first()).toHaveAttribute("href", `/p/${slug}/projects/project-one`);
      await expect(page.getByRole("link", { name: "View case study" })).toHaveCount(3);
      await expect(page.getByLabel("Project details").first()).toContainText("2026");
      await expect(page.getByLabel("Project details").first()).toContainText("PostgreSQL");
      await expect(page.getByText("Hidden project", { exact: true })).toHaveCount(0);
    }
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(), owner]);
    await page.goto(`/p/${slug}`);
    await page.waitForLoadState("networkidle");
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("portfolio_action_session"))).not.toBeNull();
    const firstCard = page.locator('[data-project-card][data-project-id="project-one"]');
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toHaveCSS("opacity", "1");
    await firstCard.hover();
    const caseStudyLink = firstCard.getByRole("link", { name: "View case study" });
    await expect(caseStudyLink).toBeInViewport();
    await caseStudyLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole("heading", { level: 1, name: "Showcase dashboard" })).toBeVisible();
    // keepalive responses can outlive the old document during hard navigation;
    // verify the persisted result rather than observing that document's response.
    await expect.poll(async () => (await pool.query('SELECT COUNT(*)::int AS count FROM "PortfolioAction" WHERE "portfolioId" = $1 AND action = $2', [owner, "project_open"])).rows[0].count).toBe(1);
    await expect(page.getByRole('article').getByText("Reduced preparation time by 80%.")).toBeVisible();
    await expect(page.getByRole("img", { name: "The reporting dashboard" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.addEventListener("click", (event) => { if ((event.target as Element).closest("a[target='_blank']")) event.preventDefault(); }, true));
    for (const name of ["View live project", "View source code"]) {
      const recorded = page.waitForResponse((response) => response.url().endsWith("/api/engagement"));
      await page.getByRole("link", { name }).click();
      expect((await recorded).status()).toBe(200);
    }
    await page.goto(`/p/${slug}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.addEventListener("click", (event) => { if ((event.target as Element).closest("a")) event.preventDefault(); }, true));
    for (const locator of [page.getByRole("link", { name: "View resume" }), page.locator('a[href="https://example.test/github"]'), page.getByRole("link", { name: "Get in Touch" })]) {
      if ((await locator.textContent())?.trim() === "Get in Touch") {
        await page.mouse.wheel(0, 1900);
        await expect(locator).toBeInViewport();
      }
      const recorded = page.waitForResponse((response) => response.url().endsWith("/api/engagement"));
      await locator.click();
      expect((await recorded).status()).toBe(200);
    }
    const counts = await pool.query('SELECT action, COUNT(*)::int AS count FROM "PortfolioAction" WHERE "portfolioId" = $1 GROUP BY action', [owner]);
    expect(Object.fromEntries(counts.rows.map((row) => [row.action, row.count]))).toEqual({ project_open: 1, project_live: 1, project_source: 1, social: 1, resume: 1, contact: 1 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/p/${slug}/projects/project-one`);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("case-study-mobile.png"), fullPage: true });
    expect(errors).toEqual([]);
  });
  test("deduplicates retried event IDs and rejects unknown or hidden projects", async ({ request }) => {
    const event = { id: crypto.randomUUID(), slug, action: "project_live", projectId: "project-one", visitorSessionId: crypto.randomUUID() };
    for (let i = 0; i < 2; i++) expect((await request.post("/api/engagement", { data: event })).status()).toBe(200);
    expect((await pool.query('SELECT COUNT(*)::int AS count FROM "PortfolioAction" WHERE id = $1', [event.id])).rows[0].count).toBe(1);
    expect((await request.post("/api/engagement", { data: { ...event, projectId: "hidden" } })).status()).toBe(400);
    // Next.js streaming not-found responses can use HTTP 200; verify the
    // not-found boundary and that protected project content is never rendered.
    const hidden = await request.get(`/p/${slug}/projects/hidden`);
    expect(await hidden.text()).toContain("NEXT_HTTP_ERROR_FALLBACK;404");
    for (const projectId of ["empty", "disabled"]) {
      const unavailable = await request.get(`/p/${slug}/projects/${projectId}`);
      expect(unavailable.status()).toBe(200);
      expect(await unavailable.text()).toContain("Case study has not been published or updated yet");
      expect((await request.post("/api/engagement", { data: { ...event, id: crypto.randomUUID(), action: "project_open", projectId } })).status()).toBe(400);
    }
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content("classic", false), owner]);
    const hiddenSection = await request.get(`/p/${slug}/projects/project-one`);
    expect(await hiddenSection.text()).toContain("NEXT_HTTP_ERROR_FALLBACK;404");
    expect((await request.post("/api/engagement", { data: { ...event, id: crypto.randomUUID() } })).status()).toBe(400);
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(), owner]);
  });
  test("shows action totals in owner analytics, filters dates, and excludes self-clicks", async ({ page, context }, testInfo) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    const cookieName = process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token";
    const token = await encode({ token: { sub: owner, id: owner, name: "Showcase Owner", email: `${slug}@example.test`, username: slug }, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "playwright-test-secret", salt: cookieName });
    await context.addCookies([{ name: cookieName, value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax", secure: process.env.NODE_ENV === "production" }]);
    await pool.query('INSERT INTO "PortfolioAction" (id, "portfolioId", action, "visitorHash", "createdAt") VALUES ($1, $2, $3, $4, NOW() - INTERVAL \'40 days\')', [crypto.randomUUID(), owner, "resume", "historical-fixture"]);
    await page.goto("/dashboard/analytics");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("action-project_open")).toHaveText("1");
    await expect(page.getByTestId("action-project_live")).toHaveText("2");
    await expect(page.getByTestId("action-resume")).toHaveText("1");
    await expect(page.getByText("Showcase dashboard", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "All Time", exact: true }).click();
    await expect(page.getByTestId("action-resume")).toHaveText("2");
    await page.screenshot({ path: testInfo.outputPath("analytics.png"), fullPage: true });
    const self = await page.request.post("/api/engagement", { data: { id: crypto.randomUUID(), slug, action: "project_live", projectId: "project-one", visitorSessionId: crypto.randomUUID() } });
    expect(self.status()).toBe(200);
    expect((await pool.query('SELECT COUNT(*)::int AS count FROM "PortfolioAction" WHERE "portfolioId" = $1 AND action = $2', [owner, "project_live"])).rows[0].count).toBe(2);
    await page.goto("/dashboard/edit");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("switch", { name: "Enable case study" }).first()).toBeChecked();
    await expect(page.getByRole("textbox", { name: "The problem", exact: true })).toHaveCount(0);
    await page.getByText("Edit case study", { exact: true }).first().click();
    await page.locator("summary").filter({ hasText: /^The problem/ }).first().click();
    await expect(page.getByRole("textbox", { name: "The problem", exact: true })).toHaveValue("Reports took hours to prepare.");
    await page.locator("summary").filter({ hasText: /^Screenshots$/ }).first().click();
    await page.locator("summary").filter({ hasText: /^Image 1/ }).first().click();
    await expect(page.getByRole("textbox", { name: "Screenshot 1 caption", exact: true })).toHaveValue("The reporting dashboard");
    await page.locator("summary").filter({ hasText: /^Results and impact/ }).first().click();
    await page.getByRole("textbox", { name: "Results and impact", exact: true }).fill("A newly verified project result.");
    await page.getByRole("textbox", { name: "New screenshot URL", exact: true }).first().fill("https://example.test/screenshot.png");
    await page.getByRole("button", { name: "Add screenshot", exact: true }).first().click();
    await page.locator("summary").filter({ hasText: /^Image 2/ }).first().click();
    await expect(page.getByRole("textbox", { name: "Screenshot 2 URL", exact: true })).toHaveValue("https://example.test/screenshot.png");
    await page.route("**/api/project-images", (route) => route.fulfill({ status: 201, json: { url: "https://example.test/screenshot.png" } }));
    await page.getByLabel("Upload screenshot", { exact: true }).first().setInputFiles({ name: "dashboard.png", mimeType: "image/png", buffer: png });
    await page.locator("summary").filter({ hasText: /^Image 3/ }).first().click();
    await expect(page.getByRole("textbox", { name: "Screenshot 3 URL", exact: true })).toHaveValue("https://example.test/screenshot.png");
    const published = page.waitForResponse((response) => response.url().endsWith("/api/portfolios") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Publish Changes", exact: true }).click();
    expect((await published).status()).toBe(200);
    const saved = (await pool.query('SELECT content FROM "Portfolio" WHERE id = $1', [owner])).rows[0].content;
    const savedProject = saved.sections.find((section: { type: string }) => section.type === "PROJECTS").content.items[0];
    expect(savedProject.screenshots).toHaveLength(3);
    expect(savedProject.caseStudy.results).toBe("A newly verified project result.");
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole("button", { name: "Remove image", exact: true }).last().click();
    await expect(page.getByRole("textbox", { name: "Screenshot 3 URL", exact: true })).toHaveCount(0);
    await page.getByRole("switch", { name: "Enable case study" }).first().uncheck();
    const disabled = page.waitForResponse((response) => response.url().endsWith("/api/portfolios") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Publish Changes", exact: true }).click();
    expect((await disabled).status()).toBe(200);
    const current = (await pool.query('SELECT content FROM "Portfolio" WHERE id = $1', [owner])).rows[0].content.sections.find((section: { type: string }) => section.type === "PROJECTS").content.items[0];
    expect(current.caseStudyEnabled).toBe(false);
    expect(current.screenshots).toHaveLength(2);
    expect(current.caseStudy.results).toBe("A newly verified project result.");
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole("switch", { name: "Enable case study" }).first().check();
    const enabled = page.waitForResponse((response) => response.url().endsWith("/api/portfolios") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Publish Changes", exact: true }).click();
    expect((await enabled).status()).toBe(200);
    await expect(page.getByText("Page Error Detected")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
  test("honors Do Not Track", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true }));
    let actionRequests = 0;
    page.on("request", (request) => { if (request.url().endsWith("/api/engagement")) actionRequests++; });
    await page.goto(`/p/${slug}/projects/project-one`);
    await page.evaluate(() => document.addEventListener("click", (event) => event.preventDefault(), true));
    await page.getByRole("link", { name: "View source code" }).click();
    await page.waitForTimeout(200);
    expect(actionRequests).toBe(0);
  });
  test("contains portrait app screenshots without cropping and keeps cards edge-to-edge", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    const portrait = content();
    const longDescription = "A long project description with useful context. ".repeat(50);
    portrait.sections[1].content.items![0].description = longDescription;
    const portraitProject = portrait.sections[1].content.items![0] as typeof project & { isMobile?: boolean };
    portraitProject.isMobile = true;
    portraitProject.screenshots = [{ url: "https://example.test/mobile.png", caption: "Mobile application" }];
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [portrait, owner]);
    await page.route("https://example.test/mobile.png", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844"><rect width="390" height="844" rx="32" fill="#202031"/><text x="28" y="76" fill="white" font-family="sans-serif" font-size="30">My mobile app</text><rect x="24" y="120" width="342" height="200" rx="16" fill="#7c3aed"/><rect x="24" y="350" width="342" height="420" rx="16" fill="#34344a"/><text x="30" y="820" fill="white" font-size="20">Bottom navigation</text></svg>' }));
    await page.goto(`/p/${slug}`);
    await page.waitForLoadState("networkidle");
    const img = page.getByRole("img", { name: "Mobile application" });
    const card = page.locator('[data-project-card][data-project-id="project-one"]');
    await card.scrollIntoViewIfNeeded();
    await expect(img).toBeInViewport();
    await expect(card).toHaveCSS("opacity", "1");
    await card.hover();
    await expect(img).toHaveCSS("object-fit", "cover");
    const description = page.getByText(longDescription, { exact: true });
    await expect(description).toBeInViewport();
    await expect(description).toHaveCSS("-webkit-line-clamp", "3");
    expect(await description.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await img.evaluate((element) => (element as HTMLImageElement).naturalHeight > (element as HTMLImageElement).naturalWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("portrait-cover.png"), fullPage: true });
    await page.goto(`/p/${slug}/projects`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(longDescription, { exact: true })).toHaveCSS("-webkit-line-clamp", "3");
    await page.goto(`/p/${slug}/projects/project-one`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(longDescription, { exact: true })).not.toHaveCSS("-webkit-line-clamp", "3");
    await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
  test("keeps controls readable on light, dark and mixed photos and aligns fallback covers", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(), owner]);
    let background = "#fff";
    await page.route("https://example.test/screenshot.png", (route) => route.fulfill({ contentType: "image/svg+xml", body: `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="${background}"/><path d="M0 1000L1600 0V1000Z" fill="${background === "mixed" ? "#111" : background}"/></svg>`.replace('fill="mixed"', 'fill="#fff"') }));
    for (const tone of ["#fff", "#111", "mixed"]) {
      background = tone;
      await page.goto(`/p/${slug}`);
      await page.waitForLoadState("networkidle");
      const link = page.getByRole("link", { name: "View Showcase dashboard live project" });
      await page.mouse.wheel(0, 800);
      await expect(link).toBeInViewport();
      await expect(page.locator('[data-project-card][data-project-id="project-one"]')).toHaveCSS("opacity", "1");
      await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(page.getByLabel("Project 1", { exact: true })).toHaveCSS("color", "rgb(255, 255, 255)");
      const sizes = await page.getByRole("heading", { name: "Showcase dashboard", exact: true }).evaluate((heading) => {
        const photoCard = heading.closest(".theme-card")!;
        const textCard = photoCard.nextElementSibling!;
        return {
          photo: photoCard.querySelector("[data-project-cover]")!.getBoundingClientRect().height,
          fallback: textCard.querySelector("[data-project-fallback]")!.getBoundingClientRect().height,
          photoPanelBottom: photoCard.querySelector("[data-project-content]")!.getBoundingClientRect().bottom,
          fallbackPanelBottom: textCard.querySelector("[data-project-content]")!.getBoundingClientRect().bottom,
          photoCardHeight: photoCard.getBoundingClientRect().height,
          fallbackCardHeight: textCard.getBoundingClientRect().height,
        };
      });
      expect(sizes.fallback).toBeCloseTo(sizes.photo, 0);
      expect(sizes.fallbackPanelBottom).toBeCloseTo(sizes.photoPanelBottom, 0);
      expect(sizes.fallbackCardHeight).toBeCloseTo(sizes.photoCardHeight, 0);
      await page.screenshot({ path: testInfo.outputPath(`cover-${tone === "#fff" ? "light" : tone === "#111" ? "dark" : "mixed"}.png`), fullPage: true });
    }
    await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
  test("uses identical card hierarchy, alignment and controls on the main page and archive", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    const fixture = content();
    Object.assign(fixture.sections[1].content.items![1], { link: "https://example.test/second-live" });
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [fixture, owner]);
    const readCards = () => page.locator("[data-project-card]").evaluateAll((cards) => cards.slice(0, 2).map((card) => {
      const body = card.querySelector<HTMLElement>("[data-project-content]")!;
      const heading = body.querySelector<HTMLElement>("h2,h3")!;
      const paragraph = body.querySelector("p")!;
      const control = card.querySelector<HTMLAnchorElement>("a[target='_blank']")!;
      const num = card.querySelector<HTMLElement>('[aria-label^="Project "]')!;
      const cover = card.querySelector<HTMLElement>("[data-project-cover]")!;
      return {
        bodyPadding: getComputedStyle(body).paddingLeft,
        bodyGap: getComputedStyle(body).gap,
        titleFont: getComputedStyle(heading).fontSize,
        titleWeight: getComputedStyle(heading).fontWeight,
        titleLineHeight: getComputedStyle(heading).lineHeight,
        descriptionFont: getComputedStyle(paragraph).fontSize,
        descriptionClamp: getComputedStyle(paragraph).webkitLineClamp,
        controlWidth: getComputedStyle(control).width,
        controlHeight: getComputedStyle(control).height,
        controlRadius: getComputedStyle(control).borderRadius,
        numberRadius: getComputedStyle(num).borderRadius,
        coverRatio: Math.round(100 * cover.getBoundingClientRect().width / cover.getBoundingClientRect().height) / 100,
        panelBottomInset: Math.round(cover.getBoundingClientRect().bottom - body.getBoundingClientRect().bottom),
        aligned: Math.abs(body.getBoundingClientRect().left - num.getBoundingClientRect().left) < 4,
      };
    }));
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/p/${slug}`);
      await page.waitForLoadState("networkidle");
      await page.mouse.wheel(0, 800);
      await expect(page.locator('[data-project-card][data-project-id="project-one"]')).toHaveCSS("opacity", "1");
      const main = await readCards();
      expect(main[0]).toEqual(main[1]);
      expect(main.every((card) => card.aligned)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`shared-main-${width}.png`), fullPage: true });
      await page.goto(`/p/${slug}/projects`);
      await page.waitForLoadState("networkidle");
      expect(await readCards()).toEqual(main);
      await page.screenshot({ path: testInfo.outputPath(`shared-archive-${width}.png`), fullPage: true });
      await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
  test("replaces an unreadable screenshot with the same decorative fallback", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
    await pool.query('UPDATE "Portfolio" SET content = $1 WHERE id = $2', [content(), owner]);
    await page.route("https://example.test/screenshot.png", (route) => route.fulfill({ contentType: "image/png", body: "unreadable image" }));
    for (const path of [`/p/${slug}`, `/p/${slug}/projects`]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.mouse.wheel(0, 800);
      await expect(page.locator('[data-project-card][data-project-id="project-one"] [data-project-fallback]')).toHaveCount(1);
      await expect(page.locator("[data-project-fallback]")).toHaveCount(3);
      await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
  test("uses upload previews on cards and preserves originals in the case-study gallery", async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
    const fixture = content();
    const firstProject = fixture.sections[1].content.items![0] as typeof project;
    Object.assign(firstProject.screenshots[0], { thumbnailUrl: 'https://example.test/preview.webp' });
    await pool.query('UPDATE "Portfolio" SET content=$1 WHERE id=$2', [fixture, owner]);
    await page.route('https://example.test/preview.webp', (route) => route.fulfill({ contentType: 'image/png', body: png }));
    for (const path of [`/p/${slug}`, `/p/${slug}/projects`]) {
      await page.goto(path); await page.waitForLoadState('networkidle');
      await expect(page.getByRole('img', { name: 'The reporting dashboard' })).toHaveAttribute('src', 'https://example.test/preview.webp');
    }
    await page.goto(`/p/${slug}/projects/project-one`); await page.waitForLoadState('networkidle');
    await expect(page.getByRole('img', { name: 'The reporting dashboard' })).toHaveAttribute('src', 'https://example.test/screenshot.png');
    expect(errors).toEqual([]);
  });
});
