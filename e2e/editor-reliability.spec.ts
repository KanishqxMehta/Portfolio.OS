import { test, expect } from './fixtures';
import { encode } from 'next-auth/jwt';
import { Pool } from 'pg';

test('cursor settles when idle and yields to native/reduced-motion interaction', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  await page.goto('/'); await page.waitForLoadState('networkidle');
  const cursor = page.locator('.smooth-cursor');
  await page.mouse.move(400, 300);
  await expect(page.locator('html')).toHaveClass(/custom-cursor-active/);
  await page.mouse.move(600, 350);
  await expect(cursor).toHaveAttribute('data-animating', 'false');
  expect(await cursor.evaluate(async (element) => {
    let changes = 0;
    const observer = new MutationObserver(() => changes++);
    observer.observe(element, { attributes: true });
    await new Promise((resolve) => setTimeout(resolve, 250));
    observer.disconnect(); return changes;
  })).toBe(0);
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).not.toHaveClass(/custom-cursor-active/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(700, 400);
  await page.mouse.click(700, 400);
  await expect(page.locator('html')).not.toHaveClass(/custom-cursor-active/);
  await expect(page.locator('.cs-particle')).toHaveCount(0);
  await expect(cursor).toHaveCSS('display', 'none');
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe('touch cursor fallback', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('keeps the native pointer behavior on touch devices', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
    await page.goto('/'); await page.waitForLoadState('networkidle');
    await page.touchscreen.tap(180, 400);
    await expect(page.locator('html')).not.toHaveClass(/custom-cursor-active/);
    await expect(page.locator('.smooth-cursor')).toHaveCSS('display', 'none');
    await expect(page.locator('.cs-particle')).toHaveCount(0);
    await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe('recoverable private editor drafts', () => {
  test.skip(!process.env.DATABASE_URL?.endsWith('/portfolio_verification'), 'Requires the disposable test database');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const owner = crypto.randomUUID();
  const slug = `d-${Date.now()}`;
  const content = { theme: 'classic', layout: 'classic', sections: [{ id: 'hero', type: 'HERO', title: 'Hero', isVisible: true, content: { fullName: 'Published Name', bio: 'Original bio' } }] };
  test.beforeAll(async () => {
    await pool.query('INSERT INTO "User" (id,email,username,"updatedAt") VALUES ($1,$2,$3,NOW())', [owner, `${slug}@example.test`, slug]);
    await pool.query('INSERT INTO "Portfolio" (id,"userId","publicSlug",content,"updatedAt") VALUES ($1,$1,$2,$3,NOW())', [owner, slug, content]);
  });
  test.afterAll(async () => { await pool.query('DELETE FROM "User" WHERE id=$1', [owner]); await pool.end(); });
  test('initial recovery outage keeps edits and retries without a reload or error overlay', async ({ page, context }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type()) && !message.text().includes('503')) errors.push(message.text()); });
    const secure = process.env.NODE_ENV === 'production';
    const name = secure ? '__Secure-authjs.session-token' : 'authjs.session-token';
    const token = await encode({ token: { sub: owner, id: owner, email: `${slug}@example.test`, username: slug }, secret: process.env.AUTH_SECRET || 'playwright-test-secret', salt: name });
    await context.addCookies([{ name, value: token, domain: new URL(process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000').hostname, path: '/', secure, httpOnly: true, sameSite: 'Lax' }]);
    await page.route('**/api/portfolio-draft', (route) => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
    await page.goto('/dashboard/edit');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Retry draft save' })).toBeVisible();
    await page.getByPlaceholder('Enter your full name').fill('Edit during recovery outage');
    await expect.poll(() => page.evaluate((id) => JSON.parse(localStorage.getItem(`portfolio-draft:v1:${id}`) || 'null')?.snapshot.sections[0].content.fullName, owner)).toBe('Edit during recovery outage');
    page.on('dialog', (dialog) => dialog.accept());
    await page.reload(); await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('Edit during recovery outage');
    await page.getByRole('button', { name: 'Publish Changes', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry draft save' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish Changes', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry draft save' })).toBeVisible();
    await expect(page.getByText('Draft sync failed. A recovery copy is kept on this device when browser storage is available. Retry when online.', { exact: true })).toHaveCount(2); // One inline status and one toast, not one toast per click.
    await page.unroute('**/api/portfolio-draft');
    await page.getByRole('button', { name: 'Retry draft save' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('Edit during recovery outage');
    await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);
    expect(errors).toEqual([]);
    // Restore this test's private baseline for the independent publish workflow.
    await pool.query('DELETE FROM "PortfolioDraft" WHERE "userId"=$1', [owner]);
  });
  test('autosaves privately, recovers on reload, detects a stale tab, and publishes explicitly', async ({ page, context }, testInfo) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
    const secure = process.env.NODE_ENV === 'production';
    const name = secure ? '__Secure-authjs.session-token' : 'authjs.session-token';
    const token = await encode({ token: { sub: owner, id: owner, email: `${slug}@example.test`, username: slug, name: 'Draft Owner' }, secret: process.env.AUTH_SECRET || 'playwright-test-secret', salt: name });
    await context.addCookies([{ name, value: token, domain: new URL(process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000').hostname, path: '/', secure, httpOnly: true, sameSite: 'Lax' }]);
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/dashboard/edit');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await page.getByPlaceholder('Enter your full name').fill('My Private Draft');
    await page.getByPlaceholder('Enter your full name').hover();
    await expect(page.getByPlaceholder('Enter your full name')).not.toHaveCSS('cursor', 'none');
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await expect.poll(async () => (await pool.query('SELECT snapshot FROM "PortfolioDraft" WHERE "userId"=$1', [owner])).rows[0]?.snapshot.sections[0].content.fullName).toBe('My Private Draft');
    expect((await pool.query('SELECT content FROM "Portfolio" WHERE id=$1', [owner])).rows[0].content.sections[0].content.fullName).toBe('Published Name');
    await page.reload(); await page.waitForLoadState('networkidle');
    await expect(page.getByRole('status').filter({ hasText: 'Draft recovered' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('My Private Draft');
    await expect(page.getByRole('button', { name: 'Publish Changes', exact: true })).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath('recovered-private-draft.png'), fullPage: true });
    // An independent writer saves first; this tab must not overwrite it.
    await pool.query('UPDATE "PortfolioDraft" SET revision=revision+1 WHERE "userId"=$1', [owner]);
    await page.getByPlaceholder('Enter your full name').fill('Stale tab edit');
    await expect(page.getByRole('status').filter({ hasText: 'another tab' })).toBeVisible();
    expect((await pool.query('SELECT snapshot FROM "PortfolioDraft" WHERE "userId"=$1', [owner])).rows[0].snapshot.sections[0].content.fullName).toBe('My Private Draft');
    await page.getByRole('button', { name: 'Reload latest draft' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('status').filter({ hasText: 'Draft recovered' })).toBeVisible();
    const response = page.waitForResponse((result) => result.url().endsWith('/api/portfolios') && result.request().method() === 'POST');
    await page.getByRole('button', { name: 'Publish Changes', exact: true }).click();
    expect((await response).status()).toBe(200);
    expect((await pool.query('SELECT content FROM "Portfolio" WHERE id=$1', [owner])).rows[0].content.sections[0].content.fullName).toBe('My Private Draft');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.route('**/api/portfolio-draft', (route) => route.request().method() === 'PUT' ? route.fulfill({ status: 503, json: { error: 'Draft sync temporarily unavailable.' } }) : route.fallback());
    await page.getByPlaceholder('Enter your full name').fill('Recovered offline edit');
    await expect(page.getByRole('status').filter({ hasText: 'temporarily unavailable' })).toBeVisible();
    await page.reload(); await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('Recovered offline edit');
    await expect(page.getByRole('status').filter({ hasText: 'temporarily unavailable' })).toBeVisible();
    await page.unroute('**/api/portfolio-draft');
    await page.getByRole('button', { name: 'Retry draft save' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    expect((await pool.query('SELECT content FROM "Portfolio" WHERE id=$1', [owner])).rows[0].content.sections[0].content.fullName).toBe('My Private Draft');
    await page.getByPlaceholder('Enter your full name').fill('Discard this private draft');
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await page.getByRole('button', { name: 'Discard', exact: true }).click();
    await page.getByRole('button', { name: 'Yes, Discard', exact: true }).click();
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('My Private Draft');
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.reload(); await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Enter your full name')).toHaveValue('My Private Draft');
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved privately' })).toBeVisible();
    await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);
    // Deliberate stale-write and outage fixtures produce expected HTTP errors only.
    expect(errors.filter((error) => !error.includes('409') && !error.includes('503'))).toEqual([]);
  });
});
