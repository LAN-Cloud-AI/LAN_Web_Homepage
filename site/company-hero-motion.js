import { HERO_STAGE_STARTS, getHeroTimeline } from './company-motion-timeline.js';

/** Load the optional 3D layer after the readable first frame. */
export function initHeroMotion() {
  const hero = document.querySelector('[data-hero-motion]');
  if (!hero || !window.matchMedia || !('IntersectionObserver' in window)) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const theme = window.matchMedia('(prefers-color-scheme: dark)');
  const compact = window.matchMedia('(max-width: 700px)');
  const stage = hero.querySelector('.hero-scene');
  const controls = hero.querySelector('.hero-story');
  const replay = hero.querySelector('[data-motion-replay]');
  const steps = [...hero.querySelectorAll('[data-motion-step]')];
  const connection = navigator.connection;
  let scene = null, disposed = false, loading = false, failed = false, pageHidden = false;
  let pendingTheme = false, pendingResize = false;
  let visible = false, frame = 0, last = 0, time = 0, step = -1;
  let resizeObserver = null;
  const pointer = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  const allowed = () => !disposed && !reduced.matches && !connection?.saveData && !failed;
  const canPaint = () => !disposed && !pageHidden && !document.hidden;
  const isDark = () => document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark' : theme.matches;
  const running = () => allowed() && !!scene && visible && canPaint();
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function render() {
    if (!scene || !canPaint()) return false;
    const narrative = getHeroTimeline(time);
    if (step !== narrative.step) {
      step = narrative.step;
      steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === step)));
      hero.dataset.motionStep = String(step);
    }
    steps.forEach((button, i) => {
      button.style.setProperty('--step-progress', String(narrative.progress[i]));
      button.dataset.progressState = narrative.progress[i] === 1 ? 'complete' : i === step ? 'active' : 'pending';
    });
    hero.dataset.motionComplete = String(narrative.complete);
    const rect = hero.getBoundingClientRect();
    try {
      scene.render(time, pointer, Math.min(1, Math.max(0, -rect.top / rect.height)), narrative);
      return true;
    } catch { fail(); return false; }
  }
  function tick(now) {
    frame = 0;
    if (!running()) { last = 0; return; }
    // Thirty frames per second is sufficient for this slow sculptural movement.
    if (last && now - last < 32) { frame = requestAnimationFrame(tick); return; }
    time += last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    pointer.x += (target.x - pointer.x) * .06;
    pointer.y += (target.y - pointer.y) * .06;
    if (!render()) return;
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (running() && !frame) frame = requestAnimationFrame(tick);
    else if (!running()) stop();
  }
  function teardown() {
    stop();
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (scene) {
      scene.canvas.removeEventListener('webglcontextlost', contextLost);
      scene.dispose();
      scene = null;
    }
    hero.classList.remove('is-3d-ready');
    controls.hidden = true;
    stage.replaceChildren();
  }
  function fail() { failed = true; teardown(); hero.dataset.motionState = 'fallback'; }
  function contextLost(event) { event.preventDefault(); fail(); }
  async function load() {
    if (!allowed() || scene || loading || !visible || !canPaint()) return;
    loading = true;
    try {
      const { createHeroScene } = await import('./company-hero-scene.js');
      if (!allowed() || !visible || !canPaint()) return;
      scene = createHeroScene(stage, { compact: compact.matches, dark: isDark() });
      scene.canvas.addEventListener('webglcontextlost', contextLost);
      if (!render()) return;
      pendingTheme = pendingResize = false;
      hero.classList.add('is-3d-ready');
      hero.dataset.motionState = 'ready';
      controls.hidden = false;
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(resized);
        resizeObserver.observe(stage);
      }
      schedule();
    } catch { fail(); }
    finally { loading = false; }
  }
  function visibility() {
    if (visible && allowed() && !scene) void load();
    if (scene && canPaint()) {
      if (pendingTheme) themeChange();
      if (pendingResize) resized();
    }
    schedule();
  }
  function preference() {
    if (!allowed()) { teardown(); hero.dataset.motionState = 'static'; }
    else { failed = false; void load(); }
  }
  function themeChange() {
    pendingTheme = true;
    if (!scene || !canPaint()) return;
    try {
      scene.setTheme(isDark()); pendingTheme = false;
      if (visible) render();
    } catch { fail(); }
  }
  function qualityChange() { if (scene) { teardown(); void load(); } }
  function resized() {
    pendingResize = true;
    if (!scene || !canPaint()) return;
    try {
      scene.resize(); pendingResize = false;
      if (visible) render();
    } catch { fail(); }
  }
  function move(event) {
    if (!canPaint() || reduced.matches || event.pointerType !== 'mouse' || compact.matches) return;
    const rect = hero.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / rect.width - .5;
    target.y = (event.clientY - rect.top) / rect.height - .5;
  }
  function leave() { target.x = target.y = 0; }
  function seek(value) {
    if (!canPaint()) return;
    stop();
    time = value;
    pointer.x = pointer.y = target.x = target.y = 0;
    if (scene) render();
    schedule();
  }
  function restart() { seek(0); }
  function select(event) {
    const stageTime = HERO_STAGE_STARTS[Number(event.currentTarget.dataset.motionStep)];
    if (stageTime !== undefined) seek(stageTime);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    visibility();
  }, { threshold: .05 });
  // Let the high-priority static picture and copy paint before importing Three.js.
  const start = () => { if (!disposed) observer.observe(hero); };
  const idle = setTimeout(start, 250);
  reduced.addEventListener('change', preference);
  theme.addEventListener('change', themeChange);
  compact.addEventListener('change', qualityChange);
  connection?.addEventListener?.('change', preference);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', resized);
  window.addEventListener('lan:theme-change', themeChange);
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerleave', leave);
  replay?.addEventListener('click', restart);
  steps.forEach(button => button.addEventListener('click', select));
  function pageHide(event) {
    // pagehide can precede visibilitychange; queued callbacks must stay suspended.
    pageHidden = true;
    if (event.persisted) {
      pendingTheme = pendingResize = true;
      stop();
    } else dispose();
  }
  function pageShow() { pageHidden = false; visibility(); }
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  function dispose() {
    if (disposed) return;
    disposed = true;
    clearTimeout(idle);
    observer.disconnect();
    teardown();
    reduced.removeEventListener('change', preference);
    theme.removeEventListener('change', themeChange);
    compact.removeEventListener('change', qualityChange);
    connection?.removeEventListener?.('change', preference);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('resize', resized);
    window.removeEventListener('lan:theme-change', themeChange);
    window.removeEventListener('pagehide', pageHide);
    window.removeEventListener('pageshow', pageShow);
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', leave);
    replay?.removeEventListener('click', restart);
    steps.forEach(button => button.removeEventListener('click', select));
  }
  return dispose;
}
