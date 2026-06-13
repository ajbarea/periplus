# Manage Sections: reorder & show/hide whole sections in edit mode

Status: accepted (2026-06-13) · Scope: `app/index.html` (zero-dep, single file)

## Goal
In edit mode, let the user reorder or remove whole sections (Intel, Calendar,
Arrival, Day 1, Venue, Anchors, Weeks, Food, Outdoor, Pre-trip, Packing,
Contacts) with first-class touch + desktop UX. The hero/title (`#overview`) is
pinned. Item-level reorder/delete already exists (the `ctrls()` up/down/delete
pattern); this adds the section level.

## Decisions (grounded in current best practice)

- **Interaction: buttons-first** (up/down + show/hide), keyboard-operable, with an
  `aria-live` announcement on every move/hide. No drag in v1.
  - `# research(2026-06)`: up/down buttons are the most accessible reorder method
    and better on touchscreens with limited precision; drag-and-drop must only ever
    be an *optional bonus* (WCAG 2.2 SC 2.5.7, Dragging Movements). There is no
    native ARIA for reordering, so a polite live region narrates each change
    (Smashing "Dragon Drop"). This also matches the stance already encoded in this
    file's `ctrls()`.
- **Presentation: a "Manage sections" sheet** — bottom sheet on mobile, centered
  dialog on desktop.
  - `# research(2026-06)`: bottom sheets win on small screens; dialogs/side-sheets
    on wide (NN/g, Material 3). A compact list of all sections beats inline up/down
    on tall sections (reorder without a scroll war).
- **Remove = hide + restore** (non-destructive). Hidden sections keep their
  content, grey out in the manage list, and can be shown again. Rationale: periplus
  is a "fork your trip" template; destroying a whole section's data on one tap is
  unforgiving, and a hidden flag round-trips cleanly in export.

## Data model
- `SECTION_DEFS`: derived from `.toc-inner a` -> `[{id, label}]` (default order +
  labels; the 12 nav targets map 1:1 to `<main> > section[id]`).
- `TRIP.layout = { order: [id...], hidden: [id...] }`. Lives inside `TRIP` so it
  round-trips through the existing export/import (`JSON.stringify(TRIP)`).
- Persisted on-device under `periplus.sections.v1` (sibling of the edits/arrays/
  trip keys). `normalizeLayout()` reconciles a saved layout against `SECTION_DEFS`
  (drops unknown ids, appends new ones) so the app survives a future section
  add/rename.

## Apply
`applyLayout()` reorders `<main>`'s `<section>` children and the matching
`.toc-inner` links to `TRIP.layout.order`, and toggles the `hidden` attribute on
both for ids in `TRIP.layout.hidden`. Runs on load, after import, and after every
manage-sheet change.

## Integration points (`noCodeEditing` IIFE)
- The edit bar gains a **Sections** button that opens the sheet.
- `importTrip()`: after `renderAll()`, normalize + persist + `applyLayout()` so an
  imported trip's layout wins.
- Reset also clears `periplus.sections.v1`.

## Tests (`tests/sections.spec.js`, Playwright)
List shows 12 rows; move-up reorders `<main>` and the TOC together; the change
persists across reload; hide removes a section and its TOC link and persists; show
restores it; export JSON contains `layout.order` / `layout.hidden`.

## Out of scope (YAGNI)
Drag-to-reorder (possible later polish), per-breakpoint orders, hiding the pinned
hero.
