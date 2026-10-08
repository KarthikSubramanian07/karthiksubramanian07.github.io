// @ts-check
const { test, expect } = require('@playwright/test');

const pages = ['/', '/dev/', '/about/', '/contact/', '/privacy/'];

test('homepage has meaningful raw content, complete identity and sequential headings', async ({ browser, request, baseURL }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Karthik Subramanian', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Systems, machine learning & hardware');
  const text = await page.locator('.portfolio-summary').innerText();
  expect(text.length).toBeGreaterThanOrEqual(500);
  expect(text).toContain('CUDA telemetry');
  await expect(page.locator('#tagcluster .tag').first()).toBeVisible();
  const levels = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes => nodes.map(n => Number(n.tagName.slice(1))));
  expect(levels).toEqual([1, 2]);
  for (const href of ['/about/', '/contact/', '/privacy/', '/dev/']) {
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  }
  await context.close();
});

test('structured identity and social metadata describe technical focus', async ({ page }) => {
  await page.goto('/');
  const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  const person = graph['@graph'].find(entity => entity['@type'] === 'Person');
  expect(person.description).toContain('software systems');
  expect(person.description.length).toBeGreaterThan(50);
  expect(person.url).toBe('https://karthiksubramanian07.github.io/');
  await expect(page).toHaveTitle(/Karthik Subramanian.*Software Systems/);
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', /software systems, machine learning and hardware/);
  }
});

test('every content page advertises working Markdown and site directory links', async ({ page, request }) => {
  for (const url of pages) {
    await page.goto(url);
    await expect(page.locator('link[rel="describedby"]')).toHaveAttribute('href', '/llms.txt');
    const alternate = page.locator('link[rel="alternate"][type="text/markdown"]');
    const href = await alternate.getAttribute('href');
    expect(href).toBeTruthy();
    const markdown = await request.get(href);
    expect(markdown.status()).toBe(200);
    const body = await markdown.text();
    expect(body).toMatch(/^# /);
    expect(body.length).toBeGreaterThan(500);
    expect(body).not.toMatch(/<html/i);
  }
});

test('site directory follows linked section format and every first-party URL resolves', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/^# Karthik Subramanian\n\n> /);
  expect(body).toContain('## When to use this');
  const sections = body.split(/^## /m).slice(1);
  for (const section of sections) {
    const [, ...lines] = section.trim().split('\n');
    expect(lines.filter(line => line.trim()).every(line => /^- \[[^\]]+\]\(https:\/\//.test(line))).toBe(true);
  }
  const links = [...body.matchAll(/\]\(https:\/\/karthiksubramanian07\.github\.io([^)]*)\)/g)];
  expect(links.length).toBeGreaterThanOrEqual(6);
  for (const [, path] of links) expect((await request.get(path)).status()).toBe(200);
});

test('sitemap contains canonical content pages and excludes missing-page representation', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const body = await response.text();
  for (const path of pages) {
    expect(body).toContain(`<loc>https://karthiksubramanian07.github.io${path}</loc>`);
    expect((await request.get(path)).status()).toBe(200);
  }
  expect(body).not.toContain('404');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://karthiksubramanian07.github.io/sitemap.xml');
});

test('error representations provide usable discovery links', async ({ page, request }) => {
  await page.goto('/404.html');
  await expect(page.locator('a[href="/llms.txt"]')).toBeVisible();
  await expect(page.locator('a[href="/sitemap.xml"]')).toBeVisible();
  const markdown = await (await request.get('/404.md')).text();
  expect(markdown).toContain('# Page not found');
  expect(markdown).toContain('https://karthiksubramanian07.github.io/llms.txt');
  expect(markdown.length).toBeGreaterThan(20);
});

test('developer profile remains useful without scripts and excludes disallowed labels', async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/dev/');
  await expect(page.locator('.tagline')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the developer profile' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact information' })).toBeVisible();
  const script = await (await request.get('/dev.js')).text();
  expect(script).not.toMatch(/claude|chatgpt|anthropic|openai|ai.generated/i);
  await context.close();
});
