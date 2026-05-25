# Tech Notes

Periplus is deliberately a no-build, single-file app: the value is that it opens anywhere, installs anywhere, and a fork is one block of edits.

## The app
- **One `index.html`**: content, the `TRIP` config, and render logic in a single file. No framework, no bundler.
- **Service worker**: stale-while-revalidate for the shell (instant offline loads), cache-first for static assets; the app shell is precached on install.
- **Modern CSS**: OKLCH `color-mix()`, container queries, scroll-driven reveals, and View Transitions, each behind `@supports` and `prefers-reduced-motion` guards.
- **System fonts**: no web fonts, so it renders instantly, even offline.

## Hosting
- The **docs site** (this site, built with Zensical) is served at the root.
- The **app** is served at [`/app/`](app/); its service worker is scoped to `/app/`, so it never interferes with these docs.

## Tests
End-to-end tests run in [Playwright](https://playwright.dev/): they verify the app renders from `TRIP`, the maps-provider toggle persists, search filters the cards, and (by actually switching the browser offline and reloading) confirm the service worker serves the app with no network.
