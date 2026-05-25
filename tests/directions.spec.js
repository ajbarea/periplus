import { test, expect } from '@playwright/test';

test('food cards render from the array with a Directions link (Google by default)', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#food-grid .dir-item a.dir-go');
  expect(await links.count()).toBeGreaterThanOrEqual(20);
  await expect(links.first()).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
});

test('rendered card count equals the data array length', async ({ page }) => {
  await page.goto('/');
  const counts = await page.evaluate(() => ({
    food: { dom: document.querySelectorAll('#food-grid .dir-item').length, data: window.TRIP.food.length },
    outdoor: { dom: document.querySelectorAll('#outdoor-grid .dir-item').length, data: window.TRIP.outdoor.length },
  }));
  expect(counts.food.dom).toBe(counts.food.data);
  expect(counts.outdoor.dom).toBe(counts.outdoor.data);
});

test('maps provider toggle switches links to Apple and persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#maps-apple').check();
  await expect(page.locator('#food-grid .dir-item a.dir-go').first()).toHaveAttribute('href', /^https:\/\/maps\.apple\.com\/\?daddr=/);
  await page.reload();
  await expect(page.locator('#food-grid .dir-item a.dir-go').first()).toHaveAttribute('href', /^https:\/\/maps\.apple\.com\/\?daddr=/);
});

test('search still filters rendered cards', async ({ page }) => {
  await page.goto('/');
  await page.fill('#food-search', 'lawrence');
  await expect(page.locator('#food-grid').getByText('Lawrence Barbecue')).toBeVisible();
  await expect(page.locator('#food-grid').getByText('Lunchbox Deli')).toBeHidden();
});
