# karthiksubramanian07.github.io

A personal site built like a transmission from deep space — Arrakis-themed, zero dependencies, obsessively crafted — with a separate **Dev Profile** dossier at **`/dev`**.

**[karthiksubramanian07.github.io](https://karthiksubramanian07.github.io)** · 37.8755° N, 122.2596° W · Δ 07.04

---

## What it is

Two hand-built pages, no framework, no build step, no bundler:

- **`/`** — the Arrakis transmission landing page. Sandstorm that follows your cursor, letter-by-letter name reveal, a worm-maw monogram, live Berkeley clock. Void black, sand-cream, amber, rust. Cormorant Garamond + JetBrains Mono.
- **`/dev`** — a **Dev Profile** dossier in a warm, editorial register: an interactive constellation starfield, a cratered ringed planet with orbiting dust, count-up stats, and the full stack across languages, AI/ML, infra, and hardware. Reached from the **Dev Profile** control top-left of the landing page.

Everything is GPU-accelerated, respects `prefers-reduced-motion`, and loads in under a second.

---

## Technical highlights

- **Zero JS dependencies** — no React, no Vue, no bundler. Two runtimes: `main.js` (landing) and `dev.js` (dossier).
- **Strict CSP, externalized** — `script-src 'self'` / `style-src 'self'`: no inline scripts or styles anywhere, including on `/dev`. All CSS/JS live in external files.
- **Scrape-proof contact** — the email never appears in source. It is shown obfuscated (`name [dot] … [at] … [dot] edu`) and the real `mailto:` / copy value is assembled in JS only at click time. Discord copies to clipboard; LinkedIn and Instagram are sandboxed external links.
- **Live, self-updating stats** — a daily GitHub Action (`update-stats.yml`) fetches GitHub numbers and writes `dev-stats.json`; `/dev` fetches it (`connect-src 'self'`) and falls back to baked values offline.
- **Canvas effects** — mouse-reactive sandstorm on the landing page; an interactive constellation starfield on `/dev`. Both pause when the tab is hidden.
- **E2E tests** — Playwright across Chromium, Firefox, WebKit, mobile Chrome, and mobile Safari. Covers accessibility (axe), security contracts (CSP + no literal email), responsive layout, and the `/dev` page.
- **CI/CD** — GitHub Actions runs the full suite on every push and PR.

---

## Stack

| Layer | Choice |
|---|---|
| Hosting | [GitHub Pages](https://pages.github.com) |
| Fonts | [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (landing); system serif/sans (dossier) |
| Tests | [Playwright](https://playwright.dev) + [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) |
| CI | [GitHub Actions](https://github.com/features/actions) |

---

## File tree

```
├── index.html            # Landing page (Arrakis transmission)
├── styles.css            # Landing styles
├── main.js               # Landing animations, canvas, clock, email assembly
├── dev/
│   └── index.html        # Dev Profile dossier (CSP-compliant, external assets)
├── dev.css               # Dossier styles
├── dev.js                # Dossier interactions, starfield, live-stats fetch
├── dev-stats.json        # Live GitHub stats (refreshed daily by Action)
├── noscript.css          # Graceful fallback for no-JS
├── favicon.svg           # Worm-maw SVG (also inlined as data URI)
├── 404.html              # Dune-themed not-found page
├── robots.txt
├── sitemap.xml
├── .github/workflows/
│   ├── ci.yml            # Test pipeline
│   └── update-stats.yml  # Daily dev-stats.json refresh
├── scripts/
│   ├── measure-hero-timing.js
│   └── update-stats.mjs  # Fetches GitHub numbers → dev-stats.json
└── tests/
    ├── site.spec.js      # Landing page suite
    └── dev.spec.js       # Dev Profile suite
```

---

## Local development

```bash
npm run serve            # http://localhost:3001  (landing at /, dossier at /dev/)
```

## Running tests

```bash
npm install
npx playwright install --with-deps chromium firefox webkit
npm test
```

## Daily stats

`update-stats.yml` runs on a cron and refreshes `dev-stats.json`. For private-contribution totals, add a `STATS_TOKEN` repository secret (a PAT with `read:user`/`repo`); otherwise it uses the Actions token for public numbers.

---

## Design notes

**Landing palette:** void `#08070a` · sand-cream `#f3e1bd` · amber `#e0a85a` · rust `#6b3a1c`
**Dossier palette:** warm near-black `#161512` · ivory `#f1ece1` · clay `#e08a6b`

The landing page is a teaser ("something is being built here"); the dossier is the substance behind it. The **Dev Profile** control top-left mirrors the **Transmission Incoming** indicator top-right — symmetric HUD framing.

---

## Security

No `eval`, no untrusted `innerHTML`, no user-input surfaces. Strict CSP with no inline scripts or styles. The email address never appears in source (assembled client-side at click time). All external links use `rel="noopener noreferrer"`. No trackers, no cookies.
