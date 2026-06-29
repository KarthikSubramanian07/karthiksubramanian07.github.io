// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Dev Profile subpage (/dev)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/');
  });

  test('has Dev Profile title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dev Profile/);
  });

  test('canonical points to /dev/', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/dev\/$/);
  });

  test('is CSP-compliant: external css/js only, no inline style/script bodies', async ({ page }) => {
    // no <style> elements at all (CSP style-src 'self')
    expect(await page.locator('style').count()).toBe(0);
    // every <script> is external (has src) — no inline script bodies
    const inlineScripts = await page.evaluate(
      () => [...document.scripts].filter((s) => !s.src && s.textContent.trim().length > 0).length
    );
    expect(inlineScripts).toBe(0);
    await expect(page.locator('link[href="/dev.css"]')).toHaveCount(1);
    await expect(page.locator('script[src="/dev.js"]')).toHaveCount(1);
  });

  test('renders four stat cards', async ({ page }) => {
    await expect(page.locator('.stat')).toHaveCount(4);
  });

  test('renders six stack panels', async ({ page }) => {
    await expect(page.locator('#stack .panel')).toHaveCount(6);
  });

  test('email is obfuscated and non-scrapable (no literal address in HTML)', async ({ page }) => {
    const content = await page.content();
    expect(content).not.toContain('karthik.subramanian@berkeley.edu');
    expect(content).not.toContain('mailto:karthik');
    const emailBtn = page.locator('.email-open');
    await expect(emailBtn).toBeVisible();
    await expect(emailBtn).toHaveAttribute('data-email', /\[at\]/);
  });

  test('Email and Discord expose a copy button; LinkedIn/Instagram are external links', async ({ page }) => {
    // two copy buttons (email + discord)
    await expect(page.locator('.copybtn')).toHaveCount(2);
    await expect(page.locator('a.cmain[href*="linkedin.com"][target="_blank"]')).toHaveCount(1);
    await expect(page.locator('a.cmain[href*="instagram.com"][target="_blank"]')).toHaveCount(1);
  });

  test('all target=_blank links carry noopener noreferrer', async ({ page }) => {
    const links = page.locator('a[target="_blank"]');
    const n = await links.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const rel = await links.nth(i).getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('starfield canvas is present', async ({ page }) => {
    await expect(page.locator('#sky')).toBeAttached();
  });

  test('has a back link to home in topbar', async ({ page }) => {
    await expect(page.locator('a.back-link[href="/"]')).toBeVisible();
  });

  test('no uncaught JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => {
      if (/cloudflareinsights|CF_ANALYTICS/.test(err.message)) return;
      errors.push(err.message);
    });
    await page.goto('/dev/');
    await page.waitForTimeout(1500);
    expect(errors).toHaveLength(0);
  });

  test('passes axe accessibility scan', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: false,
      axeOptions: { rules: { 'color-contrast': { enabled: false } } },
    });
  });
});

test.describe('Home → Dev Profile navigation', () => {
  test('Dev Profile widget is a visible link to /dev/', async ({ page }) => {
    await page.goto('/');
    const dev = page.locator('a.devnav');
    await expect(dev).toBeVisible();
    await expect(dev).toHaveAttribute('href', '/dev/');
    await expect(dev).toContainText('Dev');
  });

  test('clicking the Dev Profile widget navigates to /dev/', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.devnav').click();
    await expect(page).toHaveURL(/\/dev\/?$/);
    await expect(page).toHaveTitle(/Dev Profile/);
  });
});
