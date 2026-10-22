/* Runs before paint. The resolved theme is shared by CSS, pictures and motion. */
(() => {
  const key = 'lancloud.theme';
  const root = document.documentElement;
  root.classList.add('js');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['system', 'light', 'dark'].includes(value) ? value : 'system';
  const sharedDomain = /(^|\.)lancloudtech\.com$/.test(location.hostname);
  const cookiePreference = () => {
    if (!sharedDomain) return null;
    const value = document.cookie.split('; ').find(item => item.startsWith('lancloud_theme='))?.split('=')[1];
    return ['system', 'light', 'dark'].includes(value) ? value : null;
  };
  let preference = 'system';
  try { preference = valid(localStorage.getItem(key)); } catch { /* Private browsing uses system. */ }
  preference = cookiePreference() || preference;
  const apply = () => {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    document.querySelectorAll('picture source[media], picture source[data-theme-media]').forEach(source => {
      const original = source.dataset.themeMedia || source.getAttribute('media');
      if (!/prefers-color-scheme/.test(original || '')) return;
      source.dataset.themeMedia = original;
      const desired = /prefers-color-scheme:\s*dark/.test(original) ? 'dark' : 'light';
      const remaining = original.replace(/\(prefers-color-scheme:\s*(dark|light)\)/g, '').replace(/^\s*and\s*|\s*and\s*$/g, '').trim();
      source.media = desired === theme ? (remaining || 'all') : 'not all';
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      const media = meta.dataset.themeMedia || meta.getAttribute('media') || '';
      if (media) meta.dataset.themeMedia = media;
      meta.media = /dark/.test(media) === (theme === 'dark') ? 'all' : 'not all';
    });
    document.querySelectorAll('[data-theme-option]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeOption === preference)));
    window.dispatchEvent(new CustomEvent('lan:theme-change', { detail: { theme, preference } }));
  };
  window.LANTheme = {
    get preference() { return preference; },
    get theme() { return root.dataset.theme; },
    set(value) {
      preference = valid(value);
      try { localStorage.setItem(key, preference); } catch { /* The current page still updates. */ }
      if (sharedDomain) document.cookie = `lancloud_theme=${preference}; Domain=lancloudtech.com; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      apply();
    },
    refresh: apply,
  };
  apply();
  document.addEventListener('DOMContentLoaded', apply, { once: true });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-option]');
    if (button) window.LANTheme.set(button.dataset.themeOption);
  });
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue); apply(); }
  });
  const restore = () => { preference = cookiePreference() || preference; apply(); };
  window.addEventListener('pageshow', restore);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) restore(); });
})();
