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

test('standalone-install meta is set for readable iOS chrome', async ({ page }) => {
  await page.goto('/');
  // viewport-fit=cover is what exposes the safe-area insets the topbar/edit-bar pad against.
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  // "default" (not black-translucent): dark status glyphs stay readable over the light topbar.
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]'))
    .toHaveAttribute('content', 'default');
  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content', 'Periplus');
});

test('manifest is complete to current PWA guidance', async ({ request }) => {
  const m = await (await request.get('manifest.webmanifest')).json();
  expect(m.id).toBeTruthy();
  expect(m.lang).toBe('en-US');
  expect(m.dir).toBe('ltr');
  expect(m.start_url).toBeTruthy();
  expect(m.scope).toBeTruthy();
  expect(m.display).toBe('standalone');
  // re-launch focuses the running app instead of spawning a new client.
  expect(m.launch_handler?.client_mode).toBe('navigate-existing');
  // at least one 512px icon, and a maskable variant for adaptive Android icons.
  expect(m.icons.some((i) => i.sizes === '512x512')).toBe(true);
  expect(m.icons.some((i) => (i.purpose || '').includes('maskable'))).toBe(true);
});
