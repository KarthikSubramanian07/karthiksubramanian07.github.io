#!/usr/bin/env node
'use strict';

const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');

const PORT = 3000;
const BASE = 'http://localhost:' + PORT;
const THRESHOLD_MS = 4000;

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['serve', '.', '-p', String(PORT), '-n'], {
      cwd: require('path').join(__dirname, '..'),
      stdio: 'pipe',
      shell: true
    });
    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && /localhost:\d+/.test(text)) {
        ready = true;
        resolve(proc);
      }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);
    setTimeout(() => {
      if (!ready) resolve(proc);
    }, 3000);
  });
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const start = Date.now();
  await page.goto(BASE + '/');
  await page.waitForFunction(
    () => document.querySelectorAll('#hero-name .ch.in').length === 7,
    { timeout: THRESHOLD_MS + 2000 }
  );
  const elapsed = Date.now() - start;
  await browser.close();
  server.kill('SIGTERM');

  const status = elapsed < THRESHOLD_MS ? 'VERIFIED' : 'NOT VERIFIED';
  console.log(
    status +
      ': 7 .ch.in in ' +
      elapsed +
      'ms (threshold < ' +
      THRESHOLD_MS +
      'ms)'
  );
  process.exit(status === 'VERIFIED' ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
