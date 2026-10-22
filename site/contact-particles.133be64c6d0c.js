const instances = new WeakMap();
const FRAME_INTERVAL = 1000 / 24;
const TAU = Math.PI * 2;

/** A quiet, decorative Canvas2D layer behind the contact section. */
class ContactParticles {
  constructor(element) {
    this.element = element;
    this.document = element.ownerDocument;
    this.window = this.document.defaultView;
    this.width = 0;
    this.height = 0;
    this.elapsed = 0;
    this.frameId = 0;
    this.visibilityFrameId = 0;
    this.lastDrawAt = null;
    this.nextDrawAt = 0;
    this.pageHidden = false;
    this.destroyed = false;
    this.cleanups = [];
    this.reducedMotion = this.window.matchMedia('(prefers-reduced-motion: reduce)');
    this.systemDark = this.window.matchMedia('(prefers-color-scheme: dark)');
    this.tick = this.tick.bind(this);

    this.canvas = this.document.createElement('canvas');
    this.canvas.className = 'contact-particles';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none;z-index:0;';
    try {
      this.context = this.canvas.getContext('2d', { alpha: true });
    } catch {
      this.context = null;
    }
    if (!this.context) {
      this.element.dataset.contactMotion = 'unavailable';
      return;
    }

    // Fixed seeds keep resize and theme changes from rearranging the scene.
    this.particles = Array.from({ length: 28 }, (_, index) => {
      const seed = fraction(Math.sin((index + 1) * 127.1) * 43758.5453);
      const secondary = fraction(Math.sin((index + 1) * 311.7) * 23841.7621);
      return {
        start: seed,
        band: secondary,
        duration: 80 + seed * 60,
        radius: 0.7 + secondary * 0.8,
        brightness: 0.38 + seed * 0.5,
      };
    });

    this.element.prepend(this.canvas);
    this.measureVisibility();
    this.updateTheme();
    this.resize();
    this.installObservers();
    this.syncState();
  }

  listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    this.cleanups.push(() => target.removeEventListener(type, callback, options));
  }

  listenMedia(query, callback) {
    if (query.addEventListener) {
      this.listen(query, 'change', callback);
    } else {
      query.addListener(callback);
      this.cleanups.push(() => query.removeListener(callback));
    }
  }

  installObservers() {
    if ('IntersectionObserver' in this.window) {
      this.intersectionObserver = new this.window.IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];
        this.visible = entry.isIntersecting && entry.intersectionRatio > 0;
        this.syncState();
      }, { threshold: 0 });
      this.intersectionObserver.observe(this.element);
    } else {
      // Older browsers still stop drawing once the section leaves the viewport.
      this.listen(this.window, 'scroll', () => {
        if (this.visibilityFrameId || this.destroyed) return;
        this.visibilityFrameId = this.window.requestAnimationFrame(() => {
          this.visibilityFrameId = 0;
          this.measureVisibility();
          this.syncState();
        });
      }, { passive: true });
    }

    if ('ResizeObserver' in this.window) {
      this.resizeObserver = new this.window.ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.element);
    }
    // Window resize also catches DPR changes when moving between displays.
    this.listen(this.window, 'resize', () => {
      this.measureVisibility();
      this.resize();
    }, { passive: true });

    this.themeObserver = new this.window.MutationObserver(() => {
      this.updateTheme();
      this.draw();
    });
    this.themeObserver.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    this.listenMedia(this.systemDark, () => {
      this.updateTheme();
      this.draw();
    });
    this.listenMedia(this.reducedMotion, () => {
      this.draw();
      this.syncState();
    });
    this.listen(this.document, 'visibilitychange', () => this.syncState());
    this.listen(this.window, 'pagehide', event => {
      this.pageHidden = true;
      this.syncState();
      if (!event.persisted) this.destroy();
    });
    this.listen(this.window, 'pageshow', () => {
      this.pageHidden = false;
      this.measureVisibility();
      this.updateTheme();
      this.resize();
      this.syncState();
    });
  }

  measureVisibility() {
    const rect = this.element.getBoundingClientRect();
    this.visible = this.element.isConnected && rect.width > 0 && rect.height > 0
      && rect.bottom > 0 && rect.top < this.window.innerHeight
      && rect.right > 0 && rect.left < this.window.innerWidth;
  }

  updateTheme() {
    const theme = this.document.documentElement.dataset.theme;
    this.dark = theme ? theme === 'dark' : this.systemDark.matches;
    this.color = this.dark ? '105,153,255' : '0,82,217';
    this.makeGradient();
  }

  makeGradient() {
    if (!this.context || !this.width) return;
    this.lineGradient = this.context.createLinearGradient(0, 0, this.width, 0);
    const opacity = this.dark ? 0.15 : 0.095;
    this.lineGradient.addColorStop(0, `rgba(${this.color},0)`);
    this.lineGradient.addColorStop(0.25, `rgba(${this.color},${opacity})`);
    this.lineGradient.addColorStop(0.7, `rgba(${this.color},${opacity * 0.7})`);
    this.lineGradient.addColorStop(1, `rgba(${this.color},0)`);
  }

  resize() {
    if (this.destroyed || !this.context) return;
    // client dimensions avoid using the canvas itself to size its parent.
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    const dpr = Math.min(1.5, this.window.devicePixelRatio || 1);
    if (width !== this.width || height !== this.height || dpr !== this.dpr) {
      this.width = width;
      this.height = height;
      this.dpr = dpr;
      this.mobile = this.window.innerWidth <= 600;
      this.particleCount = this.mobile ? 10 : Math.max(14, Math.min(28, Math.round(width / 34)));
      this.canvas.width = Math.max(1, Math.round(width * dpr));
      this.canvas.height = Math.max(1, Math.round(height * dpr));
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.makeGradient();
      this.draw();
    }
    this.syncState();
  }

  syncState() {
    if (this.destroyed || !this.context) return;
    let state = 'running';
    if (this.pageHidden) state = 'paused-pagehide';
    else if (this.document.hidden) state = 'paused-hidden';
    else if (!this.visible || !this.element.isConnected || !this.width || !this.height) state = 'paused-offscreen';
    else if (this.reducedMotion.matches) state = 'static-reduced';
    this.element.dataset.contactMotion = state;
    if (state === 'running') this.start();
    else this.stop();
  }

  start() {
    if (this.frameId || this.destroyed) return;
    this.lastDrawAt = null;
    this.nextDrawAt = 0;
    this.frameId = this.window.requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.frameId) this.window.cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.lastDrawAt = null;
    this.nextDrawAt = 0;
  }

  tick(now) {
    this.frameId = 0;
    if (this.destroyed) return;
    if (this.document.hidden || this.pageHidden || !this.visible
        || !this.element.isConnected || this.reducedMotion.matches) {
      this.syncState();
      return;
    }
    if (now >= this.nextDrawAt) {
      const delta = this.lastDrawAt === null ? 0 : Math.min(0.15, (now - this.lastDrawAt) / 1000);
      this.elapsed += delta;
      this.lastDrawAt = now;
      // Keep an average 24 fps cadence without accumulating late frames.
      this.nextDrawAt = this.nextDrawAt
        ? now + FRAME_INTERVAL - ((now - this.nextDrawAt) % FRAME_INTERVAL)
        : now + FRAME_INTERVAL;
      this.draw();
    }
    this.frameId = this.window.requestAnimationFrame(this.tick);
  }

  draw() {
    if (!this.context || this.destroyed || !this.width || !this.height) return;
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const phase = this.elapsed / 120 * TAU;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 0.8;
    context.strokeStyle = this.lineGradient;

    // Leave the heading area empty; the lower quarter carries the soft flow.
    const lines = this.mobile ? 3 : 4;
    for (let line = 0; line < lines; line += 1) {
      context.beginPath();
      for (let step = 0; step <= 40; step += 1) {
        const progress = step / 40;
        const y = height * (0.77 + line * 0.052)
          + Math.sin(progress * TAU * 0.8 - phase + line * 0.6) * Math.min(12, height * 0.035);
        if (step === 0) context.moveTo(0, y);
        else context.lineTo(progress * width, y);
      }
      context.stroke();
    }

    for (let index = 0; index < this.particleCount; index += 1) {
      const particle = this.particles[index];
      const progress = (particle.start + this.elapsed / particle.duration) % 1;
      const x = progress * width;
      const y = height * (0.72 + particle.band * 0.24)
        + Math.sin(progress * TAU * 0.8 - phase + particle.band * 2) * Math.min(10, height * 0.025);
      const edgeFade = Math.pow(Math.sin(progress * Math.PI), 0.65);
      const opacity = particle.brightness * edgeFade * (this.dark ? 0.6 : 0.42);
      context.beginPath();
      context.arc(x, y, particle.radius * 3.2, 0, TAU);
      context.fillStyle = `rgba(${this.color},${opacity * 0.1})`;
      context.fill();
      context.beginPath();
      context.arc(x, y, particle.radius, 0, TAU);
      context.fillStyle = `rgba(${this.color},${opacity})`;
      context.fill();
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    this.destroyed = true;
    if (this.visibilityFrameId) this.window.cancelAnimationFrame(this.visibilityFrameId);
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups.length = 0;
    this.canvas.remove();
    this.element.dataset.contactMotion = 'destroyed';
    instances.delete(this.element);
  }
}

function fraction(value) {
  return value - Math.floor(value);
}

/** Initialize once per matching section; controllers expose destroy() for cleanup. */
export function initContactParticles(root = document) {
  const sections = [];
  if (root.matches?.('#contact.contact')) sections.push(root);
  sections.push(...root.querySelectorAll('#contact.contact'));
  return sections.map(element => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new ContactParticles(element);
      instances.set(element, instance);
    }
    return instance;
  });
}
