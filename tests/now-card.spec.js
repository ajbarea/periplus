import { test, expect } from '@playwright/test';

// The "now" widgets (topbar status chip + now-card) read `new Date()` once at
// script-eval time, so the clock must be fixed BEFORE navigation. Trip dates are
// built with the local Date constructor, so we pin the timezone to the trip's own
// (Eastern) and use explicit EDT (-04:00) offsets — deterministic on any CI tz.
// research(2026-05): page.clock.setFixedTime is the endorsed simple-case API
// (playwright.dev/docs/api/class-clock); install/setSystemTime are for
// time-advancing scenarios this suite doesn't need.
test.use({ timezoneId: 'America/New_York' });

async function gotoAt(page, iso) {
  await page.clock.setFixedTime(new Date(iso));
  await page.goto('/');
}

test('pre-trip: counts down the days to departure', async ({ page }) => {
  await gotoAt(page, '2026-05-29T12:00:00-04:00'); // 2 days before arrival
  await expect(page.locator('#now-label')).toHaveText('In 2 days');
  await expect(page.locator('#now-headline')).toContainText('Trip begins');
  await expect(page.locator('#now-card')).not.toHaveClass(/is-live|is-post/);
});

test('pre-trip: says "Tomorrow" the day before arrival', async ({ page }) => {
  await gotoAt(page, '2026-05-30T12:00:00-04:00'); // 1 day before
  await expect(page.locator('#now-label')).toHaveText('Tomorrow');
});

test('arrival day flips both status displays to live "Day 1 of 56"', async ({ page }) => {
  await gotoAt(page, '2026-05-31T12:00:00-04:00'); // arrival
  await expect(page.locator('#now-label')).toContainText('Day 1 of 56');
  await expect(page.locator('#now-card')).toHaveClass(/is-live/);
  await expect(page.locator('#status-chip')).toHaveText('Day 1 of 56');
});

test('mid-trip: the day number tracks the date', async ({ page }) => {
  await gotoAt(page, '2026-06-15T12:00:00-04:00'); // May 31 = day 1, so Jun 15 = day 16
  await expect(page.locator('#now-label')).toContainText('Day 16 of 56');
  await expect(page.locator('#now-card')).toHaveClass(/is-live/);
});

test('checkout day still counts as in-trip (Day 56 of 56)', async ({ page }) => {
  // Jul 25 is the checkout day; the trip is "active" through the whole day, not
  // flipped to complete at its midnight. This guards the off-by-one boundary.
  await gotoAt(page, '2026-07-25T12:00:00-04:00');
  await expect(page.locator('#now-label')).toContainText('Day 56 of 56');
  await expect(page.locator('#now-card')).toHaveClass(/is-live/);
});

test('post-trip: shows the trip is complete the day after checkout', async ({ page }) => {
  await gotoAt(page, '2026-07-26T12:00:00-04:00'); // day after checkout
  await expect(page.locator('#now-card')).toHaveClass(/is-post/);
  await expect(page.locator('#now-label')).toHaveText('Trip complete');
});
