# Periplus Roadmap

Periplus is a fork-it-yourself, offline-first travel-itinerary PWA. **Edit mode** now lets you change every field on the page with zero code — saved on-device, exportable as JSON; the `TRIP` block in `app/index.html` remains the source for forking. The north star: full no-code authoring — add, remove, and reorder sections and cards too.

## Now (shipped)
- **Single source of truth** — every section and card renders from the `TRIP` object: directories, calendar, timelines, intel, checklists, venue, contacts. Edit one block, redeploy, it's your trip.
- **Tap-to-navigate** (Google/Apple Maps) and **add-to-calendar** (Google/Apple) on every relevant item.
- Installable, offline-first, prints clean.

## Next: no-code editing — structural (Stage 2)
Stage 1 shipped the editable surface (see Done): edit mode, inline field editing, on-device persistence, and JSON export. What's left is **structure**:

- **Cards & entries** — add / remove / drag-reorder within a section. research lean: vendor **SortableJS** (dependency-free, touch-capable, HTML5-DnD based — offline-cached in the service worker; the dependency-light fit for a single-file PWA vs. framework-shaped Pragmatic DnD).
- **Sections** — add, delete, drag-reorder, rename the heading, pick a type (directory / cards / timeline / checklist / calendar).
- **Import** — paste a `TRIP` JSON to load someone else's trip (export already ships).
- **Re-render plumbing** — structural edits need a section-scoped re-render that re-binds the search / maps / calendar listeners (Stage 1 deliberately avoided re-render by patching fields in place).

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
