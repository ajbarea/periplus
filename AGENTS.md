# Periplus

Periplus is an offline-first, installable travel-itinerary planner: one static, hand-written `app/index.html`, plus a Zensical docs site. Humans start with [README.md](README.md).

## Commands

`make help` lists every target. Before a PR:

- `make setup` installs Node and Python dependencies
- `make test` runs the Playwright e2e suite (the `e2e` check); the first run needs `npx playwright install chromium`
- `make build` builds the docs site into `site/`

`make serve` and `uv run zensical serve` start servers: run them only when the task says to.

## Rules

- Work in a git worktree and open a pull request; `main` is protected (required checks: `e2e`, `pin-check` and the docs `build`).
- Never commit `COMMITS.md` (a local scratchpad).
- The app stays zero-dependency and single-file: all trip content lives in the `TRIP` block of `app/index.html`. Weigh any library against that invariant (ROADMAP, Invariants).
- Design notes, specs and plans go in `planning/`, never `docs/`: Zensical publishes everything under `docs/` to the public site.
- The service worker (`app/sw.js`) is scoped to `/app/` so it never caches the docs site.
- Bump `CACHE` in `app/sw.js` with every change under `app/`, so installed copies drop the old shell.
- Pin every GitHub Actions `uses:` ref to a full commit SHA; `pin-check` enforces it.
- Take test counts from the specs in `tests/*.spec.js`, and the service-worker cache version from the `CACHE` constant in `app/sw.js`, never from prose.

## State

`IMPL.md` holds the current slice and next step; `ROADMAP.md` the long view.
`.claude/skill-context.md` holds the facts the techne skills read for this repo.
