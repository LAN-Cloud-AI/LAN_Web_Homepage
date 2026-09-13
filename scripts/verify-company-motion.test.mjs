import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from 'three';
import { HERO_STAGE_STARTS, HERO_STORY_END, getHeroTimeline } from '../company-motion-timeline.js';

const controllerSource = await fs.readFile(new URL('../company-hero-motion.js', import.meta.url), 'utf8');
const preferenceSource = await fs.readFile(new URL('../company-motion-preference.js', import.meta.url), 'utf8');
const sceneSource = await fs.readFile(new URL('./motion/hero-scene.js', import.meta.url), 'utf8');
const importExpression = "await import('./company-hero-scene.js')";
assert.ok(controllerSource.includes(importExpression), 'Update the isolated import seam if the scene module moves.');

class Events {
  listeners = new Map();
  addEventListener(name, listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(listener);
  }
  removeEventListener(name, listener) { this.listeners.get(name)?.delete(listener); }
  dispatchEvent(event) {
    event.currentTarget = this;
    for (const listener of [...(this.listeners.get(event.type) || [])]) listener(event);
    return true;
  }
  emit(name, detail = {}) {
    const event = { type: name, currentTarget: this, ...detail };
    for (const listener of [...(this.listeners.get(name) || [])]) listener(event);
    return event;
  }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

class Element extends Events {
  dataset = {};
  style = { setProperty: (key, value) => { this.styles[key] = value; } };
  styles = {};
  attributes = {};
  hidden = false;
  children = [];
  selectors = {};
  classes = new Set();
  classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
  clientWidth = 800;
  clientHeight = 500;
  setAttribute(name, value) { this.attributes[name] = value; }
  querySelector(selector) { return this.selectors[selector] || null; }
  querySelectorAll() { return this.steps || []; }
  getBoundingClientRect() { return { top: 0, left: 0, width: 1000, height: 640 }; }
  appendChild(child) { child.parentElement = this; this.children.push(child); }
  replaceChildren() { this.children.forEach(child => { child.parentElement = null; }); this.children = []; }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }
}

// Each controller runs in its own VM with deterministic browser lifecycle events.
// Only the dynamic import is replaced; the production controller is otherwise executed unchanged.
function controller({ reduced = false, saveData = false, dark = false, compact = false, hidden = false, missingHero = false, missingObserver = false, withPageMotion = false, persistedPaused = null, storageDenied = false } = {}) {
  const hero = new Element(), stage = new Element(), controls = new Element(), toggle = new Element(), replay = new Element();
  const pauseLabel = new Element(), playLabel = new Element();
  controls.hidden = true;
  playLabel.hidden = true;
  hero.steps = [0, 1, 2].map(index => { const element = new Element(); element.dataset.motionStep = String(index); return element; });
  hero.selectors = { '.hero-scene': stage, '.hero-story': controls, '[data-motion-replay]': replay };
  toggle.selectors = { '[data-motion-pause-label]': pauseLabel, '[data-motion-play-label]': playLabel };
  const document = new Events(), window = new Events(), connection = new Events();
  const pageToggle = new Element(), pagePause = new Element(), pagePlay = new Element();
  pageToggle.selectors = { '[data-page-motion-pause]': pagePause, '[data-page-motion-play]': pagePlay };
  document.documentElement = new Element();
  document.hidden = hidden;
  document.querySelector = selector => selector === '[data-page-motion-toggle]' ? pageToggle : missingHero ? null : hero;
  connection.saveData = saveData;
  const media = new Map([
    ['(prefers-reduced-motion: reduce)', Object.assign(new Events(), { matches: reduced })],
    ['(prefers-color-scheme: dark)', Object.assign(new Events(), { matches: dark })],
    ['(max-width: 700px)', Object.assign(new Events(), { matches: compact })],
  ]);
  window.matchMedia = query => media.get(query);
  const frames = new Map(), timers = new Map(), intersections = [], resizes = [], scenes = [];
  let nextId = 0, imports = 0, attempts = 0;
  const storage = new Map(persistedPaused === null ? [] : [['lan.motion.paused', String(persistedPaused)]]);
  const state = { throwFactory: false, rejectImport: false, throwInitialRender: false, importPromise: null };
  class Intersection {
    constructor(callback) { this.callback = callback; intersections.push(this); }
    observe() { this.observing = true; }
    disconnect() { this.observing = false; }
  }
  class Resize {
    constructor(callback) { this.callback = callback; resizes.push(this); }
    observe() { this.observing = true; }
    disconnect() { this.observing = false; }
  }
  if (!missingObserver) window.IntersectionObserver = Intersection;
  window.ResizeObserver = Resize;
  const createHeroScene = (container, options) => {
    attempts++;
    if (state.throwFactory) throw new Error('WebGL unavailable');
    const result = {
      canvas: new Element(), options, renders: [], themes: [], resized: 0, disposed: 0,
      throwRender: state.throwInitialRender,
      render(time, pointer, scroll, narrative) {
        if (this.throwRender) throw new Error('Renderer failed');
        this.renders.push({ time, pointer: { ...pointer }, scroll, narrative });
      },
      resize() { if (this.throwResize) throw new Error('Resize failed'); this.resized++; },
      setTheme(value) { this.themes.push(value); },
      dispose() { this.disposed++; this.canvas.remove(); },
    };
    container.appendChild(result.canvas);
    scenes.push(result);
    return result;
  };
  const context = {
    HERO_STAGE_STARTS, getHeroTimeline,
    document, window, navigator: { connection }, IntersectionObserver: Intersection, ResizeObserver: Resize,
    matchMedia: window.matchMedia,
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    sessionStorage: {
      removeItem(key) { if (storageDenied) throw new Error('Storage blocked'); storage.delete(key); },
      getItem(key) { if (storageDenied) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageDenied) throw new Error('Storage blocked'); storage.set(key, value); },
    },
    setTimeout: callback => { timers.set(++nextId, callback); return nextId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
    __loadScene: () => {
      imports++;
      if (state.rejectImport) return Promise.reject(new Error('Local module unavailable'));
      return state.importPromise || Promise.resolve({ createHeroScene });
    },
  };
  vm.runInNewContext(controllerSource.replace(/^import .*;\n/gm, '').replace('export function initHeroMotion', 'function initHeroMotion').replace(importExpression, 'await __loadScene()') + '\nglobalThis.init = initHeroMotion;', context);
  let disposePreference = () => {};
  if (withPageMotion) {
    vm.runInNewContext(preferenceSource.replace('export function initPageMotion', 'function initPageMotion') + '\nglobalThis.initPreference = initPageMotion;', context);
    disposePreference = context.initPreference();
  }
  const disposeHero = context.init();
  const dispose = () => { disposeHero(); disposePreference(); };
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  return {
    hero, stage, controls, toggle, replay, pauseLabel, playLabel, pageToggle, pagePause, pagePlay, storage, document, window, connection, media, frames, scenes, state, intersections, resizes, dispose,
    get imports() { return imports; }, get attempts() { return attempts; }, get scene() { return scenes.at(-1); },
    async start(visible = true) { for (const callback of timers.values()) callback(); timers.clear(); if (intersections[0]?.observing) intersections[0].callback([{ isIntersecting: visible }]); await flush(); },
    async visible(value) { intersections[0].callback([{ isIntersecting: value }]); await flush(); },
    async preference(query, value) { const entry = media.get(query); entry.matches = value; entry.emit('change'); await flush(); },
    async dataSaving(value) { connection.saveData = value; connection.emit('change'); await flush(); },
    frame(now) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); },
    flush,
  };
}

const REDUCED = '(prefers-reduced-motion: reduce)', DARK = '(prefers-color-scheme: dark)', COMPACT = '(max-width: 700px)';

test('static first frame and offscreen hero do not import the 3D dependency', async () => {
  const h = controller();
  assert.equal(h.imports, 0);
  assert.equal(h.controls.hidden, true);
  await h.start(false);
  assert.equal(h.imports, 0);
  await h.visible(true);
  assert.equal(h.imports, 1);
  assert.equal(h.hero.dataset.motionState, 'ready');
  assert.equal(h.controls.hidden, false);
  assert.equal(h.scene.renders[0].time, 0);
  h.dispose();
});

test('initial reduced motion, saveData, and hidden documents remain static', async () => {
  for (const options of [{ reduced: true }, { saveData: true }, { hidden: true }]) {
    const h = controller(options);
    await h.start();
    assert.equal(h.imports, 0);
    assert.equal(h.frames.size, 0);
    assert.equal(h.controls.hidden, true);
    h.dispose();
  }
  for (const options of [{ missingHero: true }, { missingObserver: true }]) {
    const h = controller(options);
    await h.start();
    assert.equal(h.imports, 0);
    h.dispose();
  }
});

test('replay and stage selection seek the shared story and continue playing without pause controls', async () => {
  const h = controller();
  await h.start();
  h.frame(100); h.frame(140);
  assert.ok(h.scene.renders.at(-1).time > 0);
  assert.equal(h.toggle.listenerCount, 0, 'The removed preview pause button is not required.');
  for (const [index, time] of HERO_STAGE_STARTS.entries()) {
    h.hero.steps[index].emit('click');
    assert.equal(h.scene.renders.at(-1).time, time);
    assert.equal(h.hero.dataset.motionStep, String(index));
    assert.equal(h.frames.size, 1, 'Selecting a stage continues from its start.');
    assert.equal(h.hero.steps.filter(step => step.attributes['aria-pressed'] === 'true').length, 1);
    h.frame(40_000); h.frame(40_040);
    assert.ok(h.scene.renders.at(-1).time > time);
  }
  h.replay.emit('click');
  assert.equal(h.scene.renders.at(-1).time, 0);
  assert.equal(h.frames.size, 1);
  h.frame(90_000);
  assert.equal(h.scene.renders.at(-1).time, 0, 'Replay resets the frame baseline as well as the story.');
  h.dispose();
});

test('offscreen, background, and BFCache suspend frames without advancing the story clock', async () => {
  const h = controller();
  await h.start();
  h.frame(100); h.frame(140);
  const time = h.scene.renders.at(-1).time;
  await h.visible(false);
  assert.equal(h.frames.size, 0);
  await h.visible(true);
  h.frame(20_000);
  assert.equal(h.scene.renders.at(-1).time, time);
  h.document.hidden = true; h.document.emit('visibilitychange');
  assert.equal(h.frames.size, 0);
  h.document.hidden = false; h.document.emit('visibilitychange');
  h.frame(40_000);
  assert.equal(h.scene.renders.at(-1).time, time);
  h.window.emit('pagehide', { persisted: true });
  assert.equal(h.frames.size, 0);
  assert.equal(h.scene.disposed, 0);
  h.window.emit('pageshow'); h.frame(60_000);
  assert.equal(h.scene.renders.at(-1).time, time);
  h.dispose();
});

test('live theme updates and reduced motion / saveData teardown and recovery work', async () => {
  const h = controller({ dark: true });
  await h.start();
  assert.equal(h.scene.options.dark, true);
  await h.preference(DARK, false);
  assert.equal(h.scene.themes.at(-1), false);
  const original = h.scene;
  await h.preference(REDUCED, true);
  assert.equal(original.disposed, 1);
  assert.equal(h.stage.children.length, 0);
  assert.equal(h.frames.size, 0);
  assert.equal(h.controls.hidden, true);
  await h.preference(REDUCED, false);
  assert.equal(h.scenes.length, 2);
  await h.dataSaving(true);
  assert.equal(h.scene.disposed, 1);
  assert.equal(h.frames.size, 0);
  await h.dataSaving(false);
  assert.equal(h.scenes.length, 3);
  h.dispose();
});

test('crossing the mobile breakpoint recreates the scene while retaining the narrative time', async () => {
  const h = controller();
  await h.start();
  h.hero.steps[1].emit('click');
  const desktop = h.scene;
  await h.preference(COMPACT, true);
  assert.equal(desktop.disposed, 1);
  assert.equal(desktop.canvas.listenerCount, 0);
  assert.equal(h.scene.options.compact, true);
  assert.equal(h.scene.renders.at(-1).time, HERO_STAGE_STARTS[1]);
  assert.equal(h.frames.size, 1);
  await h.visible(false);
  await h.preference(COMPACT, false);
  assert.equal(h.scene.disposed, 1);
  assert.equal(h.scenes.length, 2);
  await h.visible(true);
  assert.equal(h.scenes.length, 3);
  assert.equal(h.scene.options.compact, false);
  assert.equal(h.scene.renders.at(-1).time, HERO_STAGE_STARTS[1]);
  assert.equal(h.frames.size, 1);
  h.dispose();
});

test('unavailable WebGL or failed local import keeps the static picture and does not retry indefinitely', async () => {
  for (const failure of ['throwFactory', 'rejectImport']) {
    const h = controller(); h.state[failure] = true;
    await h.start();
    assert.equal(h.hero.dataset.motionState, 'fallback');
    assert.equal(h.hero.classes.has('is-3d-ready'), false);
    assert.equal(h.controls.hidden, true);
    assert.equal(h.frames.size, 0);
    assert.equal(h.stage.children.length, 0);
    await h.visible(false); await h.visible(true);
    assert.equal(h.imports, 1);
    h.dispose();
  }
});

test('failure on first paint or a later animation frame disposes the completed scene', async () => {
  for (const initial of [true, false]) {
    const h = controller(); h.state.throwInitialRender = initial;
    await h.start();
    if (!initial) { h.scene.throwRender = true; h.frame(100); }
    assert.equal(h.hero.dataset.motionState, 'fallback');
    assert.equal(h.scene.disposed, 1);
    assert.equal(h.scene.canvas.listenerCount, 0);
    assert.equal(h.stage.children.length, 0);
    assert.equal(h.frames.size, 0);
    h.dispose();
    assert.equal(h.scene.disposed, 1);
  }
});

test('context loss falls back and permanent page exit removes listeners and observers', async () => {
  const h = controller(); await h.start();
  let prevented = false;
  h.scene.canvas.emit('webglcontextlost', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(h.hero.dataset.motionState, 'fallback');
  assert.equal(h.scene.disposed, 1);
  h.window.emit('pagehide', { persisted: false });
  assert.equal(h.frames.size, 0);
  assert.equal(h.window.listenerCount + h.document.listenerCount + h.hero.listenerCount + h.toggle.listenerCount + h.replay.listenerCount, 0);
  assert.equal([...h.media.values()].reduce((sum, entry) => sum + entry.listenerCount, 0), 0);
  assert.equal(h.connection.listenerCount, 0);
  assert.ok(h.intersections.every(observer => !observer.observing));
  assert.ok(h.resizes.every(observer => !observer.observing));
  h.dispose();
  assert.equal(h.scene.disposed, 1);
});

test('a pending scene import cannot create a renderer after disposal or a preference change', async () => {
  for (const disposeBeforeResolve of [true, false]) {
    const h = controller(); let resolveImport;
    h.state.importPromise = new Promise(resolve => { resolveImport = resolve; });
    await h.start();
    if (disposeBeforeResolve) h.dispose();
    else await h.preference(REDUCED, true);
    let creates = 0;
    resolveImport({ createHeroScene() { creates++; throw new Error('must not create'); } });
    await h.flush();
    assert.equal(creates, 0);
    assert.equal(h.frames.size, 0);
    h.dispose();
  }
});

// Exercise actual Three.js geometry, materials and scene math at a mocked GPU boundary.
// Resources created before a failed allocation must be released just like normal disposal.
function sceneFactory({ failAt = null, compact = false } = {}) {
  const container = new Element(), records = { renderers: [], geometries: [], materials: [] };
  const track = (object, bucket) => {
    object.disposed = 0;
    object.addEventListener('dispose', () => object.disposed++);
    bucket.push(object);
  };
  class Geometry extends THREE.BufferGeometry {
    constructor() { super(); track(this, records.geometries); }
    setIndex(index) {
      if (failAt === 'index') throw new Error('Index allocation failed');
      return super.setIndex(index);
    }
  }
  class Shader extends THREE.ShaderMaterial {
    constructor(options) {
      if (failAt === 'material' && records.materials.length === 1) throw new Error('Material allocation failed');
      super(options); track(this, records.materials);
    }
  }
  class LineMaterial extends THREE.LineBasicMaterial {
    constructor(options) { super(options); track(this, records.materials); }
  }
  class Renderer {
    constructor(options) { this.options = options; this.domElement = new Element(); this.disposed = 0; this.ratios = []; this.sizes = []; records.renderers.push(this); }
    setPixelRatio(value) { this.ratios.push(value); }
    setClearColor(color, alpha) { this.clearAlpha = alpha; }
    setSize(width, height) { if (failAt === 'resize') throw new Error('Drawing buffer allocation failed'); this.sizes.push([width, height]); }
    render(scene, camera) { this.scene = scene; this.camera = camera; }
    dispose() { this.disposed++; }
  }
  const context = {
    getHeroTimeline,
    THREE: { ...THREE, WebGLRenderer: Renderer, BufferGeometry: Geometry, ShaderMaterial: Shader, LineBasicMaterial: LineMaterial },
    window: { devicePixelRatio: 3 },
  };
  const source = sceneSource.replace(/^import .*;\n/gm, '').replace('export function createHeroScene', 'function createHeroScene');
  vm.runInNewContext(source + '\nglobalThis.create = createHeroScene;', context);
  return { container, records, context, create: () => context.create(container, { compact }) };
}

test('factory releases every allocated geometry, material and canvas after partial initialization failures', () => {
  for (const failAt of ['material', 'index', 'resize']) {
    const h = sceneFactory({ failAt });
    assert.throws(h.create);
    assert.equal(h.records.renderers[0].disposed, 1);
    assert.equal(h.container.children.length, 0);
    assert.ok(h.records.geometries.length > 0);
    assert.ok(h.records.materials.length > 0);
    assert.ok(h.records.geometries.every(resource => resource.disposed === 1));
    assert.ok(h.records.materials.every(resource => resource.disposed === 1));
  }
});

test('particle shader preserves transparency, finite geometry, theme contrast and frame-driven uniforms', () => {
  const h = sceneFactory(); const scene = h.create();
  const renderer = h.records.renderers[0];
  scene.render(0);
  const objects = []; renderer.scene.traverse(object => objects.push(object));
  const points = objects.find(object => object.isPoints);
  assert.ok(points, 'The primary scene must render real particles.');
  const material = points.material;
  assert.equal(renderer.options.alpha, true);
  assert.equal(renderer.clearAlpha, 0, 'The static hero must remain visible around the sculpture.');
  assert.equal(material.transparent, true);
  assert.equal(material.depthWrite, false);
  assert.match(material.fragmentShader, /gl_PointCoord/);
  assert.match(material.fragmentShader, /discard/);
  assert.equal(points.frustumCulled, false, 'GPU-positioned particles must not use the CPU parameter buffer as world bounds.');
  const positions = points.geometry.getAttribute('position');
  assert.ok(positions.count > 1000);
  assert.ok([...positions.array].every(Number.isFinite));
  const before = material.uniforms.uGather.value;
  scene.render(9, { x: .3, y: -.2 }, .8);
  assert.equal(material.uniforms.uTime.value, 9);
  assert.ok(material.uniforms.uGather.value > before);
  assert.ok(material.uniforms.uAction.value > 0);
  assert.equal(material.blending, THREE.NormalBlending);
  const lightColor = material.uniforms.uJade.value.getHex();
  scene.setTheme(true);
  assert.equal(material.blending, THREE.AdditiveBlending);
  assert.notEqual(material.uniforms.uJade.value.getHex(), lightColor);
  scene.setTheme(false);
  assert.equal(material.blending, THREE.NormalBlending);
  scene.dispose();
});

test('responsive scene caps pixel density, lowers mobile work, and disposes once', () => {
  const counts = [];
  for (const compact of [false, true]) {
    const h = sceneFactory({ compact }); const scene = h.create();
    const renderer = h.records.renderers[0];
    assert.ok(renderer.ratios.at(-1) <= (compact ? 1.5 : 1.75));
    scene.render(0);
    let particleCount;
    renderer.scene.traverse(object => { if (object.isPoints) particleCount = object.geometry.getAttribute('position').count; });
    counts.push(particleCount);
    h.context.window.devicePixelRatio = 1;
    h.container.clientWidth = 420; h.container.clientHeight = 360;
    scene.resize();
    assert.equal(renderer.ratios.at(-1), 1);
    assert.deepEqual(renderer.sizes.at(-1), [420, 360]);
    scene.render(4);
    assert.ok(Number.isFinite(renderer.camera.projectionMatrix.elements[0]));
    scene.dispose(); scene.dispose();
    assert.equal(renderer.disposed, 1);
    assert.equal(h.container.children.length, 0);
    assert.ok(h.records.geometries.every(resource => resource.disposed === 1));
    assert.ok(h.records.materials.every(resource => resource.disposed === 1));
  }
  assert.ok(counts[1] < counts[0] * .6, 'Mobile must allocate substantially fewer particles.');
});

test('launch defaults to playing and removes the old preview pause preference', async () => {
  const h = controller({ withPageMotion: true, persistedPaused: true }); await h.start();
  assert.equal(h.frames.size, 1);
  assert.equal(h.document.documentElement.dataset.motionPaused, 'false');
  assert.equal(h.storage.has('lan.motion.paused'), false);
  assert.equal(h.pageToggle.listenerCount + h.toggle.listenerCount, 0);
  h.window.emit('lan:motion-change', { detail: { paused: true } });
  assert.equal(h.frames.size, 1, 'Legacy preview events cannot silently disable launch animation.');
  h.dispose();
  assert.equal(h.window.listenerCount + h.document.listenerCount + h.pageToggle.listenerCount, 0);
});

test('default playback works without storage while reduced motion and data saving stay static', async () => {
  const h = controller({ withPageMotion: true, storageDenied: true }); await h.start();
  assert.equal(h.frames.size, 1);
  await h.preference(REDUCED, true);
  assert.equal(h.frames.size, 0);
  await h.preference(REDUCED, false);
  assert.equal(h.frames.size, 1);
  await h.dataSaving(true);
  assert.equal(h.frames.size, 0);
  h.dispose();
});

test('resize and theme repaint errors return to the static image and release the scene', async () => {
  for (const source of ['window-resize', 'observed-resize', 'theme']) {
    const h = controller(); await h.start();
    if (source === 'theme') {
      h.scene.throwRender = true;
      await h.preference(DARK, true);
    } else {
      h.scene.throwResize = true;
      if (source === 'window-resize') h.window.emit('resize');
      else h.resizes[0].callback();
    }
    assert.equal(h.hero.dataset.motionState, 'fallback');
    assert.equal(h.hero.classes.has('is-3d-ready'), false);
    assert.equal(h.scene.disposed, 1);
    assert.equal(h.frames.size, 0);
    h.dispose();
  }
});

test('BFCache return cannot revive the old preview session pause', async () => {
  const h = controller({ withPageMotion: true }); await h.start();
  h.frame(100); h.frame(140);
  const time = h.scene.renders.at(-1).time;
  h.window.emit('pagehide', { persisted: true });
  assert.equal(h.frames.size, 0);
  h.storage.set('lan.motion.paused', 'true');
  h.document.documentElement.dataset.motionPaused = 'true';
  h.window.emit('pageshow', { persisted: true });
  assert.equal(h.document.documentElement.dataset.motionPaused, 'false');
  assert.equal(h.storage.has('lan.motion.paused'), false);
  assert.equal(h.frames.size, 1);
  h.frame(90_000);
  assert.equal(h.scene.renders.at(-1).time, time);
  h.dispose();
});

test('BFCache latch blocks queued intersections, controls and repaint events before visibilitychange', async () => {
  const h = controller({ withPageMotion: true }); await h.start();
  h.frame(100); h.frame(140);
  const scene = h.scene;
  const time = scene.renders.at(-1).time;
  const renders = scene.renders.length, resized = scene.resized, themes = scene.themes.length;
  h.window.emit('pagehide', { persisted: true });
  assert.equal(h.document.hidden, false, 'Exercise the interval before visibilitychange arrives.');
  await h.visible(false); await h.visible(true);
  h.window.emit('resize'); h.resizes[0].callback();
  await h.preference(DARK, true);
  h.document.emit('visibilitychange');
  h.window.emit('lan:motion-change', { detail: { paused: false } });
  h.hero.steps[1].emit('click'); h.replay.emit('click'); h.hero.steps[2].emit('click');
  assert.equal(h.frames.size, 0);
  assert.equal(h.imports, 1);
  assert.equal(scene.renders.length, renders);
  assert.equal(scene.resized, resized);
  assert.equal(scene.themes.length, themes);
  assert.equal(scene.disposed, 0);
  h.window.emit('pageshow', { persisted: true });
  assert.equal(scene.renders.at(-1).time, time, 'Cached control callbacks cannot alter the story.');
  assert.equal(scene.themes.at(-1), true, 'Apply deferred theme changes on return.');
  assert.ok(scene.resized > resized);
  assert.equal(h.frames.size, 1, 'Visible pages resume their narrative after cache restoration.'); h.frame(90_000);
  assert.equal(scene.renders.at(-1).time, time);
  assert.equal(h.frames.size, 1);
  h.dispose();
});

test('BFCache latch defers first scene creation and responsive replacement until pageshow', async () => {
  const initial = controller(); await initial.start(false);
  initial.window.emit('pagehide', { persisted: true });
  await initial.visible(true);
  assert.equal(initial.imports, 0);
  assert.equal(initial.frames.size, 0);
  initial.window.emit('pageshow', { persisted: true }); await initial.flush();
  assert.equal(initial.imports, 1);
  assert.equal(initial.scenes.length, 1);
  initial.dispose();

  const responsive = controller(); await responsive.start();
  const desktop = responsive.scene;
  responsive.window.emit('pagehide', { persisted: true });
  await responsive.preference(COMPACT, true);
  assert.equal(desktop.disposed, 1);
  assert.equal(responsive.imports, 1);
  assert.equal(responsive.frames.size, 0);
  responsive.window.emit('pageshow', { persisted: true }); await responsive.flush();
  assert.equal(responsive.scenes.length, 2);
  assert.equal(responsive.scene.options.compact, true);
  responsive.dispose();
});

test('an import completed while cached cannot allocate a renderer until the page returns', async () => {
  const h = controller(); let resolveImport, unexpectedCreates = 0;
  h.state.importPromise = new Promise(resolve => { resolveImport = resolve; });
  await h.start();
  h.window.emit('pagehide', { persisted: true });
  resolveImport({ createHeroScene() { unexpectedCreates++; throw new Error('Cached page must not create WebGL.'); } });
  await h.flush();
  assert.equal(unexpectedCreates, 0);
  assert.equal(h.scenes.length, 0);
  assert.equal(h.frames.size, 0);
  h.state.importPromise = null;
  h.window.emit('pageshow', { persisted: true }); await h.flush();
  assert.equal(h.scenes.length, 1);
  assert.equal(h.hero.dataset.motionState, 'ready');
  h.dispose();
});


test('progress tracks and actual shader transitions share one timeline at every stage boundary', async () => {
  const h = controller(); await h.start();
  const gpu = sceneFactory(), scene = gpu.create();
  h.frame(100);
  for (let now = 140; now < 10_000; now += 40) {
    h.frame(now);
    const rendered = h.scene.renders.at(-1);
    scene.render(rendered.time, rendered.pointer, rendered.scroll, rendered.narrative);
    const material = gpu.records.materials[0];
    const progress = h.hero.steps.map(button => Number(button.styles['--step-progress']));
    assert.equal(h.hero.dataset.motionStep, String(rendered.narrative.step));
    assert.equal(material.uniforms.uGather.value, progress[1] * progress[1] * (3 - 2 * progress[1]));
    assert.equal(material.uniforms.uAction.value, progress[2] * progress[2] * (3 - 2 * progress[2]));
    assert.ok(progress.every(value => value >= 0 && value <= 1));
  }
  assert.equal(h.hero.dataset.motionComplete, 'true');
  assert.deepEqual(h.hero.steps.map(button => Number(button.styles['--step-progress'])), [1, 1, 1]);
  assert.ok(h.scene.renders.at(-1).time > HERO_STORY_END, 'After the story completes, the ambient ribbon keeps flowing.');
  h.replay.emit('click');
  assert.deepEqual(h.hero.steps.map(button => Number(button.styles['--step-progress'])), [0, 0, 0]);
  assert.equal(h.hero.dataset.motionComplete, 'false');
  for (const [index, time] of HERO_STAGE_STARTS.entries()) {
    scene.render(time);
    h.hero.steps[index].emit('click');
    assert.equal(h.hero.dataset.motionStep, String(index));
    assert.equal(gpu.records.materials[0].uniforms.uGather.value, getHeroTimeline(time).gather);
    assert.equal(gpu.records.materials[0].uniforms.uAction.value, getHeroTimeline(time).action);
  }
  scene.dispose(); h.dispose();
});

test('explicit theme overrides system color without restarting or advancing the narrative', async () => {
  const h = controller({ dark: true });
  h.document.documentElement.dataset.theme = 'light';
  await h.start();
  assert.equal(h.scene.options.dark, false);
  h.frame(100); h.frame(140);
  const time = h.scene.renders.at(-1).time, timeline = h.hero.steps.map(button => button.styles['--step-progress']);
  h.document.documentElement.dataset.theme = 'dark';
  h.window.emit('lan:theme-change', { detail: { theme: 'dark', preference: 'dark' } });
  assert.equal(h.scene.themes.at(-1), true);
  assert.equal(h.scene.renders.at(-1).time, time);
  assert.deepEqual(h.hero.steps.map(button => button.styles['--step-progress']), timeline);
  await h.preference(DARK, false);
  assert.equal(h.scene.themes.at(-1), true, 'A manual dark preference survives system light changes.');
  assert.equal(h.scenes.length, 1);
  h.dispose();
});
