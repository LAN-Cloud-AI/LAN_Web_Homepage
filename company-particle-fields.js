/*
 * LAN Cloud AI · Flowing intelligence, decorative section fields.
 * Adapted from the flow-field / constellation-field rendering ideas in ThreeUI.
 * https://github.com/MengTo/threeui
 *
 * MIT License — Copyright (c) 2026 Meng To
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Transparent canvases enhance existing content; they carry no text or data.
 * A single, visibility-aware 30 fps scheduler serves every section on the page.
 */

const mountedRoots = new WeakMap();
const noop = () => {};
const TAU = Math.PI * 2;
const FRAME_INTERVAL = 1000 / 30;
// Supporting sections breathe slowly; the Hero carries the main performance.
const FIELD_TIME_SCALE = .42;
const SELECTORS = [
  ['.product-visual', 'focus'],
  ['.relationship-visual', 'relations'],
  ['.workshop-visual', 'workflow'],
  ['.academy-visual', 'growth'],
  ['.method', 'method'],
  ['.contact', 'converge'],
  ['.page-hero', 'horizon'],
  ['.practice-visual, .work-image', 'orbit'],
];

const modulo = value => ((value % 1) + 1) % 1;
const mix = (a, b, t) => a + (b - a) * t;
const rgba = (color, alpha) => `rgba(${color},${alpha})`;

// Stable distribution avoids resize flashes and aligns particles into ribbons.
function hash(index) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function pointOnField(kind, progress, lane, time, compact) {
  const p = modulo(progress);
  const bend = lane - .5;
  if (kind === 'focus' || kind === 'orbit') {
    const angle = p * TAU;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    // A rounded perimeter: the central product screenshot remains untouched.
    return {
      x: .5 + Math.sign(x) * Math.pow(Math.abs(x), .43) * (.434 + bend * .049),
      y: .5 + Math.sign(y) * Math.pow(Math.abs(y), .43) * (.431 + bend * .062),
    };
  }
  if (kind === 'relations') {
    const angle = p * TAU + time * .025;
    const radius = .21 + lane * .24;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * (.15 + lane * .24);
    const rotation = -.33 + lane * .55;
    return {
      x: .5 + x * Math.cos(rotation) - y * Math.sin(rotation),
      y: .5 + x * Math.sin(rotation) + y * Math.cos(rotation),
    };
  }
  if (kind === 'workflow') {
    return {
      x: .025 + p * .95,
      y: .19 + lane * .62 + Math.sin(p * TAU * 2 - time * .13) * .037,
    };
  }
  if (kind === 'growth') {
    return {
      x: .045 + p * .91 + Math.sin(p * TAU * 1.35 + lane * 2.7) * .042,
      y: .9 - p * .82 + Math.sin(p * Math.PI) * bend * .51,
    };
  }
  if (kind === 'method') {
    return {
      x: (compact ? .942 : .965) + Math.sin(p * TAU * 1.5 - .8) * (compact ? .025 : .024) + bend * .022,
      y: .19 + p * .65,
    };
  }
  if (kind === 'converge') {
    return {
      x: .015 + p * .97,
      y: .88 - Math.sin(p * Math.PI) * (.21 + bend * .16) + Math.cos(p * TAU + lane * 2) * .028 + bend * .11,
    };
  }
  return {
    x: .51 + p * .47,
    y: .51 + Math.sin(p * TAU * .78 + lane * .7 + time * .025) * .21 + bend * .26,
  };
}

function createParticles(count) {
  return Array.from({ length: count }, (_, index) => ({
    phase: hash(index + 1),
    lane: hash(index + 941),
    speed: .025 + hash(index + 517) * .022,
    size: .62 + hash(index + 257) * 1.18,
    gold: index % 17 === 0,
    glow: index % 19 === 0,
  }));
}

function drawField(field, dark) {
  const { context: ctx, width, height, kind, time, particles, compact } = field;
  if (!width || !height) return;
  const bright = dark || kind === 'converge';
  const jade = bright ? '103,223,191' : '28,122,103';
  const pale = bright ? '186,249,226' : '66,151,126';
  const gold = bright ? '230,202,141' : '162,129,66';
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';

  // Continuous hairlines hold the composition together between bright signals.
  const ribbonCount = kind === 'workflow' ? 4 : kind === 'method' ? 2 : 3;
  const baseOpacity = kind === 'relations' ? .12 : kind === 'converge' ? .1 : .08;
  for (let ribbon = 0; ribbon < ribbonCount; ribbon += 1) {
    const lane = ribbon / Math.max(1, ribbonCount - 1);
    ctx.beginPath();
    for (let step = 0; step <= 72; step += 1) {
      const point = pointOnField(kind, step / 72 * .9999, lane, time, compact);
      const x = point.x * width;
      const y = point.y * height;
      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(ribbon === 1 ? gold : jade, baseOpacity);
    ctx.lineWidth = ribbon % 3 === 0 ? .85 : .55;
    ctx.stroke();
  }

  const rendered = [];
  for (let index = 0; index < particles.length; index += 1) {
    const particle = particles[index];
    const progress = modulo(particle.phase + time * particle.speed);
    const point = pointOnField(kind, progress, particle.lane, time, compact);
    const previous = pointOnField(kind, progress - .003, particle.lane, time, compact);
    const x = point.x * width;
    const y = point.y * height;
    const color = particle.gold ? gold : index % 3 ? jade : pale;
    const pulse = .33 + Math.sin(time * .7 + particle.phase * TAU) * .09;
    const opacity = bright ? pulse + .12 : pulse + .08;
    // Open ribbons fade at either end; avoid a line bridging the wraparound.
    const edgeFade = ['focus', 'orbit', 'relations'].includes(kind)
      ? 1 : Math.min(1, progress * 15, (1 - progress) * 15);
    if (progress > .003) {
      ctx.strokeStyle = rgba(color, opacity * .47 * edgeFade);
      ctx.lineWidth = particle.size * .75;
      ctx.beginPath();
      ctx.moveTo(previous.x * width, previous.y * height);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    if (particle.glow) {
      ctx.fillStyle = rgba(color, .07 * edgeFade);
      ctx.beginPath();
      ctx.arc(x, y, particle.size * 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(color, .13 * edgeFade);
      ctx.beginPath();
      ctx.arc(x, y, particle.size * 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = rgba(color, opacity * edgeFade);
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, TAU);
    ctx.fill();
    if (kind === 'relations' && index % 3 === 0) rendered.push({ x, y });
  }

  if (kind === 'relations') {
    // Local links evoke the ThreeUI constellation without an all-pairs loop.
    const maxDistance = Math.min(width * .2, 90);
    for (let index = 0; index < rendered.length; index += 1) {
      const a = rendered[index];
      for (let offset = 1; offset <= 4; offset += 1) {
        const b = rendered[(index + offset * 7) % rendered.length];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 8 || distance > maxDistance) continue;
        ctx.strokeStyle = rgba(jade, (1 - distance / maxDistance) * .26);
        ctx.lineWidth = .65;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

/**
 * Mount once per root. Returns an idempotent teardown function.
 * Animation is on by default; reduced motion and saveData retain static content.
 */
export function initParticleFields(root = typeof document === 'undefined' ? null : document) {
  if (!root?.querySelectorAll) return noop;
  if (mountedRoots.has(root)) return mountedRoots.get(root);
  const doc = root.ownerDocument || root;
  const win = doc.defaultView;
  if (!win?.IntersectionObserver || !win.ResizeObserver || !win.matchMedia || !win.requestAnimationFrame) return noop;

  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const dark = win.matchMedia('(prefers-color-scheme: dark)');
  const mobile = win.matchMedia('(max-width: 700px)');
  const connection = win.navigator?.connection;
  const fields = [];
  let destroyed = false;
  let pageHidden = false;
  let frame = 0;
  let previousFrame = 0;
  const prefersStatic = () => reduce.matches || Boolean(connection?.saveData);
  const isDark = () => doc.documentElement.dataset.theme
    ? doc.documentElement.dataset.theme === 'dark' : dark.matches;
  const eligible = field => field.visible && field.width > 0 && field.height > 0;
  const canPaint = () => !destroyed && !pageHidden && !doc.hidden && !prefersStatic();
  const canAnimate = () => canPaint() && fields.some(eligible);

  function resize(field) {
    if (destroyed) return;
    const rect = field.host.getBoundingClientRect();
    // Ratio coordinates, capped pixel density and dimensions avoid oversized GPU surfaces.
    field.width = Math.max(0, rect.width);
    field.height = Math.max(0, rect.height);
    field.compact = mobile.matches;
    const scale = Math.min(win.devicePixelRatio || 1, mobile.matches ? 1.5 : 1.75, 2048 / Math.max(1, rect.width));
    field.canvas.width = Math.max(1, Math.round(field.width * scale));
    field.canvas.height = Math.max(1, Math.round(field.height * scale));
    field.context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = mobile.matches
      ? (field.kind === 'converge' || field.kind === 'horizon' ? 48 : 32)
      : (field.kind === 'converge' || field.kind === 'horizon' ? 110 : field.kind === 'method' ? 55 : 80);
    if (field.particles.length !== count) field.particles = createParticles(count);
    if (canPaint() && field.visible) drawField(field, isDark());
  }

  function tick(now) {
    frame = 0;
    if (!canAnimate()) {
      previousFrame = 0;
      return;
    }
    if (!previousFrame || now - previousFrame >= FRAME_INTERVAL - .5) {
      const elapsed = previousFrame ? Math.min((now - previousFrame) / 1000, .07) : 0;
      previousFrame = now;
      for (const field of fields) {
        if (!eligible(field)) continue;
        field.time += elapsed * FIELD_TIME_SCALE;
        drawField(field, isDark());
      }
    }
    frame = win.requestAnimationFrame(tick);
  }

  function sync() {
    if (destroyed) return;
    const fallback = prefersStatic();
    for (const field of fields) {
      field.canvas.hidden = fallback;
      field.host.toggleAttribute('data-particle-fallback', fallback);
    }
    if (!canAnimate()) {
      if (frame) win.cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
    } else if (!frame) {
      previousFrame = 0;
      frame = win.requestAnimationFrame(tick);
    }
  }

  for (const [selector, kind] of SELECTORS) {
    for (const host of root.querySelectorAll(selector)) {
      if (host.querySelector(':scope > .company-particle-field')) continue;
      const canvas = doc.createElement('canvas');
      let context;
      try { context = canvas.getContext('2d', { alpha: true }); } catch { continue; }
      if (!context) continue;
      canvas.className = `company-particle-field company-particle-field--${kind}`;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.setAttribute('role', 'presentation');
      host.classList.add('has-particle-field');
      host.dataset.particleField = kind;
      host.append(canvas);
      const field = {
        host, canvas, context, kind, visible: false,
        width: 0, height: 0, time: hash(fields.length + 87) * 22,
        compact: mobile.matches, particles: [],
      };
      fields.push(field);
      resize(field);
    }
  }
  if (!fields.length) return noop;

  const byHost = new Map(fields.map(field => [field.host, field]));
  const observer = new win.IntersectionObserver(entries => {
    if (destroyed) return;
    for (const entry of entries) {
      const field = byHost.get(entry.target);
      if (!field) continue;
      field.visible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (field.visible && canPaint()) drawField(field, isDark());
    }
    sync();
  }, { threshold: [0, .01] });
  const resizeObserver = new win.ResizeObserver(entries => {
    if (destroyed) return;
    for (const entry of entries) {
      const field = byHost.get(entry.target);
      if (field) resize(field);
    }
    sync();
  });
  for (const field of fields) {
    observer.observe(field.host);
    resizeObserver.observe(field.host);
  }

  const onViewportOrTheme = () => {
    fields.forEach(resize);
    sync();
  };
  const onVisibilityChange = () => {
    if (!doc.hidden && !pageHidden) fields.forEach(resize);
    sync();
  };
  const onPageHide = event => {
    if (!event.persisted) {
      cleanup();
      return;
    }
    // BFCache suspension may precede visibilitychange. Keep an explicit gate so
    // queued observers and preference events cannot restart a hidden document.
    pageHidden = true;
    sync();
  };
  const onPageShow = () => {
    if (destroyed) return;
    pageHidden = false;
    // Use the current theme and intersection state without advancing cached time.
    fields.forEach(resize);
    sync();
  };
  const bindPreference = (media, listener) => {
    if (media.addEventListener) media.addEventListener('change', listener);
    else media.addListener(listener);
  };
  const unbindPreference = (media, listener) => {
    if (media.removeEventListener) media.removeEventListener('change', listener);
    else media.removeListener(listener);
  };
  bindPreference(reduce, sync);
  bindPreference(dark, onViewportOrTheme);
  bindPreference(mobile, onViewportOrTheme);
  connection?.addEventListener?.('change', sync);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  win.addEventListener('lan:theme-change', onViewportOrTheme);
  win.addEventListener('resize', onViewportOrTheme, { passive: true });
  win.addEventListener('pagehide', onPageHide);
  win.addEventListener('pageshow', onPageShow);
  sync();

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    if (frame) win.cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    unbindPreference(reduce, sync);
    unbindPreference(dark, onViewportOrTheme);
    unbindPreference(mobile, onViewportOrTheme);
    connection?.removeEventListener?.('change', sync);
    doc.removeEventListener('visibilitychange', onVisibilityChange);
    win.removeEventListener('lan:theme-change', onViewportOrTheme);
    win.removeEventListener('resize', onViewportOrTheme);
    win.removeEventListener('pagehide', onPageHide);
    win.removeEventListener('pageshow', onPageShow);
    for (const field of fields) {
      field.canvas.width = 1;
      field.canvas.height = 1;
      field.canvas.remove();
      field.particles.length = 0;
      field.host.classList.remove('has-particle-field');
      delete field.host.dataset.particleField;
      field.host.removeAttribute('data-particle-fallback');
    }
    mountedRoots.delete(root);
  };
  mountedRoots.set(root, cleanup);
  return cleanup;
}
