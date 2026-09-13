import test from 'node:test';
import assert from 'node:assert/strict';
import { initInquiry, INQUIRY_INTERVAL } from '../company-inquiry.js';

class Events {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emit(type, event = {}) { for (const listener of [...(this.listeners.get(type) || [])]) listener({ type, ...event }); }
  get count() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0); }
}
class Element extends Events {
  dataset = {};
  attributes = {};
  children = [];
  classes = new Set();
  lastElementChild = { textContent: '' };
  classList = { toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name) };
  animations = [];
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  set href(value) { this.attributes.href = value; }
  get href() { return this.attributes.href; }
  contains(element) { return this.children.includes(element); }
  animate() {
    const animation = { cancelled: false, cancel() { this.cancelled = true; } };
    this.animations.push(animation);
    return animation;
  }
}
function fixture({ query = '', reduced = false, observer = true, locale = 'zh-Hans' } = {}) {
  const win = new Events(), doc = new Events(), media = new Events();
  const contact = new Element(), hint = new Element(), email = new Element(), wecom = new Element();
  const buttons = ['product', 'training', 'global', 'project'].map(value => {
    const button = new Element(); button.dataset.inquiry = value; return button;
  });
  const topicLink = new Element(); topicLink.dataset.selectInquiry = 'global';
  const copy = {
    'new.inquiryProduct': '产品与方案', 'new.inquiryHint': '产品提示',
    'new.inquiryTraining': '企业培训', 'new.inquiryTrainingHint': '培训提示',
    'new.inquiryGlobal': '海外试点', 'new.inquiryGlobalHint': '海外提示',
    'new.inquiryProject': '系统合作', 'new.inquiryProjectHint': '系统提示',
  };
  wecom.href = `/${locale === 'zh-Hans' ? '' : `${locale}/`}contact/wecom/?host=cn#card`;
  contact.children = [...buttons, email, wecom];
  contact.querySelectorAll = () => buttons;
  contact.querySelector = selector => ({ '#inquiry-hint': hint, '#inquiry-email': email, '[data-umami-event="inquiry_wecom"]': wecom })[selector];
  contact.getBoundingClientRect = () => ({ top: 300, bottom: 700 });
  doc.querySelector = () => contact;
  doc.querySelectorAll = () => [topicLink];
  doc.hidden = false;
  win.document = doc;
  win.location = new URL(`https://lancloudtech.com/${query}`);
  win.innerHeight = 900;
  media.matches = reduced;
  win.matchMedia = () => media;
  win.umami = { track() { throw new Error('The presentation must never dispatch analytics.'); } };
  let now = 0, nextId = 0, intersection, disconnected = false;
  const timers = new Map();
  win.setTimeout = (callback, delay) => { timers.set(++nextId, { callback, at: now + delay }); return nextId; };
  win.clearTimeout = id => timers.delete(id);
  if (observer) win.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  const dispose = initInquiry({ copy, locale, win });
  const advance = duration => {
    const end = now + duration;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    now = end;
  };
  return {
    win, doc, media, contact, hint, email, wecom, buttons, topicLink, timers, dispose, advance,
    visible(value = true) { intersection?.([{ target: contact, isIntersecting: value, intersectionRatio: value ? 1 : 0 }]); },
    selected() { return buttons.find(button => button.attributes['aria-pressed'] === 'true')?.dataset.inquiry; },
    get disconnected() { return disconnected; },
  };
}

test('rotates the four directions at 2500ms only while visible, updating real contact context', () => {
  const f = fixture();
  assert.equal(INQUIRY_INTERVAL, 2500);
  f.advance(20000);
  assert.equal(f.selected(), 'product');
  assert.equal(f.timers.size, 0);
  f.visible();
  f.advance(2499);
  assert.equal(f.selected(), 'product');
  f.advance(1);
  assert.equal(f.selected(), 'training');
  assert.equal(f.hint.textContent, '培训提示');
  assert.match(decodeURIComponent(f.email.href), /企业培训 · LAN Cloud AI/);
  assert.equal(f.email.dataset.umamiEventTopic, 'training');
  assert.equal(f.wecom.href, '/contact/wecom/?host=cn&inquiry=training#card');
  assert.equal(f.wecom.dataset.umamiEventTopic, 'training');
  assert.equal(f.hint.attributes['aria-live'], 'off');
  assert.equal(f.hint.animations.length, 1);
  f.advance(7500);
  assert.equal(f.selected(), 'product');
  assert.equal(f.timers.size, 1);
  f.dispose();
});

test('manual selection and explicit query links stay selected through timer and visibility changes', () => {
  for (const query of ['', '?inquiry=training']) {
    const f = fixture({ query });
    f.visible();
    if (!query) f.buttons[1].emit('click');
    f.advance(15000);
    f.visible(false);
    f.visible();
    f.advance(15000);
    assert.equal(f.selected(), 'training');
    assert.equal(f.contact.dataset.inquiryRotation, 'manual');
    assert.equal(f.timers.size, 0);
    f.dispose();
  }
});

test('invalid inquiry queries fall back safely and contextual links lock their selected direction', () => {
  const f = fixture({ query: '?inquiry=unknown' });
  assert.equal(f.selected(), 'product');
  f.visible();
  assert.equal(f.timers.size, 1);
  f.topicLink.emit('click');
  f.advance(15000);
  assert.equal(f.selected(), 'global');
  assert.equal(f.timers.size, 0);
  f.dispose();
});

test('hover and keyboard focus pause rotation, and contact activation locks the current destination', () => {
  const f = fixture();
  f.visible();
  f.contact.emit('pointerenter', { pointerType: 'mouse' });
  f.advance(10000);
  assert.equal(f.selected(), 'product');
  f.contact.emit('pointerleave');
  f.advance(2500);
  assert.equal(f.selected(), 'training');
  f.contact.emit('focusin');
  f.contact.emit('focusout', { relatedTarget: f.wecom });
  f.advance(10000);
  assert.equal(f.selected(), 'training');
  f.contact.emit('focusout', { relatedTarget: null });
  f.advance(2500);
  assert.equal(f.selected(), 'global');
  f.wecom.emit('pointerdown');
  const target = f.wecom.href;
  f.advance(10000);
  assert.equal(f.wecom.href, target);
  assert.equal(f.wecom.dataset.umamiEventTopic, 'global');
  assert.equal(f.timers.size, 0);
  f.dispose();
});

test('offscreen and hidden documents stop timers and resume with a fresh 2500ms interval', () => {
  const f = fixture();
  f.visible();
  f.advance(2400);
  f.visible(false);
  f.advance(10000);
  assert.equal(f.selected(), 'product');
  f.visible();
  f.advance(2400);
  assert.equal(f.selected(), 'product');
  f.doc.hidden = true;
  f.doc.emit('visibilitychange');
  assert.equal(f.timers.size, 0);
  f.advance(10000);
  f.doc.hidden = false;
  f.doc.emit('visibilitychange');
  f.advance(2500);
  assert.equal(f.selected(), 'training');
  f.dispose();
});

test('reduced motion stops automatic changes and fades but preserves manual interaction', () => {
  const f = fixture({ reduced: true });
  f.visible();
  f.advance(10000);
  assert.equal(f.selected(), 'product');
  f.media.matches = false;
  f.media.emit('change');
  f.advance(2500);
  assert.equal(f.selected(), 'training');
  f.media.matches = true;
  f.media.emit('change');
  assert.equal(f.hint.animations[0].cancelled, true);
  f.buttons[3].emit('click');
  assert.equal(f.selected(), 'project');
  assert.equal(f.hint.animations.length, 1);
  assert.equal(f.timers.size, 0);
  f.dispose();
});

test('BFCache suspends cleanly, ordinary exit disposes observers/listeners/animations', () => {
  const f = fixture();
  f.visible();
  f.win.emit('pagehide', { persisted: true });
  f.advance(10000);
  assert.equal(f.selected(), 'product');
  f.win.emit('pageshow', { persisted: true });
  f.advance(2500);
  assert.equal(f.selected(), 'training');
  f.win.emit('pagehide', { persisted: false });
  assert.equal(f.timers.size, 0);
  assert.equal(f.disconnected, true);
  assert.equal(f.hint.animations[0].cancelled, true);
  for (const target of [f.win, f.doc, f.media, f.contact, ...f.buttons, f.email, f.wecom, f.topicLink]) assert.equal(target.count, 0);
  f.win.emit('pageshow');
  assert.equal(f.timers.size, 0);
  f.dispose();
});

test('locale paths survive context changes and browsers without IntersectionObserver can rotate', () => {
  const f = fixture({ observer: false, locale: 'zh-Hant' });
  f.advance(2500);
  assert.equal(f.wecom.href, '/zh-Hant/contact/wecom/?host=cn&inquiry=training#card');
  f.contact.getBoundingClientRect = () => ({ top: 1500, bottom: 1900 });
  f.win.emit('scroll');
  f.advance(10000);
  assert.equal(f.selected(), 'training');
  f.dispose();
});
