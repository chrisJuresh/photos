import { expect, test } from '@playwright/test';

test('the independent shell supports keyboard navigation without captured artifacts', async ({ page }) => {
  const policyViolations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
      policyViolations.push(message.text());
    }
  });
  const response = await page.goto('/');
  const policy = await response?.headerValue('content-security-policy');
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("'sha256-");
  expect(policy).not.toContain("'unsafe-inline'");
  await expect(page.getByRole('heading', { name: 'Your media, prepared for careful review.' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Local service ready');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Settings', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/settings\/$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
  const theme = page.getByLabel('Theme');
  await expect(theme).toBeEnabled();
  await theme.selectOption('dark');
  await expect(page.getByRole('status').last()).toContainText('Appearance saved.');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  expect(policyViolations).toEqual([]);
});
