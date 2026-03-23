# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll static site for the SITCON 2026 booth. It uses Jekyll 4.4.x with the Minima theme, jekyll-feed plugin, and Tailwind CSS v3 (via `tailwindcss-ruby`).

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

# Serve with drafts and future-dated posts visible
bundle exec jekyll serve --drafts --future
```

> Note: `_config.yml` changes require a server restart — they are not auto-reloaded.

## Architecture

- `_config.yml` — site-wide settings (title, URL, plugins)
- `_posts/` — blog posts, named `YYYY-MM-DD-title.markdown`
- `index.markdown` — homepage using `layout: home`
- `about.markdown` — about page
- `404.html` — custom 404 page
- `_site/` — generated output (gitignored)

Layouts and includes come from the bundled `minima` gem. To override, create matching files under `_layouts/`, `_includes/`, or `_sass/`.

## Tailwind CSS

Tailwind CSS v4 is integrated via `tailwindcss-ruby` gem and a Jekyll `post_write` hook.

- `_css/input.css` — Tailwind source; uses `@import "tailwindcss"` and `@source` to specify scanned paths (prefixed with `_` so Jekyll ignores it)
- `_plugins/tailwindcss.rb` — runs Tailwind CLI after every Jekyll write cycle
- Output: `_site/assets/css/tailwind.css` (generated, not committed)
- `_includes/custom-head.html` — injects the CSS link (Minima's official extension point)

Tailwind v4 has no `tailwind.config.js`; all configuration lives in `_css/input.css` via `@source`, `@theme`, and `@plugin` directives.

In production (`JEKYLL_ENV=production`), the output CSS is minified automatically.
