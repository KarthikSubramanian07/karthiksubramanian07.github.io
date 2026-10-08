import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createPortfolioServer } from '../server.mjs';

let server, base;
before(async () => {
  server = createPortfolioServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

test('all portfolio pages negotiate complete HTML and Markdown with HEAD parity', async () => {
  for (const path of ['/', '/about/', '/contact/', '/privacy/', '/dev/']) {
    for (const type of ['text/html', 'text/markdown']) {
      const response = await fetch(base + path, { headers: { Accept: type } });
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('content-type'), `${type}; charset=utf-8`);
      assert.equal(response.headers.get('vary'), 'Accept');
      const body = await response.text();
      assert.ok(body.length > 500, path);
      assert.match(body, type === 'text/html' ? /<h1[ >]/ : /^# /m);
      const head = await fetch(base + path, { method: 'HEAD', headers: { Accept: type } });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get('content-type'), response.headers.get('content-type'));
      assert.equal(head.headers.get('content-length'), response.headers.get('content-length'));
      assert.equal(await head.text(), '');
    }
  }
});

test('Accept quality values, exclusions, wildcards and default select correctly', async () => {
  for (const [accept, type, status] of [
    ['text/markdown;q=0, text/html', 'text/html', 200],
    ['text/html;q=0.2, text/markdown;q=0.9', 'text/markdown', 200],
    ['text/html;q=0, text/markdown;q=0', 'text/plain', 406],
    ['application/json', 'text/plain', 406],
    ['*/*', 'text/html', 200],
    ['text/*;q=0.5, text/markdown;q=0', 'text/html', 200],
  ]) {
    const response = await fetch(base, { headers: { Accept: accept } });
    assert.equal(response.status, status, accept);
    assert.match(response.headers.get('content-type'), new RegExp(`^${type}`));
    assert.equal(response.headers.get('vary'), 'Accept');
  }
});

test('missing and private paths retain 404 in both representations without reflecting input', async () => {
  for (const path of ['/missing', '/package.json', '/server.mjs', '/README.md', '/tests/runtime.test.mjs', '/.git/config', '/scripts/update-stats.mjs', '/%2e%2e/package.json', '/<script>alert(1)</script>']) {
    for (const type of ['text/html', 'text/markdown']) {
      const response = await fetch(base + path, { headers: { Accept: type } });
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('content-type'), `${type}; charset=utf-8`);
      assert.equal(response.headers.get('vary'), 'Accept');
      const body = await response.text();
      assert.ok(body.length >= 20);
      assert.match(body, /llms\.txt|sitemap\.xml/);
      assert.ok(!body.includes('alert(1)'));
    }
  }
});

test('public files are accessible and clean paths redirect once preserving queries', async () => {
  for (const path of ['/index.md', '/about/index.md', '/contact/index.md', '/privacy/index.md', '/dev/index.md', '/404.md', '/robots.txt', '/sitemap.xml', '/llms.txt', '/styles.css', '/content.css', '/main.js', '/dev.js', '/dev-stats.json', '/favicon.svg', '/og-image.png', '/apple-touch-icon.png']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0, path);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  for (const path of ['/about', '/contact', '/privacy', '/dev']) {
    const response = await fetch(`${base}${path}?from=home`, { redirect: 'manual' });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), `${path}/?from=home`);
  }
  const response = await fetch(base, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

async function rpc(method, params = {}, extra = {}) {
  return fetch(`${base}/.well-known/mcp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...extra },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
}

test('official client performs handshake, lists read-only tools and retrieves every public page', async () => {
  const client = new Client({ name: 'portfolio-test', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(`${base}/.well-known/mcp`));
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().name, 'portfolio');
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ['read_portfolio_page', 'read_site_navigation']);
    for (const tool of tools) assert.equal(tool.annotations.readOnlyHint, true);
    for (const page of ['home', 'about', 'contact', 'privacy', 'development']) {
      const result = await client.callTool({ name: 'read_portfolio_page', arguments: { page } });
      assert.ok(!result.isError);
      assert.match(result.content[0].text, /^# /m);
    }
    const navigation = await client.callTool({ name: 'read_site_navigation', arguments: {} });
    assert.match(navigation.content[0].text, /<urlset/);
    assert.match(navigation.content[1].text, /^# /m);
    const invalid = await client.callTool({ name: 'read_portfolio_page', arguments: { page: '../../package.json' } });
    assert.equal(invalid.isError, true);
  } finally { await client.close(); }
});

test('MCP enforces origin, methods, JSON parsing and request size', async () => {
  for (const method of ['GET', 'HEAD', 'DELETE', 'PUT', 'OPTIONS']) {
    const response = await fetch(`${base}/.well-known/mcp`, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
  }
  for (const origin of ['https://other.example', 'null', 'not-a-url', `${base}/`, 'https://karthiksubramanian07.github.io.evil.example']) {
    assert.equal((await rpc('tools/list', {}, { Origin: origin })).status, 403, origin);
  }
  assert.equal((await rpc('tools/list', {}, { Origin: base })).status, 200);
  assert.equal((await rpc('tools/list', {}, { Origin: 'https://karthiksubramanian07.github.io' })).status, 200);
  const malformed = await fetch(`${base}/.well-known/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, -32700);
  const oversized = await fetch(`${base}/.well-known/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(65537) });
  assert.equal(oversized.status, 413);
  const chunked = await new Promise((resolve, reject) => {
    const request = http.request(`${base}/.well-known/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.write('x'.repeat(32768));
    request.end('x'.repeat(32769));
  });
  assert.equal(chunked, 413);
  const wrongType = await fetch(`${base}/.well-known/mcp`, { method: 'POST', body: '{}' });
  assert.equal(wrongType.status, 415);
  const unacceptable = await rpc('tools/list', {}, { Accept: 'application/json' });
  assert.equal(unacceptable.status, 406);
  const unknown = await rpc('unknown/method');
  assert.equal((await unknown.json()).error.code, -32601);
  const missingTool = await rpc('tools/call', { name: 'missing', arguments: {} });
  const missingResult = await missingTool.json();
  assert.ok(missingResult.error || missingResult.result.isError);
});

test('MCP rejects hostile Host and handles simultaneous stateless requests', async () => {
  const hostile = await new Promise((resolve, reject) => {
    const request = http.request(`${base}/.well-known/mcp`, { headers: { Host: 'evil.example' } }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject); request.end();
  });
  assert.equal(hostile, 403);
  const results = await Promise.all(Array.from({ length: 40 }, async (_, i) => {
    const response = await rpc('tools/call', { name: 'read_portfolio_page', arguments: { page: i % 2 ? 'home' : 'about' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('mcp-session-id'), null);
    assert.match((await response.json()).result.content[0].text, /^# /m);
  }));
  assert.equal(results.length, 40);
});
