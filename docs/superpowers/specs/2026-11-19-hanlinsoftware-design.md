# hanlinsoftware.com — Design

Date: 2026-11-19 · Repo: `cph5236/cph5236.github.io` · Base branch: `redesign/Design1.0` (not yet merged to `main`)

## Intent

Connor bought **hanlinsoftware.com**. This repo, today Connor's personal portfolio on GitHub Pages, becomes the **Hanlin Software** studio site: a home for its products (games and apps) and a way to get in touch. The portfolio is kept, moved to an About page.

Two kinds of visitor:
- **Business contacts**: want to see what the studio makes and how to reach it.
- **Product users**: arrived looking for one specific app/game; must find it fast and reach its store/download.

Success: a visitor can find any product and its store link within one screen of scrolling, and can find the contact email from any page.

## Goals

1. Host the site at `https://hanlinsoftware.com` on **Cloudflare Pages via Git connection** (same Cloudflare account that hosts Heap).
2. Turn the homepage into a products-first studio site; move the portfolio to an About page.
3. Add **Craft Brewery Simulator** (upcoming Steam game) as a product.
4. Check all dependencies for CVEs and update anything affected.

## Non-goals

- No build system, bundler, or framework. Stays plain static HTML + Bootstrap 5.3 (as today).
- No contact form or backend. Contact is a `mailto:` link only.
- No changes to the Heap, Brewery Simulator, or Simple Weather Service repos.
- API Builder is not a product and is not promoted on the homepage.

## Anti-goals (would be a failure even if it works)

- Products blending into one generic template — each must carry its own look.
- The studio frame competing visually with the products.
- Publishing repo internals (docs, CLAUDE.md, README, package files, `.claude/`) on the live site.
- Breaking existing links to the API Builder or the CV without a redirect.

## Site structure (decided)

Layout **C**: styled product bands on the homepage, each with a dedicated product page.

| Path | Content |
|---|---|
| `/` | Studio home: short intro, one full-width band per product, contact |
| `/brewery-simulator/` | Craft Brewery Simulator product page |
| `/heap/` | Heap product page |
| `/simple-weather/` | Simple Weather Service product page |
| `/about/` | Connor: today's portfolio (experience, education, skills, CV, side projects incl. API Builder) |
| `/ApiBuilder/api-builder.html` | Unchanged location and behavior |

Nav (on every page): logo · **Products** · **About** · **Contact**. "Products" scrolls to the product bands on home (or links to `/#products` from other pages). "Contact" is the email.

**Contact:** `hanlinsoftwareSWS@gmail.com` — the nav "Contact" item is a mailto link; the footer of every page shows the address as visible text (mailto).

**Shared header/footer (Claude's call):** duplicate the markup in each page (no JS includes) so pages work without JS; keep it identical across pages and note in CLAUDE.md that nav/footer changes must be made in every page.

Builder's call: whether pages use folder `index.html` (`/heap/`) or flat files (`/heap.html`); folders preferred for clean URLs.

### Homepage

- **Header/hero:** the logo, a one-line description of the studio ("independent studio making games and apps" or similar — builder's call, keep it short), and a link to the products.
- **Product bands**, in this order: Craft Brewery Simulator, Heap, Simple Weather Service. Each band:
  - is full width and styled in **that product's own** palette, fonts and imagery (see Products);
  - shows the name/logo, a one- or two-line teaser, one image;
  - has the store/play button(s) and a **"More →"** link to its product page.
- **Footer:** contact email, link to About, © Hanlin Software.

### Product pages

Each product page is themed fully in that product's identity (colors, fonts, imagery), with a slim Hanlin Software header/footer so visitors can get back. Content per page: hero (key art + logo + store button), short pitch, feature sections, screenshot gallery, store/platform links, and any support/privacy links that exist. Builder's call on exact section layout.

### About page

Today's portfolio content, largely as-is (hero, education, experience, technical stack, projects, CV modal), restyled to sit inside the Hanlin Software frame. Projects section keeps SessionM, **API Builder**, and Simple Weather Service.

**Contact details (Claude's call, flag to Connor):** remove the personal phone number from the public site. Keep personal email, LinkedIn and GitHub on About only.

## Studio brand (decided)

- **Logo:** `]-[anlin.software_` — JetBrains Mono, semibold. The "H" is built from two brackets and a dash (`]-[`, extra-bold, tight letter-spacing). Brackets in the accent color; `.software` at reduced opacity; on the web the trailing `_` is a blinking block cursor (respect `prefers-reduced-motion` — no blink).
- **Small mark:** `]-[` alone in a rounded-square tile (accent background, dark glyph) — used as favicon and as the nav logo on narrow screens.
- **Accent:** amber (Claude's call; Connor didn't specify). Mockup values: `#f5b43a` on dark, `#c98a12` on light. Builder may tune for contrast; should stay close to the site's existing gold.
- **Studio frame:** dark, neutral, restrained so products stand out. Dark only, no theme toggle — this matches the current `redesign/Design1.0` branch, which is already `data-bs-theme="dark"` with no toggle (CLAUDE.md's toggle description is out of date; update it). Product bands/pages use their own fixed palettes.
- **Static logo files** (Claude's call): produce an SVG (and a PNG) of the logo without the cursor animation, plus favicon sizes, for places that can't animate (social previews, favicon). Fonts must be outlined/embedded in the SVG, or the PNG used, so it renders without the webfont.
- Reference mockups: `.superpowers/brainstorm/101998-1795121752/content/logo-blend-v2.html` (option 1a).

## Products

### Craft Brewery Simulator

- **Name:** always "Craft Brewery Simulator". Town: Oakhaven. Cozy low-poly first-person brewery sim/management, solo or online co-op up to 4. PC/Steam, Early Access planned.
- **Status:** no Steam page/app ID yet. Button reads **"Coming soon to Steam"** (disabled or linking nowhere). When the Steam URL exists, it becomes "Wishlist on Steam". Make the URL a single easy-to-change value.
- **Copy:** approved short description in `BrwerySim/SteamStore/README.md`; long description with section headers in `BrwerySim/docs/marketing/store-text.md`. Use these; don't invent new marketing claims. Don't mention price.
- **Look:** UI palette Paper `#F7EED9`, Cream `#FAF3E0`, Ink `#2B211A`, InkSoft `#6E553C`, Wood `#8A572C`, WoodDark `#4F3017`, Honey `#E3B04B`, Sage `#9CC08A`, Brick `#D05E4A`. Fonts: Alfa Slab One (titles, caps), Nunito (body). Logo fonts Bevan / Barlow Condensed (only needed if using the SVG logo; prefer the PNG).
- **Assets:** private repo `cph5236/BrwerySim`, branch `M6-int`, folder `SteamStore/`. Use `SteamStore/web/` (1920-wide JPGs: key art, title screen, 8 screenshots) and `SteamStore/logo/` (PNG, one-colour cream/stout variants). Hero: `keyart_craft_brewery_1920x1080.jpg`. Files are in **Git LFS** — `git lfs` is not installed on this machine. Verified working: `gh` is authenticated with access to the private repo, and files download via the LFS batch API (`POST https://github.com/cph5236/BrwerySim.git/info/lfs/objects/batch`, basic auth `x:$(gh auth token)`, oid/size from `git show FETCH_HEAD:<path>`). Non-LFS text (`store-text.md`, README) reads normally via `gh`/git. Network access to GitHub and the product sites is available. Copy needed files into this repo (resize/compress as needed; aim < 300 KB per image).
- **Screenshots are "preview only"** — Connor will retake them. Keep the gallery a simple list of files so they can be swapped without touching layout.

### Heap

- Free roguelite climbing platformer on a community-built trash heap. **Platforms: Web (heapgame.com/play), Android (Google Play), itch.io.** Not on the Apple App Store (Connor said App Store; repo/site show Google Play only — assumed he meant Play Store; flag if iOS appears).
- **Links:** Play: `https://heapgame.com/play` · Google Play: `https://play.google.com/store/apps/details?id=com.hanlinsoftware.heapgame.app` · itch.io: `https://hanlinsoftware.itch.io/heap` · Site: `https://heapgame.com` · Accessibility: `https://heapgame.com/accessibility`.
- **Copy:** meta description and Play Store text from `cph5236/HeapGame` (`android/app/src/main/play/listings/en-US/full-description.txt`, `play.html` taglines e.g. "Climb it before it climbs away.").
- **Look:** match heapgame.com — bg `#1a1a1a`, panel `#20202a`, text `#c8c8d2`, accent amber `#f5a02a`, secondary mint `#6ee7a0`, monospace type, dark junkyard/arcade feel. (Note: Heap's amber is close to the studio accent; the band should still read as Heap's — mint + its art help.)
- **Assets** (public repo `cph5236/HeapGame`): hero `assets/play-event/grand-opening-clean.jpg` (1920×1080) or `assets/play-listing/00-feature.png`; icon `assets/icon-only.png`; screenshots `assets/play-listing/01-climb.png`…`07-upgrades.png` (1080×1920 portrait → phone-shaped gallery).
- The page is a showcase that sends players on to heapgame.com; it doesn't replace it.

### Simple Weather Service

- A live Hanlin Software product (Connor listed the portfolio apps as products). Band and page link out to the live web app and Play Store. Existing app: web app `https://cph5236.github.io/SimpleWeatherService/` and Google Play `https://play.google.com/store/apps/details?id=com.cph5236.simpleweatherservice`. Repo `cph5236/SimpleWeatherService` (no description set).
- **Look:** builder's call — derive from the app's own styling/screens if any; otherwise a clean sky-blue weather palette. Pull screenshots from the repo or the live web app.
- Its URL stays on `cph5236.github.io/SimpleWeatherService` (separate repo, unaffected by the redirect below).

## Hosting (decided)

**Cloudflare Pages with Git connection** to `cph5236/cph5236.github.io` (not a GitHub Actions pipeline — no build step needed, no tokens, free branch previews).

- Production branch: `main`. Build command: none. **Build output directory: `public`**.
- **Repo restructure (Claude's call):** move all public files (`index.html`, `about/`, product folders, `ApiBuilder/`, `assets/`, `cv.pdf`, favicon, logo files) into `public/`. Repo internals stay at root and are therefore never published.
- Custom domains (apex already attached by Connor): `hanlinsoftware.com` (primary) and `www.hanlinsoftware.com` → redirect to apex. Assumed the domain is in the same Cloudflare account as Heap — the checklist should verify.
- Add `public/_redirects` / `_headers` only if needed (e.g. old paths). Builder's call.
- Pages has a ~25 MB per-file limit and serves `node_modules` nothing — ensure no large unneeded files land in `public/`.

**Connor does any remaining dashboard steps** (see Current state below for what is already done). Include how to view branch preview URLs so the redesign can be reviewed before merging to `main`.

### Retire GitHub Pages → redirect (decided)

`cph5236.github.io` redirects to `https://hanlinsoftware.com`, preserving path where possible (e.g. `/ApiBuilder/api-builder.html`).

**Mechanism (Claude's call):** GitHub Pages keeps serving the repo root of `main` (branch-served, no Actions workflow). Put a small redirect `index.html` and `404.html` at the **repo root** (outside `public/`, so Cloudflare never serves them). Both use `<meta http-equiv="refresh">` plus a one-line script that carries over `location.pathname + search + hash`, and a `rel=canonical` to hanlinsoftware.com. Must **not** set a custom domain on the GitHub Pages user site. `cph5236.github.io/SimpleWeatherService` (separate repo) must keep working — verify after.

### Current state (as of 2026-11-19)

Connor has already created the Cloudflare Pages project with a Git connection and attached `hanlinsoftware.com`. It is live, serving `main` **from the repo root** — so `CLAUDE.md`, `README.md`, `package.json` and `docs/` are currently public (verified with curl). `www.hanlinsoftware.com` does not resolve yet. `cph5236.github.io` still serves the old site from GitHub Pages.

**Output-directory switch (Claude's call):** add a `wrangler.toml` at the repo root with `pages_build_output_dir = "public"` (plus `name` matching the Pages project). Git-connected Pages reads this file, so the switch to `public/` lands atomically with the restructure — no dashboard change to time. Verify on the branch preview that Cloudflare honors it; fall back to the dashboard setting if not. The checklist (`docs/cloudflare-setup.md`) shrinks to: add `www` custom domain (+ redirect to apex via a Redirect Rule or `_redirects`), confirm the domain/SSL, how to find branch previews.

### Launch order (Claude's call)

Work happens on `redesign/Design1.0` (or a branch off it). Because both Cloudflare production and GitHub Pages serve `main`, the restructure, `wrangler.toml`, and the redirect stubs land on `main` together:

1. Build on the branch; push it when Connor approves → Cloudflare builds a branch preview URL.
2. Connor reviews the preview (confirms the repo files are no longer reachable there).
3. Connor approves → merge to `main` → hanlinsoftware.com switches to the new site and GitHub Pages starts redirecting, in the same push.
4. Verify: hanlinsoftware.com, `/CLAUDE.md` etc. now 404, www redirect, `cph5236.github.io/` and `/ApiBuilder/api-builder.html` redirect, `cph5236.github.io/SimpleWeatherService/` still works.

Update links that point at the old address (e.g. the GitHub link on About, README, CLAUDE.md).

## CVE check (task 4)

Dependencies today: `bootstrap ^5.3.8` (npm; vendored copy at `assets/vendor/bootstrap/`, which is what pages actually load) and `@popperjs/core` (bundled inside `bootstrap.bundle.min.js`). Google Fonts via CSS link. No other third-party JS.

- Run `npm audit`; check Bootstrap and Popper against current advisories (GitHub Advisory DB / NVD); confirm the vendored files match the latest patched release.
- Include anything new this work adds (e.g. any font or lightbox library) — prefer adding none.
- Report findings to Connor; fix by updating versions. If `node_modules`/`package.json` exist only to vendor Bootstrap, builder may note that but not remove without asking.
- Consider (builder's call) basic security headers via `public/_headers` (CSP allowing Google Fonts, `X-Content-Type-Options`, `Referrer-Policy`).

## Constraints

- Static only, Bootstrap 5.3, `var(--bs-*)` for studio-frame colors; existing conventions in `CLAUDE.md` (update it to reflect new structure).
- Mobile: works at phone width, no horizontal scroll; product bands stack.
- Accessibility: alt text on all images, sufficient contrast in each product palette, reduced-motion respected.
- Each page: proper `<title>`, meta description, Open Graph image (product key art for product pages, logo PNG for home).
- Push discipline (Connor's preference): don't push every small fix; push when Connor approves.

## Left to the builder

Exact copy for the studio intro; section layouts on product pages; Simple Weather's look; image sizes/compression; whether to add a lightbox; file naming; `_headers` content; how to fetch LFS files.
