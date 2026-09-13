/** Check the public navigation contract in source and generated locale HTML. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { SHELL_ROUTES } from './site-shell.mjs';

const pages = ['index.html','solutions/index.html','practice/index.html','ai-course/index.html','ai-course/fde/index.html','ai-course/mvp-3day/index.html','internal-expense/index.html','contact/wecom/index.html','sitemap/index.html'];
const locales = process.argv.includes('--source-only') ? [''] : ['', 'en/', 'zh-Hant/'];
let checked = 0;
for (const locale of locales) for (const page of pages) {
  const file = locale + page;
  const html = fs.readFileSync(file, 'utf8');
  assert.equal((html.match(/data-site-header/g) || []).length, 1, `${file}: one shared header`);
  assert.equal((html.match(/data-site-footer/g) || []).length, 1, `${file}: one shared footer`);
  assert.equal((html.match(/site-theme\.js/g) || []).length, 1, `${file}: one theme bootstrap`);
  assert.equal((html.match(/site-shell\.css/g) || []).length, 1, `${file}: one shell stylesheet`);
  const header = html.match(/<header class="lan-header"[\s\S]*?<\/header>/)[0];
  const footer = html.match(/<footer class="lan-footer"[\s\S]*?<\/footer>/)[0];
  assert.deepEqual([...header.matchAll(/data-shell-route="([^"]+)"/g)].map(match => match[1]), SHELL_ROUTES.map(item => item.id), `${file}: primary menu order`);
  for (const region of [header, footer]) {
    for (const option of ['system','light','dark']) assert.ok(region.includes(`data-theme-option="${option}"`), `${file}: ${option} theme choice`);
    for (const language of ['zh-Hans','zh-Hant','en']) assert.ok(region.includes(`data-shell-locale="${language}"`), `${file}: ${language} language choice`);
  }
  for (const match of [...header.matchAll(/href="([^"]+)"/g), ...footer.matchAll(/href="([^"]+)"/g), ...html.matchAll(/class="lan-skip" href="([^"]+)"/g)]) {
    const url = new URL(match[1], `https://local.test/${file.replace(/index\.html$/, '')}`);
    if (url.origin !== 'https://local.test') continue;
    const target = path.join(process.cwd(), decodeURI(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(fs.existsSync(target), `${file}: missing navigation target ${url.pathname}`);
    if (url.hash) assert.ok(fs.readFileSync(target,'utf8').includes(`id="${url.hash.slice(1)}"`), `${file}: missing anchor ${url.hash}`);
    assert.ok(url.pathname.startsWith(`/${locale}`), `${file}: link changed the visitor's locale`);
  }
  checked++;
}
console.log(`Shared header, footer, theme, language and navigation destinations passed for ${checked} pages.`);
