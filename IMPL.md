# Periplus — Implementation scratchpad

In-flight work and the immediate next pickup. Long-horizon plan lives in
[ROADMAP.md](./ROADMAP.md); design history under [`planning/`](./planning/).
Git history is the permanent record.

## In flight

Nothing open.

## Next pickup

- **Offline maps (PMTiles + MapLibre)** — **accepted by AJ 2026-05-27, scheduled for
  after the NC trip (post-May 31).** A knowingly-accepted exception to the zero-dep /
  single-file invariant. See ROADMAP → Later for the approach + research links.

## Notes

- **Content port complete + verified (2026-05-27).** The original single-file itinerary
  (`AJ_NC_Summer_Residency_2026.html/.md`, the pre-periplus source) is faithfully carried
  by the `TRIP` block: directories with orders/addresses/moved-closed + hours warnings,
  the drive-day and Day-1 hour-by-hour timelines, the 9-category packing checklist, the
  Helene backup hikes, and the intel cards. The original is superseded history.
- **Pre-trip iOS standalone hardening (2026-05-29).** Fixed the installed-app status bar
  (`black-translucent` → `default`: white-on-light glyphs were unreadable) and added
  `env(safe-area-inset-*)` padding so the topbar / edit-bar clear the notch & home indicator
  under `viewport-fit=cover`; rounded the manifest to 2026 PWA guidance (`lang`/`dir`/`launch_handler`);
  SW cache v8 → v9. See ROADMAP → Done. Verified: 27 e2e green + a live iPhone-width render of the
  now-card (reads "In 2 days / Trip begins Sun, May 31").
- **Now-card trip-day hardening (2026-05-29).** Found + fixed an off-by-one in the trip
  active-window: the status chip / now-card flipped to "Trip complete" at midnight of the
  checkout day instead of staying live through it, and "Day 56 of 56" was unreachable.
  Clamped the end bound to end-of-day, derived the 56-day length from the trip dates (was
  hardcoded in two spots), and added `tests/now-card.spec.js` — clock-mocked pre/live/post
  coverage the now-card never had. 35 e2e green, SW v13. See ROADMAP → Done.
- **Pre-trip freshness pass (2026-05-27).** Web-verified the time-sensitive itinerary facts
  before the residency. Real corrections: I-95 itself isn't closed (only the NC-50 bridge at
  Benson Exit 79 is, May 28-~Jul 12), so the avoid-I-95 note was reframed; Wrightsville Beach
  parking moved from ParkMobile to PivotGO! / Pivot Parking; The Common Market slipped to
  later-2026 (807 Halifax St), likely closed during the stay; Lewis BBQ is at Raleigh Iron
  Works' Salvage Yard with no open date yet. Confirmed and sharpened: Blue Ridge Parkway stays
  closed MP 317-355 (Linville Falls to Mt. Mitchell) through ~end 2026 per NPS, so the Jul
  backups (DuPont, Graveyard Fields) are required; Biltmore Luminere is real (select evenings
  Mar 26 to Oct 18, 2026). Sources in the commit message.
