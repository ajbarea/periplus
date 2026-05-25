# NC Residency Itinerary → Installable Offline PWA — Design Spec

> Project: **Periplus** (Greek περίπλους — an ancient written voyage itinerary) · Date: 2026-05-25 · Status: awaiting AJ review

## Overview

Convert the existing single-file HTML itinerary (`AJ_NC_Summer_Residency_2026.html`, 2000 lines) into an **installable, offline-first Progressive Web App** deployed to GitHub Pages, for personal use during the 8-week NC State LAS / SCADS residency (May 31 – Jul 25, 2026). The architecture is kept **template-ready** (clean data/presentation separation) so it can be open-sourced as a fork-able template after the trip — but **no template machinery is built now**.

The existing artifact's modern-CSS craft (OKLCH color-mix, container queries, scroll-driven reveals, View Transitions, live "Today" widget, localStorage checklists) is preserved, not regressed.

## Goals

- Installable to the iPhone Home Screen on iOS 26.5; launches standalone.
- Fully usable **offline** after one online load — covers the I-81/Blue Ridge Parkway dead zones the trip route has.
- **One source of truth** for trip data (`const TRIP`), with the uniform card grids rendered from arrays.
- **Tap-to-navigate**: a directions link on every venue, hike, beach, and the lodging.
- No build step; the app stays hand-editable (edit one HTML file).

## Non-Goals (deliberately deferred to post-trip)

- Personalize form, JSON config import/export, fork README, MIT/template framing.
- Native iOS / Capacitor wrap (revisit as a "first iPhone app" learning project later — the PWA proves the surface first).
- Analytics, web fonts, frameworks, service-worker background sync, push notifications.
- Any new content feature beyond tap-to-navigate.
- **Premium AI (e.g., a Claude-powered trip Q&A chatbot).** Feasible and pre-enabled by the `TRIP` block (ready-made context to feed the model). Path when built: **BYOK** — user supplies their own Anthropic key (stored locally; the documented `anthropic-dangerous-direct-browser-access` header lets the browser call Claude directly), preserving the zero-backend static deployment. A serverless proxy (Cloudflare Worker holding the key) is only needed for a hosted no-key-required product, which carries API cost + monetization. Online-only; degrades gracefully offline. Deferred until post-trip / funding, mirroring the kourai "ship free tier, defer premium" call.

## Architecture

Deployed footprint is ~4 files; **you still only ever edit `index.html`**:

| File | Role |
| --- | --- |
| `index.html` | The app (renamed from the current file). Holds all content, the `TRIP` config block, and the render logic. |
| `sw.js` | ~20-line hand-rolled service worker (no Workbox, no build step). |
| `manifest.webmanifest` | `id`, `name`, `short_name`, `start_url: "./"`, `scope: "./"`, `display: "standalone"`, `background_color`, `theme_color` (from existing brand), `icons` at 192 + 512 (incl. maskable). Relative `start_url`/`scope` so it resolves under the Pages `/periplus/` subpath; `id: "/periplus/"`. |
| `icons/` | 192×192 + 512×512 PNGs for Android / PWA / the future template, **plus** a 180×180 `apple-touch-icon` linked in `<head>`. Safari ignores manifest icons on iOS and reads `apple-touch-icon` for the Home Screen, so both are required. All from one brand mark. |

### `TRIP` config block

A single `const TRIP = {…}` near the top of `<script>`: `title`, `subtitle`, `start`, `end`, `lodging {name, address, phone}`, `origin`, `constraints`, `weeks[]`, `activity{}`, `contacts[]`, `food[]`, `outdoor[]`, `intelCards[]`, `anchors[]`. The uniform card grids (food / outdoor / intel / anchors) render from these arrays via template-literal → `innerHTML`, replacing ~600 lines of hand-written, copy-pasted HTML. The existing JS-driven bits (calendar, status chip, Today/Up-next widget) read from the same source instead of separate constants. This is both the DRY consolidation and the template hinge.

### Tap-to-navigate

Each `food` / `outdoor` / `lodging` entry carries an `address` (most already present). When present, render a "Directions" button. The maps provider is **user-selectable (Apple / Google)**, persisted in `localStorage` (reusing the existing checkbox-persistence pattern), defaulting to **Google** (AJ's preference), set via a small toggle in the UI. A single `directionsUrl(query, provider)` builder is the only place a URL is constructed:

```
Google:  https://www.google.com/maps/dir/?api=1&destination=<urlencoded "Name, Address">
Apple:   https://maps.apple.com/?daddr=<urlencoded "Name, Address">
```

Apple's directions parameter is `daddr` (destination), not `?q=` (which only drops a search pin — no route). Both forms open the respective native app on a device that has it (Universal Links) and fall back to the web otherwise; no API key. The maps app handles its own offline data, so the link works in the field. Making the provider a setting rather than a hardcode is the generalization hook: the future template ships provider-agnostic, the personal copy just defaults to Google. Links render conditionally on `address`.

### Offline strategy (service worker)

- Versioned cache name (`residency-v1`); bump to invalidate on content changes.
- **install** — precache the app shell: `index.html`, `manifest.webmanifest`, the icons, and `./`.
- **fetch** — navigations (the shell): **stale-while-revalidate** — serve cached `index.html` instantly (fast load in dead zones), refetch in the background to refresh for the next launch; static assets / icons: **cache-first**. SWR's background refresh inherently avoids the "stuck on a stale version" lock without the network-timeout penalty that network-first pays when offline — the right trade for a mostly-static field tool.
- **activate** — delete superseded caches.
- iOS notes baked into expectations: home-screen install exempts the app from the 7-day storage eviction; ~50 MB Cache API ceiling (app is ~80 KB).

### Data / privacy

The personal version keeps real data (hotel, dates, the LAS host's institutional NCSU email, contacts). Financial details were already stripped upstream. **Publishing requires explicit AJ approval at ship time.** Verified GitHub Pages visibility rules: on **Free**, the repo must be public to use Pages at all; on **Pro**, the repo can be private but the published site is still public (a separate visibility setting); only **Enterprise Cloud** can gate the site itself. So on any plan realistically used here, the deployed itinerary URL is public — "private repo" ≠ "private site." The future template version strips personal contacts and swaps in demo data.

## Shipping (executed only after AJ's explicit go)

1. Extract the app into its own clean directory — **exclude** the unrelated `scads projects.txt` research notes and `HANDOFF.md` from the app repo.
2. `git init`; repo name **`periplus`** (Greek περίπλους — an ancient written voyage itinerary; neutral and template-ready). Pages serves it at `<user>.github.io/periplus/`.
3. First commit → create GitHub repo → push.
4. Settings → Pages → source `main` / root → Save → grab the URL.
5. AJ installs via Safari → Add to Home Screen, opens once online to seed the cache.

## Verification

- Local dev over HTTP via `python3 -m http.server` (service workers do not run from `file://`).
- Lighthouse: installable + offline pass; aim 95+ across categories.
- DevTools mobile emulation @ 375px: search/filter, accordions, checkboxes, tap-to-navigate all thumb-usable; 44×44 tap targets intact.
- Airplane-mode test: load online once → disable network → reload → still fully functional.
- Print preview: clean, accordions expanded, animations off (existing behavior preserved).
- W3C validator: clean.

## Open trip TODOs to preserve in the personal version

Carried from the handoff — these are live action items, not app features:

- Call Hyatt for an extended-stay parking rate (default ~$25/night).
- Ask Emily (LAS) about a sponsored Centennial Campus parking permit.
- Reserve Wrightsville Beach lodging (Sat Jun 27).
- Reserve Asheville lodging (Fri Jul 3 – Sun Jul 5).
- Confirm whether LAS observes the Fri Jul 3 federal holiday.
- Re-confirm Blue Ridge Parkway milepost + Mt. Pisgah Trail status the week of Jul 3.
- Watch for The Common Market opening at Seaboard Station (next door to the Hyatt).
