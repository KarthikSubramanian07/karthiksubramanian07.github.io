# winnerkarthik.dev

> *Transmission incoming.*

A static personal landing page on an Arrakis / Dune theme — deep void, amber dunes, sandstorm canvas, and a Shai-Hulud worm-maw monogram. Pure HTML, CSS, and JavaScript with no build step and no framework.

---

## Stack

| Layer | Choice | Cost |
|---|---|---|
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) | Free |
| Analytics | [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) | Free |
| Fonts | [Google Fonts](https://fonts.google.com) — Cormorant Garamond (300/400 + italic 300) + JetBrains Mono (300/400); hero LCP font preloaded | Free |
| Tests | [Playwright](https://playwright.dev) + [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) | Free |
| Domain | `winnerkarthik.dev` | ~$12/yr |

---

## File tree

```
winnerkarthik.dev/
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
├── _headers              # Cloudflare Pages security headers (CSP, HSTS, cache)
├── _redirects            # Block dev files from public URLs
├── playwright.config.js
├── scripts/
│   └── measure-hero-timing.js  # Hero letter reveal timing check (<4s)
└── tests/
    └── site.spec.js      # E2E, accessibility, and security contract tests
```

No `wrangler.toml` needed — this is a static site with no Workers, KV, or D1.

---

## Deploy to Cloudflare Pages

### One-time setup

**1. Connect your repo**

```
dash.cloudflare.com → Pages → Create a project → Connect to Git
```

Pick this repository. Build settings:

- **Framework preset:** None
- **Build command:** *(leave blank)*
- **Build output directory:** `/` (or `.`)

**2. Add your custom domain**

```
Pages → your-project → Custom domains → Add domain → winnerkarthik.dev
```

Then in your domain registrar, point the nameservers to Cloudflare (or add a CNAME if keeping your registrar).

**3. Enable Cloudflare Web Analytics**

```
dash.cloudflare.com → Web Analytics → Add a site → winnerkarthik.dev
```

Copy the beacon token, then in `index.html` replace the placeholder `CF_ANALYTICS_TOKEN` in:

```html
data-cf-beacon='{"token": "CF_ANALYTICS_TOKEN"}'
```

with your actual token from the dashboard. Until replaced, analytics requests fail silently in the browser console; Playwright tests ignore those errors. Commit and push — Cloudflare Pages redeploys automatically.

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
- **Custom cursor:** Paper airplane SVG follows the pointer on fine-pointer desktops; `requestAnimationFrame` pauses when the tab is hidden; hidden on touch (`pointer: coarse`), mobile, and `prefers-reduced-motion`
- **Sandstorm:** Canvas particle field skips touch and reduced-motion; caps at 120 particles below 760px width, 400 on desktop; animation loop cancels when the tab is hidden
- **Coordinates:** 37.8719° N, 122.2585° W — UC Berkeley

---

## Security

`_headers` sets a strict Content Security Policy without `'unsafe-inline'` for scripts or styles (assets are externalized). External links use `rel="noopener noreferrer"`. Replace `CF_ANALYTICS_TOKEN` before production deploy.
