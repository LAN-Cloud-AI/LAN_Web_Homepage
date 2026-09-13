import { applyI18n, persistLocale, resolveLocale } from './i18n.js';
import { HTML_LANG, localeAwareUrl, withLocalePrefix } from './site-identity.js';

export const NOT_FOUND_COPY = {
  'zh-Hans': {
    title: '页面未找到 · 兰芯云朵',
    description: '这个地址可能已更新，或输入有误。返回兰芯云朵首页，继续探索 AI 产品、业务方案与实战培训。',
    eyebrow: '404 · 路径之外，还有新的可能',
    heading: '页面没有找到，\n换条路继续探索。',
    intro: '这个地址可能已更新，或输入有误。\n从熟悉的入口出发，我们继续向前。',
    home: '返回首页',
    solutions: '看看产品与方案',
    note: '有用的改变，从下一个入口开始。',
  },
  'zh-Hant': {
    title: '頁面未找到 · 蘭芯雲朵',
    description: '這個地址可能已更新，或輸入有誤。返回蘭芯雲朵首頁，繼續探索 AI 產品、業務方案與實戰培訓。',
    eyebrow: '404 · 路徑之外，還有新的可能',
    heading: '頁面沒有找到，\n換條路繼續探索。',
    intro: '這個地址可能已更新，或輸入有誤。\n從熟悉的入口出發，我們繼續向前。',
    home: '返回首頁',
    solutions: '看看產品與方案',
    note: '有用的改變，從下一個入口開始。',
  },
  en: {
    title: 'Page not found · LAN Cloud AI',
    description: 'This address may have changed or been entered incorrectly. Return to LAN Cloud AI to explore AI products, business solutions and practical training.',
    eyebrow: '404 · ANOTHER WAY FORWARD',
    heading: 'A missing page.\nA new way forward.',
    intro: 'This address may have changed or been entered incorrectly.\nLet’s pick up the journey from here.',
    home: 'Back to home',
    solutions: 'Explore our solutions',
    note: 'A useful next step is still within reach.',
  },
};

const TAU = Math.PI * 2;
const hash = index => { const value = Math.sin(index * 127.1 + 47.3) * 43758.5453; return value - Math.floor(value); };

// Sample vector strokes instead of raster text: the 404 stays sharp at every size.
function digitPoints(compact) {
  const points = [];
  const spacing = compact ? 8 : 5;
  const line = (x1, y1, x2, y2) => {
    const count = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / spacing);
    for (let i = 0; i <= count; i++) points.push({ x: x1 + (x2 - x1) * i / count, y: y1 + (y2 - y1) * i / count });
  };
  for (const offset of [0, 455]) {
    line(225 + offset, 104, 98 + offset, 305);
    line(98 + offset, 305, 269 + offset, 305);
    line(226 + offset, 104, 226 + offset, 363);
  }
  const count = Math.ceil(675 / spacing);
  for (let i = 0; i < count; i++) {
    const angle = i / count * TAU;
    points.push({ x: 404 + Math.cos(angle) * 81, y: 234 + Math.sin(angle) * 129 });
  }
  return points;
}

/** Decorative, visibility-aware particles; the static SVG remains the fallback. */
export function initErrorParticles(host) {
  const doc = host?.ownerDocument;
  const win = doc?.defaultView;
  if (!win?.matchMedia || !win.IntersectionObserver || !win.ResizeObserver || !win.requestAnimationFrame) return () => {};
  const canvas = doc.createElement('canvas');
  let context;
  try { context = canvas.getContext('2d', { alpha: true }); } catch { return () => {}; }
  if (!context) return () => {};
  canvas.className = 'error-particles';
  canvas.setAttribute('aria-hidden', 'true');
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const systemDark = win.matchMedia('(prefers-color-scheme: dark)');
  const connection = win.navigator?.connection;
  let width = 0, height = 0, compact = false, points = [];
  let visible = false, pageHidden = false, destroyed = false;
  let frame = 0, last = 0, time = 0;
  const staticMode = () => reduce.matches || !!connection?.saveData;
  const drawable = () => !destroyed && !pageHidden && !doc.hidden && visible && width > 0 && height > 0 && !staticMode();
  const dark = () => doc.documentElement.dataset.theme ? doc.documentElement.dataset.theme === 'dark' : systemDark.matches;
  const stop = () => { if (frame) win.cancelAnimationFrame(frame); frame = 0; last = 0; };
  function draw() {
    if (!drawable()) return;
    const jade = dark() ? '139,225,188' : '23,117,91';
    const gold = dark() ? '219,202,151' : '149,123,64';
    context.clearRect(0, 0, width, height);
    const scale = width / 800;
    const offsetY = (height - 450 * scale) / 2;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const wave = Math.sin(time * .55 + i * .038);
      const x = (point.x + Math.sin(time * .35 + i * .71) * .75) * scale;
      const y = (point.y + Math.cos(time * .29 + i * .59) * .75) * scale + offsetY;
      const color = i % 19 === 0 ? gold : jade;
      const radius = (1.5 + hash(i + 8) * 1.1) * scale;
      if (i % 11 === 0) {
        context.fillStyle = `rgba(${color},.07)`;
        context.beginPath(); context.arc(x, y, radius * 4.8, 0, TAU); context.fill();
      }
      context.fillStyle = `rgba(${color},${.45 + (wave + 1) * .2})`;
      context.beginPath(); context.arc(x, y, radius, 0, TAU); context.fill();
    }
    const count = compact ? 36 : 72;
    for (let i = 0; i < count; i++) {
      const angle = hash(i + 811) * TAU + time * (.018 + hash(i) * .015);
      const lane = hash(i + 331) - .5;
      const x = (404 + Math.cos(angle) * (345 + lane * 40)) * scale;
      const y = (244 + Math.sin(angle) * (151 + lane * 35) + Math.sin(angle * 2) * 23) * scale + offsetY;
      context.fillStyle = `rgba(${i % 17 === 0 ? gold : jade},${.18 + hash(i + 50) * .36})`;
      context.beginPath(); context.arc(x, y, (1 + hash(i + 3) * 1.6) * scale, 0, TAU); context.fill();
    }
    host.classList.add('is-particle-ready');
  }
  function tick(now) {
    frame = 0;
    if (!drawable()) { last = 0; return; }
    if (!last || now - last >= 1000 / 30 - .5) {
      time += last ? Math.min((now - last) / 1000, .08) : 0;
      last = now;
      draw();
    }
    frame = win.requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    canvas.hidden = staticMode();
    if (staticMode()) host.classList.remove('is-particle-ready');
    if (!drawable()) stop();
    else if (!frame) { draw(); frame = win.requestAnimationFrame(tick); }
  }
  function resize() {
    if (destroyed || pageHidden || doc.hidden) return;
    const rect = host.getBoundingClientRect();
    width = Math.max(0, rect.width); height = Math.max(0, rect.height);
    compact = width < 500;
    points = digitPoints(compact);
    const dpr = Math.min(win.devicePixelRatio || 1, compact ? 1.5 : 1.75, 1800 / Math.max(1, width));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(); sync();
  }
  const observer = new win.IntersectionObserver(entries => {
    if (destroyed) return;
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: .01 });
  const resizer = new win.ResizeObserver(resize);
  const visibility = () => { if (!doc.hidden && !pageHidden) resize(); sync(); };
  const themeChange = () => { draw(); };
  const pageHide = event => { if (event.persisted) { pageHidden = true; stop(); } else dispose(); };
  const pageShow = () => { if (!destroyed) { pageHidden = false; resize(); sync(); } };
  host.append(canvas);
  resize(); observer.observe(host); resizer.observe(host);
  reduce.addEventListener('change', sync);
  systemDark.addEventListener('change', themeChange);
  connection?.addEventListener?.('change', sync);
  doc.addEventListener('visibilitychange', visibility);
  win.addEventListener('lan:theme-change', themeChange);
  win.addEventListener('pagehide', pageHide);
  win.addEventListener('pageshow', pageShow);
  function dispose() {
    if (destroyed) return;
    destroyed = true; stop();
    observer.disconnect(); resizer.disconnect();
    reduce.removeEventListener('change', sync);
    systemDark.removeEventListener('change', themeChange);
    connection?.removeEventListener?.('change', sync);
    doc.removeEventListener('visibilitychange', visibility);
    win.removeEventListener('lan:theme-change', themeChange);
    win.removeEventListener('pagehide', pageHide);
    win.removeEventListener('pageshow', pageShow);
    canvas.width = canvas.height = 1;
    canvas.remove(); points = [];
    host.classList.remove('is-particle-ready');
  }
  return dispose;
}

export function initErrorPage() {
  const page = document.querySelector('[data-not-found]');
  if (!page) return;
  // Static locale documents are primary; this also localizes the shared edge 404 fallback.
  const locale = persistLocale(resolveLocale());
  const copy = NOT_FOUND_COPY[locale];
  applyI18n(locale);
  document.documentElement.lang = HTML_LANG[locale];
  document.title = copy.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description);
  page.querySelectorAll('[data-error-copy]').forEach(element => { element.textContent = copy[element.dataset.errorCopy]; });
  page.querySelector('[data-error-home]').href = withLocalePrefix('/', locale);
  page.querySelector('[data-error-solutions]').href = withLocalePrefix('/solutions/', locale);
  document.querySelectorAll('[data-site-header] a[href^="/"], [data-site-footer] a[href^="/"]').forEach(link => {
    link.setAttribute('href', localeAwareUrl(link.getAttribute('href'), locale));
  });
  initErrorParticles(page.querySelector('[data-error-visual]'));
}

if (typeof document !== 'undefined') initErrorPage();
