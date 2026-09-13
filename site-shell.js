import { getI18nTable, resolveLocale, setLocale } from './i18n.js';

const locale = resolveLocale();
const copy = getI18nTable(locale);
const header = document.querySelector('[data-site-header]');
const toggle = header?.querySelector('.lan-menu-toggle');
const menu = header?.querySelector('.lan-primary');
const setOpen = (open, restore = false) => {
  if (!header || !toggle || !menu) return;
  header.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', copy[open ? 'nav.closeMenu' : 'nav.menu'] || 'Menu');
  if (open) menu.querySelector('a')?.focus();
  if (restore) toggle.focus();
};
toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
document.addEventListener('click', event => { if (header && !header.contains(event.target)) setOpen(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setOpen(false, true);
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) setOpen(false); });
document.querySelectorAll('[data-shell-locale]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.dataset.shellLocale === locale));
  button.addEventListener('click', () => setLocale(button.dataset.shellLocale));
});
const setCurrent = () => {
  const path = location.pathname.replace(/^\/preview(?=\/)/, '').replace(/^\/(en|zh-Hant)(?=\/)/, '').replace(/index\.html$/, '');
  const route = document.body.dataset.siteError === '404' ? null : path.startsWith('/ai-course/') ? 'academy' : path.startsWith('/solutions/') || path.startsWith('/internal-expense/') ? 'solutions' : path.startsWith('/practice/') ? 'practice' : path === '/' && location.hash === '#method' ? 'about' : null;
  header?.querySelectorAll('[data-shell-route]').forEach(link => {
    if (link.dataset.shellRoute === route) link.setAttribute('aria-current', route === 'about' ? 'location' : 'page');
    else link.removeAttribute('aria-current');
  });
};
setCurrent();
window.addEventListener('hashchange', setCurrent);
