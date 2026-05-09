# winnerkarthik.dev

> *Transmission incoming.*

An under-construction landing page built on an Arrakis / Dune theme — deep void, amber dunes, sandstorm canvas, and a Shai-Hulud worm-maw monogram at the center. Pure HTML + CSS + JS, no build step, no framework.

---

## Stack

| Layer | Choice | Cost |
|---|---|---|
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) | Free |
| Analytics | [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) | Free |
| Contact form | [Formspree](https://formspree.io) | Free tier |
| Fonts | [Google Fonts](https://fonts.google.com) — Cormorant Garamond + JetBrains Mono | Free |
| Domain | `winnerkarthik.dev` | ~$12/yr |

---

## File tree

```
winnerkarthik.dev/
├── index.html            # Single-page site — all CSS + JS inline
├── favicon.svg           # Worm maw SVG favicon
├── apple-touch-icon.png  # 180×180 iOS home screen icon
├── og-image.png          # 1200×630 Open Graph / Twitter card image
├── robots.txt
├── sitemap.xml
└── _headers              # Cloudflare Pages security headers (CSP, X-Frame, etc.)
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

Copy the beacon token, then in `index.html` replace:

```html
data-cf-beacon='{"token": "CF_ANALYTICS_TOKEN"}'
```

with your actual token. Commit and push — Cloudflare Pages redeploys automatically.

**4. Set up Formspree contact form**

1. Create a free account at [formspree.io](https://formspree.io)
2. **New Form** → name it anything → copy the 8-character form ID
3. In `index.html`, replace `FORMSPREE_ID` in the form action:

```html
action="https://formspree.io/f/FORMSPREE_ID"
```

Commit, push, done. The form submits via AJAX — no page reload, success message appears inline.

---

## Local preview

No build step required. Open directly in any browser:

```bash
# macOS / Linux
open index.html

# Windows
start index.html
```

Or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8000
```

---

## Design notes

- **Palette:** Arrakis (sand-cream `#f3e1bd`, amber `#e0a85a`, rust `#6b3a1c`, void `#08070a`)
- **Fonts:** Cormorant Garamond (headings, name) + JetBrains Mono (UI, coordinates, tags)
- **Animations:** Sandstorm canvas (60fps, mouse-reactive), dune drift, worm maw counter-rotation, letter scatter on hover, surname burst on hold
- **Custom cursor:** Amber ring + dot, expands on interactive elements, hidden on touch
- **Coordinates:** 37.8719° N, 122.2585° W — UC Berkeley
