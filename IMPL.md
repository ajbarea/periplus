# Periplus — Implementation scratchpad

In-flight work and the immediate next pickup. Long-horizon plan lives in
[ROADMAP.md](./ROADMAP.md); design history under [`planning/`](./planning/).
Git history is the permanent record.

## In flight

Nothing open.

## Next pickup

- **Pre-trip demo-data freshness pass.** The live demo is a real, dated itinerary, so its
  time-sensitive content should be re-verified before it goes stale: Blue Ridge Parkway
  post-Helene milepost closures (the Asheville Jul 3-5 stretch), 2026 venue openings
  (Common Market at Seaboard Station, Lewis BBQ), and volatile hours / beach parking.
  Keeps the public demo accurate and is the kind of refresh any forked trip needs.
- **Offline-maps spike (optional).** See ROADMAP → Later. Weigh hard against the
  zero-dependency / single-file invariant before committing — it's a deliberate call.

## Notes

- **Content port complete + verified (2026-05-27).** The original single-file itinerary
  (`AJ_NC_Summer_Residency_2026.html/.md`, the pre-periplus source) is faithfully carried
  by the `TRIP` block: directories with orders/addresses/moved-closed + hours warnings,
  the drive-day and Day-1 hour-by-hour timelines, the 9-category packing checklist, the
  Helene backup hikes, and the intel cards. The original is superseded history.
