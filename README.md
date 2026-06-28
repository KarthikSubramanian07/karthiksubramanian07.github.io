# karthiksubramanian07.github.io

> *Transmission incoming.*

A static personal landing page on an Arrakis / Dune theme — deep void, amber dunes, sandstorm canvas, and a Shai-Hulud worm-maw monogram. Pure HTML, CSS, and JavaScript with no build step and no framework.

Live at: **[karthiksubramanian07.github.io](https://karthiksubramanian07.github.io)**

---

## Stack

| Layer | Choice | Cost |
|---|---|---|
| Hosting | [GitHub Pages](https://pages.github.com) | Free |
| Fonts | [Google Fonts](https://fonts.google.com) — Cormorant Garamond (300/400 + italic 300) + JetBrains Mono (300/400); hero LCP font preloaded | Free |
| Tests | [Playwright](https://playwright.dev) + [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) | Free |

---

## File tree

```
├── index.html            # Page markup and metadata
├── styles.css            # All site styles
├── main.js               # Animations, canvas, clock, interactions
├── noscript.css          # Fallback when JavaScript is disabled
├── favicon.svg           # Worm maw SVG favicon
├── apple-touch-icon.png  # 180×180 iOS home screen icon
├── og-image.png          # 1200×630 Open Graph / Twitter card image
├── robots.txt
├── sitemap.xml
├── 404.html
├── playwright.config.js
├── scripts/
│   └── measure-hero-timing.js  # Hero letter reveal timing check (<4s)
└── tests/
    └── site.spec.js      # E2E, accessibility, and security contract tests
```

---

## Local preview

```bash
npm run serve
# open http://localhost:3000
```

Or open `index.html` directly in a browser (some features need a local server for `/main.js` and `/styles.css` paths).

---

## Tests

```bash
npm install
npx playwright install chromium   # first time only
npm test
```

Playwright starts a static server on port 3000 and runs tests across Chromium, Firefox, WebKit, and mobile viewports.

---

## Design notes

- **Palette:** Arrakis (sand-cream `#f3e1bd`, amber `#e0a85a`, rust `#6b3a1c`, void `#08070a`)
- **Fonts:** Cormorant Garamond (headings, name) + JetBrains Mono (UI, coordinates, tags)
- **Animations:** Sandstorm canvas (mouse-reactive, pauses when tab hidden), dune drift, worm maw counter-rotation, letter scatter on hover, surname burst on hold
- **Sandstorm:** Canvas particle field skips touch and reduced-motion; caps at 120 particles below 760px width, 400 on desktop; animation loop cancels when the tab is hidden
- **Coordinates:** 37.8719° N, 122.2585° W — UC Berkeley

---

## Security

No `eval`, no `innerHTML`, no user input. All external links use `rel="noopener noreferrer"`. Assets are externalized (no inline scripts or styles).
