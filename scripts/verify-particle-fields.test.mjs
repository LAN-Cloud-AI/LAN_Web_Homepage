import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../company-particle-fields.js', import.meta.url), 'utf8');
const REDUCED = '(prefers-reduced-motion: reduce)', DARK = '(prefers-color-scheme: dark)', MOBILE = '(max-width: 700px)';

class Events {
  listeners = new Map();
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type, properties = {}) {
    const event = { type, currentTarget: this, ...properties };
    for (const callback of [...(this.listeners.get(type) || [])]) callback(event);
  }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0); }
}
class Host {
  dataset = {};
  attributes = {};
  children = [];
  classes = new Set();
  classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
  rect = { width: 480, height: 300 };
  getBoundingClientRect() { return this.rect; }
  querySelector() { return this.children.find(child => child.className?.includes('company-particle-field')) || null; }
  append(child) { child.parentElement = this; this.children.push(child); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  toggleAttribute(name, value) { if (value) this.setAttribute(name, ''); else this.removeAttribute(name); }
}
function drawingContext() {
  return {
    draws: 0, arcs: [], colors: new Set(), transforms: [],
    clearRect() { this.draws++; this.arcs = []; this.colors = new Set(); },
    setTransform(...values) { this.transforms.push(values); },
    beginPath() {}, moveTo() {}, lineTo() {},
    arc(x, y, radius) { this.arcs.push([x, y, radius]); },
    stroke() { this.colors.add(this.strokeStyle); },
    fill() { this.colors.add(this.fillStyle); },
  };
}

// Run the unchanged production module against observable browser boundaries.
// Drawn positions, scheduling and DOM cleanup are checked, not internal formulas.
function fields({ reduced = false, saveData = false, paused = false, hidden = false, missingAPI = false, contextFailure = null } = {}) {
  const doc = new Events(), win = new Events(), connection = new Events();
  const hosts = [new Host(), new Host()];
  const canvases = [], frames = new Map(), observers = [], resizers = [], mutations = [];
  let id = 0;
  doc.documentElement = new Host(); doc.documentElement.dataset.motionPaused = String(paused);
  doc.defaultView = win; doc.hidden = hidden;
  doc.querySelectorAll = selector => selector === '.product-visual' ? [hosts[0]] : selector === '.relationship-visual' ? [hosts[1]] : [];
  doc.createElement = () => {
    const canvas = new Host(); canvas.context = drawingContext(); canvas.hidden = false;
    canvas.getContext = () => { if (contextFailure === 'throw') throw new Error('Canvas unavailable'); return contextFailure === 'null' ? null : canvas.context; };
    canvas.remove = () => { if (canvas.parentElement) canvas.parentElement.children = canvas.parentElement.children.filter(child => child !== canvas); canvas.parentElement = null; };
    canvases.push(canvas); return canvas;
  };
  connection.saveData = saveData;
  win.navigator = { connection }; win.devicePixelRatio = 3;
  const media = new Map([[REDUCED, reduced], [DARK, false], [MOBILE, false]].map(([key, matches]) => [key, Object.assign(new Events(), { matches })]));
  win.matchMedia = query => media.get(query);
  win.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  win.cancelAnimationFrame = frame => frames.delete(frame);
  const observerClass = bucket => class {
    constructor(callback) { this.callback = callback; this.targets = new Set(); this.connected = true; bucket.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.connected = false; this.targets.clear(); }
  };
  if (!missingAPI) win.IntersectionObserver = observerClass(observers);
  win.ResizeObserver = observerClass(resizers);
  win.MutationObserver = observerClass(mutations);
  const context = { document: doc };
  vm.runInNewContext(source.replace('export function initParticleFields', 'function initParticleFields') + '\nglobalThis.init = initParticleFields;', context);
  const cleanup = context.init();
  return {
    doc, win, connection, hosts, canvases, frames, observers, resizers, mutations, media, cleanup,
    init: () => context.init(),
    visible(...values) { observers[0].callback(hosts.map((target, index) => ({ target, isIntersecting: !!values[index], intersectionRatio: values[index] ? .5 : 0 }))); },
    frame(now) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); },
    preference(query, value) { const entry = media.get(query); entry.matches = value; entry.emit('change'); },
    motion(value, updateAttribute = true) {
      if (updateAttribute) doc.documentElement.dataset.motionPaused = String(value);
      win.emit('lan:motion-change', { detail: { paused: value } });
    },
    get draws() { return canvases.reduce((sum, canvas) => sum + canvas.context.draws, 0); },
  };
}

test('unsupported canvas and observer environments leave content unchanged', () => {
  for (const options of [{ missingAPI: true }, { contextFailure: 'null' }, { contextFailure: 'throw' }]) {
    const h = fields(options);
    assert.equal(h.hosts.reduce((sum, host) => sum + host.children.length, 0), 0);
    assert.equal(h.win.listenerCount + h.doc.listenerCount, 0);
    assert.equal(h.frames.size, 0);
    h.cleanup();
  }
});

test('multiple fields share one throttled scheduler and repeated mounting creates no duplicates', () => {
  const h = fields();
  assert.equal(h.init(), h.cleanup);
  assert.equal(h.canvases.length, 2);
  assert.equal(h.frames.size, 0, 'Offscreen fields must not start animation.');
  for (const canvas of h.canvases) {
    assert.equal(canvas.attributes['aria-hidden'], 'true');
    assert.equal(canvas.attributes.role, 'presentation');
  }
  h.visible(true, true);
  assert.equal(h.frames.size, 1);
  h.frame(100);
  const draws = h.draws;
  h.frame(110);
  assert.equal(h.draws, draws, 'A 10 ms tick should not redraw 30 fps fields.');
  h.frame(135);
  assert.equal(h.draws, draws + 2);
  assert.equal(h.frames.size, 1);
  h.cleanup();
});

test('offscreen and background pauses preserve particle positions instead of jumping on return', () => {
  const h = fields(); h.visible(true, true); h.frame(100); h.frame(140);
  const positions = h.canvases.map(canvas => JSON.stringify(canvas.context.arcs));
  h.visible(false, false);
  assert.equal(h.frames.size, 0);
  h.visible(true, false); h.frame(20_000);
  assert.equal(JSON.stringify(h.canvases[0].context.arcs), positions[0]);
  const hiddenDraws = h.canvases[1].context.draws;
  h.frame(20_040);
  assert.equal(h.canvases[1].context.draws, hiddenDraws);
  assert.notEqual(JSON.stringify(h.canvases[0].context.arcs), positions[0]);
  const beforeBackground = JSON.stringify(h.canvases[0].context.arcs);
  h.doc.hidden = true; h.doc.emit('visibilitychange');
  assert.equal(h.frames.size, 0);
  h.doc.hidden = false; h.doc.emit('visibilitychange'); h.frame(40_000);
  assert.equal(JSON.stringify(h.canvases[0].context.arcs), beforeBackground);
  h.cleanup();
});

test('preview pause attributes and events cannot silently disable launch particle fields', () => {
  const h = fields({ paused: true }); h.visible(true, true);
  assert.equal(h.frames.size, 1);
  h.frame(100); h.frame(140);
  const before = h.canvases.map(canvas => JSON.stringify(canvas.context.arcs));
  h.motion(true);
  assert.equal(h.frames.size, 1);
  h.frame(180);
  assert.notDeepEqual(h.canvases.map(canvas => JSON.stringify(canvas.context.arcs)), before);
  assert.equal(h.mutations.length, 0, 'No observer remains for the retired pause attribute.');
  h.cleanup();
});

test('reduced motion and data saving hide decoration and recover without duplicate animation', () => {
  for (const mode of ['reduced', 'saveData']) {
    const h = fields({ [mode]: true }); h.visible(true, true);
    const set = value => {
      if (mode === 'reduced') h.preference(REDUCED, value);
      else { h.connection.saveData = value; h.connection.emit('change'); }
    };
    assert.equal(h.frames.size, 0);
    assert.equal(h.draws, 0);
    assert.ok(h.canvases.every(canvas => canvas.hidden));
    assert.ok(h.hosts.every(host => 'data-particle-fallback' in host.attributes));
    set(false); h.frame(100);
    assert.equal(h.frames.size, 1);
    assert.ok(h.canvases.every(canvas => !canvas.hidden));
    assert.ok(h.hosts.every(host => !('data-particle-fallback' in host.attributes)));
    assert.ok(h.draws > 0);
    set(true); assert.equal(h.frames.size, 0);
    set(false); assert.equal(h.frames.size, 1);
    assert.equal(h.canvases.length, 2);
    h.cleanup();
  }
});

test('fields repaint for theme and viewport changes with lower mobile density', () => {
  const h = fields(); h.visible(true, true);
  const light = [...h.canvases[0].context.colors];
  const desktopDots = h.canvases[0].context.arcs.length;
  assert.ok(h.canvases[0].width / h.hosts[0].rect.width <= 1.75);
  h.preference(DARK, true);
  assert.notDeepEqual([...h.canvases[0].context.colors], light);
  assert.equal(h.frames.size, 1);
  h.hosts[0].rect = { width: 360, height: 240 };
  h.preference(MOBILE, true);
  assert.ok(h.canvases[0].width / 360 <= 1.5);
  assert.ok(h.canvases[0].context.arcs.length < desktopDots * .6);
  assert.ok(h.canvases[0].context.arcs.flat().every(Number.isFinite));
  h.hosts[0].rect = { width: 5000, height: 300 };
  h.resizers[0].callback([{ target: h.hosts[0] }]);
  assert.ok(h.canvases[0].width <= 2048);
  assert.equal(h.frames.size, 1);
  h.cleanup();
});

test('BFCache suspension stops all work before visibilitychange and restores the same frame with the current theme', () => {
  const h = fields(); h.visible(true, true); h.frame(100); h.frame(140);
  const positions = h.canvases.map(canvas => JSON.stringify(canvas.context.arcs));
  const colors = [...h.canvases[0].context.colors];
  const beforeHide = h.draws;
  h.win.emit('pagehide', { persisted: true });
  assert.equal(h.frames.size, 0, 'pagehide must stop even while document.hidden still reports false.');
  h.visible(true, true);
  h.preference(DARK, true);
  h.resizers[0].callback([{ target: h.hosts[0] }]);
  h.doc.emit('visibilitychange');
  h.motion(false);
  assert.equal(h.frames.size, 0, 'Queued observers and global events cannot restart a cached page.');
  assert.equal(h.draws, beforeHide, 'Hidden cached pages must not repaint from theme or resize events.');
  h.win.emit('pageshow', { persisted: true });
  assert.equal(h.frames.size, 1);
  assert.notDeepEqual([...h.canvases[0].context.colors], colors, 'Restoration uses the current theme.');
  h.frame(90_000);
  assert.deepEqual(h.canvases.map(canvas => JSON.stringify(canvas.context.arcs)), positions, 'Restoration does not advance by cached time.');
  h.cleanup();
});

test('BFCache restoration respects document visibility, motion preferences and intersections', () => {
  for (const restriction of ['hidden', 'reduced', 'saveData', 'offscreen']) {
    const h = fields(); h.visible(true, true); h.frame(100);
    h.win.emit('pagehide', { persisted: true });
    if (restriction === 'hidden') h.doc.hidden = true;
    if (restriction === 'reduced') h.preference(REDUCED, true);
    if (restriction === 'saveData') { h.connection.saveData = true; h.connection.emit('change'); }
    if (restriction === 'offscreen') h.visible(false, false);
    const beforeRestore = h.draws;
    h.win.emit('pageshow', { persisted: true });
    assert.equal(h.frames.size, 0, `Restoring ${restriction} fields must not schedule animation.`);
    assert.equal(h.draws, beforeRestore, `Restoring ${restriction} fields must not paint.`);
    if (restriction === 'hidden') { h.doc.hidden = false; h.doc.emit('visibilitychange'); }
    if (restriction === 'reduced') h.preference(REDUCED, false);
    if (restriction === 'saveData') { h.connection.saveData = false; h.connection.emit('change'); }
    if (restriction === 'offscreen') h.visible(true, true);
    assert.equal(h.frames.size, 1, `${restriction} fields recover once their restriction clears.`);
    h.cleanup();
  }
});

test('a truly hidden document does not paint and normal navigation disposes every resource', () => {
  const h = fields({ hidden: true }); h.visible(true, true);
  h.preference(DARK, true);
  h.resizers[0].callback([{ target: h.hosts[0] }]);
  assert.equal(h.draws, 0);
  assert.equal(h.frames.size, 0);
  h.doc.hidden = false; h.doc.emit('visibilitychange'); h.frame(100);
  assert.ok(h.draws > 0);
  h.win.emit('pagehide', { persisted: false });
  assert.equal(h.frames.size, 0);
  assert.equal(h.win.listenerCount + h.doc.listenerCount + h.connection.listenerCount, 0);
  assert.ok([...h.observers, ...h.resizers, ...h.mutations].every(observer => !observer.connected));
  assert.ok(h.canvases.every(canvas => canvas.width === 1 && canvas.height === 1 && !canvas.parentElement));
  const afterCleanup = h.draws;
  h.observers[0].callback(h.hosts.map(target => ({ target, isIntersecting: true, intersectionRatio: 1 })));
  h.resizers[0].callback([{ target: h.hosts[0] }]);
  h.win.emit('pageshow', { persisted: false });
  assert.equal(h.draws, afterCleanup, 'Late observer delivery cannot repaint disposed fields.');
  assert.equal(h.frames.size, 0);
  h.cleanup();
});

test('cleanup releases canvases, scheduled frames, observers and listeners and permits a fresh mount', () => {
  const h = fields(); h.visible(true, true); h.frame(100);
  h.cleanup(); h.cleanup();
  assert.equal(h.frames.size, 0);
  assert.equal(h.win.listenerCount + h.doc.listenerCount + h.connection.listenerCount, 0);
  assert.equal([...h.media.values()].reduce((sum, media) => sum + media.listenerCount, 0), 0);
  assert.ok([...h.observers, ...h.resizers, ...h.mutations].every(observer => !observer.connected));
  assert.ok(h.canvases.every(canvas => canvas.width === 1 && canvas.height === 1 && !canvas.parentElement));
  assert.ok(h.hosts.every(host => host.children.length === 0 && !host.classes.has('has-particle-field') && !host.dataset.particleField));
  const mountedAgain = h.init();
  assert.notEqual(mountedAgain, h.cleanup);
  assert.ok(h.hosts.every(host => host.children.length === 1));
  mountedAgain();
});


test('manual theme changes repaint particles in place and override the system palette', () => {
  const h = fields();
  h.doc.documentElement.dataset.theme = 'dark';
  h.visible(true, true); h.frame(100); h.frame(140);
  const darkColors = [...h.canvases[0].context.colors];
  const positions = h.canvases.map(canvas => JSON.stringify(canvas.context.arcs));
  h.doc.documentElement.dataset.theme = 'light';
  h.win.emit('lan:theme-change', { detail: { theme: 'light', preference: 'light' } });
  assert.notDeepEqual([...h.canvases[0].context.colors], darkColors);
  const lightColors = [...h.canvases[0].context.colors];
  assert.deepEqual(h.canvases.map(canvas => JSON.stringify(canvas.context.arcs)), positions);
  h.preference(DARK, true);
  assert.deepEqual([...h.canvases[0].context.colors], lightColors, 'Explicit light takes precedence over system dark.');
  assert.equal(h.frames.size, 1);
  h.cleanup();
});
