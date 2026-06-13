##
## periplus — Makefile
## Single entrypoint over the npm + uv (Zensical) toolchains, matching the
## sister repos. Wraps the existing package.json scripts and the docs build.
##

.PHONY: help setup serve build test icons clean
.DEFAULT_GOAL := help

setup:                  ## Install Node + Python deps (npm ci + uv sync)
	@npm ci
	@uv sync

serve:                  ## Serve locally on http://localhost:5173
	@npm run serve

build:                  ## Build the Zensical docs site (-> site/)
	@uv run zensical build --clean

test:                   ## Run Playwright tests
	@npm test

icons:                  ## Regenerate PWA icons
	@npm run icons

clean:                  ## Remove build + cache + test artifacts (keeps node_modules/, .venv/)
	@rm -rf site/ .cache/ test-results/ playwright-report/

help:                   ## Show this help
	@grep -hE '^[a-zA-Z][a-zA-Z0-9_-]*:.*?##' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-10s %s\n", $$1, $$2}'
