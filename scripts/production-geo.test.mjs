import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { productionGeoHost } from './build-production.mjs';

const source = await fs.readFile(new URL('../site/geo-host.js', import.meta.url), 'utf8');
const production = productionGeoHost(source);

function run({ href = 'https://lancloudtech.com/solutions/?a=1#tact', region = 'mainland', cookie = '', userAgent = 'Mozilla/5.0', failure, pending = false } = {}) {
  const parsed = new URL(href), redirects = [], calls = [], timers = new Map();
  let id = 0, cleared = 0, aborted = false;
  const document = { cookie };
  const context = vm.createContext({
    URL, URLSearchParams, AbortController, navigator: { userAgent }, document,
    location: { hostname: parsed.hostname, protocol: parsed.protocol, search: parsed.search, href, replace: url => redirects.push(url) },
    setTimeout: (callback, delay) => { const next = ++id; timers.set(next, { callback, delay }); return next; },
    clearTimeout: timer => { timers.delete(timer); cleared++; },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (failure) throw new Error('Network unavailable');
      if (pending) return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => {
        aborted = true; const error = new Error('Aborted'); error.name = 'AbortError'; reject(error);
      }, { once: true }));
      return { ok: true, json: async () => ({ region }) };
    },
  });
  const done = vm.runInContext(production, context);
  return { done, redirects, calls, timers, document, get cleared() { return cleared; }, get aborted() { return aborted; } };
}

test('mainland remains on apex and overseas steers to Pages preserving route, query and hash', async () => {
  for (const [region, redirects] of [['mainland', []], ['overseas', ['https://global.lancloudtech.com/solutions/?a=1#tact']]]) {
    const state = run({ region }); await state.done;
    assert.deepEqual(state.redirects, redirects);
    assert.equal(state.calls[0].url, 'https://geo.lancloudtech.com/');
    assert.equal(state.calls[0].options.credentials, 'omit');
    assert.equal(state.calls[0].options.cache, 'no-store');
    assert.ok(state.calls[0].options.signal instanceof AbortSignal);
    assert.equal(state.timers.size, 0); assert.equal(state.cleared, 1);
  }
  const returning = run({ href: 'https://global.lancloudtech.com/en/?a=1#method', region: 'mainland' });
  await returning.done; assert.deepEqual(returning.redirects, ['https://lancloudtech.com/en/?a=1#method']);
});

test('manual and cached preferences bypass network and take precedence over geography', async () => {
  const manual = run({ href: 'https://lancloudtech.com/practice/?a=1&host=global#artist', cookie: 'lan_geo_host=cn' });
  await manual.done;
  assert.deepEqual(manual.redirects, ['https://global.lancloudtech.com/practice/?a=1#artist']);
  assert.equal(manual.calls.length, 0); assert.equal(manual.timers.size, 0);
  const cache = run({ href: 'https://global.lancloudtech.com/ai-course/', cookie: 'lan_geo_host=cn' });
  await cache.done; assert.deepEqual(cache.redirects, ['https://lancloudtech.com/ai-course/']); assert.equal(cache.calls.length, 0);
  const stay = run({ href: 'https://lancloudtech.com/?host=cn', region: 'overseas' });
  await stay.done; assert.equal(stay.calls.length, 0); assert.deepEqual(stay.redirects, []);
});

test('network failure and 3-second timeout keep current host, write no preference and always clear timer', async () => {
  const failure = run({ failure: true }); await failure.done;
  assert.deepEqual(failure.redirects, []); assert.equal(failure.document.cookie, '');
  assert.equal(failure.timers.size, 0); assert.equal(failure.cleared, 1);
  const timeout = run({ pending: true });
  assert.equal(timeout.timers.size, 1);
  const timer = [...timeout.timers.values()][0]; assert.equal(timer.delay, 3000);
  timer.callback(); await timeout.done;
  assert.ok(timeout.aborted); assert.deepEqual(timeout.redirects, []); assert.equal(timeout.document.cookie, '');
  assert.equal(timeout.timers.size, 0); assert.equal(timeout.cleared, 1);
});

test('WeChat, crawlers and local previews remain exempt; normalization rejects unexpected source', async () => {
  for (const options of [{ userAgent: 'MicroMessenger/8.0' }, { userAgent: 'Googlebot' }, { href: 'http://127.0.0.1:4180/' }]) {
    const state = run(options); await state.done; assert.equal(state.calls.length, 0); assert.deepEqual(state.redirects, []);
  }
  assert.throws(() => productionGeoHost('unexpected controller'), /Geo source changed/);
  assert.ok(source.includes('lan-geo.mingxuan400.workers.dev')); // raw approved import remains untouched
});
