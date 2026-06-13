# Features

Periplus is a single-page progressive web app with no build step and no backend. Everything below runs from one HTML file.

## Offline-first
Open it once with a connection and a service worker caches the whole itinerary. After that it loads instantly and works with no signal: airplane mode, mountain passes, the dead zones along your route.

## Installable
On iOS (Safari → Share → **Add to Home Screen**) or Android, Periplus installs to your home screen with its own icon and launches full-screen, no browser chrome.

## Light & dark
The app follows your phone's light or dark appearance automatically. A top-bar toggle cycles **Auto** (follow the system), **Light**, and **Dark**, and remembers your choice on the device. Printing stays light either way, so a paper copy is clean.

## Tap-to-navigate
Every food spot, hike, beach, and your lodging has a **Directions** link that opens your maps app. A toggle lets you pick **Google** or **Apple** Maps, and your choice is remembered.

## Add to calendar
Every event in the 8-week calendar is an **Add to calendar** link. The same Google/Apple toggle decides whether it opens a pre-filled Google Calendar event or downloads an Apple/ICS file generated on-device, so it works with zero signal too.

## Searchable directories
Filter food by type (sandwiches, BBQ, breakfast, sweet) or the outdoors by category (parks, hikes, beaches, museums), or search by name. Filtering is instant and shows a live count of how many spots match. Each directory carries its own Google/Apple directions toggle.

## Live "today" widget
A status chip counts down to your trip, then tracks which day you're on and what's coming next, reading from the itinerary's activity map.

## Persistent checklists
Pre-trip prep and packing checklists remember what you've ticked off, saved locally on your device.

## Edit in the browser
Tap **Edit** and the whole page becomes editable — no code, no redeploy. Change any text in place, and add, remove, or reorder entries: food and outdoor spots, intel, contacts, trip anchors, the plans inside each week, checklist items, timeline steps, and whole weeks or checklist groups. Changes save to your device and survive a reload; **Reset** restores the built-in itinerary.

## Export and import
**Export** copies your whole trip as JSON to back up or share; **Import** pastes one back in. That exported JSON is also the `TRIP` block a fork uses, so you can plan a trip visually, export it, and drop it into your own fork to make it permanent. It all happens on-device, with no upload.
