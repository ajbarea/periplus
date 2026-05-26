# Customize

Periplus is built to fork. The trip's content lives in a `TRIP` config block near the top of the app's `<script>` in `app/index.html`. Edit it, commit, and the site and app redeploy.

## What's in TRIP
One config object drives the structured content:

- `TRIP.title` / `TRIP.subtitle`: the hero heading
- `TRIP.overview`: the at-a-glance KV cards
- `TRIP.intel`: the color-coded "critical intel" cards
- `TRIP.calendar`: the 8-week calendar — `weekNotes` plus dated `events`; every event renders as an "add to calendar" link (Google Calendar or Apple, user-toggle)
- `TRIP.weeks`: the week-by-week plan (the current week auto-expands)
- `TRIP.arrival` / `TRIP.dayOne`: the arrival-drive and Day-1 hour-by-hour timelines
- `TRIP.anchors`: the multi-night trip anchors
- `TRIP.venue`: venue logistics (commute, host, dress code)
- `TRIP.pretrip` / `TRIP.packing`: the collapsible setup and packing checklists (each section is an array of `{ id, label }` items)
- `TRIP.food` / `TRIP.outdoor`: the searchable directories (each entry has a `maps` field for its Directions link)
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

## Tap-to-navigate and add-to-calendar
Every directory spot has a **Directions** link and every calendar event an **Add to calendar** link. Both honor a Google/Apple toggle the visitor sets once (stored locally): the same `maps` field drives Google or Apple Maps, and the calendar event's date/title/location drive a Google Calendar deep-link or an offline-generated Apple/ICS download. Nothing leaves the device until the visitor taps a link.
