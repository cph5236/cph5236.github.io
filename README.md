# hanlinsoftware.com

The Hanlin Software studio site: products (Craft Brewery Simulator, Heap, Simple Weather Service), an About page for Connor, and the API Builder side project. Plain static HTML, no build step.

**Live:** https://hanlinsoftware.com (Cloudflare Worker with static assets, Git-connected via Workers Builds). `cph5236.github.io` redirects there.

## Layout

| Path | What |
|---|---|
| `public/` | **Everything that gets published.** Cloudflare serves only this folder (`wrangler.toml` → `[assets] directory`). |
| `public/index.html` | Studio homepage with product bands |
| `public/brewery-simulator/`, `public/heap/`, `public/simple-weather/` | Product pages |
| `public/about/` | Connor's portfolio (experience, skills, projects, CV) |
| `public/ApiBuilder/` | API Builder |
| `public/_headers` | Security headers (CSP etc.) for Cloudflare |
| `index.html`, `404.html` (root) | GitHub Pages redirect stubs → hanlinsoftware.com, keeping the path |
| `tools/` | Checks: `check_site.py` (links/alt/leaks), `test_redirect.js` (github.io stubs), `test_ghpages_config.py` (Jekyll excludes). Helpers: `fetch_assets.py` (product art), `make_brand.py` (logo + favicons) |
| `_config.yml` | Tells GitHub Pages to publish only the redirect stubs |
| `docs/` | Design spec, plan, Cloudflare setup checklist, CVE report |

## Running locally

```bash
python3 -m http.server 8080 -d public
python3 tools/check_site.py && node tools/test_redirect.js && python3 tools/test_ghpages_config.py
```

## Updating things

- **Steam link for Craft Brewery Simulator:** set `STEAM_URL` in `public/assets/js/steam.js`. Every "Coming soon to Steam" button becomes "Wishlist on Steam".
- **Brewery screenshots (retakes):** `python tools/fetch_assets.py brewery` (needs Pillow and `gh` auth), then check the gallery list in `public/brewery-simulator/index.html`.
- **Nav / footer:** the markup is duplicated in every page — change all of them.
