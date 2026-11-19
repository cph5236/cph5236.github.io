# Cloudflare Pages setup — hanlinsoftware.com

Already done (2026-11-19): Pages project created with a Git connection to `cph5236/cph5236.github.io`, `hanlinsoftware.com` attached as a custom domain.

## 1. Confirm the project name matches `wrangler.toml`

`wrangler.toml` tells Cloudflare to publish only `public/`. Its `name` must match the Pages project name.

1. Cloudflare dashboard → **Workers & Pages** → open the project for this site.
2. The name is in the page title / URL (its preview address is `<name>.pages.dev`, possibly with a suffix like `heap-cax`).
3. If it isn't `hanlinsoftware`, edit `name = "..."` in `wrangler.toml` to match and commit.

## 2. Check the preview before merging

Every pushed branch gets a preview: **project → Deployments**, or `https://<branch>.<project>.pages.dev` (branch name lowercased, `/` → `-`, e.g. `feature-hanlinsoftware.<project>.pages.dev`).

On the preview, check:
- The new homepage shows (not the old portfolio).
- `/CLAUDE.md` and `/README.md` return 404 (proves only `public/` is served).
- Build log (**Deployments → the build → View details**) mentions `pages_build_output_dir` / output `public`.

If the build ignores `wrangler.toml`: **Settings → Builds → Build configuration → Build output directory = `public`**, build command empty.

## 3. Add www

1. Project → **Custom domains → Set up a custom domain** → `www.hanlinsoftware.com` → accept the DNS record it offers.
2. Redirect www → apex: **hanlinsoftware.com zone → Rules → Redirect Rules → Create rule** → template "Redirect from WWW to root" (301, preserve path and query).

## 4. After merging to `main`

- [ ] https://hanlinsoftware.com shows the studio homepage
- [ ] https://hanlinsoftware.com/CLAUDE.md → 404
- [ ] https://www.hanlinsoftware.com → redirects to https://hanlinsoftware.com
- [ ] https://cph5236.github.io/ → redirects to https://hanlinsoftware.com/
- [ ] https://cph5236.github.io/ApiBuilder/api-builder.html → https://hanlinsoftware.com/ApiBuilder/api-builder.html
- [ ] https://cph5236.github.io/SimpleWeatherService/ still works (separate repo)
- [ ] Response headers include `content-security-policy` (`curl -sI https://hanlinsoftware.com/`)
