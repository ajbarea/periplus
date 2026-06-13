# Periplus PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing single-file NC residency itinerary into an installable, offline-first PWA (Periplus) with tap-to-navigate directions, shipped to GitHub Pages.

**Architecture:** Keep the app a no-build static site. Add PWA scaffolding (manifest + service worker + icons) and render the food/outdoor directories from a `TRIP` config so the directions feature and future template share one data source. Service worker uses stale-while-revalidate for the shell (instant offline loads) and cache-first for static assets. A user-selectable maps provider (Google default / Apple) drives every directions link through one `directionsUrl()` builder.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework, no build). Service Worker + Cache API. Web App Manifest. Playwright for E2E tests, `sharp` for icon generation, `python3 -m http.server` for local serving. All test/build tooling is dev-only — the deployed artifact is pure static files.

**Phasing:** Tasks 1–6 are **Phase A (trip-ready)** — ship before departure (May 31). Task 7 is **Phase B (template-prep)** — safe to defer past the trip.

**Source of truth for content:** `AJ_NC_Summer_Residency_2026.md` (full itinerary text) and the current `AJ_NC_Summer_Residency_2026.html` (rendered markup). Both live in `../../SCADS/` relative to the new repo; copy data from them rather than retyping from memory.

---

## File Structure

New repo at `/home/ajbar/ajsoftworks/periplus/`:

| File | Responsibility |
| --- | --- |
| `index.html` | The app. All content, the `TRIP` config, render logic, SW registration. (Renamed from the source HTML.) |
| `sw.js` | Service worker: SWR for navigations, cache-first for assets. |
| `manifest.webmanifest` | PWA manifest. |
| `icons/icon.svg` | Source brand mark. |
| `icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Generated icons. |
| `scripts/gen-icons.mjs` | Renders the SVG to the three PNGs via `sharp`. |
| `tests/*.spec.js` | Playwright E2E specs. |
| `playwright.config.js`, `package.json` | Dev tooling (not shipped to users). |
| `.gitignore`, `.nojekyll` | Repo hygiene. |
| `docs/superpowers/specs/…`, `docs/superpowers/plans/…` | This plan + the design spec (copied in at scaffold). |

---

## Task 1: Scaffold the `periplus/` repo and dev harness

**Files:**
- Create: `/home/ajbar/ajsoftworks/periplus/index.html` (copy of source HTML)
- Create: `package.json`, `playwright.config.js`, `.gitignore`, `.nojekyll`
- Create: `tests/baseline.spec.js`

- [ ] **Step 1: Create the repo dir and copy the app + design docs in**

```bash
mkdir -p /home/ajbar/ajsoftworks/periplus/{tests,scripts,icons,docs/superpowers/specs,docs/superpowers/plans}
cd /home/ajbar/ajsoftworks/periplus
cp "../SCADS/AJ_NC_Summer_Residency_2026.html" index.html
cp "../SCADS/docs/superpowers/specs/2026-05-25-residency-pwa-design.md" docs/superpowers/specs/
cp "../SCADS/docs/superpowers/plans/2026-05-25-periplus-pwa.md" docs/superpowers/plans/
git init
```

Do NOT copy `scads projects.txt`, `HANDOFF.md`, or the `.md` itinerary — those stay out of the app repo (the `.md` is a content reference, read it in place).

- [ ] **Step 2: Write `.gitignore` and `.nojekyll`**

`.gitignore`:
```
node_modules/
test-results/
playwright-report/
.DS_Store
```
`.nojekyll`: empty file (`touch .nojekyll`) — stops GitHub Pages running Jekyll over the static files.

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "periplus",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "serve": "python3 -m http.server 5173",
    "test": "playwright test",
    "icons": "node scripts/gen-icons.mjs"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "sharp": "^0.34.0"
  }
}
```

- [ ] **Step 4: Write `playwright.config.js`**

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'python3 -m http.server 5173',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 5: Install dev deps and the browser**

Run:
```bash
npm install
npx playwright install chromium
```
Expected: installs `@playwright/test` + `sharp`, then downloads the Chromium build.

- [ ] **Step 6: Write the baseline characterization test**

This locks current behavior so later refactors can't silently break content. `tests/baseline.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('core sections and key content render', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Residency/);
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#calendar #cal-body')).toBeVisible();

  // Food directory renders the full set with known anchor items present
  const food = page.locator('#food-grid .dir-item');
  expect(await food.count()).toBeGreaterThanOrEqual(20);
  await expect(page.getByText('Lunchbox Deli')).toBeVisible();
  await expect(page.getByText('Lawrence Barbecue')).toBeVisible();
  await expect(page.getByText('Two Roosters Ice Cream')).toBeVisible();

  // Outdoor directory renders
  await expect(page.locator('#outdoor-grid .dir-item').first()).toBeVisible();
});
```

- [ ] **Step 7: Run the baseline test — verify it passes**

Run: `npm test -- tests/baseline.spec.js`
Expected: PASS (the unmodified source HTML already renders this content).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold periplus repo, dev harness, baseline test"
```

---

## Task 2: PWA manifest, icons, and `<head>` links

**Files:**
- Create: `manifest.webmanifest`, `icons/icon.svg`, `scripts/gen-icons.mjs`
- Generate: `icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`
- Modify: `index.html` `<head>` (insert after the `<title>`, currently line 7)
- Test: `tests/pwa.spec.js`

- [ ] **Step 1: Write the failing PWA test**

`tests/pwa.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('manifest and apple-touch-icon are linked', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

test('icons are reachable', async ({ request }) => {
  for (const p of ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']) {
    const res = await request.get(p);
    expect(res.status(), p).toBe(200);
  }
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `npm test -- tests/pwa.spec.js`
Expected: FAIL (no manifest link, no icons yet).

- [ ] **Step 3: Write `manifest.webmanifest`**

```json
{
  "id": "/periplus/",
  "name": "Periplus — NC Summer Residency",
  "short_name": "Periplus",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 4: Write the source SVG `icons/icon.svg`**

Maskable-safe (glyph kept within the centered safe zone), on the app's `#0f172a` theme with a sky-blue accent — a dashed route between a start and destination pin:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <path d="M160 352 Q256 256 352 160" fill="none" stroke="#38bdf8" stroke-width="18"
        stroke-linecap="round" stroke-dasharray="2 34"/>
  <circle cx="160" cy="352" r="32" fill="#38bdf8"/>
  <circle cx="352" cy="160" r="32" fill="#f8fafc"/>
</svg>
```

- [ ] **Step 5: Write `scripts/gen-icons.mjs` and generate the PNGs**

```js
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const svg = readFileSync(new URL('../icons/icon.svg', import.meta.url));
const sizes = { 'icons/icon-192.png': 192, 'icons/icon-512.png': 512, 'icons/apple-touch-icon.png': 180 };

for (const [rel, size] of Object.entries(sizes)) {
  const out = fileURLToPath(new URL('../' + rel, import.meta.url));
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log('wrote', rel, size + 'px');
}
```
Run: `npm run icons`
Expected: prints three `wrote …` lines; the three PNGs exist in `icons/`.

- [ ] **Step 6: Add the `<head>` links in `index.html`**

Insert immediately after the `<title>…</title>` line (currently line 7):
```html
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Periplus">
```
(The existing `<meta name="theme-color" content="#0f172a">` at line 6 stays — it already matches the manifest.)

- [ ] **Step 7: Run the PWA test — verify it passes**

Run: `npm test -- tests/pwa.spec.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add web app manifest, icons, and apple-touch-icon"
```

---

## Task 3: Service worker (SWR shell + cache-first assets)

**Files:**
- Create: `sw.js`
- Modify: `index.html` `<script>` (append registration before `</script>`, currently line 1998)
- Test: `tests/offline.spec.js`

- [ ] **Step 1: Write the failing offline test**

`tests/offline.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('app works offline after first online load', async ({ page, context }) => {
  await page.goto('/');
  // wait until the service worker controls this page (skipWaiting + clients.claim)
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 15000 });

  await context.setOffline(true);
  await page.reload();

  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#food-grid .dir-item').first()).toBeVisible();

  await context.setOffline(false);
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `npm test -- tests/offline.spec.js`
Expected: FAIL (no service worker registered yet; `controller` stays null and the wait times out).

- [ ] **Step 3: Write `sw.js`**

```js
const CACHE = 'periplus-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // let cross-origin (maps links, etc.) pass

  if (req.mode === 'navigate') {
    // stale-while-revalidate: instant cached shell, refresh in the background
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('index.html');
      const network = fetch(req)
        .then((res) => { cache.put('index.html', res.clone()); return res; })
        .catch(() => null);
      return cached || (await network) || cache.match('./');
    })());
    return;
  }

  // cache-first for static assets
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
```

- [ ] **Step 4: Register the service worker in `index.html`**

Append just before `</script>` (currently line 1998):
```js
// Service worker registration (offline + installable)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
```

- [ ] **Step 5: Run the offline test — verify it passes**

Run: `npm test -- tests/offline.spec.js`
Expected: PASS (SW registers, claims the page, offline reload serves the cached shell).

- [ ] **Step 6: Run the full suite — confirm nothing regressed**

Run: `npm test`
Expected: baseline + pwa + offline all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add service worker (SWR shell, cache-first assets) + registration"
```

---

## Task 4: Food + outdoor → `TRIP` arrays, tap-to-navigate, provider toggle

This task introduces `const TRIP`, renders the two directories from arrays (DRY — removes ~170 lines of hand-written cards), and adds provider-aware Directions buttons. The rendered cards must keep the `.dir-item` / `data-cat` / `data-text` contract so the existing `wireDir()` search/filter keeps working.

**Files:**
- Modify: `index.html` — empty the two `.dir-grid`s (food cards at lines 1212–1317, outdoor cards at 1340–~1404); add `TRIP` + helpers in the `<script>` before the `wireDir(...)` calls (currently line 1979); add a maps-provider toggle in the header.
- Test: `tests/directions.spec.js`

- [ ] **Step 1: Write the failing directions + provider tests**

`tests/directions.spec.js`:
```js
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
  await expect(page.getByText('Lawrence Barbecue')).toBeVisible();
  await expect(page.getByText('Lunchbox Deli')).toBeHidden();
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `npm test -- tests/directions.spec.js`
Expected: FAIL (no `a.dir-go` links, no `window.TRIP`, no `#maps-apple` toggle).

- [ ] **Step 3: Add the maps-provider toggle to the header**

In `index.html`, inside `<header class="topbar">`, after the share button block (currently ends ~line 787), insert:
```html
<fieldset class="maps-toggle" aria-label="Directions provider">
  <legend class="sr-only">Maps app for directions</legend>
  <label><input type="radio" name="maps" id="maps-google" value="google"> Google</label>
  <label><input type="radio" name="maps" id="maps-apple" value="apple"> Apple</label>
</fieldset>
```
Add minimal CSS near the end of the `<style>` block (before `</head>`):
```css
.maps-toggle { display:inline-flex; gap:.5rem; border:0; padding:0; margin:0; font-size:.8rem; }
.maps-toggle label { display:inline-flex; align-items:center; gap:.25rem; cursor:pointer; }
.dir-go { display:inline-block; margin-top:.5rem; font-weight:600; font-size:.85rem; text-decoration:none; }
.dir-go::before { content:"→ "; }
```
(`.sr-only` already exists in the stylesheet for the TOC; reuse it. If it does not, add `.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}`.)

- [ ] **Step 4: Empty the two hardcoded grids**

In `index.html`, delete the `<article class="dir-item">…</article>` children inside `<div class="dir-grid" id="food-grid">` (lines 1213–1316) and inside `<div class="dir-grid" id="outdoor-grid">` (the cards between line 1340 and the grid's closing `</div>`). Leave the grid containers empty:
```html
<div class="dir-grid" id="food-grid"></div>
```
```html
<div class="dir-grid" id="outdoor-grid"></div>
```

- [ ] **Step 5: Add `TRIP`, `directionsUrl`, `renderDir`, and provider wiring**

In the `<script>`, insert this block ABOVE the `wireDir("food-search", "food-grid")` calls (currently line 1979). Port the FULL food list (24 items) from the current markup at lines 1213–1316 and the FULL outdoor list from lines 1340–1404 of the source HTML — schema below, two real entries shown as the pattern. `cat` and `text` must match the existing `data-cat`/`data-text` values so the chips/search behave identically; `maps` is the directions query (street address when known, else "Name, City, NC"):

```js
// ---- TRIP data (single source for the directories) ----
const TRIP = {
  food: [
    { name:"Lunchbox Deli", cat:"sandwich", meta:"Sandwich · Raleigh",
      note:"Turkey Basil on Rosemary Focaccia.",
      text:"lunchbox deli turkey basil rosemary focaccia raleigh",
      maps:"Lunchbox Deli, Raleigh, NC" },
    { name:"Lawrence Barbecue", cat:"bbq", meta:"BBQ · Raleigh",
      note:"Top of every 2025 Triangle list. Jake Wood — brisket birria, smoked-fried wings.",
      text:"lawrence barbecue jake wood brisket birria tex mex raleigh",
      maps:"Lawrence Barbecue, Raleigh, NC" },
    // …port the remaining 22 food entries from index.html lines 1213–1316.
    // Keep an optional `warn` field where the source card has <span class="warn">…</span>.
  ],
  outdoor: [
    { name:"William B. Umstead State Park", cat:"hike", meta:"Hike · 15 min",
      note:"Company Mill Trail (5.8 mi loop) — Raleigh's marquee hike.",
      text:"umstead state park company mill trail raleigh hike",
      maps:"William B. Umstead State Park, NC" },
    // …port the remaining outdoor entries (parks/hikes/beaches/museums) from index.html lines 1340–1404,
    // matching the outdoor chips' data-filter values for `cat`.
  ],
};
window.TRIP = TRIP; // exposed for tests

// ---- Maps provider (user-selectable, persisted) ----
const MAPS_KEY = "periplus:maps-provider";
function getMapsProvider(){ try { return localStorage.getItem(MAPS_KEY) || "google"; } catch { return "google"; } }
function setMapsProvider(p){ try { localStorage.setItem(MAPS_KEY, p); } catch {} }
function directionsUrl(query, provider = getMapsProvider()){
  const q = encodeURIComponent(query);
  return provider === "apple"
    ? `https://maps.apple.com/?daddr=${q}`
    : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

// ---- Render the directories from TRIP ----
function dirCard(item){
  const warn = item.warn ? `<span class="warn">${item.warn}</span>` : "";
  const go = item.maps
    ? `<a class="dir-go" href="${directionsUrl(item.maps)}" target="_blank" rel="noopener">Directions</a>`
    : "";
  return `<article class="dir-item" data-cat="${item.cat}" data-text="${item.text}">
    <div class="name">${item.name} <span class="meta">${item.meta}</span></div>
    <div class="note">${item.note}</div>${warn}${go}
  </article>`;
}
function renderDir(gridId, items){
  const grid = document.getElementById(gridId);
  if (grid) grid.innerHTML = items.map(dirCard).join("");
}
function renderDirectories(){
  renderDir("food-grid", TRIP.food);
  renderDir("outdoor-grid", TRIP.outdoor);
}
renderDirectories();

// ---- Wire the provider toggle ----
(function wireMapsToggle(){
  const current = getMapsProvider();
  const radio = document.getElementById(current === "apple" ? "maps-apple" : "maps-google");
  if (radio) radio.checked = true;
  document.querySelectorAll('input[name="maps"]').forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) { setMapsProvider(r.value); renderDirectories(); }
    });
  });
})();
```

`renderDirectories()` runs before the existing `wireDir(...)` calls, so the search/filter wiring binds to the freshly rendered `.dir-item`s. (`wireDir` reads `data-cat`/`data-text`, which the template reproduces.)

- [ ] **Step 6: Run the directions suite — verify it passes**

Run: `npm test -- tests/directions.spec.js`
Expected: PASS (links present and Google-by-default; DOM count equals array length; toggle flips to Apple and persists; search filters).

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: baseline + pwa + offline + directions all PASS. (Baseline still passes: it asserts ≥20 items and known names, which the rendered cards satisfy.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: render directories from TRIP, add tap-to-navigate + maps provider toggle"
```

---

## Task 5: Verification pass (manual / tooling)

No code; confirm real-world behavior with evidence before claiming done.

- [ ] **Step 1: Lighthouse PWA + categories**

Run Chrome DevTools → Lighthouse (or `npx lighthouse http://localhost:5173 --view`) against the served site.
Expected: "Installable" passes; offline/SW checks pass; Performance/Best-Practices/Accessibility 95+ (the source already scores high — confirm no regression).

- [ ] **Step 2: Mobile layout @ 375px**

DevTools device emulation at 375px width. Verify: header maps toggle fits, food/outdoor search + chips usable, cards + Directions buttons tappable (44×44 targets), accordions and checkboxes work.

- [ ] **Step 3: Real offline check**

Serve, load once, then DevTools → Network → Offline, reload. Expected: full app renders. Then on an actual iPhone (iOS 26.5): open the Pages URL in Safari → Share → Add to Home Screen → open once online → enable Airplane Mode → launch from the icon → app loads and works.

- [ ] **Step 4: Print + validation**

Print preview: clean, accordions expanded, animations off (existing print stylesheet). Run the page through the W3C validator (`https://validator.w3.org/nu/`) — expected clean (or only pre-existing, non-blocking notes).

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: verification-pass adjustments"   # only if changes were needed
```

---

## Task 6: Ship — GATED on AJ's explicit go + publish confirmation

> **Do not run this task without AJ's explicit approval at execution time.** Pushing publishes the real itinerary (hotel, dates, the LAS host's NCSU email) to a public URL. Confirm before any push.

- [ ] **Step 1: Final local commit state**

Run: `git status` → clean. `git log --oneline` → tasks 1–5 committed.

- [ ] **Step 2: Create the GitHub repo and push** *(after AJ confirms public/private)*

```bash
gh repo create periplus --public --source=. --remote=origin --push
```
(Use `--private` instead if AJ chooses; remember a Pro-private repo still serves a public Pages site.)

- [ ] **Step 3: Enable Pages**

Repo → Settings → Pages → Source: `Deploy from a branch`, branch `main` / `/ (root)` → Save. Wait ~30s.
(Verify `start_url`/`scope`/`id` resolve under `…github.io/periplus/`; they are relative, so they will.)

- [ ] **Step 4: Smoke the live site**

Open `https://<user>.github.io/periplus/`. Confirm load, offline (after one visit), and a Directions link opens Google Maps. Install on the iPhone per Task 5 Step 3.

- [ ] **Step 5: Confirm done**

Report the live URL to AJ.

---

## Task 7: PHASE B (deferrable past the trip) — consolidate remaining content into `TRIP`

Pure template-prep; **no trip-facing value**. Do only if Phase A ships comfortably before May 31. Extends `TRIP` to cover the hero, intel cards, trip anchors, weeks/activity, lodging, and contacts, and renders those sections from the config so a fork is a single-block edit.

**Files:** Modify `index.html` (move the inline `TRIP_START`/`TRIP_END`/`weeks`/`activity` consts into `TRIP`; render `#intel`, `#anchors`, `#contacts` from arrays). Test: extend specs with count/most-content assertions per section.

- [ ] **Step 1:** Write failing tests asserting intel/anchors/contacts render from `TRIP` (counts + one known string each).
- [ ] **Step 2:** Run — verify fail.
- [ ] **Step 3:** Fold `TRIP_START`, `TRIP_END`, `weeks`, `activity` into `TRIP` (keep local `const TRIP_START = TRIP.start` aliases so the calendar/status/now-card code is untouched), and add `TRIP.intel[]`, `TRIP.anchors[]`, `TRIP.contacts[]` ported from the source sections. Add render functions mirroring `renderDir`.
- [ ] **Step 4:** Run — verify pass; run full suite.
- [ ] **Step 5:** Commit: `refactor: consolidate all trip content into the TRIP config (template-ready)`.

---

## Self-Review

**Spec coverage:**
- Installable PWA → Task 2 (manifest, icons, apple-touch-icon, head links).
- Offline-first → Task 3 (SWR shell + cache-first), verified Task 5.
- `TRIP` single source + array-rendered grids → Task 4 (food/outdoor), Task 7 (rest).
- Tap-to-navigate + user-selectable provider → Task 4 (`directionsUrl`, toggle, persisted).
- Rename to `index.html` → Task 1 Step 1.
- Privacy / publish gate → Task 6 (explicit approval, public-URL warning).
- Exclude `scads projects.txt` / `HANDOFF.md` → Task 1 Step 1.
- Verification (Lighthouse/375px/airplane/print/W3C) → Task 5.

**Placeholder scan:** The only deferred-by-design item is "port the remaining food/outdoor entries from the named source lines" — that points at concrete in-repo markup (`index.html` 1213–1316 / 1340–1404), not an invented spec. Schema + two real entries + the exact source line ranges are given.

**Type/name consistency:** `directionsUrl(query, provider)`, `getMapsProvider`/`setMapsProvider`, `renderDir(gridId, items)`/`renderDirectories()`, `dirCard(item)`, `MAPS_KEY`, toggle ids `#maps-google`/`#maps-apple`, card contract `.dir-item`/`data-cat`/`data-text`/`a.dir-go` are used identically across Task 4 code and the tests. Cache name `periplus-v1` consistent in `sw.js`.

---

## Execution Handoff

(Filled in after the plan is saved — choose subagent-driven or inline execution.)
