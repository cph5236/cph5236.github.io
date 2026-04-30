# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ConnorHanlin.github.io with a "Refined Minimal" aesthetic — new typography, skill tags, even project cards, and removal of theme/accent switching — while keeping the dark palette, emerald accent, and all existing navigation/CV modal functionality.

**Architecture:** Static HTML/CSS/JS, no build step. Bootstrap 5.3 (local vendor files) is kept solely for the CV modal; all page layout switches from Bootstrap grid utilities to custom CSS grid. `data-bs-theme="dark"` stays hardcoded on `<html>` so Bootstrap's modal renders dark. Two JS files (`theme.js`, `accent.js`) are deleted entirely; `nav.js` is unchanged because all the IDs and classes it relies on are preserved.

**Tech Stack:** Plain HTML5, CSS custom properties, vanilla JS, Bootstrap 5.3 (modal only), Google Fonts (DM Serif Display, DM Sans, JetBrains Mono).

---

## File Map

| File | Action | Summary |
|------|--------|---------|
| `index.html` | Rewrite | New font link, remove settings UI/SVGs, rewrite all sections |
| `assets/css/custom.css` | Replace | New design tokens + all styles; remove Bootstrap variable deps |
| `assets/js/theme.js` | Delete | Entire file — theme switching removed |
| `assets/js/accent.js` | Delete | Entire file — accent switching removed |
| `assets/js/nav.js` | No change | All IDs/classes it uses are preserved |

---

## Task 1: Remove Theme & Accent Switching Infrastructure

**Files:**
- Delete: `assets/js/theme.js`
- Delete: `assets/js/accent.js`
- Modify: `index.html`

This task strips everything related to the settings dropdown so the next tasks start from a clean baseline.

- [ ] **Step 1: Delete the two JS files**

```bash
rm assets/js/theme.js assets/js/accent.js
```

- [ ] **Step 2: Remove their script tags and the settings dropdown from `index.html`**

Replace the entire `<nav>` block (lines 20–60) with this cleaned version. Key changes: removes the `.dropdown` with gear button, removes `navbar-dark` (Bootstrap 5.3 inherits dark from `data-bs-theme` on `<html>`), keeps all IDs/classes that `nav.js` relies on (`id="nav-toggle"`, `id="navbarNav"`, `.nav-btn`, `data-target`).

```html
    <!-- Navigation -->
    <nav class="navbar navbar-dark navbar-expand-lg fixed-top" id="main-nav">
        <div class="container-fluid px-4">
            <a class="navbar-brand fw-bold" href="#about" data-target="about">CH</a>
            <button class="navbar-toggler border-0" type="button" id="nav-toggle" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse justify-content-end" id="navbarNav">
                <div class="navbar-nav gap-2 align-items-center">
                    <button class="btn nav-btn" data-target="about">About</button>
                    <button class="btn nav-btn" data-target="skills">Skills</button>
                    <button class="btn nav-btn" data-target="projects">Projects</button>
                    <button class="btn nav-btn" data-target="cv">CV</button>
                </div>
            </div>
        </div>
    </nav>
```

- [ ] **Step 3: Remove the SVG icon sprite and the two script tags at the bottom of `<body>`**

Find and remove the entire `<!-- SVG Icons -->` block (the `<svg xmlns="...">` element containing `sun-fill`, `moon-stars-fill`, and `gear-fill` symbols).

Also remove these two lines from the bottom of `<body>`:
```html
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/accent.js"></script>
```

Keep `<script src="assets/js/nav.js"></script>` and `<div class="nav-backdrop" id="nav-backdrop"></div>` — nav.js still needs both.

- [ ] **Step 4: Verify in browser**

Open `http://localhost:8080` in a browser. Confirm:
- Nav shows four text buttons (About, Skills, Projects, CV) with no gear icon
- No JavaScript console errors
- CV button opens the resume modal
- Mobile: hamburger opens the drawer

- [ ] **Step 5: Commit**

```bash
git add index.html assets/js/
git commit -m "Remove theme/accent switching: delete theme.js and accent.js, strip settings dropdown from nav"
```

---

## Task 2: Replace `custom.css` with New Design System

**Files:**
- Replace: `assets/css/custom.css`

The new CSS drops all Bootstrap variable dependencies (`--bs-body-bg`, `--bs-secondary-bg`, etc.) and replaces them with explicit custom properties. The mobile drawer logic is preserved exactly — `nav.js` relies on `.drawer-open`, `.show`, and `.is-open` CSS classes.

- [ ] **Step 1: Replace the entire contents of `assets/css/custom.css`**

```css
/* ============================================================
   Portfolio — Design System
   Dark-only. Bootstrap 5.3 loaded only for CV modal.
   ============================================================ */

:root {
    --bg-base:        #111418;
    --bg-nav:         rgba(17, 20, 24, 0.85);
    --bg-card:        #1c2128;
    --bg-card-hover:  #21262d;
    --border:         rgba(255, 255, 255, 0.07);
    --border-accent:  rgba(16, 185, 129, 0.3);
    --accent:         #10b981;
    --accent-hover:   #059669;
    --accent-dim:     rgba(16, 185, 129, 0.12);
    --text-primary:   #e6edf3;
    --text-secondary: #8b949e;
    --text-muted:     #484f58;
}

/* ── BASE ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    padding-top: 56px;
}

/* ── NAVBAR ────────────────────────────────────────────── */
#main-nav {
    background: var(--bg-nav) !important;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 !important;
    height: 56px;
}

#main-nav .navbar-brand {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1px;
    color: var(--accent) !important;
    transition: opacity 0.15s;
    padding: 0;
}

#main-nav .navbar-brand:hover { opacity: 0.75; }

.nav-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    border-radius: 6px;
    padding: 6px 14px !important;
    transition: color 0.15s, border-color 0.15s;
}

.nav-btn:hover {
    color: var(--text-primary) !important;
    border-color: var(--border) !important;
    background: transparent !important;
}

.nav-btn.active {
    color: var(--accent) !important;
    border-color: var(--border-accent) !important;
    background: var(--accent-dim) !important;
}

/* ── PAGE WIDTH WRAPPER ────────────────────────────────── */
/*
  .hero-section    — hero block, extra top padding
  .about-grid      — education/experience two-column block
  .page-section    — all other sections (skills, projects)
  All share 860px max-width and horizontal padding.
*/
.hero-section {
    max-width: 860px;
    margin: 0 auto;
    padding: 100px 40px 90px;
    border-bottom: 1px solid var(--border);
}

.about-grid {
    max-width: 860px;
    margin: 0 auto;
    padding: 56px 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    border-bottom: 1px solid var(--border);
}

.page-section {
    max-width: 860px;
    margin: 0 auto;
    padding: 72px 40px;
    border-bottom: 1px solid var(--border);
}

/* Last section has no border */
.page-section:last-of-type { border-bottom: none; }

/* ── SECTION TYPOGRAPHY ────────────────────────────────── */
.section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 12px;
}

.section-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(32px, 4vw, 44px);
    font-weight: 400;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.1;
}

.section-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 48px;
    font-weight: 300;
}

/* ── HERO ──────────────────────────────────────────────── */
.hero-name {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(52px, 7vw, 80px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -1px;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.hero-subtitle {
    font-size: 18px;
    font-weight: 300;
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.hero-bio {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.75;
    max-width: 560px;
    margin-bottom: 32px;
    font-weight: 300;
}

.hero-contacts {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.hero-contacts a {
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    border-bottom: 1px solid var(--border);
    padding-bottom: 2px;
    transition: color 0.15s, border-color 0.15s;
}

.hero-contacts a:hover {
    color: var(--accent);
    border-color: var(--accent);
}

.hero-contacts .sep {
    color: var(--text-muted);
    font-size: 11px;
    user-select: none;
}

/* ── ABOUT GRID (education + experience) ───────────────── */
.about-block-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
}

.about-block h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.4;
}

.about-block p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
    font-weight: 300;
    margin: 0;
}

.about-block .detail {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
}

/* ── SKILLS ────────────────────────────────────────────── */
.skill-group { margin-bottom: 36px; }

.skill-group-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 14px;
}

.skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 12px;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
}

.skill-tag:hover {
    border-color: var(--border-accent);
    color: var(--accent);
}

.skill-tag.primary {
    border-color: var(--border-accent);
    color: var(--accent);
    background: var(--accent-dim);
}

/* ── PROJECTS ──────────────────────────────────────────── */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.project-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s, background 0.2s;
}

.project-card:hover {
    border-color: var(--border-accent);
    background: var(--bg-card-hover);
}

.project-tag {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
}

.project-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 10px;
    line-height: 1.3;
}

.project-card p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
    font-weight: 300;
    flex: 1;
    margin: 0;
}

.project-links {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.btn-primary-accent {
    display: block;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #000 !important;
    background: var(--accent);
    border: none;
    border-radius: 6px;
    padding: 9px 16px;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s;
}

.btn-primary-accent:hover { opacity: 0.85; }

.btn-ghost {
    display: block;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-secondary) !important;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 9px 16px;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
}

.btn-ghost:hover {
    color: var(--text-primary) !important;
    border-color: rgba(255, 255, 255, 0.2);
}

/* ── FOOTER ────────────────────────────────────────────── */
footer {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 40px;
}

footer p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
}

/* ── MODAL (Bootstrap) ─────────────────────────────────── */
.modal-content {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-accent) !important;
    color: var(--text-primary) !important;
}

.modal-header {
    border-color: var(--border) !important;
    background-color: #161b22 !important;
}

.modal-title {
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
    font-weight: 600;
}

/* Raise modal above everything */
.modal          { z-index: 2000 !important; }
.modal-backdrop { z-index: 1990 !important; }

/* ── MOBILE NAV DRAWER ─────────────────────────────────── */
@media (max-width: 991.98px) {
    /*
      backdrop-filter creates a stacking context that traps fixed
      descendants inside the nav's bounding box — disable on mobile.
      Raise z-index so it sits above the backdrop overlay.
    */
    #main-nav {
        backdrop-filter: none !important;
        z-index: 1060 !important;
    }

    #navbarNav {
        position: fixed !important;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(240px, 70vw);
        background: var(--bg-card);
        border-left: 1px solid var(--border);
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.25);
        padding: 5.5rem 1.75rem 2rem;
        display: flex !important;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        transform: translateX(100%);
        transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow-y: auto;
    }

    #navbarNav.drawer-open { transform: translateX(0); }

    #navbarNav .navbar-nav {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.5rem !important;
        width: 100%;
    }

    #navbarNav .nav-btn {
        width: 100%;
        text-align: left;
        font-size: 14px !important;
        padding: 0.65rem 1rem !important;
        border-radius: 0.5rem;
    }

    /* Backdrop — z-index below nav (1059 < 1060) */
    .nav-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1059;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .nav-backdrop.show {
        opacity: 1;
        visibility: visible;
    }

    .navbar-toggler.is-open .navbar-toggler-icon {
        opacity: 0.7;
    }
}

/* ── RESPONSIVE ────────────────────────────────────────── */
@media (max-width: 768px) {
    .hero-section,
    .page-section {
        padding: 60px 24px;
    }

    .about-grid {
        grid-template-columns: 1fr;
        padding: 40px 24px;
        gap: 28px;
    }

    .projects-grid {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:8080`. The page will look unstyled/broken because the HTML still uses old Bootstrap utility classes — that's expected at this stage. Confirm the fonts are loading (check Network tab for `fonts.googleapis.com` requests, or inspect an element and see `DM Sans` in computed styles).

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Replace custom.css with new design system: tokens, DM Serif/Sans/Mono typography, skills tags, project cards"
```

---

## Task 3: Rewrite `index.html` — Head & Google Fonts

**Files:**
- Modify: `index.html` (head section only)

- [ ] **Step 1: Replace the Google Fonts `<link>` in `<head>`**

Find this line:
```html
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

Replace it with:
```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Update Google Fonts: DM Serif Display, DM Sans, JetBrains Mono (replaces Roboto)"
```

---

## Task 4: Rewrite `index.html` — About/Hero Section

**Files:**
- Modify: `index.html` (hero section)

- [ ] **Step 1: Replace the entire hero `<section id="about">` block**

Find the opening `<section id="about" class="hero py-5">` through its closing `</section>` tag and replace with:

```html
        <!-- About / Hero Section -->
        <section id="about">
            <div class="hero-section">
                <p class="section-label">About</p>
                <h1 class="hero-name">Connor Hanlin</h1>
                <p class="hero-subtitle">Senior Software Engineer</p>
                <p class="hero-bio">
                    Software Engineering graduate from Pennsylvania State University (Class of 2020),
                    passionate about backend systems, cloud architecture, and game development.
                </p>
                <div class="hero-contacts">
                    <a href="tel:8148739072">(814) 873‑9072</a>
                    <span class="sep">·</span>
                    <a href="mailto:HanlinConnor@gmail.com">HanlinConnor@gmail.com</a>
                    <span class="sep">·</span>
                    <a href="https://linkedin.com/in/connor-hanlin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <span class="sep">·</span>
                    <a href="https://github.com/cph5236/cph5236.github.io" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>
            <div class="about-grid">
                <div class="about-block">
                    <div class="about-block-label">Education</div>
                    <h3>Pennsylvania State University</h3>
                    <p>B.S. Software Engineering</p>
                    <p class="detail">Minor in Game Development/Design · Class of 2020</p>
                </div>
                <div class="about-block">
                    <div class="about-block-label">Experience</div>
                    <h3>Senior Software Engineer at Mastercard <span style="font-weight:300;color:var(--text-muted);font-size:13px">(SessionM)</span></h3>
                    <p>Designing scalable backend platforms and leading client migrations.</p>
                    <p class="detail">Since March 2022</p>
                </div>
            </div>
        </section>
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:8080`. Confirm:
- "Connor Hanlin" renders in DM Serif Display (serif font with character)
- "Senior Software Engineer" appears as a subtitle in lighter text below the name
- Contact links are inline with `·` separators
- Education and Experience appear side-by-side in a two-column grid below

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rewrite hero section: DM Serif name, subtitle, bio, inline contacts, edu/exp grid"
```

---

## Task 5: Rewrite `index.html` — Skills Section

**Files:**
- Modify: `index.html` (skills section)

- [ ] **Step 1: Replace the entire `<section id="skills">` block**

Find `<section id="skills" class="py-5 bg-section">` through its closing `</section>` and replace with:

```html
        <!-- Skills Section -->
        <section id="skills">
            <div class="page-section">
                <p class="section-label">Skills</p>
                <h2 class="section-title">Technical Stack</h2>
                <p class="section-subtitle">Languages, frameworks, and tools I work with</p>

                <div class="skill-group">
                    <div class="skill-group-name">Languages &amp; Frameworks</div>
                    <div class="skill-tags">
                        <span class="skill-tag primary">C#</span>
                        <span class="skill-tag primary">Python</span>
                        <span class="skill-tag primary">JavaScript / TypeScript</span>
                        <span class="skill-tag">Java</span>
                        <span class="skill-tag primary">AWS Services</span>
                        <span class="skill-tag">.NET Core</span>
                        <span class="skill-tag">Bootstrap</span>
                        <span class="skill-tag">LINQ</span>
                        <span class="skill-tag">SQL Server</span>
                        <span class="skill-tag">PostgreSQL</span>
                    </div>
                </div>

                <div class="skill-group">
                    <div class="skill-group-name">Cloud &amp; DevOps</div>
                    <div class="skill-tags">
                        <span class="skill-tag primary">AWS</span>
                        <span class="skill-tag">Azure</span>
                        <span class="skill-tag primary">Docker</span>
                        <span class="skill-tag">DynamoDB</span>
                        <span class="skill-tag">CI/CD Pipelines</span>
                        <span class="skill-tag">GitLab</span>
                        <span class="skill-tag">API Design</span>
                        <span class="skill-tag">Terraform</span>
                        <span class="skill-tag">Distributed Systems</span>
                        <span class="skill-tag">Git</span>
                        <span class="skill-tag">GitHub</span>
                        <span class="skill-tag">Jira</span>
                    </div>
                </div>
            </div>
        </section>
```

- [ ] **Step 2: Verify in browser**

Scroll to the Skills section. Confirm:
- Individual skill tags render as pill-shaped badges
- C#, Python, JavaScript/TypeScript, AWS Services, AWS, Docker appear in accent green with a tinted background
- Other skills appear in muted grey
- Tags wrap to a new line on narrow viewports

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rewrite skills section: individual tag pills with primary accent highlighting"
```

---

## Task 6: Rewrite `index.html` — Projects Section & Footer

**Files:**
- Modify: `index.html` (projects section and footer)

- [ ] **Step 1: Replace the entire `<section id="projects">` block**

Find `<section id="projects" class="py-5">` through its closing `</section>` and replace with:

```html
        <!-- Projects Section -->
        <section id="projects">
            <div class="page-section">
                <p class="section-label">Projects</p>
                <h2 class="section-title">Featured Work</h2>
                <p class="section-subtitle">Highlights of past work and coding experience</p>

                <div class="projects-grid">
                    <div class="project-card">
                        <span class="project-tag">Current Role</span>
                        <h3>SessionM Loyalty Platform</h3>
                        <p>Senior Software Engineer at Mastercard building scalable backend APIs and distributed systems for enterprise loyalty and incentive platforms.</p>
                        <div class="project-links">
                            <button class="btn-primary-accent" id="view-resume" data-target="cv">View Full Resume</button>
                        </div>
                    </div>
                    <div class="project-card">
                        <span class="project-tag">Side Project</span>
                        <h3>API Builder</h3>
                        <p>A client-side Postman-like API request builder built with vanilla JavaScript, Bootstrap 5, and localStorage for persistence.</p>
                        <div class="project-links">
                            <a class="btn-primary-accent" href="ApiBuilder/api-builder.html">Try API Query Builder</a>
                        </div>
                    </div>
                    <div class="project-card">
                        <span class="project-tag">Side Project</span>
                        <h3>Simple Weather Service</h3>
                        <p>A clean weather app built with React and Vite. Available as a React Native app on the Google Play Store.</p>
                        <div class="project-links">
                            <a class="btn-primary-accent" href="https://cph5236.github.io/SimpleWeatherService/" target="_blank" rel="noopener noreferrer">View Web App</a>
                            <a class="btn-ghost" href="https://play.google.com/store/apps/details?id=com.cph5236.simpleweatherservice&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">Google Play Store</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
```

- [ ] **Step 2: Replace the `<footer>` block**

Find:
```html
    <!-- Footer -->
    <footer class="bg-section text-center py-4 mt-auto border-top border-secondary">
        <p class="mb-0">&copy; 2026 Connor Hanlin. All Rights Reserved</p>
    </footer>
```

Replace with:
```html
    <!-- Footer -->
    <footer>
        <p>&copy; 2026 Connor Hanlin. All Rights Reserved.</p>
    </footer>
```

- [ ] **Step 3: Verify in browser**

Scroll to the Projects section. Confirm:
- Three cards appear in a 3-column grid at desktop width
- Each card has the same visual height (content area is equal-weight across all three)
- "Current Role" / "Side Project" labels appear in accent green above titles
- "View Full Resume" button triggers the CV modal (click it to test)
- Simple Weather Service shows two buttons stacked vertically
- At mobile width, cards stack to single column

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Rewrite projects section: even 3-column grid with project-tag labels, trimmed descriptions; clean up footer"
```

---

## Task 7: Final Verification Pass

**Files:** None — browser-only verification

No code changes in this task. Verify all interactive features still work end-to-end.

- [ ] **Step 1: Verify at desktop (1440px)**

Open `http://localhost:8080` at full desktop width. Check each section:

| What | Expected |
|------|----------|
| Navbar | CH logo in accent green (mono font), four ghost-style nav buttons |
| About | "Connor Hanlin" in DM Serif Display at ~80px, subtitle "Senior Software Engineer" below, bio paragraph, inline contact links |
| Education/Experience | Two-column grid, accent-green labels, clean typography |
| Skills | Two groups, tag pills, primary skills in green, others in muted grey |
| Projects | Three equal cards, "Current Role" / "Side Project" labels, consistent height |
| Footer | Left-aligned copyright in small muted text |
| No gear icon | Settings dropdown is completely gone |

- [ ] **Step 2: Verify CV modal**

Click "CV" in the navbar. Confirm the modal opens, the PDF loads, and it renders in dark theme. Click outside to close it.

- [ ] **Step 3: Verify at mobile (375px)**

Resize browser to 375px. Check:
- Hamburger button appears in navbar
- Tapping hamburger opens the right-side drawer
- Drawer contains four nav buttons
- Tapping a nav item closes the drawer and scrolls to the section
- Projects cards stack single-column
- About grid stacks to single column
- Hero name scales down gracefully via `clamp()`

- [ ] **Step 4: Check browser console**

Open DevTools → Console. Confirm zero JavaScript errors.

- [ ] **Step 5: Final commit**

No code changes needed if everything passes. If any minor CSS tweaks were made during verification, commit them now:

```bash
git add -p  # review each change before staging
git commit -m "Polish: fix any issues found during final verification pass"
```
