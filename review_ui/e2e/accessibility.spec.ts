import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('shell routes have no automatically detectable accessibility violations @a11y', async ({ page }) => {
  for (const route of ['/', '/imports/', '/library/', '/organize/', '/junk/', '/bulk-reject/', '/settings/']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `${route}: ${results.violations.map((item) => item.id).join(', ')}`).toEqual([]);
  }
});
