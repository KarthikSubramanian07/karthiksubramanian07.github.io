// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const fs = require('node:fs');
const path = require('node:path');

const pages = [
  { slug: 'about', heading: 'About Karthik Subramanian' },
  { slug: 'contact', heading: 'Contact Karthik Subramanian' },
  { slug: 'privacy', heading: 'Privacy' },
];

for (const { slug, heading } of pages) {
  test.describe(`${slug} page`, () => {
    test('provides substantial content and working navigation without scripts', async ({ browser, request, baseURL }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
      const page = await context.newPage();
      try {
        const response = await page.goto(`/${slug}/`);
        expect(response.status()).toBe(200);
        await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
        expect((await page.locator('main').innerText()).length).toBeGreaterThanOrEqual(500);
        await expect(page.locator('h1')).toHaveCount(1);
        expect(await page.locator('h2').count()).toBeGreaterThan(0);
        await expect(page.locator('h3, h4, h5, h6, script, style, [style]')).toHaveCount(0);
        const links = await page.locator('a[href^="/"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))]);
        for (const href of links) {
          const result = await request.get(href);
          expect(result.status(), href).toBe(200);
        }
        await page.getByRole('link', { name: 'Return to the homepage' }).click();
        await expect(page).toHaveURL(/\/$/);
      } finally {
        await context.close();
      }
    });

    test('publishes consistent Markdown and discoverable metadata', async ({ page, request }) => {
      await page.goto(`/${slug}/`);
      await expect(page).toHaveTitle(new RegExp(heading));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://karthiksubramanian07.github.io/${slug}/`);
      await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute('href', `/${slug}/index.md`);
      await expect(page.locator('link[rel="describedby"]')).toHaveAttribute('href', '/llms.txt');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{50}/);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://karthiksubramanian07.github.io/${slug}/`);
      const markdown = await request.get(`/${slug}/index.md`);
      expect(markdown.status()).toBe(200);
      const text = await markdown.text();
      expect(text).toMatch(new RegExp(`^# ${heading}`));
      const paragraphs = await page.locator('main p:not(.page-link)').allTextContents();
      for (const paragraph of paragraphs) expect(text).toContain(paragraph);
      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      expect(csp).toContain("script-src 'none'");
      await expect(page.locator('link[href="/content.css"]')).toHaveCount(1);
    });

    test('remains readable at narrow widths and passes accessibility checks', async ({ page }) => {
      await page.goto(`/${slug}/`);
      for (const width of [320, 375, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
      await page.setViewportSize({ width: 375, height: 800 });
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('main')).toBeFocused();
      await injectAxe(page);
      await checkA11y(page, undefined, { detailedReport: false });
      for (const link of await page.locator('a[target="_blank"]').all()) {
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });
  });
}

test('contact publishes usable channels while preserving email obfuscation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/contact/');
    await expect(page.getByRole('link', { name: 'Visit LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/karthik-subramanian-07/');
    await expect(page.getByRole('link', { name: 'Visit GitHub' })).toHaveAttribute('href', 'https://github.com/KarthikSubramanian07');
    await expect(page.locator('main')).toContainText('karthik [dot] subramanian [at] berkeley [dot] edu');
    const address = ['karthik', 'subramanian'].join('.') + '@' + ['berkeley', 'edu'].join('.');
    for (const filename of ['index.html', 'index.md']) {
      expect(fs.readFileSync(path.join(__dirname, '..', 'contact', filename), 'utf8')).not.toContain(address);
    }
    await expect(page.locator('a[href^="mailto:"], form')).toHaveCount(0);
  } finally {
    await context.close();
  }
});
