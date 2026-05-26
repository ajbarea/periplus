# Periplus

**An offline-first, installable travel-itinerary planner you can fork for your own multi-week trip.**

[**Live planner →**](https://ajbarea.github.io/periplus/app/) &nbsp;·&nbsp; [**Docs →**](https://ajbarea.github.io/periplus/)

A *periplus* was the ancient mariner's itinerary, a written log of ports and landmarks along a voyage. This one is a modern progressive web app: install it to your home screen and the whole itinerary works offline, in the dead zones where cell coverage drops. The live demo is a real 8-week North Carolina summer residency.

![Periplus](docs/assets/og.jpg)

## What it does
- **Works offline.** Open it once on signal and a service worker caches everything; after that it runs in airplane mode.
- **Installs like an app.** Add to Home Screen on iOS or Android: full-screen, its own icon.
- **Tap to navigate.** Every food spot, hike, beach, and your lodging opens in Google or Apple Maps (your choice, remembered).
- **Searchable directories**, a live "today" widget, and persistent checklists.
- **Edit in the browser.** Tap **Edit** to change any text and add, reorder, or remove anything; export the trip as JSON to back up, share, or fork.
- **No build, no backend, no framework.** The whole app is one `index.html`.

## Make it yours
The trip's content lives in a `TRIP` config block in [`app/index.html`](app/index.html): overview, the food and outdoor directories, intel, trip anchors, the week-by-week plan, and contacts. Edit it in source and redeploy, or edit it live (tap **Edit**) and export the JSON. See [Customize](https://ajbarea.github.io/periplus/customize/).

## Develop
```bash
# The app (static, no build) — serve and test
npm install
npx playwright install chromium
npm test                                      # Playwright e2e: offline, directions, editing, render
python3 -m http.server 5173 --directory app   # preview at http://localhost:5173

# The docs site (Zensical)
uv sync
uv run zensical serve                         # preview the docs
```

## How it's hosted
A single GitHub Pages deployment via [`.github/workflows/docs.yml`](.github/workflows/docs.yml): the Zensical docs build to the site root, and the app is placed at [`/app/`](https://ajbarea.github.io/periplus/app/) with its service worker scoped there so it never interferes with the docs.

## License
[MIT](LICENSE) © 2026 AJ Barea
