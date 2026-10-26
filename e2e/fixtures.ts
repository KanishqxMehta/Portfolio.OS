import { test as base } from '@playwright/test';
export { expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, runPage) => {
    // Hosting-only scripts do not exist on a local production test server.
    await page.route('**/_vercel/**/script.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await runPage(page);
  },
});
