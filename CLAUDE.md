# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll 4.4.x static site for the SITCON 2026 Ruby Taiwan booth challenge game. Uses Minima theme, jekyll-feed plugin, Tailwind CSS v4 (via `tailwindcss-ruby`), and Ruby 4.0 WebAssembly for in-browser Ruby execution.

## Common Commands

```bash
# Install dependencies
bundle install

# Start local development server (auto-reloads on file changes, except _config.yml)
bundle exec jekyll serve

# Build the site to _site/
bundle exec jekyll build

# Production build (Tailwind CSS will be minified)
JEKYLL_ENV=production bundle exec jekyll build
```

> Note: `_config.yml` changes require a server restart — they are not auto-reloaded.

## Architecture

### Key Files

- `_config.yml` — site-wide settings; also holds `listmonk_list_uuid` for the subscription API
- `index.html` — main challenge page (4-phase game flow)
- `_data/tasks.yml` — Ruby challenge task bank (easy/medium/hard, 15 tasks)
- `_layouts/challenge.html` — layout for the challenge page; loads qrcode.min.js and ruby-wasm browser.umd.js
- `_includes/cover.html` — Ruby Taiwan cover section SVG artwork
- `_includes/cover-styles.html` — CSS for the cover section

### Assets

- `assets/ruby-wasm/browser.umd.js` — Ruby 4.0 WASM JS bridge (`@ruby/4.0-wasm-wasi@2.8.1`); exposes `window["ruby-wasm-wasi"]`
- `assets/ruby-wasm/ruby+stdlib.wasm` — Ruby 4.0 WASM binary (~31MB)
- `assets/js/qrcode.min.js` — `qrcode-generator` UMD bundle; exposes `window.qrcode(typeNumber, errorLevel)`
- `assets/images/rubytw_logo.png` — Ruby Taiwan logo (used in Canvas scorecard)

### Challenge Game Flow (index.html)

4-phase single-page flow, controlled by `switchPhase(name)`:

1. **quiz** — 10 questions in difficulty gradient (3 easy → 5 medium → 2 hard), drawn from `_data/tasks.yml`. Max 3 attempts per question; reveals answer on failure.
2. **result** — HTML Canvas 1080×1080 scorecard with logo; Web Share API for IG sharing (falls back to download).
3. **form** — Collects name, email, phone, school; POSTs to listmonk (`/api/public/subscription`). Failure is non-blocking.
4. **proof** — Completion certificate with QR code, proof code (`RUBY-{score:02d}-{hash8}`), shimmer animation, live clock.

### Task Bank (`_data/tasks.yml`)

Each task has:
- `category`, `difficulty` (`easy`/`medium`/`hard`)
- `secret_type`: `integer` | `odd_integer` | `string` | `array`
- `secret_range`, `secret_pool`, `array_length`, `element_range` (depending on type)
- `question` — use `{secret}` (single braces) as placeholder; `{{secret}}` would be processed by Liquid
- `answer` — the Ruby method/operator (e.g. `.next`, `* 2`)
- `tips` — array of `{ code, desc }` hint items

`EXPECTED_MAP` in `index.html` maps each `answer` string to a JS lambda for answer verification without `eval`.

### listmonk Integration

- API endpoint: `/api/public/subscription` (same-origin when deployed at `edm.ruby.tw/sitcon2026`)
- List UUID configured in `_config.yml` as `listmonk_list_uuid`, injected into JS via `{{ site.listmonk_list_uuid }}`
- Deployment at `edm.ruby.tw/sitcon2026` requires `baseurl: "/sitcon2026"` in `_config.yml`

## Tailwind CSS

Tailwind CSS v4 via `tailwindcss-ruby` gem and a Jekyll `post_write` hook.

- `_css/input.css` — Tailwind source (`@import "tailwindcss"`, `@source` directives; `_` prefix keeps Jekyll from processing it)
- `_plugins/tailwindcss.rb` — runs Tailwind CLI after every Jekyll write cycle
- Output: `_site/assets/css/tailwind.css` (generated, not committed)

Tailwind v4 has no `tailwind.config.js`; all config lives in `_css/input.css`.

## Liquid / JS Template Gotcha

Jekyll processes `{{ }}` inside `<script>` blocks. Use `{secret}` (single braces) as JS/YAML placeholders that Liquid won't touch. Only use `{{ }}` for intentional Jekyll injections (e.g. `{{ site.data.tasks | jsonify }}`).
