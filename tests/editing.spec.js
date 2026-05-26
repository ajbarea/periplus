import { test, expect } from '@playwright/test';

// No-code editing: edit-mode toggle, inline field editing, localStorage
// persistence, export, and reset. Mirrors the TRIP data model — every
// [data-edit] path maps to a field so a fork can edit without code.

test('edit mode exposes the editable surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#edit-toggle')).toHaveText('Edit');
  await page.locator('#edit-toggle').click();
  await expect(page.locator('body')).toHaveClass(/editing/);
  await expect(page.locator('#edit-bar')).toBeVisible();
  await expect(page.locator('#hero-title')).toHaveAttribute('contenteditable', 'true');
  // the whole itinerary is wired, not just a few fields
  expect(await page.locator('[data-edit]').count()).toBeGreaterThan(100);
});

test('edits persist across reload, reset restores the default', async ({ page }) => {
  await page.goto('/');
  const original = (await page.locator('#hero-title').innerText()).trim();
  await page.locator('#edit-toggle').click();
  await page.evaluate(() => {
    const t = document.getElementById('hero-title');
    t.innerHTML = 'Trip Edited';
    t.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
  expect(await page.evaluate(() => localStorage.getItem('periplus.edits.v1'))).toContain('Trip Edited');

  await page.reload();
  await expect(page.locator('#hero-title')).toHaveText('Trip Edited');

  page.on('dialog', (d) => d.accept());
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-reset').click();
  await expect(page.locator('#hero-title')).toHaveText(original);
  expect(await page.evaluate(() => localStorage.getItem('periplus.edits.v1'))).toBe('{}');
});

test('export reflects the current edits', async ({ page }) => {
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  await page.evaluate(() => {
    const n = document.querySelector('[data-edit="food.0.note"]');
    n.innerHTML = 'EXPORT-CHECK';
    n.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
  await page.locator('#edit-export').click();
  await expect(page.locator('#edit-json')).toBeVisible();
  expect(await page.locator('#edit-json').inputValue()).toContain('EXPORT-CHECK');
});

test('editing a heading inside a summary does not toggle the accordion', async ({ page }) => {
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  const result = await page.evaluate(() => {
    const span = document.querySelector('[data-edit="weeks.1.title"]');
    const details = span.closest('details');
    const before = details.open;
    span.click();
    return { before, after: details.open };
  });
  expect(result.after).toBe(result.before);
});

test('directory cards can be added, reordered, and deleted', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  const cards = page.locator('#food-grid .dir-item');
  const start = await cards.count();
  await page.locator('#edit-toggle').click();

  await page.locator('.dir-add[data-arr="food"]').click();
  await expect(cards).toHaveCount(start + 1);
  await expect(cards.last().locator('[data-edit$=".name"]')).toHaveText('New entry');

  const names = await page.locator('#food-grid [data-edit$=".name"]').allInnerTexts();
  await cards.nth(1).locator('[data-act="up"]').click();
  const reordered = await page.locator('#food-grid [data-edit$=".name"]').allInnerTexts();
  expect(reordered[0]).toBe(names[1]);
  expect(reordered[1]).toBe(names[0]);

  await cards.first().locator('[data-act="del"]').click();
  await expect(cards).toHaveCount(start);
});

test('structural edits persist via array snapshot and reset clears them', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  const cards = page.locator('#food-grid .dir-item');
  const start = await cards.count();
  await page.locator('#edit-toggle').click();
  await page.locator('.dir-add[data-arr="food"]').click();
  await expect(cards).toHaveCount(start + 1);
  expect(await page.evaluate(() => localStorage.getItem('periplus.arrays.v1'))).toContain('food');

  await page.reload();
  await expect(page.locator('#food-grid .dir-item')).toHaveCount(start + 1);

  await page.locator('#edit-toggle').click();
  await page.locator('#edit-reset').click();
  await expect(page.locator('#food-grid .dir-item')).toHaveCount(start);
  expect(await page.evaluate(() => localStorage.getItem('periplus.arrays.v1'))).toBeNull();
});
