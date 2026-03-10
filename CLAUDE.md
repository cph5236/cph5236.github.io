# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio website (Connor Hanlin) hosted on GitHub Pages. There is no build system, bundler, or package manager — all files are served directly as-is.

To develop locally, just open `index.html` in a browser or use a simple static server:
```bash
python3 -m http.server 8080
```

## Architecture

**Single-page portfolio** (`index.html`) with sections: About, Skills, Projects, and CV (PDF modal).

- **Bootstrap 5.3** (CDN) handles layout, theming (`data-bs-theme`), and the resume modal.
- **`assets/css/custom.css`** — All custom styles. Uses Bootstrap CSS variables (`--bs-*`) for automatic light/dark mode compatibility. Accent color is golden yellow (`#ffc107`, `--accent-color`).
- **`assets/js/theme.js`** — Reads/writes `localStorage('bsTheme')` and sets `data-bs-theme` on `<html>`. Loaded before `nav.js`.
- **`assets/js/nav.js`** — Handles nav button active states, smooth scroll to sections, hash-based deep linking, and opens the resume modal (loads `cv.pdf` lazily into an `<embed>`).

**Theme system**: Light/dark mode is toggled via radio buttons in the navbar. The theme is stored in `localStorage` as `'light'` or `'dark'` and applied as `data-bs-theme` on the root `<html>` element. Bootstrap's built-in CSS variables do the rest automatically.

## API Builder (`ApiBuilder/api-builder.html`)

A completed, browser-based Postman-like API request builder. Entirely client-side — no backend or install required.

**Technologies:** Vanilla JavaScript, Bootstrap 5.3, Fetch API, localStorage

**Key files:**
- `ApiBuilder/api-builder.html` — page markup
- `assets/js/api-builder.js` — main app logic (UI, request building, sending, response rendering)
- `assets/js/api-storage.js` — localStorage manager (key: `apiBuilderData`)
- `assets/css/api-builder.css` — page-specific styles

**Capabilities:** folder/request organization; GET/POST/PUT/DELETE with headers, params, and JSON body; Fetch-based request execution with timeout handling; color-coded response viewer (status, headers, body, time); JSON export/import (merge or replace); full light/dark theme support.

**Conventions:**
- New page files go in the root; JS in `assets/js/`, CSS in `assets/css/`
- Shares the same theme system (`data-bs-theme` on `<html>`) and accent color as the main portfolio
- Data model: folders array containing requests, each with id, name, method, url, headers, params, body

## Model Selection Strategy

Claude Code supports running different Claude models for different tasks. Route work to maximize efficiency:

- **Opus** — Architecture, planning, design decisions. Use when the task requires weighing multiple approaches or designing a complex feature.
- **Sonnet** — Implementation, code review, refactoring. Use for writing and modifying code with full context.
- **Haiku** — File searches, formatting, simple edits, mechanical tasks. Use for grunt work; keeps main session lean and token burn low.

**For subagents:** File exploration and codebase searches naturally delegate to Haiku. The planning phase (Opus) is upfront investment that makes implementation (Sonnet) straightforward.

## Conventions

- No linting or test tooling exists; validate by opening in a browser.
- All styling uses Bootstrap utility classes first; only add to `custom.css` for things Bootstrap can't do.
- Use `var(--bs-*)` CSS variables (not hardcoded colors) to ensure light/dark mode works automatically.
- Nav buttons use `data-target` attribute to identify their scroll target or action.
