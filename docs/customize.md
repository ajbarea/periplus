# Customize

Periplus is built to fork. The trip's content lives in a `TRIP` config block near the top of the app's `<script>` in `app/index.html`. Edit it, commit, and the site and app redeploy.

## What's in TRIP
One config object drives the structured content:

- `TRIP.title` / `TRIP.subtitle`: the hero heading
- `TRIP.overview`: the at-a-glance KV cards
- `TRIP.food` / `TRIP.outdoor`: the searchable directories (each entry has a `maps` field for its Directions link)
- `TRIP.intel`: the color-coded "critical intel" cards
- `TRIP.anchors`: the multi-night trip anchors
- `TRIP.weeks`: the week-by-week plan (with the dates the calendar auto-expands on)
- `TRIP.contacts`: the key-contacts grid

Each is an array of plain objects. Add, remove, or edit entries and the page re-renders. No build, no framework, no backend.

## Example
```js
TRIP.food = [
  {
    name: "Your Spot",
    cat: "sandwich",                 // matches the filter chips
    meta: "Sandwich · Your City",
    note: "What to order.",
    text: "search keywords",         // what search matches
    maps: "Your Spot, 123 Main St, Your City, ST", // Directions destination
  },
  // ...
];
```

## The rest
A few one-off sections (the arrival drive schedule, the Day-1 hour-by-hour, venue logistics, and the pre-trip and packing checklists) are plain HTML in `app/index.html`; edit those in place. The calendar grid reads its dates from the constants at the top of the `<script>`.
