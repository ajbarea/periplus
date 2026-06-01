import { test, expect } from '@playwright/test';

// Full-trip portability (Stage 6): trip dates + destination live in TRIP.meta, so an
// exported trip round-trips its calendar range and live status — import authors an
// arbitrary trip, not just restores this one's content. Like now-card.spec.js, the
// "now" widgets read new Date() at eval time, so the clock is fixed BEFORE navigation
// and the tz pinned to Eastern (EDT -04:00) for determinism on any CI box.
test.use({ timezoneId: 'America/New_York' });

// Open the export modal, set TRIP.meta to `meta` in the JSON, and load it (no reload).
async function importMeta(page, meta) {
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-export').click();
  await page.evaluate((m) => {
    const ta = document.getElementById('edit-json');
    const t = JSON.parse(ta.value);
    t.meta = m;
    ta.value = JSON.stringify(t);
  }, meta);
  await page.locator('#edit-import').click();
}

test('export carries the trip dates + destination (meta) for a portable fork', async ({ page }) => {
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-export').click();
  const meta = await page.evaluate(() => JSON.parse(document.getElementById('edit-json').value).meta);
  expect(meta).toEqual({ start: '2026-05-31', end: '2026-07-25', destination: 'Raleigh' });
});

test('imported trip dates re-derive the live status chip without a reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-05-20T12:00:00-04:00'));
  await page.goto('/');
  await expect(page.locator('#status-chip')).toHaveText('T-11 days to Raleigh'); // default: pre-trip
  await importMeta(page, { start: '2026-05-15', end: '2026-07-10', destination: 'Lisbon' });
  // 2026-05-20 is day 6 of the imported 57-day range — the chip must flip to live.
  await expect(page.locator('#status-chip')).toHaveText('Day 6 of 57');
});

test('imported trip dates re-derive the now-card without a reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-05-20T12:00:00-04:00'));
  await page.goto('/');
  await expect(page.locator('#now-card')).not.toHaveClass(/is-live/); // default: pre-trip
  await importMeta(page, { start: '2026-05-15', end: '2026-07-10', destination: 'Lisbon' });
  await expect(page.locator('#now-card')).toHaveClass(/is-live/);
  await expect(page.locator('#now-label')).toContainText('Day 6 of 57');
});

test('imported destination appears in the pre-trip status chip', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-05-20T12:00:00-04:00'));
  await page.goto('/');
  await importMeta(page, { start: '2026-06-10', end: '2026-06-20', destination: 'Lisbon' });
  await expect(page.locator('#status-chip')).toContainText('to Lisbon');
});

test('a trip with no meta falls back to the built-in dates (back-compat)', async ({ page }) => {
  // An export made before Stage 6 has no `meta`. Importing it must not break the
  // live status — it falls back to the deploy-side default dates.
  await page.clock.setFixedTime(new Date('2026-06-15T12:00:00-04:00')); // mid default trip
  await page.goto('/');
  await page.locator('#edit-toggle').click();
  await page.locator('#edit-export').click();
  await page.evaluate(() => {
    const ta = document.getElementById('edit-json');
    const t = JSON.parse(ta.value);
    delete t.meta;
    t.title = 'No-Meta Trip';
    ta.value = JSON.stringify(t);
  });
  await page.locator('#edit-import').click();
  await expect(page.locator('#hero-title')).toHaveText('No-Meta Trip');
  await expect(page.locator('#status-chip')).toHaveText('Day 16 of 56'); // default dates still drive status
});
