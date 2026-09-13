import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../site-theme.js', import.meta.url), 'utf8');
const setup = ({ dark = false, stored = null, host = '127.0.0.1', cookie = '', blocked = false } = {}) => {
  const listeners = { window: {}, document: {}, system: {} };
  const events = [];
  const element = media => ({
    dataset: {}, media, attributes: {},
    getAttribute(name) { return name === 'media' ? this.media : this.attributes[name]; },
    setAttribute(name, value) { this.attributes[name] = value; },
  });
  const pictures = [element('(prefers-color-scheme: dark)'), element('(max-width: 640px) and (prefers-color-scheme: dark)')];
  const metas = [element('(prefers-color-scheme: light)'), element('(prefers-color-scheme: dark)')];
  const controls = ['system', 'light', 'dark'].map(mode => Object.assign(element(), { dataset: { themeOption: mode } }));
  const root = { dataset: {}, style: {}, classList: { add() {} } };
  const system = { matches: dark, addEventListener(name, callback) { listeners.system[name] = callback; } };
  const document = {
    documentElement: root, cookie, hidden: false,
    querySelectorAll(selector) { return selector.startsWith('picture') ? pictures : selector.startsWith('meta') ? metas : controls; },
    addEventListener(name, callback) { (listeners.document[name] ||= []).push(callback); },
  };
  const window = {
    matchMedia() { return system; },
    addEventListener(name, callback) { (listeners.window[name] ||= []).push(callback); },
    dispatchEvent(event) { events.push(event); },
  };
  const storage = new Map(stored ? [['lancloud.theme', stored]] : []);
  const context = vm.createContext({ window, document, location: { hostname: host, protocol: 'https:' },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    localStorage: { getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key); }, setItem(key, value) { if (blocked) throw Error('blocked'); storage.set(key, value); } },
  });
  vm.runInContext(source, context);
  const fire = (target, name, event) => (listeners[target][name] || []).forEach(callback => callback(event));
  return { window, document, root, system, pictures, metas, controls, storage, events, fire,
    systemChange(value) { system.matches = value; listeners.system.change(); } };
};

test('default follows the actual system; image sources keep their responsive conditions', () => {
  const env = setup({ dark: true });
  assert.equal(env.root.dataset.theme, 'dark');
  assert.equal(env.root.style.colorScheme, 'dark');
  assert.equal(env.pictures[0].media, 'all');
  assert.equal(env.pictures[1].media, '(max-width: 640px)');
  env.systemChange(false);
  assert.equal(env.root.dataset.theme, 'light');
  assert.equal(env.pictures[1].media, 'not all');
});

test('explicit light overrides a dark system, persists, and updates every theme control', () => {
  const env = setup({ dark: true });
  env.window.LANTheme.set('light');
  assert.equal(env.root.dataset.theme, 'light');
  assert.equal(env.storage.get('lancloud.theme'), 'light');
  assert.deepEqual(env.controls.map(item => item.attributes['aria-pressed']), ['false','true','false']);
  env.systemChange(true);
  assert.equal(env.root.dataset.theme, 'light');
  env.window.LANTheme.set('dark');
  assert.equal(env.pictures[1].media, '(max-width: 640px)');
  assert.equal(env.metas[1].media, 'all');
});

test('switching back to system resumes live system updates and notifies particle scenes', () => {
  const env = setup({ stored: 'dark' });
  env.window.LANTheme.set('system');
  assert.equal(env.root.dataset.theme, 'light');
  env.systemChange(true);
  assert.equal(env.root.dataset.theme, 'dark');
  assert.equal(env.events.at(-1).type, 'lan:theme-change');
  assert.equal(env.events.at(-1).detail.theme, 'dark');
  assert.equal(env.events.at(-1).detail.preference, 'system');
});

test('other tabs, BFCache, and theme changes on another company subdomain are restored', () => {
  const env = setup({ host: 'global.lancloudtech.com', cookie: 'lancloud_theme=light', stored: 'dark' });
  assert.equal(env.root.dataset.theme, 'light');
  env.fire('window','storage',{ key: 'lancloud.theme', newValue: 'dark' });
  assert.equal(env.root.dataset.theme, 'dark');
  env.window.LANTheme.set('dark');
  assert.match(env.document.cookie, /Domain=lancloudtech.com/);
  env.document.cookie = 'lancloud_theme=light';
  env.fire('window','pageshow',{});
  assert.equal(env.root.dataset.theme, 'light');
});

test('blocked storage and invalid preferences still allow in-page switching', () => {
  const env = setup({ blocked: true, dark: true });
  env.window.LANTheme.set('light');
  assert.equal(env.root.dataset.theme, 'light');
  env.window.LANTheme.set('invalid');
  assert.equal(env.root.dataset.theme, 'dark');
  assert.equal(env.root.dataset.themePreference, 'system');
});
