import { test, expect } from '@playwright/test';

test('manifest and apple-touch-icon are linked', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

test('icons and manifest are reachable', async ({ request }) => {
  for (const p of ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']) {
    const res = await request.get(p);
    expect(res.status(), p).toBe(200);
  }
});
