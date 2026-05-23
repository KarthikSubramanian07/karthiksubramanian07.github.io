// @ts-check
const { test, expect } = require('@playwright/test');

// ─── helpers ────────────────────────────────────────────────────────────────

/** Wait until the JS hero-name letters have been injected AND animated in. */
async function waitForName(page, timeout = 5000) {
  await page.waitForFunction(
    () => document.querySelectorAll('#hero-name .ch.in').length === 7,
    { timeout }
  );
}

/** Wait until the interest tags have been injected. */
async function waitForTags(page, timeout = 5000) {
  await page.waitForFunction(
    () => document.querySelectorAll('#tagcluster .tag').length === 9,
    { timeout }
  );
}

// ─── page structure ──────────────────────────────────────────────────────────

test.describe('Page structure', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/winnerkarthik\.dev/);
  });

  test('has meta description mentioning Karthik Subramanian', async ({ page }) => {
    await page.goto('/');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /Karthik Subramanian/);
  });

  test('has Open Graph image', async ({ page }) => {
    await page.goto('/');
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /og-image\.png/);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /winnerkarthik\.dev/);
  });

  test('uses semantic header element for topbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header.topbar')).toBeAttached();
  });

  test('uses semantic nav element for links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.links')).toBeAttached();
  });

  test('hero name is an h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1.name')).toBeAttached();
  });
});

// ─── core content ───────────────────────────────────────────────────────────

test.describe('Core content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('topbar shows branding and transmission status', async ({ page }) => {
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('.topbar')).toContainText('winnerkarthik.dev');
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
    await page.waitForFunction(
      () => (document.getElementById('worm-maw')?.childElementCount ?? 0) > 5,
      { timeout: 2000 }
    );
    const childCount = await page.evaluate(
      () => document.getElementById('worm-maw')?.childElementCount ?? 0
    );
    expect(childCount).toBeGreaterThan(5);
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
    await page.goto('/');
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
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

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
    await page.goto('/');
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
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

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

  test('email link exists', async ({ page }) => {
    await expect(page.locator('.links a[href^="mailto:"]')).toBeVisible();
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

// ─── cursor ──────────────────────────────────────────────────────────────────

test.describe('Sandworm cursor', () => {
  test('cursor element is present with worm maw SVG', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cursor')).toBeAttached();
    await expect(page.locator('.cursor-maw')).toBeAttached();
    await expect(page.locator('.c-outer-ring')).toBeAttached();
    await expect(page.locator('.c-mid-ring')).toBeAttached();
    await expect(page.locator('.c-inner-ring')).toBeAttached();
  });
});

// ─── mobile viewports ────────────────────────────────────────────────────────

test.describe('Mobile 375×812', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('custom cursor is hidden on mobile', async ({ page }) => {
    await page.goto('/');
    const display = await page.locator('#cursor').evaluate(
      (el) => getComputedStyle(el).display
    );
    expect(display).toBe('none');
  });

  test('hero name is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await waitForName(page);
    await expect(page.locator('#hero-name')).toBeVisible();
  });

  test('topbar is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('interest tags render on mobile', async ({ page }) => {
    await page.goto('/');
    await waitForTags(page);
    expect(await page.locator('#tagcluster .tag').count()).toBe(9);
  });

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(376);
  });

  test('links do not cause horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('.links').boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(375);
  });
});

test.describe('Mobile 320×568 (small screen)', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('page renders without horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(321);
  });

  test('hero name is visible on 320px screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-name')).toBeVisible();
  });
});

test.describe('Tablet 768×1024', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('page renders correctly on tablet', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-name')).toBeVisible();
    await expect(page.locator('.transmission')).toBeVisible();
  });
});

// ─── accessibility ───────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero name h1 has aria-label', async ({ page }) => {
    await expect(page.locator('#hero-name')).toHaveAttribute('aria-label', 'Karthik');
  });

  test('canvas storm is not interactive (no tabindex)', async ({ page }) => {
    const tabIndex = await page.locator('#storm').getAttribute('tabindex');
    expect(tabIndex).toBeNull();
  });

  test('cursor element is aria-hidden', async ({ page }) => {
    await expect(page.locator('#cursor')).toHaveAttribute('aria-hidden', 'true');
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
});

// ─── prefers-reduced-motion ──────────────────────────────────────────────────

test.describe('Prefers reduced motion', () => {
  test('content is visible immediately without animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#hero-name')).toBeVisible();
    await expect(page.locator('.transmission')).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('canvas is skipped when reduced motion is set', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Canvas exists in DOM but storm IIFE returns early so resize() is never called
    const canvas = page.locator('#storm');
    await expect(canvas).toBeAttached();
    // style.width is empty when resize() was never called
    const styleWidth = await canvas.evaluate((el) => el.style.width);
    expect(styleWidth).toBe('');
  });
});

// ─── no JS errors ────────────────────────────────────────────────────────────

test.describe('JavaScript errors', () => {
  test('no uncaught errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    // Wait for all deferred JS (PST clock, counters, etc.)
    await page.waitForTimeout(2500);
    expect(errors).toHaveLength(0);
  });

  test('no failed network requests for critical assets', async ({ page }) => {
    const failed = [];
    page.on('requestfailed', (req) => {
      if (!req.url().includes('cloudflareinsights') && !req.url().includes('CF_ANALYTICS')) {
        failed.push(req.url());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(failed).toHaveLength(0);
  });
});
