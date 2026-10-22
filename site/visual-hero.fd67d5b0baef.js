import { buildHeroShape, SCENE_IDS, UTILITY_SCENES } from './visual-hero-shapes.370b55533b79.js';

const DURATION = 9;
const SINGLETON = Symbol.for('lan.visualHero');
const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, n));
let threePromise;

const languageCopy = {
  en: { group: 'Hero animation', pause: 'Pause', resume: 'Resume', replay: 'Replay', pauseLabel: 'Pause animation', resumeLabel: 'Resume animation', replayLabel: 'Replay animation', playing: 'Animation playing', paused: 'Animation paused', complete: 'Animation finished. Replay is available.', static: 'Static illustration' },
  'zh-Hans': { group: '主视觉动效', pause: '暂停', resume: '继续', replay: '重看', pauseLabel: '暂停动画', resumeLabel: '继续动画', replayLabel: '重看动画', playing: '动画播放中', paused: '动画已暂停', complete: '动画已完成，可重看', static: '静态画面' },
  'zh-Hant': { group: '主視覺動效', pause: '暫停', resume: '繼續', replay: '重看', pauseLabel: '暫停動畫', resumeLabel: '繼續動畫', replayLabel: '重看動畫', playing: '動畫播放中', paused: '動畫已暫停', complete: '動畫已完成，可重看', static: '靜態畫面' },
};

function copy() {
  const lang = (document.documentElement.lang || 'zh-CN').toLowerCase();
  return lang.startsWith('en') ? languageCopy.en : /hant|tw|hk|mo/.test(lang) ? languageCopy['zh-Hant'] : languageCopy['zh-Hans'];
}

function createFallback(id) {
  const data = buildHeroShape(id, 1000);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 480 300');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('lan-hero-art__fallback');
  const project = p => [240 + p[0] * 72 + p[2] * 10, 150 - p[1] * 65 + p[2] * 12];
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', data.edges.map(([a, b]) => { const p = project(a), q = project(b); return `M${p[0].toFixed(2)},${p[1].toFixed(2)}L${q[0].toFixed(2)},${q[1].toFixed(2)}`; }).join(''));
  path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '.55'); path.setAttribute('opacity', '.32'); svg.append(path);
  for (let i = 0; i < 1000; i += 2) {
    const p = project(data.to.subarray(i * 3, i * 3 + 3));
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', p[0].toFixed(2)); dot.setAttribute('cy', p[1].toFixed(2)); dot.setAttribute('r', i % 5 ? '.85' : '1.4'); dot.setAttribute('fill', 'currentColor'); dot.setAttribute('opacity', '.7'); svg.append(dot);
  }
  return svg;
}

class HeroArt {
  constructor(host) {
    this.host = host;
    this.id = SCENE_IDS.includes(host.dataset.lanHeroScene) ? host.dataset.lanHeroScene : 'home';
    this.utility = UTILITY_SCENES.includes(this.id);
    this.elapsed = 0; this.last = 0; this.raf = 0;
    this.paused = false; this.visible = false; this.ready = false; this.failed = false; this.loading = false; this.disposed = false;
    this.abort = new AbortController();
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.colorPreference = matchMedia('(prefers-color-scheme: dark)');
    this.stage = document.createElement('div'); this.stage.className = 'lan-hero-art__stage'; this.stage.setAttribute('aria-hidden', 'true');
    this.fallback = createFallback(this.id); this.stage.append(this.fallback);
    this.controls = document.createElement('div'); this.controls.className = 'lan-hero-art__controls'; this.controls.setAttribute('role', 'group');
    this.pauseButton = document.createElement('button'); this.pauseButton.type = 'button'; this.pauseButton.className = 'lan-hero-art__control';
    this.replayButton = document.createElement('button'); this.replayButton.type = 'button'; this.replayButton.className = 'lan-hero-art__control';
    this.status = document.createElement('span'); this.status.className = 'lan-hero-art__status'; this.status.setAttribute('aria-live', 'polite'); this.status.setAttribute('aria-atomic', 'true');
    this.controls.append(this.pauseButton, this.replayButton, this.status); host.append(this.stage, this.controls);
    this.on(this.pauseButton, 'click', () => { this.paused = !this.paused; this.stop(); this.updateControls(); this.schedule(); });
    this.on(this.replayButton, 'click', () => { if (this.reduced.matches || this.failed) return; this.elapsed = 0; this.paused = false; this.stop(); this.updateControls(); this.render(); this.schedule(); });
    this.on(document, 'visibilitychange', () => { if (document.hidden) this.stop(); else this.activate(); this.updateControls(); });
    this.on(window, 'lan:theme-change', () => this.updateTheme());
    this.on(window, 'resize', () => this.resize(), { passive: true });
    this.on(window, 'pagehide', event => { this.stop(); if (!event.persisted) this.destroy(); });
    this.on(window, 'pageshow', () => { this.measureVisibility(); this.resize(); this.activate(); });
    this.on(this.reduced, 'change', () => this.motionPreferenceChanged());
    this.on(this.colorPreference, 'change', () => this.updateTheme());
    this.rootObserver = new MutationObserver(records => { if (records.some(record => record.attributeName === 'lang')) this.updateControls(); if (records.some(record => record.attributeName === 'data-theme')) this.updateTheme(); });
    this.rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
    if ('ResizeObserver' in window) { this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(this.stage); }
    if ('IntersectionObserver' in window) {
      this.intersection = new IntersectionObserver(entries => { this.visible = entries[0].isIntersecting; if (!this.visible) this.stop(); else this.activate(); this.updateControls(); }, { threshold: .01 });
      this.intersection.observe(this.stage);
    } else {
      this.on(window, 'scroll', () => { this.measureVisibility(); if (!this.visible) this.stop(); else this.activate(); this.updateControls(); }, { passive: true });
    }
    this.measureVisibility(); this.updateControls(); this.activate();
  }

  on(target, event, fn, options = {}) { target.addEventListener(event, fn, { ...options, signal: this.abort.signal }); }

  measureVisibility() {
    const rect = this.stage.getBoundingClientRect();
    this.visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  }

  get dark() {
    const theme = document.documentElement.dataset.theme;
    return theme === 'dark' || (theme !== 'light' && this.colorPreference.matches);
  }

  async activate() {
    if (this.disposed || !this.host.isConnected || this.failed || document.hidden || !this.visible || this.reduced.matches) return;
    if (this.ready) { this.schedule(); return; }
    if (this.loading) return;
    this.loading = true; this.updateControls();
    try {
      // Loading starts only when this visual is on screen and motion is permitted.
      const T = await (threePromise ||= import('./vendor/three/three.module.js'));
      if (this.disposed || !this.host.isConnected || !this.visible || document.hidden || this.reduced.matches) return;
      this.T = T;
      this.renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setClearColor(0x000000, 0); this.renderer.outputColorSpace = T.SRGBColorSpace;
      this.canvas = this.renderer.domElement; this.canvas.className = 'lan-hero-art__canvas'; this.canvas.setAttribute('aria-hidden', 'true'); this.canvas.hidden = true; this.stage.append(this.canvas);
      this.on(this.canvas, 'webglcontextlost', event => { event.preventDefault(); this.useFallback(); });
      this.scene = new T.Scene(); this.camera = new T.PerspectiveCamera(42, 1, .1, 60); this.group = new T.Group(); this.scene.add(this.group);
      this.data = buildHeroShape(this.id, 15000);
      this.geometry = new T.BufferGeometry();
      for (const [name, array] of [['position', this.data.to], ['aFrom', this.data.from], ['aGather', this.data.gather], ['aMeta', this.data.meta]]) this.geometry.setAttribute(name, new T.BufferAttribute(array, 3));
      this.geometry.setDrawRange(0, 15000);
      this.material = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uEnergy: { value: this.utility ? .18 : 1 }, uPixelRatio: { value: 1 }, uColor: { value: new T.Color('#699ef5') }, uHighlight: { value: new T.Color('#d2e8ff') }, uOpacity: { value: .92 } },
        vertexShader: `
          attribute vec3 aFrom; attribute vec3 aGather; attribute vec3 aMeta;
          uniform float uTime; uniform float uEnergy; uniform float uPixelRatio;
          varying float vBrightness; varying float vDepth;
          void main() {
            float gather = smoothstep(.7 + aMeta.z * .5, 4.1 + aMeta.z * .3, uTime);
            float release = smoothstep(4.6 + aMeta.y * .23, 7.7 + aMeta.y * .24, uTime);
            vec3 p = mix(mix(aFrom, aGather, gather), position, release);
            float burst = sin(clamp((uTime - 4.6 - aMeta.y * .18) / 3.25, 0., 1.) * 3.14159265);
            p += normalize(position + vec3(.0001)) * burst * (.38 + aMeta.z * .45) * uEnergy;
            p += vec3(sin(aMeta.z * 78. + uTime), cos(aMeta.z * 93. + uTime), sin(aMeta.z * 57.)) * .035 * sin(clamp(uTime / 9., 0., 1.) * 3.14159265);
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = clamp(aMeta.x * uPixelRatio * 7.5 / -mv.z, .8, 9.);
            vBrightness = aMeta.z; vDepth = clamp(1.1 + mv.z * .04, .45, 1.);
          }`,
        fragmentShader: `
          uniform vec3 uColor; uniform vec3 uHighlight; uniform float uOpacity;
          varying float vBrightness; varying float vDepth;
          void main() {
            float r = length(gl_PointCoord - .5) * 2.; if (r > 1.) discard;
            float alpha = pow(1. - r, 1.1) * (.55 + vBrightness * .45) * vDepth * uOpacity;
            gl_FragColor = vec4(mix(uColor, uHighlight, pow(vBrightness, 5.) * .75), alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      });
      this.points = new T.Points(this.geometry, this.material); this.points.frustumCulled = false; this.group.add(this.points);
      this.lineGeometry = new T.BufferGeometry().setFromPoints(this.data.edges.flat().map(p => new T.Vector3(...p)));
      this.lineMaterial = new T.LineBasicMaterial({ color: '#699ef5', transparent: true, opacity: 0, depthWrite: false });
      this.lines = new T.LineSegments(this.lineGeometry, this.lineMaterial); this.group.add(this.lines);
      this.ready = true; this.updateTheme(); this.resize(); this.render();
      // Keep the static composition until a real WebGL frame has been painted.
      this.canvas.hidden = false; this.fallback.hidden = true;
      this.schedule();
    } catch {
      this.useFallback();
    } finally {
      this.loading = false;
      if (!this.disposed) this.updateControls();
    }
  }

  updateTheme() {
    if (this.disposed || !this.ready) return;
    const dark = this.dark;
    this.material.uniforms.uColor.value.set(dark ? '#699ef5' : '#0052d9');
    this.material.uniforms.uHighlight.value.set(dark ? '#d2e8ff' : '#003c9e');
    this.material.uniforms.uOpacity.value = dark ? .92 : .8;
    const blending = dark ? this.T.AdditiveBlending : this.T.NormalBlending;
    if (this.material.blending !== blending) { this.material.blending = blending; this.material.needsUpdate = true; }
    this.lineMaterial.color.set(dark ? '#699ef5' : '#0052d9');
    this.render();
  }

  resize() {
    if (this.disposed || !this.ready) return;
    const rect = this.stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) { this.stop(); return; }
    const phone = rect.width < 500;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.5 : 2));
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.position.z = this.utility ? 7.2 : phone ? 5.8 : 6.2;
    this.camera.updateProjectionMatrix();
    this.geometry.setDrawRange(0, this.id === 'contact' ? 6000 : phone ? 10000 : 15000);
    this.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    this.render();
  }

  updateControls() {
    if (this.disposed) return;
    const text = copy();
    const staticView = this.reduced.matches || this.failed || !this.ready;
    const finished = this.elapsed >= DURATION;
    this.controls.setAttribute('aria-label', text.group);
    this.pauseButton.hidden = staticView || finished;
    this.replayButton.hidden = staticView;
    this.pauseButton.textContent = this.paused ? text.resume : text.pause;
    this.pauseButton.setAttribute('aria-label', this.paused ? text.resumeLabel : text.pauseLabel);
    this.pauseButton.setAttribute('aria-pressed', String(this.paused));
    this.replayButton.textContent = text.replay;
    this.replayButton.setAttribute('aria-label', text.replayLabel);
    const status = staticView ? text.static : finished ? text.complete : this.paused ? text.paused : text.playing;
    if (this.status.textContent !== status) this.status.textContent = status;
    this.host.dataset.motionState = this.reduced.matches ? 'static' : this.failed ? 'fallback' : this.loading && !this.ready ? 'loading' : !this.ready ? 'static' : finished ? 'complete' : this.paused ? 'paused' : !this.visible || document.hidden ? 'offscreen' : 'playing';
  }

  motionPreferenceChanged() {
    this.stop();
    if (this.reduced.matches) {
      this.fallback.hidden = false; if (this.canvas) this.canvas.hidden = true;
    } else {
      this.elapsed = 0; this.paused = false;
      if (this.ready) { this.render(); this.canvas.hidden = false; this.fallback.hidden = true; }
      this.activate();
    }
    this.updateControls();
  }

  eligible() { return !this.disposed && this.ready && !this.failed && !this.paused && !this.reduced.matches && this.visible && !document.hidden && this.elapsed < DURATION; }

  render() {
    if (this.disposed || !this.ready || this.reduced.matches) return;
    this.material.uniforms.uTime.value = this.elapsed;
    this.group.rotation.set(-.1, .18 + Math.sin(clamp(this.elapsed / DURATION) * Math.PI) * .07, -.03);
    this.lineMaterial.opacity = (this.dark ? .24 : .2) * clamp((this.elapsed - 5) / 2.5);
    this.renderer.render(this.scene, this.camera);
  }

  schedule() {
    if (!this.eligible() || this.raf) return;
    this.raf = requestAnimationFrame(now => {
      this.raf = 0;
      if (!this.host.isConnected) { this.destroy(); return; }
      if (!this.eligible()) { this.last = 0; this.updateControls(); return; }
      const dt = this.last ? Math.min((now - this.last) / 1000, .05) : 0;
      this.last = now; this.elapsed = Math.min(DURATION, this.elapsed + dt);
      this.render();
      if (this.elapsed >= DURATION) { this.last = 0; this.updateControls(); }
      else this.schedule();
    });
  }

  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.last = 0; }

  useFallback() {
    if (this.disposed) return;
    this.stop(); this.ready = false; this.failed = true;
    this.fallback.hidden = false; if (this.canvas) this.canvas.hidden = true;
    this.updateControls();
  }

  getState() {
    return { scene: this.id, state: this.host.dataset.motionState, elapsed: this.elapsed, rendering: !!this.raf, particles: this.geometry?.drawRange.count || 0, mainNodes: this.data?.mainNodes || null, rendererCount: this.renderer ? 1 : 0, reducedMotion: this.reduced.matches };
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true; this.stop(); this.abort.abort();
    this.intersection?.disconnect(); this.resizeObserver?.disconnect(); this.rootObserver?.disconnect();
    this.geometry?.dispose(); this.lineGeometry?.dispose(); this.material?.dispose(); this.lineMaterial?.dispose();
    this.renderer?.renderLists.dispose(); this.renderer?.dispose(); this.renderer?.forceContextLoss();
    this.scene?.clear(); this.stage.remove(); this.controls.remove(); delete this.host.dataset.motionState;
    if (window[SINGLETON] === this) delete window[SINGLETON];
    this.data = null;
  }
}

/** Mount one decorative renderer for this document. Re-mounting safely releases the prior instance. */
export function mountHeroArt(host = document.querySelector('.lan-hero-art[data-lan-hero-scene]')) {
  if (!host) return null;
  const existing = window[SINGLETON];
  if (existing?.host === host && !existing.disposed) return existing;
  existing?.destroy();
  const instance = new HeroArt(host); window[SINGLETON] = instance;
  return instance;
}

export function getHeroArtState() { return window[SINGLETON]?.getState() || null; }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountHeroArt(), { once: true });
else mountHeroArt();
