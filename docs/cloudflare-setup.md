# Cloudflare setup — hanlinsoftware.com

The site is a **Cloudflare Worker with static assets** named `hanlinsoftware` (Workers & Pages → hanlinsoftware), Git-connected to `cph5236/cph5236.github.io` via Workers Builds. Production branch: `main`. Custom domain `hanlinsoftware.com` is attached.

`wrangler.toml` tells the build to upload only `public/` (`[assets] directory = "./public"`). Its `name` (`hanlinsoftware`) matches the Worker.

## 1. Check the build settings

Worker → **Settings → Build**:
- **Deploy command:** `npx wrangler deploy` (the default). Root directory: `/` (repo root).
- **Build command:** empty.
- **Branch control → Builds for non-production branches:** turn **on**. Non-production branches then run `npx wrangler versions upload` and get a preview URL.

## 2. Check the preview before merging

After enabling non-production builds, push to the branch (or hit "Retry" on the build). The preview shows under **Deployments** / the GitHub PR's checks, as a `*-hanlinsoftware.hanlinsoftwaresws.workers.dev` URL. If no preview link appears, turn on **Settings → Domains & Routes → Preview URLs**.

On the preview, check:
- The new studio homepage shows (not the old portfolio).
- `/CLAUDE.md` and `/README.md` return 404 (proves only `public/` is uploaded).
- `curl -sI <preview-url>` shows a `content-security-policy` header (proves `_headers` is applied).

If the build log shows a wrangler config error, paste it to Claude.

## 3. Add www

1. Worker → **Settings → Domains & Routes → Add → Custom domain** → `www.hanlinsoftware.com`.
2. Redirect www → apex: **hanlinsoftware.com zone → Rules → Redirect Rules → Create rule** → template "Redirect from WWW to root" (301, preserve path and query).

## 4. After merging to `main`

- [ ] https://hanlinsoftware.com shows the studio homepage
- [ ] https://hanlinsoftware.com/CLAUDE.md → 404
- [ ] https://www.hanlinsoftware.com → redirects to https://hanlinsoftware.com
- [ ] https://cph5236.github.io/ → redirects to https://hanlinsoftware.com/
- [ ] https://cph5236.github.io/ApiBuilder/api-builder.html → https://hanlinsoftware.com/ApiBuilder/api-builder.html
- [ ] https://cph5236.github.io/SimpleWeatherService/ still works (separate repo)
- [ ] Response headers include `content-security-policy` (`curl -sI https://hanlinsoftware.com/`)
