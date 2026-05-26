# Periplus Roadmap

Periplus is a fork-it-yourself, offline-first travel-itinerary PWA. Today you make it yours by editing one `TRIP` config block in `app/index.html`. The north star: **make that possible with zero code.**

## Now (shipped)
- **Single source of truth** — every section and card renders from the `TRIP` object: directories, calendar, timelines, intel, checklists, venue, contacts. Edit one block, redeploy, it's your trip.
- **Tap-to-navigate** (Google/Apple Maps) and **add-to-calendar** (Google/Apple) on every relevant item.
- Installable, offline-first, prints clean.

## Next: no-code content editing
Let the trip owner add, remove, reorder, and rename **sections and cards** — and edit every field — without touching code. The consolidation above is the foundation: the UI just manipulates the `TRIP` data.

- **Edit mode** — a toggle that turns the page into an editable surface (pencil affordances on each section/card).
- **Sections** — add, delete, drag-reorder, rename the heading, pick a type (directory / cards / timeline / checklist / calendar).
- **Cards & entries** — add/remove/edit inline (name, note, maps target, dates…); reorder within a section.
- **Persistence** — saved to `localStorage` per device, so edits survive reloads and work offline.
- **Export / import** — one button to export the current state as a ready-to-paste `TRIP` block (or JSON) so edits become permanent in a fork and shareable; import to load someone else's trip.

## Later (ideas)
- Multiple saved trips + a trip switcher.
- Share a trip via URL or a single JSON file.
- BYOK AI helper (bring-your-own Claude key) for "plan my week" / suggestions — deferred until there's a clean offline-friendly story.
- Theme/accent customization inside the editor.

## Done
- [x] Consolidate **all** content into the `TRIP` block (directories, calendar, timelines, intel, venue, checklists, contacts).
- [x] Google/Apple add-to-calendar integration, mirroring the maps toggle.
- [x] Brand the footer to match the rest of the fleet.
