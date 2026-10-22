#!/usr/bin/env node
/** Read-only public HTTP checks. Run explicitly after the production cutover. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apex = 'https://lancloudtech.com';
const globalHost = 'https://global.lancloudtech.com';
const manifest = JSON.parse(await fs.readFile(path.join(root, 'release-manifest.json'), 'utf8'));
const expectedSitemap = await fs.readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
const sitemapLocations = xml => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => match[1].trim());
const locations = sitemapLocations(expectedSitemap);
if (locations.length !== 27 || locations.some(url => !url.startsWith(`${apex}/`))) {
  throw new Error('Expected exactly 27 apex sitemap routes in the production output');
}
const routes = locations.map(url => new URL(url).pathname);
const results = [];
const tasks = [];
const startedAt = new Date().toISOString();
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
const count = (text, expression) => [...text.matchAll(expression)].length;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeHeaders = headers => Object.fromEntries([
  'content-type', 'cache-control', 'x-robots-tag', 'location', 'server', 'etag',
].filter(name => headers.has(name)).map(name => [name, headers.get(name)]));

async function request(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': 'LAN-Cloud-AI-Release-Verification/1.0', 'Accept': '*/*' },
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.text();
      if ([429, 502, 503, 504].includes(response.status) && attempt < 3) {
        await sleep(attempt * 1500);
        continue;
      }
      return { status: response.status, headers: safeHeaders(response.headers), body, attempts: attempt };
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(attempt * 1000);
    }
  }
}

function queue(kind, url, verify) {
  tasks.push(async () => {
    const failures = [];
    const check = (condition, message) => { if (!condition) failures.push(message); };
    try {
      const response = await request(url);
      const details = await verify(response, check) || {};
      results.push({ kind, url, status: response.status, headers: response.headers, attempts: response.attempts, passed: failures.length === 0, failures, ...details });
    } catch (error) {
      results.push({ kind, url, passed: false, failures: [`Request failed: ${error.name}: ${error.message}`] });
    }
    const done = results.length;
    if (done % 12 === 0 || done === tasks.length) console.log(`Production HTTP verification ${done}/${tasks.length}`);
  });
}

function resourcesFromHtml(html) {
  const resources = [];
  for (const match of html.matchAll(/<(?:script|link|img|source|video)\b[^>]*>/gi)) {
    const tag = match[0];
    if (/^<link\b/i.test(tag) && !/\b(?:stylesheet|icon|apple-touch-icon|preload|modulepreload)\b/i.test(attr(tag, 'rel'))) continue;
    for (const name of ['src', 'href', 'poster']) if (attr(tag, name)) resources.push(attr(tag, name));
    if (attr(tag, 'srcset')) resources.push(...attr(tag, 'srcset').split(',').map(value => value.trim().split(/\s+/)[0]));
  }
  return resources;
}

for (const origin of [apex, globalHost]) {
  for (const route of routes) queue('page', origin + route, (response, check) => {
    const html = response.body;
    check(response.status === 200, 'Page does not return 200');
    check(/text\/html/i.test(response.headers['content-type'] || ''), 'Page has incorrect HTML Content-Type');
    check(!/demo-review-label|Website preview\s*·\s*Demo|官网改版预览\s*·\s*Demo|官網改版預覽\s*·\s*Demo|chatgpt\.site/.test(html), 'Demo residue remains');
    const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).find(tag => attr(tag, 'rel') === 'canonical');
    const canonical = attr(canonicalTag || '', 'href');
    check(canonical === apex + route, `Canonical mismatch: ${canonical}`);
    const analytics = count(html, /data-lan-analytics=["']umami["']/g);
    const events = count(html, /data-lan-events=["']umami["']/g);
    check(analytics === 1, `Expected one analytics script; got ${analytics}`);
    check(events === 1, `Expected one events script; got ${events}`);
    check(html.includes('d93294b3-1e1c-4127-9289-1fb8bdc42293'), 'Original corporate analytics ID missing');
    const robotsTag = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).find(tag => attr(tag, 'name') === 'robots');
    check(!/noindex/i.test(attr(robotsTag || '', 'content')), 'Normal page has noindex meta');
    const resources = resourcesFromHtml(html);
    const packaged = resources.filter(url => !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('https://stats.lancloudtech.com/'));
    const releaseReferences = [...new Set(html.match(/https:\/\/img\.lancloudtech\.com\/lanxin\/webpage\/releases\/compact-[a-f0-9]+/g) || [])];
    if (origin === apex) {
      check(!/noindex/i.test(response.headers['x-robots-tag'] || ''), 'Apex response has noindex header');
      check(releaseReferences.length === 1 && releaseReferences[0] === manifest.cdnBase, 'Apex does not exclusively reference the current CDN release');
      check(packaged.length > 0 && packaged.every(url => url.startsWith(`${manifest.cdnBase}/`)), 'Apex static resources escape the current CDN release');
    } else {
      check(/noindex/i.test(response.headers['x-robots-tag'] || ''), 'Global mirror lacks noindex response header');
      check(releaseReferences.length === 0, 'Global mirror depends on the domestic release CDN');
      check(packaged.every(url => new URL(url, origin + route).origin === globalHost), 'Global static resources are not same-origin');
    }
    return { route, canonical, analytics, events, resourceCount: resources.length, releaseReferences };
  });

  for (const [prefix, language] of [['', 'zh-CN'], ['/en', 'en'], ['/zh-Hant', 'zh-Hant']]) {
    const route = `${prefix}/__release-not-found-${manifest.release}/`;
    queue('not-found', origin + route, (response, check) => {
      check(response.status === 404, 'Missing route does not return a true 404');
      const htmlTag = response.body.match(/<html\b[^>]*>/i)?.[0] || '';
      check(attr(htmlTag, 'lang') === language, '404 response uses the wrong locale');
      check(!/demo-review-label|chatgpt\.site/.test(response.body), '404 contains demo residue');
    });
  }

  for (const [from, to] of [
    ['/index.html', '/'],
    ['/solutions/index.html', '/solutions/'],
    ['/en/index.html', '/en/'],
    ['/preview', '/'],
    ['/preview/', '/'],
    ['/preview/solutions/?audit=1', '/solutions/?audit=1'],
    ['/leadshunter/', 'https://leadshunter.lancloudtech.com/'],
  ]) queue('redirect', origin + from, (response, check) => {
    check(response.status === 301, `Expected 301 redirect; got ${response.status}`);
    const destination = response.headers.location ? new URL(response.headers.location, origin + from).href : '';
    check(destination === new URL(to, origin).href, `Redirect target mismatch: ${destination}`);
  });

  queue('robots', origin + '/robots.txt', (response, check) => {
    check(response.status === 200, 'robots.txt does not return 200');
    check(!/^Disallow:\s*\/\s*$/mi.test(response.body), 'robots.txt blocks the whole site');
    check(response.body.includes(`Sitemap: ${apex}/sitemap.xml`), 'robots.txt missing apex sitemap');
  });
  queue('sitemap', origin + '/sitemap.xml', (response, check) => {
    check(response.status === 200, 'sitemap.xml does not return 200');
    const actual = sitemapLocations(response.body);
    check(JSON.stringify(actual) === JSON.stringify(locations), 'Sitemap route set differs from approved production output');
    return { sitemapRouteCount: actual.length };
  });
}

queue('www-redirect', 'https://www.lancloudtech.com/solutions/?audit=1', (response, check) => {
  check(response.status === 301, 'www does not return 301');
  check(response.headers.location === `${apex}/solutions/?audit=1`, 'www redirect loses path or query');
});

const verificationName = 'baidu_verify_codeva-AkZ0e24V6q.html';
const verificationBytes = await fs.readFile(path.join(root, 'dist', verificationName), 'utf8');
for (const origin of [apex, 'https://www.lancloudtech.com', globalHost]) {
  queue('search-verification', origin + '/' + verificationName, async (response, check) => {
    // Pages retains its standard .html-to-extensionless canonical redirect.
    if (origin === globalHost && [301, 308].includes(response.status)) {
      const location = response.headers.location ? new URL(response.headers.location, origin).href : '';
      check(location === `${origin}/${verificationName.replace(/\.html$/, '')}`, 'Unexpected verification-file redirect');
      if (location.startsWith(`${origin}/`)) response = await request(location);
    }
    check(response.status === 200, 'Search verification file does not return 200');
    check(response.body === verificationBytes, 'Search verification contents changed');
    return { finalStatus: response.status, verificationBytes: Buffer.byteLength(response.body) };
  });
}

let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < tasks.length) await tasks[next++]();
}));
results.sort((a, b) => a.url.localeCompare(b.url) || a.kind.localeCompare(b.kind));
const failures = results.filter(result => !result.passed);
const report = {
  release: manifest.release, cdnBase: manifest.cdnBase, startedAt, completedAt: new Date().toISOString(),
  passed: failures.length === 0, sitemapRoutes: routes.length, checkedPages: results.filter(result => result.kind === 'page').length,
  checks: results.length, passedChecks: results.length - failures.length, failedChecks: failures.length,
  failures: failures.map(({ kind, url, failures }) => ({ kind, url, failures })), results,
};
await fs.mkdir(path.join(root, 'release-evidence'), { recursive: true });
await fs.writeFile(path.join(root, 'release-evidence/live-http.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ release: report.release, passed: report.passed, checks: report.checks, checkedPages: report.checkedPages, failedChecks: report.failedChecks, failures: report.failures }, null, 2));
if (!report.passed) process.exitCode = 1;
