import test from 'node:test';
import assert from 'node:assert/strict';
import { productionHtml, rewriteAssets, APEX, GLOBAL } from './build-production.mjs';

const files = new Set(['company.js', 'images/demo.webp', 'fonts/test.ttf', 'ai-course/course.js']);
const base = 'https://img.lancloudtech.com/lanxin/webpage/releases/test';

test('domestic cross-origin entrypoints retain relative module import semantics and complete srcsets', () => {
  const html = '<link rel="stylesheet" href="../company.js"><img src="/images/demo.webp" srcset="/images/demo.webp 768w, ../images/demo.webp 1536w"><a href="/ai-course/">课</a>';
  const result = rewriteAssets(html, 'solutions/index.html', files, base);
  assert.equal((result.match(new RegExp(`${base}/images/demo.webp`, 'g')) || []).length, 3);
  assert.ok(result.includes(`href="${base}/company.js"`));
  assert.ok(result.includes('href="/ai-course/"'));
  const module = "import '../company.js'; const image='/images/demo.webp'; const url='https://outside.example/image.png';";
  const rewritten = rewriteAssets(module, 'ai-course/course.js', files, base);
  assert.ok(rewritten.includes("import '../company.js'"));
  assert.ok(rewritten.includes(`'${base}/images/demo.webp'`));
  assert.ok(rewritten.includes('https://outside.example/image.png'));
});

test('global mirror retains local assets and moves only share-image URLs to Pages', () => {
  const html = `<link rel="canonical" href="${APEX}/"><meta property="og:image" content="${APEX}/images/demo.webp"><img src="/images/demo.webp">`;
  const result = rewriteAssets(html, 'index.html', files, base, true);
  assert.ok(result.includes(`href="${APEX}/"`));
  assert.ok(result.includes(`content="${GLOBAL}/images/demo.webp"`));
  assert.ok(result.includes('src="/images/demo.webp"'));
  assert.ok(!result.includes(base));
});

test('release sanitation preserves product text, restores one domain-scoped tracker and keeps 404 noindex', () => {
  const raw = '<head><meta name="robots" content="noindex,nofollow"/><style>.demo-review-label{color:red}</style></head><body data-site-version="demo"><h1>LeadsHunter Global</h1><div class="demo-review-label">Website preview · Demo</div></body>';
  const result = productionHtml(productionHtml(raw, 'index.html'), 'index.html');
  assert.ok(result.includes('<h1>LeadsHunter Global</h1>'));
  assert.ok(!result.includes('demo-review-label'));
  assert.equal((result.match(/data-lan-analytics=/g) || []).length, 1);
  assert.equal((result.match(/data-lan-events=/g) || []).length, 1);
  assert.ok(result.includes('data-domains="lancloudtech.com,www.lancloudtech.com,global.lancloudtech.com"'));
  assert.ok(result.includes('index,follow,max-image-preview:large'));
  assert.ok(productionHtml(raw, 'en/404.html').includes('content="noindex,follow"'));
  assert.equal(productionHtml('verified-search-token', 'baidu.html'), 'verified-search-token');
});
