import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Negotiator from 'negotiator';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const root = dirname(fileURLToPath(import.meta.url));
const pages = { home: '', about: 'about/', contact: 'contact/', privacy: 'privacy/', development: 'dev/' };
const assets = {
  '/styles.css': 'text/css', '/noscript.css': 'text/css', '/404.css': 'text/css',
  '/dev.css': 'text/css', '/content.css': 'text/css', '/main.js': 'text/javascript',
  '/dev.js': 'text/javascript', '/dev-stats.json': 'application/json',
  '/favicon.svg': 'image/svg+xml', '/apple-touch-icon.png': 'image/png',
  '/og-image.png': 'image/png', '/robots.txt': 'text/plain', '/sitemap.xml': 'application/xml',
  '/llms.txt': 'text/plain',
  '/404.html': 'text/html', '/404.md': 'text/markdown',
};
for (const directory of Object.values(pages)) {
  assets[`/${directory}index.md`] = 'text/markdown';
  assets[`/${directory}index.html`] = 'text/html';
}

function reply(req, res, status, type, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': type.startsWith('image/') ? type : `${type}; charset=utf-8`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

function rpcError(req, res, status, message, code = -32600, headers = {}) {
  reply(req, res, status, 'application/json', JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }), headers);
}

function portfolioServer() {
  const server = new McpServer({ name: 'portfolio', version: '1.0.0' });
  const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  server.registerTool('read_portfolio_page', {
    title: 'Read a portfolio page',
    description: 'Retrieve published biography, contact channels, privacy information, homepage, or development profile as Markdown.',
    inputSchema: { page: z.enum(Object.keys(pages)) }, annotations,
  }, async ({ page }) => {
    try {
      return { content: [{ type: 'text', text: await readFile(join(root, pages[page], 'index.md'), 'utf8') }] };
    } catch {
      return { isError: true, content: [{ type: 'text', text: 'This public page is temporarily unavailable.' }] };
    }
  });
  server.registerTool('read_site_navigation', {
    title: 'Read site navigation',
    description: 'Retrieve the published sitemap and reading guide to locate public portfolio pages.',
    inputSchema: {}, annotations,
  }, async () => {
    try {
      return { content: [
        { type: 'text', text: await readFile(join(root, 'sitemap.xml'), 'utf8') },
        { type: 'text', text: await readFile(join(root, 'llms.txt'), 'utf8') },
      ] };
    } catch {
      return { isError: true, content: [{ type: 'text', text: 'Site navigation is temporarily unavailable.' }] };
    }
  });
  return server;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    const cleanup = () => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
    };
    const onError = error => { cleanup(); reject(error); };
    const onData = chunk => {
      bytes += chunk.length;
      if (bytes > 65536) {
        const error = new Error('Request body exceeds 64 KiB.');
        error.status = 413;
        cleanup();
        req.resume();
        reject(error);
      } else chunks.push(chunk);
    };
    const onEnd = () => {
      cleanup();
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (error) { reject(error); }
    };
    req.on('data', onData);
    req.once('end', onEnd);
    req.once('error', onError);
  });
}

export function createPortfolioServer({ publicOrigin = 'https://karthiksubramanian07.github.io', allowedOrigins = [] } = {}) {
  const canonicalOrigin = new URL(publicOrigin).origin;
  const publicHost = new URL(canonicalOrigin).hostname;
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;
      if (pathname === '/.well-known/mcp') {
        let requestHost;
        try { requestHost = new URL(`http://${req.headers.host}`); } catch {
          return rpcError(req, res, 403, 'Host is not allowed.');
        }
        if (![publicHost, 'localhost', '127.0.0.1', '[::1]'].includes(requestHost.hostname)) {
          return rpcError(req, res, 403, 'Host is not allowed.');
        }
        if (req.headers.origin) {
          const origin = req.headers.origin;
          const origins = [canonicalOrigin, ...allowedOrigins];
          if (['localhost', '127.0.0.1', '[::1]'].includes(requestHost.hostname)) origins.push(requestHost.origin);
          if (!origins.includes(origin)) return rpcError(req, res, 403, 'Origin is not allowed.');
        }
        if (req.method !== 'POST') return rpcError(req, res, 405, 'Use POST for this endpoint.', -32600, { Allow: 'POST' });
        if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
          return rpcError(req, res, 415, 'Content-Type must be application/json.');
        }
        const length = Number(req.headers['content-length']);
        if (length > 65536) return rpcError(req, res, 413, 'Request body exceeds 64 KiB.', -32600, { Connection: 'close' });
        let body;
        try { body = await readJsonBody(req); } catch (error) {
          return rpcError(req, res, error.status || 400, error.status ? error.message : 'Invalid JSON.', -32700, error.status ? { Connection: 'close' } : {});
        }
        const server = portfolioServer();
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
        res.once('close', () => { void transport.close(); void server.close(); });
        await server.connect(transport);
        await transport.handleRequest(req, res, body);
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) {
        return reply(req, res, 405, 'text/plain', 'Use GET or HEAD to read this page.\n', { Allow: 'GET, HEAD' });
      }
      const directory = Object.values(pages).find(value => pathname === `/${value}`);
      const redirect = Object.values(pages).find(value => value && pathname === `/${value.slice(0, -1)}`);
      if (redirect) return reply(req, res, 308, 'text/plain', 'This page has moved.\n', { Location: `/${redirect}${url.search}`, Vary: 'Accept' });
      if (directory !== undefined || !Object.hasOwn(assets, pathname)) {
        const representation = new Negotiator(req).mediaType(['text/html', 'text/markdown']);
        if (!representation) return reply(req, res, 406, 'text/plain', 'Available formats: text/html and text/markdown.\n', { Vary: 'Accept' });
        const status = directory === undefined ? 404 : 200;
        const extension = representation === 'text/markdown' ? 'md' : 'html';
        const file = status === 404 ? `404.${extension}` : `${directory}index.${extension}`;
        return reply(req, res, status, representation, await readFile(join(root, file)), { Vary: 'Accept', ...(status === 404 ? { 'Cache-Control': 'no-store' } : {}) });
      }
      return reply(req, res, 200, assets[pathname], await readFile(join(root, pathname.slice(1))));
    } catch {
      if (!res.headersSent) reply(req, res, 500, 'text/plain', 'Unable to serve this request.\n', { 'Cache-Control': 'no-store' });
      else res.end();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  const server = createPortfolioServer({ publicOrigin: process.env.PUBLIC_ORIGIN });
  server.listen(port, host, () => console.log(`Portfolio listening on http://${host}:${server.address().port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
