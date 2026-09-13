import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { renderNotFound } from './generate-notfound.mjs';
import { NOT_FOUND_COPY } from '../error-page.js';
import { HTML_LANG, SITE_LOCALES, withLocalePrefix } from '../site-identity.js';

test('all three static 404 documents remain useful at deeply nested missing URLs without JavaScript', () => {
  for (const locale of SITE_LOCALES) {
    const html = renderNotFound(locale), home = withLocalePrefix('/', locale);
    assert.ok(html.includes(`<html lang="${HTML_LANG[locale]}">`));
    assert.ok(html.includes(NOT_FOUND_COPY[locale].heading));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /name="robots" content="noindex,follow"/);
    assert.ok(!html.includes('rel="canonical"'), 'A missing page must not canonicalize to the homepage.');
    assert.ok(html.includes(`data-error-home href="${home}"`));
    assert.ok(html.includes(`data-error-solutions href="${home}solutions/"`));
    assert.match(html, /class="error-vector"/);
    assert.match(html, /data-error-visual aria-hidden="true"/);
    assert.equal((html.match(/data-lan-analytics="umami"/g) || []).length, 1);
    assert.equal((html.match(/data-lan-events="umami"/g) || []).length, 1);
    assert.equal((html.match(/data-site-header/g) || []).length, 1);
    assert.equal((html.match(/data-site-footer/g) || []).length, 1);
    assert.ok(!/data-(?:page-)?motion-toggle|返回旧版/.test(html));
    for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      assert.ok(/^(?:\/|#|https:|mailto:|tel:)/.test(ref), `Relative reference breaks deep 404: ${ref}`);
    }
    assert.ok(html.includes('data-theme-option="light"') && html.includes('data-theme-option="dark"'));
  }
});

const source = await fs.readFile(new URL('../error-page.js', import.meta.url), 'utf8');
class Events {
  listeners = new Map();
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type, props = {}) { for (const callback of [...(this.listeners.get(type) || [])]) callback({ type, ...props }); }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0); }
}
function particles({ reduced = false, saveData = false, unavailable = false } = {}) {
  const doc = new Events(), win = new Events(), connection = new Events();
  const frames = new Map(), observations = [], resizes = [], children = [];
  const classes = new Set(), canvas = { attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, remove() { children.splice(children.indexOf(this), 1); } };
  const context = {
    paints: 0, positions: [], colors: new Set(),
    clearRect() { this.paints++; this.positions = []; this.colors = new Set(); },
    setTransform() {}, beginPath() {}, arc(...point) { this.positions.push(point); }, fill() { this.colors.add(this.fillStyle); },
  };
  canvas.getContext = () => unavailable ? null : context;
  const host = {
    ownerDocument: doc,
    rect: { width: 800, height: 490 },
    classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    getBoundingClientRect() { return this.rect; }, append(node) { children.push(node); },
  };
  const observer = bucket => class {
    constructor(callback) { this.callback = callback; this.connected = true; bucket.push(this); }
    observe() {} disconnect() { this.connected = false; }
  };
  doc.defaultView = win; doc.hidden = false; doc.documentElement = { dataset: { theme: 'light' } }; doc.createElement = () => canvas;
  connection.saveData = saveData; win.navigator = { connection }; win.devicePixelRatio = 3;
  const reduce = Object.assign(new Events(), { matches: reduced }), dark = Object.assign(new Events(), { matches: false });
  win.matchMedia = query => query.includes('reduced') ? reduce : dark;
  win.IntersectionObserver = observer(observations); win.ResizeObserver = observer(resizes);
  let id = 0;
  win.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  win.cancelAnimationFrame = value => frames.delete(value);
  const sandbox = {};
  vm.runInNewContext(source.replace(/^import .*;\n/gm, '').replace(/^export /gm, '').replace("if (typeof document !== 'undefined') initErrorPage();", '') + '\nglobalThis.init = initErrorParticles;', sandbox);
  const dispose = sandbox.init(host);
  return {
    doc, win, host, context, canvas, frames, reduce, dark, connection, children, classes, observations, resizes, dispose,
    visible(value) { observations[0].callback([{ isIntersecting: value }]); },
    frame(now) { const work = [...frames.values()]; frames.clear(); work.forEach(callback => callback(now)); },
    theme(value) { doc.documentElement.dataset.theme = value; win.emit('lan:theme-change', { detail: { theme: value } }); },
  };
}

test('404 particles animate only while visible and preserve positions across background and BFCache', () => {
  const h = particles();
  assert.equal(h.frames.size, 0);
  assert.equal(h.context.paints, 0);
  h.visible(true); h.frame(100); h.frame(140);
  assert.equal(h.frames.size, 1);
  const positions = JSON.stringify(h.context.positions);
  h.visible(false); assert.equal(h.frames.size, 0);
  h.visible(true); h.frame(30_000);
  assert.equal(JSON.stringify(h.context.positions), positions);
  h.doc.hidden = true; h.doc.emit('visibilitychange'); assert.equal(h.frames.size, 0);
  h.doc.hidden = false; h.doc.emit('visibilitychange'); h.frame(60_000);
  assert.equal(JSON.stringify(h.context.positions), positions);
  h.win.emit('pagehide', { persisted: true });
  const paints = h.context.paints;
  h.visible(true); h.resizes[0].callback(); h.theme('dark'); h.doc.emit('visibilitychange');
  assert.equal(h.frames.size, 0);
  assert.equal(h.context.paints, paints);
  h.win.emit('pageshow', { persisted: true }); h.frame(90_000);
  assert.equal(JSON.stringify(h.context.positions), positions);
  h.frame(90_040); assert.notEqual(JSON.stringify(h.context.positions), positions);
  h.dispose();
});

test('404 themes repaint the same composition; mobile reduces work and fallback needs no canvas', () => {
  const h = particles(); h.visible(true); h.frame(100);
  const positions = JSON.stringify(h.context.positions), light = [...h.context.colors], desktop = h.context.positions.length;
  h.theme('dark');
  assert.equal(JSON.stringify(h.context.positions), positions);
  assert.notDeepEqual([...h.context.colors], light);
  h.host.rect = { width: 340, height: 210 }; h.resizes[0].callback();
  assert.ok(h.context.positions.length < desktop * .65);
  assert.ok(h.context.positions.flat().every(Number.isFinite));
  assert.ok(h.canvas.width / 340 <= 1.5);
  h.dispose();
  const fallback = particles({ unavailable: true });
  assert.equal(fallback.children.length, 0);
  assert.equal(fallback.win.listenerCount, 0);
  fallback.dispose();
});

test('reduced motion and saveData keep the static SVG, resume safely and dispose all work', () => {
  for (const restriction of ['reduced', 'saveData']) {
    const h = particles({ [restriction]: true }); h.visible(true);
    assert.equal(h.context.paints, 0);
    assert.equal(h.frames.size, 0);
    assert.equal(h.canvas.hidden, true);
    assert.equal(h.classes.has('is-particle-ready'), false);
    if (restriction === 'reduced') { h.reduce.matches = false; h.reduce.emit('change'); }
    else { h.connection.saveData = false; h.connection.emit('change'); }
    assert.equal(h.frames.size, 1);
    assert.equal(h.classes.has('is-particle-ready'), true);
    h.win.emit('pagehide', { persisted: false });
    assert.equal(h.frames.size, 0);
    assert.equal(h.children.length, 0);
    assert.equal(h.win.listenerCount + h.doc.listenerCount + h.reduce.listenerCount + h.dark.listenerCount + h.connection.listenerCount, 0);
    assert.ok([...h.observations, ...h.resizes].every(item => !item.connected));
    h.observations[0].callback([{ isIntersecting: true }]); h.resizes[0].callback();
    assert.equal(h.frames.size, 0);
    h.dispose();
  }
});
