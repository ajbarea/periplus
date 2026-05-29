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

test('card CRUD generalizes beyond directories (intel) and persists', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  const cards = page.locator('#intel-grid .intel-card');
  const start = await cards.count();
  await page.locator('#edit-toggle').click();
  await expect(page.locator('.dir-add')).toHaveCount(10); // 5 card grids + 2 timelines + weeks + pretrip + packing

  await page.locator('#intel summary').click(); // intel is a closed accordion — open it to reach its edit controls
  await page.locator('.dir-add[data-arr="intel"]').click();
  await expect(cards).toHaveCount(start + 1);
  await page.reload();
  await expect(page.locator('#intel-grid .intel-card')).toHaveCount(start + 1);

  await page.locator('#edit-toggle').click();
  await page.locator('#edit-reset').click();
  await expect(page.locator('#intel-grid .intel-card')).toHaveCount(start);
});

// --- Stage 3: the interactive / thin list sections (weeks, checklists, timelines) ---
// These differ from card grids: weeks/checklists are two-level (a list of
// accordions, each holding a list of items) and carry per-element wiring
// (checkbox change, current-week open). CRUD here exercises nested-path edits
// and the delegated re-render path.

test('week items can be added, reordered, and deleted, and persist', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  await page.evaluate(() => { document.querySelector('#weeks-list .week-card').open = true; });
  const firstWeek = page.locator('#weeks-list .week-card').first();
  const items = firstWeek.locator('ul li');
  const start = await items.count();

  await page.locator('.li-add[data-arr="weeks.0.items"]').click();
  await expect(items).toHaveCount(start + 1);
  await expect(firstWeek.locator('[data-edit="weeks.0.items.' + start + '"]')).toHaveText('New plan');

  const before = await firstWeek.locator('[data-edit^="weeks.0.items."]').allInnerTexts();
  await page.locator('[data-act="up"][data-arr="weeks.0.items"][data-i="1"]').click();
  const after = await firstWeek.locator('[data-edit^="weeks.0.items."]').allInnerTexts();
  expect(after[0]).toBe(before[1]);
  expect(after[1]).toBe(before[0]);

  await page.reload();
  await expect(page.locator('#weeks-list .week-card').first().locator('ul li')).toHaveCount(start + 1);

  await page.locator('#edit-toggle').click();
  await page.evaluate(() => { document.querySelector('#weeks-list .week-card').open = true; });
  await page.locator('[data-act="del"][data-arr="weeks.0.items"][data-i="0"]').click();
  await expect(page.locator('#weeks-list .week-card').first().locator('ul li')).toHaveCount(start);
});

test('adding a week item preserves the open state of other weeks', async ({ page }) => {
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#weeks-list .week-card');
    cards[0].open = true; cards[2].open = true;
  });
  await page.locator('.li-add[data-arr="weeks.0.items"]').click();
  // the re-render must not collapse week index 2
  expect(await page.evaluate(() => document.querySelectorAll('#weeks-list .week-card')[2].open)).toBe(true);
});

test('checklist items can be added; a new checkbox toggles and persists (delegation)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  const sec0 = page.locator('#pretrip-list details.accordion').first();
  const items = sec0.locator('ul.checklist li');
  const start = await items.count();

  await page.locator('.li-add[data-arr="pretrip.0.items"]').click();
  await expect(items).toHaveCount(start + 1);

  // The freshly-rendered checkbox must work via the delegated change listener.
  await items.last().locator('input[type=checkbox]').check();
  await expect(items.last().locator('input[type=checkbox]')).toBeChecked();

  await page.reload();
  const items2 = page.locator('#pretrip-list details.accordion').first().locator('ul.checklist li');
  await expect(items2).toHaveCount(start + 1);
  await expect(items2.last().locator('input[type=checkbox]')).toBeChecked();
});

test('timeline rows can be added, reordered, and deleted', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  const rows = page.locator('#arrival-timeline .row');
  const start = await rows.count();

  await page.locator('.dir-add[data-arr="arrival"]').click();
  await expect(rows).toHaveCount(start + 1);
  await expect(rows.last().locator('[data-edit="arrival.' + start + '.a"]')).toHaveText('New step');

  const before = await page.locator('#arrival-timeline [data-edit$=".a"]').allInnerTexts();
  await rows.nth(1).locator('[data-act="up"]').click();
  const after = await page.locator('#arrival-timeline [data-edit$=".a"]').allInnerTexts();
  expect(after[0]).toBe(before[1]);

  await rows.first().locator('[data-act="del"]').click();
  await expect(rows).toHaveCount(start);
});

// --- Stage 4: whole weeks & checklist groups ---
// Top-level CRUD for the two-level sections. Controls live in the body (a11y:
// interactive controls must not be nested in a <summary>, which is itself a button).

test('whole weeks can be added, reordered, and deleted, and persist', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  const weeks = page.locator('#weeks-list .week-card');
  const start = await weeks.count();

  await page.locator('.dir-add[data-arr="weeks"]').click();
  await expect(weeks).toHaveCount(start + 1);
  await expect(weeks.last().locator('[data-edit="weeks.' + start + '.title"]')).toHaveText('New week');

  // whole-week controls live in the body, so open the new (last) week first
  await weeks.last().evaluate((el) => { el.open = true; });
  const titlesBefore = await page.locator('#weeks-list .week-card [data-edit$=".title"]').allInnerTexts();
  await weeks.last().locator('.grp-bar [data-act="up"][data-arr="weeks"]').click();
  const titlesAfter = await page.locator('#weeks-list .week-card [data-edit$=".title"]').allInnerTexts();
  expect(titlesAfter[start - 1]).toBe('New week');
  expect(titlesAfter[start]).toBe(titlesBefore[start - 1]);

  await page.reload();
  await expect(page.locator('#weeks-list .week-card')).toHaveCount(start + 1);

  await page.locator('#edit-toggle').click();
  const newCard = page.locator('#weeks-list .week-card').filter({ hasText: 'New week' });
  await newCard.evaluate((el) => { el.open = true; });
  await newCard.locator('.grp-bar [data-act="del"][data-arr="weeks"]').click();
  await expect(page.locator('#weeks-list .week-card')).toHaveCount(start);
});

test('whole checklist groups can be added and deleted, and persist', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  const groups = page.locator('#packing-list details.accordion');
  const start = await groups.count();

  await page.locator('.dir-add[data-arr="packing"]').click();
  await expect(groups).toHaveCount(start + 1);
  await expect(groups.last().locator('[data-edit="packing.' + start + '.title"]')).toHaveText('New group');

  await page.reload();
  await expect(page.locator('#packing-list details.accordion')).toHaveCount(start + 1);

  await page.locator('#edit-toggle').click();
  const newGroup = page.locator('#packing-list details.accordion').filter({ hasText: 'New group' });
  await newGroup.evaluate((el) => { el.open = true; });
  await newGroup.locator('.grp-bar [data-act="del"][data-arr="packing"]').click();
  await expect(page.locator('#packing-list details.accordion')).toHaveCount(start);
});

// --- Stage 5: JSON import (the export ↔ import round-trip) ---

test('a pasted trip loads, persists, and reset restores the original', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  const original = (await page.locator('#hero-title').innerText()).trim();
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-export').click(); // opens the modal seeded with the current TRIP JSON

  await page.evaluate(() => {
    const ta = document.getElementById('edit-json');
    const t = JSON.parse(ta.value);
    t.title = 'Imported Trip';
    t.food = [{ name: 'Imported Spot', cat: 'sandwich', meta: 'x', note: 'y', text: 'imported', maps: '' }];
    ta.value = JSON.stringify(t);
  });
  await page.locator('#edit-import').click();

  await expect(page.locator('#hero-title')).toHaveText('Imported Trip');
  await expect(page.locator('#food-grid .dir-item')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('periplus.trip.v1'))).toContain('Imported Trip');

  await page.reload();
  await expect(page.locator('#hero-title')).toHaveText('Imported Trip');

  await page.locator('#edit-toggle').click();
  await page.locator('#edit-reset').click();
  await expect(page.locator('#hero-title')).toHaveText(original);
  expect(await page.evaluate(() => localStorage.getItem('periplus.trip.v1'))).toBeNull();
});

test('invalid import JSON shows an error and leaves the trip unchanged', async ({ page }) => {
  await page.goto('/');
  const original = (await page.locator('#hero-title').innerText()).trim();
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-export').click();
  await page.evaluate(() => { document.getElementById('edit-json').value = '{ not valid json'; });
  await page.locator('#edit-import').click();
  await expect(page.locator('#edit-import-err')).toBeVisible();
  await expect(page.locator('#hero-title')).toHaveText(original);
});

// The editing feature must be reachable on a phone — periplus is a mobile-first PWA.
// The topbar Edit toggle previously overflowed off the right edge at phone widths.
test.describe('mobile (iPhone-13 width)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('edit mode is reachable and the page does not scroll sideways', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const box = await page.locator('#edit-toggle').boundingBox();
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(box.x + box.width).toBeLessThanOrEqual(cw); // toggle fully within the viewport

    await page.locator('#edit-toggle').click();
    await expect(page.locator('body')).toHaveClass(/editing/);
  });
});
