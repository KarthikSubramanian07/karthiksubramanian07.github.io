# karthiksubramanian07.github.io

A personal site built like a transmission from deep space — Arrakis-themed, zero dependencies, obsessively crafted.

**[karthiksubramanian07.github.io](https://karthiksubramanian07.github.io)** · 37.8755° N, 122.2596° W · Δ 07.04

---

## What it is

Pure HTML, CSS, and JavaScript. No framework, no build step, no bundler. Everything you see — the sandstorm that follows your cursor, the letter-by-letter name reveal, the worm-maw monogram in the tab bar — is hand-written and loads in under a second.

The design language is Arrakis: void black, sand-cream, amber, rust. The typography is Cormorant Garamond for weight and JetBrains Mono for precision. The animations are GPU-accelerated and respect `prefers-reduced-motion`.

---

## Technical highlights

- **Zero JS dependencies** — no React, no Vue, no lodash, no bundler. The entire runtime is `main.js`.
- **Inline SVG favicon** — base64-encoded directly in the `<link>` tag, so there is never a favicon flash even in incognito mode.
- **Canvas sandstorm** — mouse-reactive particle field. Caps at 120 particles on mobile, 400 on desktop. Pauses when the tab is hidden, resumes on focus.
- **LCP-optimized** — hero font preloaded, CSS stagger delays use `nth-child` rules (no inline styles), name reveal is under 4 seconds.
- **340 E2E tests** — Playwright across Chromium, Firefox, WebKit, mobile Chrome, and mobile Safari. Covers accessibility (axe), performance budgets, security contracts, and responsive layout.
- **CI/CD** — GitHub Actions runs the full suite on every push and PR. Test report uploaded as an artifact.
- **Content Security Policy** — strict CSP header, no `eval`, no `innerHTML`, no untrusted input. All external links use `rel="noopener noreferrer"`.

---

## Stack

| Layer | Choice |
|---|---|
| Hosting | [GitHub Pages](https://pages.github.com) |
| Fonts | [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts |
| Tests | [Playwright](https://playwright.dev) + [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) |
| CI | [GitHub Actions](https://github.com/features/actions) |

---

## File tree

```
├── index.html            # Markup and all metadata
├── styles.css            # Every style rule
├── main.js               # Animations, canvas, clock, interactions
├── noscript.css          # Graceful fallback for no-JS
├── favicon.svg           # Worm-maw SVG (also inlined as data URI)
├── 404.html              # Dune-themed not-found page
├── robots.txt
├── sitemap.xml
├── .github/
│   └── workflows/
│       └── ci.yml        # Test pipeline
├── scripts/
│   └── measure-hero-timing.js
└── tests/
    └── site.spec.js      # 68 unique tests × 5 browsers = 340 total
```

---

## Local development

```bash
npm run serve
# http://localhost:3001
```

Or open `index.html` directly — most features work without a server.

---

## Running tests

```bash
npm install
npx playwright install --with-deps chromium firefox webkit
npm test
```

Tests spin up a static server on port 3001, then run across all five browser projects. The full suite takes about 90 seconds locally.

---

## Design notes

**Palette:** void `#08070a` · sand-cream `#f3e1bd` · amber `#e0a85a` · rust `#6b3a1c`

**Motion:** The sandstorm canvas is mouse-reactive on desktop and skips touch events. The name reveal staggers each character with a CSS `nth-child` delay — no JavaScript timers involved. Hovering the first name scatters letters; holding the surname triggers a burst.

**Favicon:** The worm-maw is a mandala of concentric circles and chevrons rendered in SVG, with a Gaussian blur glow filter. The viewBox is cropped to `15 15 70 70` so the geometry fills the tab icon without padding.

**404:** A separate Dune-themed page — amber palette, starfield, dune SVGs. Copy: *"The desert does not remember this path."*

---

## Security

No `eval`, no `innerHTML`, no user input surfaces. Strict CSP. All external links sandboxed with `rel="noopener noreferrer"`. No analytics, no trackers, no cookies.
