# hanlinsoftware.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the portfolio repo into the Hanlin Software studio site (products-first home, three product pages, About page) served from `public/` on Cloudflare Pages, with cph5236.github.io redirecting.

**Architecture:** Plain static HTML + Bootstrap 5.3 (vendored). All published files live in `public/`; `wrangler.toml` sets `pages_build_output_dir = "public"`. Root-level `index.html`/`404.html` are GitHub Pages redirect stubs. Shared nav/footer markup is duplicated per page. Studio styles in `public/assets/css/studio.css`; each product has its own stylesheet scoped by a body/section class.

**Tech Stack:** HTML, CSS, vanilla JS, Bootstrap 5.3.8 (vendored), Google Fonts, Python 3 + Pillow (image prep), Playwright MCP (visual checks).

**Spec:** `docs/superpowers/specs/2026-11-19-hanlinsoftware-design.md`

## Global Constraints

- Static only; no build step, no bundler, no new JS libraries.
- Use root-absolute URLs (`/assets/...`, `/cv.pdf`) in all new/moved pages so they work at any depth.
- Contact email everywhere: `hanlinsoftwareSWS@gmail.com` (mailto). Nav: logo · Products · About · Contact.
- Logo text `]-[anlin.software_`, JetBrains Mono 600; `]-[` weight 800, letter-spacing -0.12em; brackets in accent; `.software` opacity .55; cursor blinks, static under `prefers-reduced-motion`.
- Studio accent `#f5b43a`; studio frame dark only (`data-bs-theme="dark"`), no toggle.
- Brewery: name "Craft Brewery Simulator"; button "Coming soon to Steam"; Steam URL in one place (`data-steam-url` attribute on body, empty = coming soon); no price; copy only from BrwerySim `SteamStore/README.md` and `docs/marketing/store-text.md`.
- Heap links: `https://heapgame.com/play`, `https://play.google.com/store/apps/details?id=com.hanlinsoftware.heapgame.app`, `https://hanlinsoftware.itch.io/heap`, `https://heapgame.com`. No App Store.
- Simple Weather links: `https://cph5236.github.io/SimpleWeatherService/`, `https://play.google.com/store/apps/details?id=com.cph5236.simpleweatherservice`.
- Personal phone number removed from the site.
- Images ≤ ~300 KB each, every `<img>` has `alt`, `loading="lazy"` below the fold.
- No push to remote; commit locally only (Connor reviews before push).

## Review Focus

1. Deep links into old paths (`/ApiBuilder/api-builder.html`, `/cv.pdf`, `/#projects`) on github.io → must land on the same path at hanlinsoftware.com. Test in Task 1.
2. Repo internals (`CLAUDE.md`, `README.md`, `package.json`, `docs/`, `wrangler.toml`) must not be under `public/`. Checked by `tools/check_site.py` (Task 1).
3. Phone-width (375px) layout: bands stack, no horizontal scroll, nav usable. Checked by screenshots in Task 7.
4. Broken relative paths after moving pages one directory deeper (About, product pages, CV modal). Checked by `tools/check_site.py` link crawl.
5. Readability of text over product art (contrast). Checked visually in Task 7 at each band.

---

### Task 1: Restructure into `public/`, Cloudflare config, GitHub Pages redirect, site checker

**Files:**
- Move (git mv): `index.html`, `ApiBuilder/`, `assets/`, `cv.pdf` → `public/`
- Create: `wrangler.toml`, root `index.html` + `404.html` (redirect stubs), `tools/check_site.py`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `python3 tools/check_site.py` → exit 0 when: every local `href`/`src` in `public/**/*.html` resolves to a file in `public/` (root-absolute resolved against `public/`, relative against the page's dir, `/foo/` → `foo/index.html`); every `<img>` has non-empty `alt`; none of the forbidden names exist under `public/` (`CLAUDE.md`, `README.md`, `package.json`, `package-lock.json`, `docs`, `wrangler.toml`, `node_modules`, `.claude`). Prints each failure as `FAIL <page>: <reason>`.

- [ ] Write `tools/check_site.py` (stdlib `html.parser`); ignore `http(s):`, `mailto:`, `tel:`, `#…` links and strip `?query`/`#hash`.
- [ ] `git mv` the public files into `public/`; run checker → expect PASS (existing pages use relative paths).
- [ ] `wrangler.toml`: `name = "hanlinsoftware"` (comment: must match the Pages project name — confirm in dashboard), `pages_build_output_dir = "public"`.
- [ ] Root redirect stubs: `<meta http-equiv="refresh" content="0; url=https://hanlinsoftware.com/">`, `<link rel="canonical" href="https://hanlinsoftware.com/">`, script `location.replace('https://hanlinsoftware.com' + location.pathname + location.search + location.hash)`; `404.html` identical (GitHub Pages serves it for unknown paths, so deep links carry their path). Visible fallback link.
- [ ] Verify stub logic: `python3 -m http.server` at repo root, Playwright to `/ApiBuilder/api-builder.html?x=1#y` with the redirect target swapped to read the computed URL (evaluate the expression in page) → `https://hanlinsoftware.com/ApiBuilder/api-builder.html?x=1#y`.
- [ ] Commit: `Move site into public/ for Cloudflare Pages; add github.io redirect stubs`

### Task 2: Studio brand assets and shared frame

**Files:**
- Create: `public/assets/css/studio.css`, `public/assets/img/brand/logo.svg`, `logo.png` (1200 wide, dark bg), `og-default.png` (1200×630), `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `tools/make_brand.py`

**Interfaces:**
- Produces CSS classes: `.studio-nav`, `.studio-logo` (contains `.bh` with `.br` brackets, `.dim`, `.cur`), `.studio-footer`, CSS vars `--studio-accent:#f5b43a`, `--studio-bg:#0f1115`, `--studio-panel:#171a20`, `--studio-text:#e9ebf0`, `--studio-muted:#a3a8b4`.
- Canonical nav markup (copy verbatim into every page; `aria-current="page"` on the current item):
  `<nav class="studio-nav"><a class="studio-logo" href="/" aria-label="Hanlin Software home"><span class="bh"><span class="br">]</span>-<span class="br">[</span></span><span class="long">anlin<span class="dim">.software</span></span><span class="cur" aria-hidden="true"></span></a><div class="studio-links"><a href="/#products">Products</a><a href="/about/">About</a><a href="mailto:hanlinsoftwareSWS@gmail.com">Contact</a></div></nav>`
  Below 480px `.long` is hidden (logo collapses to `]-[_`).
- Canonical footer: email as visible mailto text, About link, `© 2026 Hanlin Software`.
- Every page `<head>` includes favicon links (`/assets/img/brand/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`), Google Fonts JetBrains Mono 400;600;800.

- [ ] `tools/make_brand.py` (Pillow): render PNGs using JetBrains Mono TTF downloaded to scratch (Google Fonts GitHub repo) — logo.png, og-default.png (logo centred + "Games & apps" line), favicon-32, apple-touch-icon (amber rounded tile, dark `]-[`). SVGs hand-written with `<path>` glyphs is overkill: `favicon.svg` uses `<text>` with font-family monospace fallback is acceptable since glyphs are ASCII; `logo.svg` embeds the font as base64 `@font-face` subset (or references PNG) — builder's choice, must render without webfont.
- [ ] Write `studio.css` (nav sticky, footer, logo, cursor blink keyframes + reduced-motion).
- [ ] Look at the PNGs (Read tool) to confirm they render correctly.
- [ ] Commit: `Add Hanlin Software logo, favicons and studio frame styles`

### Task 3: About page (portfolio moved)

**Files:**
- Create: `public/about/index.html` (from current `public/index.html`)
- Modify: `public/assets/js/nav.js` (CV path `'/cv.pdf'`), `public/ApiBuilder/api-builder.html` (back link → `/about/#projects`, add studio favicon)

- [ ] Copy portfolio markup to `about/index.html`; root-absolute asset paths; replace navbar with studio nav (About current) — keep in-page section buttons (About/Skills/Projects/CV) as a secondary sub-nav so `nav.js` still works; add studio footer.
- [ ] Remove `tel:` link. Update GitHub link to `https://github.com/cph5236`.
- [ ] Projects keep SessionM, API Builder (`/ApiBuilder/api-builder.html`), Simple Weather Service (also link `/simple-weather/`).
- [ ] Run checker → PASS; Playwright: open `/about/`, click CV → embed src ends with `/cv.pdf`.
- [ ] Commit: `Move portfolio to /about/ inside studio frame`

### Task 4: Product assets

**Files:**
- Create: `public/assets/img/brewery/*`, `public/assets/img/heap/*`, `public/assets/img/weather/*`, `tools/fetch_assets.sh` (documents sources; LFS batch download for BrwerySim)

- [ ] Brewery (BrwerySim@M6-int `SteamStore/`): `web/keyart/keyart_craft_brewery_1920x1080.jpg`, `web/keyart/keyart_brewhouse_1920x1080.jpg`, `web/title-screen/title_screen_1920x1080.jpg`, all 8 `web/screenshots/*.jpg`, `logo/craft-brewery-simulator-logo-1024.png`. Resize hero to 1920w q80, screenshots to 1280w q80 + 640w thumbs.
- [ ] Heap (HeapGame@main): `assets/play-event/grand-opening-clean.jpg`, `assets/icon-only.png` → 256px, `assets/play-listing/01..07*.png` → 540w JPEG/WebP-free JPEG q82. Also fetch heapgame.com logo/wordmark if one exists.
- [ ] Simple Weather: inspect `cph5236/SimpleWeatherService` for icon/screens and its CSS palette; if none, Playwright screenshot of the live web app at 390×844 (2 screens) and desktop.
- [ ] Save brewery `store-text.md` copy to scratch for Task 6 (not into public).
- [ ] Verify all images ≤ 300 KB (`find public/assets/img -size +300k` empty).
- [ ] Commit: `Add product art for Brewery Simulator, Heap and Simple Weather`

### Task 5: Studio homepage

**Files:**
- Create: `public/index.html` (replace portfolio copy), `public/assets/css/products.css` (band styles: `.band-brewery`, `.band-heap`, `.band-weather`)

- [ ] Head: title "Hanlin Software — games & apps", meta description, OG image `og-default.png`, fonts for all three products (Alfa Slab One, Nunito; JetBrains Mono).
- [ ] Hero: logo large, one line ("An independent studio making games and apps."), button to `#products`.
- [ ] `<section id="products">`: three bands in order Brewery, Heap, Weather — each: art (image half / text half, alternating sides on desktop, stacked on mobile), name/logo, 1–2 line teaser, store buttons, `More →` to `/brewery-simulator/`, `/heap/`, `/simple-weather/`. Brewery Steam button: disabled-look "Coming soon to Steam".
- [ ] Studio footer. Checker PASS.
- [ ] Commit: `Studio homepage with product bands`

### Task 6: Product pages

**Files:**
- Create: `public/brewery-simulator/index.html`, `public/heap/index.html`, `public/simple-weather/index.html`, `public/assets/css/product-brewery.css`, `product-heap.css`, `product-weather.css`, `public/assets/js/steam.js` (reads `body[data-steam-url]`; if set, turns `.steam-btn` into "Wishlist on Steam" links)

- [ ] Each page: studio nav + footer (slim), themed hero (key art bg, logo, primary button), pitch, feature sections, screenshot gallery (`<a href=full><img src=thumb>` grid — no lightbox), links/support row, OG image = that product's key art, meta description from its store text.
- [ ] Brewery: long-description section headers from `store-text.md`; Early Access note if stated there; palette/fonts per spec; gallery list in a single `<ul class="gallery">` for easy swapping; comment noting screenshots are preview-only.
- [ ] Heap: heapgame.com palette (bg `#1a1a1a`, accent `#f5a02a`, mint `#6ee7a0`), monospace; Play Store feature sections; phone-shaped portrait gallery; buttons Play in browser / Google Play / itch.io; link to heapgame.com and accessibility page.
- [ ] Simple Weather: palette from Task 4 findings; Web app + Google Play buttons.
- [ ] Checker PASS.
- [ ] Commit per page.

### Task 7: Security headers, CVE check, docs, visual verification

**Files:**
- Create: `public/_headers`, `docs/cloudflare-setup.md`, `docs/superpowers/2026-11-19-cve-report.md`
- Modify: `CLAUDE.md`, `README.md`, `package.json` (only if a version bump is needed)

- [ ] `_headers` for `/*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. CSP: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src *; frame-src 'self'; object-src 'self'` — `connect-src *` because API Builder fetches arbitrary URLs; `object-src/frame-src 'self'` for CV `<embed>`. Check no inline `<script>` exists in public pages (move any into files) and inline `style=` attrs are covered by `'unsafe-inline'`.
- [ ] CVE: `npm audit`; check Bootstrap 5.3.8 / Popper 2.x versions in vendored files vs GitHub Advisory DB (`gh api /advisories?ecosystem=npm&affects=bootstrap`) and latest npm versions (`npm view bootstrap version`); write report; update vendored files if a newer patched version exists.
- [ ] `docs/cloudflare-setup.md`: add www custom domain + redirect to apex (Bulk Redirect or Redirect Rule), confirm build output picks up `wrangler.toml` (Settings → Builds shows output `public`), branch preview URLs (`<branch>.<project>.pages.dev`), post-merge verification list (spec Launch order step 4).
- [ ] Update `CLAUDE.md` + `README.md` for new structure (public/, studio pages, duplicated nav rule, no theme toggle, check_site.py).
- [ ] Playwright from `python3 -m http.server -d public`: screenshot `/`, `/brewery-simulator/`, `/heap/`, `/simple-weather/`, `/about/`, `/ApiBuilder/api-builder.html` at 1440 and 375 widths; check `document.documentElement.scrollWidth <= innerWidth` at 375; check console errors (CSP not testable locally — note it).
- [ ] Fix issues; commit: `Security headers, CVE report, docs`
