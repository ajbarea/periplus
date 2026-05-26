import { test, expect } from '@playwright/test';

test('core sections and key content render', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Residency/);
  await expect(page.locator('#overview')).toBeVisible();

  // calendar is JS-generated from TRIP.calendar — lock both views so a refactor can't silently drop it
  await expect(page.locator('#cal-months .cal-month').first()).toBeVisible();
  const calEvents = await page.evaluate(() => window.TRIP.calendar.events.length);
  await expect(page.locator('#cal-agenda .cal-ag')).toHaveCount(calEvents);

  // food directory — locked so refactors can't silently drop content
  const food = page.locator('#food-grid .dir-item');
  expect(await food.count()).toBeGreaterThanOrEqual(20);
  const grid = page.locator('#food-grid');
  await expect(grid.getByText('Lunchbox Deli')).toBeVisible();
  await expect(grid.getByText('Lawrence Barbecue')).toBeVisible();
  await expect(grid.getByText('Two Roosters Ice Cream')).toBeVisible();

  await expect(page.locator('#outdoor-grid .dir-item').first()).toBeVisible();
});

test('config-driven sections render from TRIP', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveText('North Carolina Summer Residency');
  expect(await page.locator('#kv-grid .kv').count()).toBe(4);
  expect(await page.locator('#intel-grid .intel-card').count()).toBe(6);
  expect(await page.locator('#anchors-grid .card').count()).toBe(2);
  expect(await page.locator('#weeks-list .week-card').count()).toBe(8);
  expect(await page.locator('#contacts-grid .contact').count()).toBe(7);
  expect(await page.locator('#arrival-timeline .row').count()).toBe(6);
  expect(await page.locator('#dayone-timeline .row').count()).toBe(14);
  await expect(page.locator('#intel-grid').getByText('July heat')).toBeVisible();
  await expect(page.locator('#weeks-list').getByText('Settle in')).toBeVisible();
  await expect(page.locator('#contacts-grid').getByText('Emily Keller (LAS host)')).toBeVisible();
});
