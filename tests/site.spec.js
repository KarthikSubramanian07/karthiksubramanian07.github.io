// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const fs = require('fs');
const path = require('path');

// ─── helpers ────────────────────────────────────────────────────────────────

async function waitForName(page, timeout = 4000) {
  await page.waitForFunction(
    () => document.querySelectorAll('#hero-name .ch.in').length === 7,
    { timeout }
  );
}

async function waitForTags(page, timeout = 4000) {
  await page.waitForFunction(
    () => document.querySelectorAll('#tagcluster .tag.in').length === 9,
    { timeout }
  );
}

// ─── shared navigation ───────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ─── page structure ──────────────────────────────────────────────────────────

test.describe('Page structure', () => {
  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Karthik Subramanian');
  });

  test('has meta description mentioning Karthik Subramanian', async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /Karthik Subramanian/);
  });

  test('has Open Graph image pointing to correct domain', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /karthiksubramanian07\.github\.io.*og-image\.png/);
  });

  test('has canonical URL pointing to github.io', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /karthiksubramanian07\.github\.io/);
  });

  test('OG metadata contains no stale domain references', async ({ page }) => {
    const metas = await page.locator('meta[content*="winnerkarthik"]').count();
    expect(metas).toBe(0);
  });

  test('og:url points to correct domain', async ({ page }) => {
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /karthiksubramanian07\.github\.io/);
  });

  test('twitter:image points to correct domain', async ({ page }) => {
    const twitterImg = page.locator('meta[name="twitter:image"]');
    await expect(twitterImg).toHaveAttribute('content', /karthiksubramanian07\.github\.io/);
  });

  test('loads external stylesheet and script', async ({ page }) => {
    await expect(page.locator('link[href="/styles.css"]')).toHaveCount(1);
    await expect(page.locator('script[src="/main.js"]')).toHaveCount(1);
  });

  test('uses semantic header element for topbar', async ({ page }) => {
    await expect(page.locator('header.topbar')).toBeAttached();
  });

  test('uses semantic nav element for links', async ({ page }) => {
    await expect(page.locator('nav.links')).toBeAttached();
  });

  test('hero name is an h1', async ({ page }) => {
    await expect(page.locator('h1.name')).toBeAttached();
  });
});

// ─── core content ───────────────────────────────────────────────────────────

test.describe('Core content', () => {
  test('topbar shows transmission status', async ({ page }) => {
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('.topbar')).toContainText('Transmission Incoming');
  });

  test('hero name renders all 7 letters with aria-label', async ({ page }) => {
    const nameEl = page.locator('#hero-name');
    await expect(nameEl).toHaveAttribute('aria-label', 'Karthik');
    await waitForName(page);
    expect(await page.locator('#hero-name .ch').count()).toBe(7);
  });

  test('hero name letters animate in (get .in class)', async ({ page }) => {
    await waitForName(page);
    expect(await page.locator('#hero-name .ch.in').count()).toBe(7);
  });

  test('surname Subramanian is visible', async ({ page }) => {
    await expect(page.locator('#surname')).toHaveText('Subramanian');
    await expect(page.locator('#surname')).toBeVisible();
  });

  test('transmission text is present', async ({ page }) => {
    await expect(page.locator('.transmission')).toContainText('Something is being built here');
  });

  test('divider is visible', async ({ page }) => {
    await expect(page.locator('.divider')).toBeVisible();
  });

  test('monogram seal and worm-maw SVG render', async ({ page }) => {
    await expect(page.locator('.monogram')).toBeVisible();
    const childCount = await page.evaluate(
      () => document.getElementById('worm-maw')?.childElementCount ?? 0
    );
    expect(childCount).toBeGreaterThan(5);
  });

  test('tick marks are present in monogram', async ({ page }) => {
    const tickCount = await page.evaluate(
      () => document.querySelectorAll('#tickgroup line').length
    );
    expect(tickCount).toBe(60);
  });

  test('scan line is visible', async ({ page }) => {
    await expect(page.locator('.scan')).toBeVisible();
  });

  test('canvas storm is present and sized', async ({ page }) => {
    const canvas = page.locator('#storm');
    await expect(canvas).toBeAttached();
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });
});

// ─── interest tags ───────────────────────────────────────────────────────────

test.describe('Interest tags', () => {
  test.beforeEach(async ({ page }) => {
    await waitForTags(page);
  });

  test('renders exactly 9 tags', async ({ page }) => {
    expect(await page.locator('#tagcluster .tag').count()).toBe(9);
  });

  const TAGS = [
    'Writing', 'Board Games', 'Stargazing', 'Philosophy',
    'Travel', 'Trivia', 'History & Geography',
    'Film & Television', 'Civic Life',
  ];

  for (const tag of TAGS) {
    test(`tag "${tag}" is present`, async ({ page }) => {
      await expect(page.locator('#tagcluster .tag', { hasText: tag })).toBeVisible();
    });
  }
});

// ─── clock ───────────────────────────────────────────────────────────────────

test.describe('Live clock', () => {
  test('PST clock shows HH:MM format after load', async ({ page }) => {
    await page.waitForFunction(
      () => /^\d{2}:\d{2}$/.test(document.getElementById('pst-time')?.textContent ?? ''),
      { timeout: 2000 }
    );
    const text = await page.locator('#pst-time').textContent();
    expect(text).toMatch(/^\d{2}:\d{2}$/);
  });

  test('timezone label is PST or PDT', async ({ page }) => {
    const text = await page.locator('#tz-label').textContent();
    expect(['PST', 'PDT']).toContain(text?.trim());
  });
});

// ─── percentage counter ──────────────────────────────────────────────────────

test.describe('Percentage counter', () => {
  test('animates away from initial "resolving" state', async ({ page }) => {
    await page.waitForFunction(
      () => {
        const pct = document.getElementById('pct');
        return pct && pct.textContent !== 'resolving' && pct.textContent?.includes('%');
      },
      { timeout: 5000 }
    );
    const text = await page.locator('#pct').textContent();
    expect(text).toMatch(/\d+\.\d+%/);
  });
});

// ─── links ───────────────────────────────────────────────────────────────────

test.describe('Navigation links', () => {
  test('LinkedIn link has correct href and security attrs', async ({ page }) => {
    const link = page.locator('.links a[href*="linkedin.com"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });

  test('GitHub link has correct href and security attrs', async ({ page }) => {
    const link = page.locator('.links a[href*="github.com"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });

  test('Instagram link has correct href and security attrs', async ({ page }) => {
    const link = page.locator('.links a[href*="instagram.com"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });

  test('email is an obfuscated, non-scrapable control (no literal address in HTML)', async ({ page }) => {
    const btn = page.locator('.links .email-open');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('data-email', /\[at\]/);
    const content = await page.content();
    expect(content).not.toContain('karthik.subramanian@berkeley.edu');
    expect(content).not.toContain('mailto:karthik');
  });

  test('Dev Profile widget links to /dev/', async ({ page }) => {
    const dev = page.locator('a.devnav');
    await expect(dev).toBeVisible();
    await expect(dev).toHaveAttribute('href', '/dev/');
  });

  test("Peet's coffee link has correct href and security attrs", async ({ page }) => {
    const link = page.locator('a.peets');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /buymeacoffee\.com/);
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });

  test('all target="_blank" links have noopener noreferrer', async ({ page }) => {
    const links = page.locator('a[target="_blank"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const rel = await links.nth(i).getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });
});

// ─── security headers (static file contract) ─────────────────────────────────

test.describe('Security headers contract', () => {
  test('_headers CSP disallows inline scripts and styles', () => {
    const headers = fs.readFileSync(path.join(__dirname, '..', '_headers'), 'utf8');
    expect(headers).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(headers).not.toMatch(/style-src[^;]*'unsafe-inline'/);
    expect(headers).toMatch(/frame-ancestors 'none'/);
    expect(headers).toMatch(/form-action 'none'/);
    expect(headers).toMatch(/object-src 'none'/);
  });
});

// ─── mobile viewports ────────────────────────────────────────────────────────

test.describe('Mobile 375×812', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hero name is visible on mobile', async ({ page }) => {
    await waitForName(page);
    await expect(page.locator('#hero-name')).toBeVisible();
  });

  test('topbar is visible on mobile', async ({ page }) => {
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('interest tags render on mobile', async ({ page }) => {
    await waitForTags(page);
    expect(await page.locator('#tagcluster .tag').count()).toBe(9);
  });

  test('no horizontal overflow on mobile', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(376);
  });

  test('links do not cause horizontal overflow on mobile', async ({ page }) => {
    const box = await page.locator('.links').boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(375);
  });
});

test.describe('Mobile 320×568 (small screen)', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('page renders without horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(321);
  });

  test('hero name is visible on 320px screen', async ({ page }) => {
    await expect(page.locator('#hero-name')).toBeVisible();
  });
});

test.describe('iPad 768×1024 (portrait)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('hero name is visible', async ({ page }) => {
    await waitForName(page);
    await expect(page.locator('#hero-name')).toBeVisible();
  });

  test('all content sections are visible', async ({ page }) => {
    await expect(page.locator('.transmission')).toBeVisible();
    await expect(page.locator('.monogram')).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('nav.links')).toBeVisible();
  });

  test('no horizontal overflow on iPad portrait', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(769);
  });

  test('interest tags render on iPad', async ({ page }) => {
    await waitForTags(page);
    expect(await page.locator('#tagcluster .tag').count()).toBe(9);
  });
});

test.describe('iPad 1024×768 (landscape)', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('hero name is visible in landscape', async ({ page }) => {
    await waitForName(page);
    await expect(page.locator('#hero-name')).toBeVisible();
  });

  test('no horizontal overflow on iPad landscape', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1025);
  });
});

// ─── accessibility ───────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('hero name h1 has aria-label', async ({ page }) => {
    await expect(page.locator('#hero-name')).toHaveAttribute('aria-label', 'Karthik');
  });

  test('canvas storm is not interactive (no tabindex)', async ({ page }) => {
    const tabIndex = await page.locator('#storm').getAttribute('tabindex');
    expect(tabIndex).toBeNull();
  });

  test('seal-art SVG has aria-label', async ({ page }) => {
    await expect(page.locator('.seal-art')).toHaveAttribute('aria-label', 'Shai-Hulud');
  });

  test("Peet's button has aria-label", async ({ page }) => {
    await expect(page.locator('a.peets')).toHaveAttribute('aria-label');
  });

  test('page language is set', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('passes axe accessibility scan', async ({ page }) => {
    await waitForName(page);
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: false,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false },
        },
      },
    });
  });
});

// ─── prefers-reduced-motion ──────────────────────────────────────────────────

test.describe('Prefers reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
  });

  test('content is visible immediately without animation', async ({ page }) => {
    await expect(page.locator('#hero-name')).toBeVisible();
    await expect(page.locator('.transmission')).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('storm canvas is skipped when reduced motion is set', async ({ page }) => {
    const canvas = page.locator('#storm');
    await expect(canvas).toBeAttached();
    const styleWidth = await canvas.evaluate((el) => el.style.width);
    expect(styleWidth).toBe('');
  });

});

// ─── 404 page ────────────────────────────────────────────────────────────────

test.describe('404 page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page).toHaveTitle(/Not Found/);
  });

  test('has return link', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });
});

// ─── performance ─────────────────────────────────────────────────────────────

test.describe('Performance', () => {
  test('hero name reveals within 4 seconds', async ({ page }) => {
    const start = Date.now();
    await waitForName(page, 4000);
    expect(Date.now() - start).toBeLessThan(4000);
  });

  test('all 9 tags reveal within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await waitForTags(page, 5000);
    expect(Date.now() - start).toBeLessThan(5000);
  });
});

// ─── no JS errors ────────────────────────────────────────────────────────────

test.describe('JavaScript errors', () => {
  test('no uncaught errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => {
      const msg = err.message;
      if (msg.includes('cloudflareinsights') || msg.includes('CF_ANALYTICS')) return;
      errors.push(msg);
    });
    await page.waitForTimeout(3000);
    expect(errors).toHaveLength(0);
  });

  test('no failed network requests for critical assets', async ({ page }) => {
    const failed = [];
    page.on('requestfailed', (req) => {
      const url = req.url();
      // Only flag failures on our own server — external CDNs and analytics may fail in dev
      if (url.startsWith('http://localhost:3001')) {
        failed.push(url);
      }
    });
    await page.waitForTimeout(1000);
    expect(failed).toHaveLength(0);
  });
});
