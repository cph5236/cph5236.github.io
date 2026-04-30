# Portfolio Redesign — Design Spec
_2026-04-30_

## Summary

Redesign ConnorHanlin.github.io with a "Refined Minimal" aesthetic that builds on the existing dark theme and emerald accent. The goal is a polished, senior-engineer-quality portfolio that can be linked from a resume without hesitation. No framework changes — still plain HTML/CSS/JS with Bootstrap 5.3 on CDN.

## Approved Direction

Blend of **Refined/Minimal** (generous whitespace, typography-first, single accent color) with the **current site's character** (dark theme, emerald green `#10b981`). Approved by user on 2026-04-30 via visual mockup review.

---

## Design Tokens

### Typography
- **Display / Headings**: `DM Serif Display` (Google Fonts) — serif with character, not generic
- **Body / UI**: `DM Sans` — clean, modern sans-serif
- **Monospace accents** (section labels, skill tags, nav logo): `JetBrains Mono`
- Load via single Google Fonts `<link>` in `<head>`

### Colors
Commit to dark-only. Remove all light/dark theme switching infrastructure.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#111418` | Page background |
| `--bg-section` | `#161b22` | Alternate section background |
| `--bg-card` | `#1c2128` | Card backgrounds |
| `--bg-card-hover` | `#21262d` | Card hover state |
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border-accent` | `rgba(16,185,129,0.3)` | Accent borders |
| `--accent` | `#10b981` | Emerald — CTA buttons, labels, highlights |
| `--accent-dim` | `rgba(16,185,129,0.12)` | Primary skill tag backgrounds |
| `--text-primary` | `#e6edf3` | Headings, important text |
| `--text-secondary` | `#8b949e` | Body copy, descriptions |
| `--text-muted` | `#484f58` | Tertiary labels, separators |

### Spacing
- Page max-width: `860px`, centered
- Section vertical padding: `72px` top/bottom
- Hero vertical padding: `100px` top, `90px` bottom

---

## Sections

### Navigation
- Keep current structure: logo left (`CH` in mono font, accent color), nav links right
- Remove the gear/settings icon and its entire dropdown (theme + accent switcher)
- Nav link style: small uppercase, `12px`, letter-spaced, subtle border on hover
- Sticky with `backdrop-filter: blur(12px)` and a bottom border

### Hero (About)
**Current problem**: name is large but the section feels like a text dump with no hierarchy.

**New structure**:
1. Eyebrow label: `ABOUT` in mono, accent color, letter-spaced
2. Name: `DM Serif Display`, large (`clamp(52px, 7vw, 80px)`), light weight
3. Title subtitle: "Senior Software Engineer" as a second line in DM Sans, muted color — surfaces the role that's buried in the bio today
4. Bio paragraph: `DM Sans` 300 weight, `16px`, max-width `560px`, muted color
5. Contact row: inline links with subtle underline, hover turns accent green

The Education + Experience block moves below the hero as a two-column grid, separated by a thin border — same content, cleaner treatment.

### Skills
**Current problem**: comma-separated text inside bordered cards is visually inert.

**New structure**: Tag/pill system
- Each skill is its own `<span>` with a border, rounded corners, monospace font
- **Primary skills** (C#, Python, JavaScript/TypeScript, AWS, Docker) get accent-colored border + background tint — visually distinct without needing a legend
- Skills grouped with a small uppercase label (`LANGUAGES & FRAMEWORKS`, `CLOUD & DEVOPS`)
- No wrapping cards — tags live directly in the section on a white/dark background

### Projects
**Current problem**: SessionM card has 4× the text of others, breaking the grid.

**New structure**: Three equal-height cards in a CSS grid (`repeat(3, 1fr)`)
- Each card: small `project-tag` label (e.g. "Current Role", "Side Project"), title, trimmed description (≤2 sentences), link buttons at bottom via `margin-top: auto`
- Two button variants: `btn-primary` (solid accent, black text) and `btn-ghost` (transparent, border)
- Cards have hover state: accent border + slightly lighter background
- SessionM card description is trimmed to match the others in weight

### Footer
Minimal. Copyright text left-aligned, no changes needed.

---

## Removals

| Item | File(s) | Action |
|------|---------|--------|
| Theme switcher (light/dark radio buttons) | `index.html`, `assets/js/theme.js`, `assets/css/custom.css` | Remove UI; delete or gut `theme.js`; remove `[data-bs-theme]` CSS overrides |
| Accent color switcher | `index.html`, `assets/js/accent.js`, `assets/css/custom.css` | Remove UI; delete `accent.js`; remove accent CSS variable overrides |
| Gear icon + settings dropdown in nav | `index.html` | Remove the entire settings popover markup and trigger button |
| Bootstrap `data-bs-theme` attribute usage | `index.html` | Set to `"dark"` hardcoded on `<html>` — Bootstrap stays loaded for the CV modal and needs this to render the modal in dark theme. Stop reading/writing it from JS. |

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Major rewrite of markup: new font link, nav cleanup, hero restructure, skills tags, project cards, remove theme/accent UI |
| `assets/css/custom.css` | Replace with new CSS custom properties and styles from approved mockup; remove all `[data-bs-theme]` blocks |
| `assets/js/theme.js` | Delete — no longer needed |
| `assets/js/accent.js` | Delete — no longer needed |
| `assets/js/nav.js` | Remove any references to theme/accent switching; keep scroll, hash linking, and CV modal logic |

---

## Out of Scope

- API Builder (`ApiBuilder/`) — no changes
- CV/resume PDF — no changes
- Any new sections (no adding testimonials, blog, contact form, etc.)
- Photo/headshot — not included in this pass; can be added later
- Mobile-specific layout changes beyond what Bootstrap grid provides

---

## Success Criteria

- Opens in a browser and looks like the approved mockup
- No theme switcher or accent switcher visible anywhere
- Project cards are equal-height with consistent structure
- Skills render as individual tags, primary ones accented
- Google Fonts load correctly (DM Serif Display, DM Sans, JetBrains Mono)
- All existing links and the CV modal still work
- No JavaScript errors in console
