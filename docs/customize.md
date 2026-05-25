# Customize

Periplus is built to fork. All the trip-specific data lives in one `TRIP` config block near the top of the app's `<script>`. Change it and the app is yours.

## Fork and edit

1. Fork the [repo](https://github.com/ajbarea/periplus) and open `app/index.html`.
2. Find the `const TRIP = { … }` block and edit the `food` and `outdoor` arrays:

```js
const TRIP = {
  food: [
    {
      name: "Your Spot",
      cat: "sandwich",                 // matches the filter chips
      meta: "Sandwich · Your City",
      note: "What to order.",
      text: "your spot search keywords", // what search matches
      maps: "Your Spot, 123 Main St, Your City, ST", // Directions destination
    },
    // …
  ],
  outdoor: [ /* parks, hikes, beaches, museums (same shape) */ ],
};
```

3. Each entry's `maps` field is the destination for its **Directions** link. `cat` matches the filter chips; `text` is what the search box matches against; `warn` (optional) renders a small caution badge.
4. Commit and push; the site and app redeploy automatically.

That's the whole edit surface: no build, no framework, no backend.
