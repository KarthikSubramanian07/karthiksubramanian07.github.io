# karthiksubramanian07.github.io

A portfolio transmitted from deep space: warm sand, amber light and an engineering dossier.

**[Visit the site](https://karthiksubramanian07.github.io)**

`portfolio` · `systems` · `machine-learning` · `hardware` · `vanilla-web`

## Architecture

The static site uses hand-built HTML, CSS and JavaScript with no browser runtime dependencies or bundler. The landing page carries the desert-inspired visual identity; `/dev/` presents the technical profile. About, Contact and Privacy pages are readable without scripts. Every content page has a Markdown counterpart, advertised through an alternate link, and `/llms.txt` provides a compact directory with specific usage guidance.

- `index.html`, `styles.css`, `main.js`: landing page and visual effects.
- `dev/`, `dev.css`, `dev.js`, `dev-stats.json`: technical profile and periodically refreshed public repository statistics.
- `about/`, `contact/`, `privacy/`, `content.css`: background, contact routes and data practices.
- `index.md`, `dev/index.md`, `*/index.md`, `llms.txt`: plain-text content and directory.
- `404.html`, `404.css`, `404.md`: error representations.
- `robots.txt`, `sitemap.xml`: crawling and canonical page discovery.
- `server.mjs`: optional HTTP runtime for negotiated content and read-only portfolio tools.
- `tests/`, `.github/workflows/`: browser, HTTP and protocol checks.

## Run and verify

```sh
npm ci
npm run serve
npm run test:runtime
npx playwright install chromium firefox webkit
npm test
```

The static preview is available at `http://localhost:3001`. To exercise server-side content negotiation and the tool endpoint, run `npm start` instead. The runtime reads `PORT` (default 3001), serves an explicit public file allowlist and keeps development files off the HTTP surface.

## HTTP representations

The optional runtime serves HTML or Markdown at the same content URL according to the `Accept` header, with `Vary: Accept`. Missing paths retain HTTP 404 and receive the selected error representation. Explicit `.md` URLs remain available on either hosting mode.

```sh
curl -i -H 'Accept: text/markdown' http://localhost:3001/
curl -i -H 'Accept: text/html' http://localhost:3001/
curl -i -H 'Accept: text/markdown' http://localhost:3001/missing-page
```

The runtime exposes a read-only Streamable HTTP endpoint at `/.well-known/mcp`. The SDK supports protocol revision `2025-11-25`. Its tools retrieve public portfolio content; they do not send messages or modify data. Protocol compatibility and real client exchanges are covered by the runtime tests.

GitHub Pages hosts the static files from `main`. It cannot run `server.mjs`, select a response by `Accept`, or serve a live tool endpoint. Deploy the runtime to a Node-capable host with a custom domain to enable these features publicly. Set `HOST=0.0.0.0`, `PORT` to the host’s assigned port, and `PUBLIC_ORIGIN` to the HTTPS origin. Update canonical URLs and the sitemap when changing the public origin. A static Markdown URL is a fallback, rather than negotiated content at the homepage URL. `_headers` and `_redirects` are reference configuration; GitHub Pages does not apply them.

## Quality and privacy

Browser tests cover the existing animations, keyboard access, responsive layouts, script-free content and accessibility. HTTP tests cover representations, status codes, headers, file isolation and protocol behavior. GitHub Actions runs both suites for pull requests and changes to `main`.

Per-page meta policies restrict scripts and styles to external assets. Contact addresses remain in readable obfuscated form; browser controls assemble mail links at interaction time. The site includes no analytics script or contact form. Hosting requests, external font loading and outbound links are described on the Privacy page.

The daily statistics workflow refreshes `dev-stats.json` using public repository data. An optional `STATS_TOKEN` repository secret permits additional authenticated statistics.
