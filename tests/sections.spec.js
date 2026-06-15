import { test, expect } from '@playwright/test';

// Manage Sections: reorder / show-hide whole sections in edit mode.
// Buttons-first, persisted on-device, round-tripped in export.

const mainOrder = (page) =>
  page.evaluate(() => [...document.querySelectorAll('main > section')].map(s => s.id).filter(Boolean));
const tocOrder = (page) =>
  page.evaluate(() => [...document.querySelectorAll('.toc-inner a')].map(a => a.getAttribute('href').slice(1)));

async function openManage(page) {
  await page.goto('/');
  await page.locator('#edit-toggle').click();      // enter edit mode
  await page.locator('#edit-sections').click();    // open the sheet
  await expect(page.locator('#sections-modal')).toBeVisible();
}

test('manage sheet lists every reorderable section', async ({ page }) => {
  await openManage(page);
  await expect(page.locator('#sections-list .sec-row')).toHaveCount(12);
  // default order matches the TOC / main order
  expect(await mainOrder(page)).toEqual(await tocOrder(page));
});

test('moving a section up reorders <main> and the TOC together, and persists', async ({ page }) => {
  await page.goto('/');
  const before = await mainOrder(page);     // [intel, calendar, arrival, ...]
  const target = before[1];                 // calendar
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-sections').click();
  await page.locator(`.sec-row[data-id="${target}"] [data-sact="up"]`).click();

  const after = await mainOrder(page);
  expect(after[0]).toBe(target);
  expect(after[1]).toBe(before[0]);
  expect((await tocOrder(page))[0]).toBe(target);   // nav mirrors content

  await page.reload();                              // persists on-device
  expect((await mainOrder(page))[0]).toBe(target);
});

test('hiding a section removes it and its nav link, and persists', async ({ page }) => {
  await openManage(page);
  await page.locator('.sec-row[data-id="calendar"] [data-sact="toggle"]').click();

  await expect(page.locator('section#calendar')).toBeHidden();
  await expect(page.locator('.toc-inner a[href="#calendar"]')).toBeHidden();
  await expect(page.locator('.sec-row[data-id="calendar"] [data-sact="toggle"]')).toHaveText('Show');

  await page.reload();
  await expect(page.locator('section#calendar')).toBeHidden();
});

test('a hidden section can be shown again', async ({ page }) => {
  await openManage(page);
  const toggle = page.locator('.sec-row[data-id="food"] [data-sact="toggle"]');
  await toggle.click();                              // hide
  await expect(page.locator('section#food')).toBeHidden();
  await toggle.click();                              // show
  await expect(page.locator('section#food')).toBeVisible();
});

test('the section layout round-trips in the JSON export', async ({ page }) => {
  await openManage(page);
  await page.locator('.sec-row[data-id="calendar"] [data-sact="toggle"]').click();   // hide calendar
  await page.locator('#sections-close').click();
  await page.locator('#edit-export').click();

  const trip = JSON.parse(await page.locator('#edit-json').inputValue());
  expect(Array.isArray(trip.layout.order)).toBe(true);
  expect(trip.layout.order).toHaveLength(12);
  expect(trip.layout.hidden).toContain('calendar');
});
