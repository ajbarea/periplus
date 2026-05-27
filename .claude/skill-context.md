# skill-context — periplus

Repo-specific facts for the canonical techne skills. Injected into each skill at
invocation. Update on toolchain / path / tooling changes.

## repo

- name: periplus
- kind: offline-first, installable PWA + Zensical docs site. The app is a single
  zero-dependency static file (`app/index.html` — no build, no framework); all trip
  content lives in its `TRIP` config block.
- languages: JavaScript (the app + Playwright specs + `scripts/*.mjs` asset gen),
  Python (docs toolchain only — Zensical, via uv).
- package_root: none — there is no importable package; the app *is* `app/index.html`.
- no Makefile / dev-runner harness — validate with npm + uv directly (see `## audit`).
- hosting: one GitHub Pages deploy (`docs.yml`); docs at site root, app copied to
  `/app/` with its service worker scoped there so it never caches the docs.
- has: PWA service worker, Playwright e2e, Zensical docs. No backend, no runtime deps.

## audit

periplus has no `make` targets and no `logs/dev-*.log` archive, so `/techne:audit`'s
make-target + log-reconciliation model does not apply. Validate directly:

- `npm ci` then `npx playwright install --with-deps chromium` — test deps.
- `npm test` (= `playwright test`) — the gate. e2e specs in `tests/*.spec.js`
  (baseline, directions, editing, offline, pwa).
- `uv sync --group dev --frozen` then `uv run zensical build --clean` — docs build smoke.
- `npm run icons` (`scripts/gen-icons.mjs`, sharp) regenerates PWA icons; `scripts/gen-og.mjs` the OG image.

Do-not-run (serve / long-running): `npm run serve` (http.server), `uv run zensical serve`.

## ci_audit

Workflows:
- `test.yml` — job `e2e`, runs on **every PR** (Playwright). The PR gate.
- `docs.yml` — jobs `build` + `deploy`, **push-to-main only** (does not run on PRs).
- `pin-check.yml` — SHA-pin guard, PR + push.

Configs a CI failure can trace to:
- `package.json` / `package-lock.json`, `playwright.config.js`
- `pyproject.toml` / `uv.lock`, `zensical.toml`, `overrides/`
- `.github/workflows/*.yml`

Tool error markers (extend default grep set): `playwright` (e2e), `zensical` (docs build).
Expected external PR checks: none wired (no codecov, no GitGuardian).

## slop_ground_truth

Sources of truth for quantitative claims:
- e2e count: the specs in `tests/*.spec.js` (the "N e2e" figure in README/ROADMAP must
  match the actual test count — count tests, do not trust a hard-coded number).
- service-worker cache version: the cache-name/version string in the service worker
  inside `app/index.html` (ROADMAP's "SW cache vN" claims trace here).

Any perf / scale / count claim not traceable to the app source or the spec files is slop.

## scan_scope

Skip paths (vendored / generated / out-of-scope):
- `.venv/`, `node_modules/`, `site/`, `.cache/`, `test-results/`
- `docs/assets/`, `uv.lock`, `package-lock.json`

Scan areas:
- App: `app/**` (chiefly `app/index.html`)
- Tests: `tests/*.spec.js`, `playwright.config.js`
- Scripts: `scripts/*.mjs`
- Docs (opt-in): `docs/**/*.md`
- Config/build: `package.json`, `pyproject.toml`, `zensical.toml`, `overrides/**`, `.github/workflows/**`

## docs_site

- config: `zensical.toml`
- workflow: `.github/workflows/docs.yml`
- build_command: `uv run zensical build --clean` (then `cp -r app site/app` places the PWA under `/app/`)
- theme_overrides: `overrides/` (`main.html`, `partials/`)
- site_url: `https://ajbarea.github.io/periplus/`
- topology: docs at root, app at `/app/` (SW scoped to `/app/` — never caches the docs)
- action_pins (expected): all `uses:` SHA-pinned; `pin-check.yml` enforces it.
