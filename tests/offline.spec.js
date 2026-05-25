import { test, expect } from '@playwright/test';

test('app works offline after first online load', async ({ page, context }) => {
  await page.goto('/');
  // wait until the service worker controls this page (skipWaiting + clients.claim)
  await page.waitForFunction(
    () => navigator.serviceWorker && navigator.serviceWorker.controller !== null,
    null,
    { timeout: 15000 }
  );

  await context.setOffline(true);
  await page.reload();

  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#food-grid .dir-item').first()).toBeVisible();

  await context.setOffline(false);
});
