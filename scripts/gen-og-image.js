// Generates og-image.png at 1200×630 using Playwright
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@300;400&display=block" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1200px; height: 630px;
  background: #08070a;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.scanlines {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(224,168,90,0.04) 3px, rgba(224,168,90,0.04) 4px
  );
  pointer-events: none;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(8,7,10,0.7) 100%);
  pointer-events: none;
}
.corner {
  position: absolute; width: 36px; height: 36px;
  border: 1px solid rgba(224,168,90,0.35);
}
.tl { top: 28px; left: 28px;  border-right: 0; border-bottom: 0; }
.tr { top: 28px; right: 28px; border-left:  0; border-bottom: 0; }
.bl { bottom: 28px; left: 28px;  border-right: 0; border-top: 0; }
.br { bottom: 28px; right: 28px; border-left:  0; border-top: 0; }

svg.rings { position: absolute; opacity: 0.55; }
svg.rings.left  { left: 72px;  top: 50%; transform: translateY(-50%); }
svg.rings.right { right: 72px; top: 50%; transform: translateY(-50%); }

.name {
  text-align: center; position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.first {
  font-family: 'Cormorant Garamond', serif;
  font-size: 128px; font-weight: 400; font-style: italic;
  color: #f3e1bd; line-height: 1;
  text-shadow: 0 0 80px rgba(224,168,90,0.25);
}
.last {
  font-family: 'Cormorant Garamond', serif;
  font-size: 52px; font-weight: 300; font-style: normal;
  color: #e0a85a; line-height: 1; letter-spacing: 0.12em;
}
.footer {
  position: absolute; bottom: 38px; left: 0; right: 0;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 300;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(224,168,90,0.5);
}
</style>
</head>
<body>
<div class="scanlines"></div>
<div class="vignette"></div>
<div class="corner tl"></div>
<div class="corner tr"></div>
<div class="corner bl"></div>
<div class="corner br"></div>

<svg class="rings left" width="90" height="90" viewBox="15 15 70 70" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="30" fill="none" stroke="#e0a85a" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="21" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="13" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="5.5" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="2" fill="#e0a85a"/>
</svg>

<svg class="rings right" width="90" height="90" viewBox="15 15 70 70" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="30" fill="none" stroke="#e0a85a" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="21" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="13" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="5.5" fill="none" stroke="#e0a85a" stroke-width="0.6"/>
  <circle cx="50" cy="50" r="2" fill="#e0a85a"/>
</svg>

<div class="name">
  <span class="first">Karthik</span>
  <span class="last">Subramanian</span>
</div>

<div class="footer">karthiksubramanian07.github.io &nbsp;·&nbsp; Transmission Incoming</div>
</body>
</html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(__dirname, '..', 'og-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await browser.close();
  console.log('og-image.png generated');
})();
