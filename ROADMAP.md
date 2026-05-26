# Periplus Roadmap

Periplus is a fork-it-yourself, offline-first travel-itinerary PWA. **Edit mode** now lets you change every field on the page with zero code — saved on-device, exportable as JSON; the `TRIP` block in `app/index.html` remains the source for forking. The north star: full no-code authoring — add, remove, and reorder sections and cards too.

## Now (shipped)
- **Single source of truth** — every section and card renders from the `TRIP` object: directories, calendar, timelines, intel, checklists, venue, contacts. Edit one block, redeploy, it's your trip.
- **Tap-to-navigate** (Google/Apple Maps) and **add-to-calendar** (Google/Apple) on every relevant item.
- Installable, offline-first, prints clean.

## Next: no-code editing — remaining structure
Stage 1 (field editing) and Stage 2 (directory cards) shipped (see Done). Remaining:

- **Cards in the other list sections** — extend add / remove / reorder to weeks items, checklists, intel, contacts, anchors, and timelines. Directories went first because their search/maps listeners sit on static elements, so re-render is free; the others need their render + a listener re-bind (e.g. `wireChecklists`).
- **Sections** — add, delete, reorder, rename, and pick a type. The page's section scaffold is static HTML, so this is the biggest piece (each section becomes a data-driven block).
- **Import** — paste a `TRIP` JSON to load a whole trip (needs the full-app re-render path; export already ships).
- **Drag-reorder** — optional enhancement layered on the buttons. WCAG 2.2 SC 2.5.7 requires the single-pointer alternative regardless, so the buttons stay either way.

## Later (ideas)
- Multiple saved trips + a trip switcher.
- Share a trip via URL or a single JSON file.
- BYOK AI helper (bring-your-own Claude key) for "plan my week" / suggestions — deferred until there's a clean offline-friendly story.
- Theme/accent customization inside the editor.

## Done
- [x] Consolidate **all** content into the `TRIP` block (directories, calendar, timelines, intel, venue, checklists, contacts).
- [x] Google/Apple add-to-calendar integration, mirroring the maps toggle.
- [x] Brand the footer to match the rest of the fleet.
- [x] Docs hero polish + scroll-reveal, hero-entrance, and card-hover interactivity, matching the sister sites (IntersectionObserver `reveal.js`; CSS scroll-driven deferred until Firefox ships full support).
- [x] Calendar reliability + a11y after the month-view refactor: repaired the stale `e2e` selector that had left **Tests** red on `main` (now web-first assertions on `#cal-months`/`#cal-agenda`, agenda locked to event count), restored WCAG AA 4.5:1 on the event chips (`hike`/`beach` were failing white-on-color — darkened ~80% in oklab to 5.6:1 / 6.2:1, verified in-browser), and removed ~85 lines of dead `.cal-cell`/`.cal-row`/`.cal-header` CSS the refactor orphaned.
- [x] **No-code editing, Stage 1** — an Edit toggle turns the page into an editable surface: 343 inline-editable fields across every section (`[data-edit]` paths into `TRIP`), saved as a sparse diff in `localStorage` and reapplied on load. No re-render — fields are patched in place, so the existing search / maps / calendar / accordion listeners survive untouched; nested headings in `<summary>`/`<label>` are click-guarded so editing doesn't toggle them. Export the current trip as JSON to fork; reset restores the built-in itinerary. Covered by `tests/editing.spec.js`. research(2026-05): in-place `contenteditable` (Atlassian inline-edit pattern); kept the JS path (no re-render) over a form panel to preserve listeners.
- [x] **No-code editing, Stage 2 — directory cards** — add / delete / reorder food & outdoor entries in edit mode via single-pointer buttons (↑ ↓ ×) plus an "Add entry" button. Structural changes persist as a whole-array snapshot (`periplus.arrays.v1`, indices shift so a field diff won't do) and survive reload; reset clears them. research(2026-05): chose move-buttons over a drag library — WCAG 2.2 SC 2.5.7 requires a single-pointer alternative to dragging anyway, and buttons keep the app zero-dependency (drag is a future enhancement). Re-render is safe here because the search/maps listeners live on static elements. Covered by `tests/editing.spec.js`.
