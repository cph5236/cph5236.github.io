# ConnorHanlin.github.io

Personal portfolio website hosted on GitHub Pages. No build system or bundler — all files are served as-is.

## Stack

- **Bootstrap 5.3** (CDN) — layout, theming, modals
- **Vanilla JS** — theme switching, smooth scroll, nav behavior
- **localStorage** — client-side persistence

## Running Locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Projects

### API Builder (`ApiBuilder/api-builder.html`)

A browser-based, Postman-like API request builder. Entirely client-side — no backend or install required.

**Technologies:** Vanilla JavaScript, Bootstrap 5.3, Fetch API, localStorage

**Capabilities:**
- Organize requests into folders (create, rename, delete)
- Build requests with GET, POST, PUT, DELETE methods
- Configure headers (with common presets), query params, and JSON body
- Live URL preview showing params appended to the base URL
- JSON body editor with prettify and validation
- Send requests via the browser Fetch API with timeout and error handling
- View color-coded response status, headers, body, and response time
- Export/import collections as JSON files (merge or replace)
- Full light/dark theme support shared with the main portfolio
