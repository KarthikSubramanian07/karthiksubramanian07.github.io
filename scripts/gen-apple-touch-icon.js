const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const out = path.join(__dirname, '..', 'apple-touch-icon.png');
  const icon = path.join(__dirname, '..', 'favicon.svg');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page.setContent(
    `<html><body style="margin:0;background:#08070a;display:flex;align-items:center;justify-content:center">
      <img src="file://${icon}" width="160" height="160" alt="">
    </body></html>`
  );
  await page.screenshot({ path: out });
  await browser.close();
  console.log('Wrote', out);
})();
