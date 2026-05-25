import { test, expect } from '@playwright/test';

test('core sections and key content render', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Residency/);
  await expect(page.locator('#overview')).toBeVisible();

  // calendar is JS-generated
  expect(await page.locator('#cal-body > *').count()).toBeGreaterThan(0);

  // food directory — locked so the Task 4 refactor can't silently drop content
  const food = page.locator('#food-grid .dir-item');
  expect(await food.count()).toBeGreaterThanOrEqual(20);
  const grid = page.locator('#food-grid');
  await expect(grid.getByText('Lunchbox Deli')).toBeVisible();
  await expect(grid.getByText('Lawrence Barbecue')).toBeVisible();
  await expect(grid.getByText('Two Roosters Ice Cream')).toBeVisible();

  await expect(page.locator('#outdoor-grid .dir-item').first()).toBeVisible();
});
