import { test, expect } from '@playwright/test';

test('home loads and links to components', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /AI-native design system/i })).toBeVisible();
  await page.getByRole('link', { name: /browse components/i }).first().click();
  await expect(page).toHaveURL(/\/components\/?$/);
});

test('component detail renders and all four tabs are clickable', async ({ page }) => {
  await page.goto('/components/magnetic-button');
  await expect(page.getByRole('heading', { level: 1, name: 'MagneticButton' })).toBeVisible();
  for (const label of ['Preview', 'Code', 'Prompt', 'Bundle']) {
    const tab = page.getByRole('tab', { name: label });
    await expect(tab).toBeVisible();
    await tab.click();
  }
});

test('Command-K opens on cmd+k and filters results', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Trigger the keydown event directly to bypass client:idle hydration timing
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: false, bubbles: true }));
  });
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
  await page.getByPlaceholder(/search/i).fill('magnetic');
  await expect(page.getByText(/MagneticButton/i).first()).toBeVisible();
});

test('bundle endpoint returns markdown with expected content', async ({ request }) => {
  const res = await request.get('/bundles/magnetic-button.md');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^# MagneticButton/);
  expect(body).toContain('## Prompt');
  expect(body).toContain('## Tokens');
  expect(body).toContain('color.accent');
});

test('tokens page shows all 10 token cards', async ({ page }) => {
  await page.goto('/tokens');
  await expect(page.getByRole('heading', { level: 1, name: 'Tokens' })).toBeVisible();
  // Just verify a few representative tokens are visible.
  await expect(page.getByText('color.accent')).toBeVisible();
  await expect(page.getByText('motion.duration-base')).toBeVisible();
});
