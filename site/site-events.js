/**
 * Shared current-site click taxonomy. Umami alone owns delivery and pageviews.
 * This module decorates elements; it never sends analytics requests itself.
 */
export const SITE_EVENT_NAMES = Object.freeze({
  email: "inquiry_email",
  wecom: "inquiry_wecom",
  phone: "inquiry_phone",
  leadshunter: "product_leadshunter",
  academy: "academy_overview",
  appDownload: "app_download",
  courseDownload: "course_download",
  solutions: "solutions_overview",
});

const COMPANY_HOSTS = new Set([
  "lancloudtech.com", "www.lancloudtech.com", "global.lancloudtech.com",
]);
const ALIASES = Object.freeze({
  hero_academy: SITE_EVENT_NAMES.academy,
  academy_overview: SITE_EVENT_NAMES.academy,
  course_overview: SITE_EVENT_NAMES.academy,
  hero_solutions: SITE_EVENT_NAMES.solutions,
  solutions_overview: SITE_EVENT_NAMES.solutions,
  product_leadshunter: SITE_EVENT_NAMES.leadshunter,
  contact_email: SITE_EVENT_NAMES.email,
  inquiry_email: SITE_EVENT_NAMES.email,
  contact_wecom: SITE_EVENT_NAMES.wecom,
  inquiry_wecom: SITE_EVENT_NAMES.wecom,
  contact_phone: SITE_EVENT_NAMES.phone,
  inquiry_phone: SITE_EVENT_NAMES.phone,
  app_download: SITE_EVENT_NAMES.appDownload,
  course_download: SITE_EVENT_NAMES.courseDownload,
});
const TOPICS = new Set(["product", "training", "global", "project"]);
const TRACKED_ATTRIBUTE = "data-umami-event";
const FIELD_PREFIX = `${TRACKED_ATTRIBUTE}-`;
const SELECTOR = `a[href], [${TRACKED_ATTRIBUTE}]`;
const installations = new WeakMap();

const parseUrl = (value, base = "https://lancloudtech.com/") => {
  try { return new URL(value, base); } catch { return null; }
};

/** The current release owns all company routes; old preview paths are redirect aliases. */
export const getSiteEventContext = (href) => {
  const url = parseUrl(href);
  const pathname = url?.pathname || "/";
  const preview = /^\/preview(?:\/|$)/.test(pathname);
  const unversioned = preview ? pathname.replace(/^\/preview(?=\/|$)/, "") || "/" : pathname;
  const language = /^\/en(?:\/|$)/.test(unversioned)
    ? "en" : /^\/zh-Hant(?:\/|$)/.test(unversioned) ? "zh-Hant" : "zh-Hans";
  const route = unversioned.replace(/^\/(?:en|zh-Hant)(?=\/|$)/, "") || "/";
  return { site_version: "current", language, route };
};

const sameCompany = (source, target) =>
  target.origin === source.origin || (COMPANY_HOSTS.has(source.hostname) && COMPANY_HOSTS.has(target.hostname));

/** Pure mapping: never collect mail bodies, arbitrary query values, or link text. */
export const describeSiteEvent = ({ href = "", eventName = "", download = "", topic = "" } = {}, currentHref) => {
  const source = parseUrl(currentHref);
  if (!source) return null;
  const context = getSiteEventContext(source.href);
  const data = { site_version: context.site_version, language: context.language };
  const target = href ? parseUrl(href, source.href) : null;
  const internal = target && /^https?:$/.test(target.protocol) && sameCompany(source, target);
  const destination = target ? getSiteEventContext(target.href) : null;
  const localAnchor = href.trim().startsWith("#");
  let name;

  if (target?.protocol === "mailto:") {
    name = SITE_EVENT_NAMES.email;
  } else if (target?.protocol === "tel:") {
    name = SITE_EVENT_NAMES.phone;
  } else if (target?.hostname === "leadshunter.lancloudtech.com" || (internal && /^\/leadshunter\/?$/.test(destination.route))) {
    name = SITE_EVENT_NAMES.leadshunter;
  } else if (target?.hostname === "appstore.lancloudtech.com") {
    name = SITE_EVENT_NAMES.appDownload;
  } else if (internal && /^\/contact\/wecom\/?$/.test(destination.route)) {
    name = SITE_EVENT_NAMES.wecom;
  } else if (["textbook", "practice"].includes(download) ||
      (target && ["img.lancloudtech.com", "files.lancloudtech.com"].includes(target.hostname) && /\/ai-course\//.test(target.pathname))) {
    name = SITE_EVENT_NAMES.courseDownload;
    data.resource = ["textbook", "practice"].includes(download) ? download : /\.zip$/i.test(target.pathname) ? "practice" : "textbook";
  } else if (internal && destination.route === "/" && target.hash === "#academy") {
    name = SITE_EVENT_NAMES.academy;
    data.course_path = "overview";
  } else if (internal && !localAnchor && /^\/ai-course(?:\/|$)/.test(destination.route)) {
    name = SITE_EVENT_NAMES.academy;
    data.course_path = /\/fde\/?$/.test(destination.route) ? "fde" : /\/mvp-3day\/?$/.test(destination.route) ? "mvp-3day" : "overview";
  } else if (internal && !localAnchor && /^\/solutions\/?$/.test(destination.route)) {
    name = SITE_EVENT_NAMES.solutions;
  } else {
    name = ALIASES[eventName];
  }
  if (!name) return null;
  if (TOPICS.has(topic) && [SITE_EVENT_NAMES.email, SITE_EVENT_NAMES.wecom].includes(name)) data.topic = topic;
  return { name, data };
};

const decorate = (element, currentHref) => {
  // A cached prelaunch page must not send the retired switch event to Umami.
  if (element.getAttribute(TRACKED_ATTRIBUTE) === "website_version_switch") {
    element.removeAttribute(TRACKED_ATTRIBUTE);
    for (const attribute of element.getAttributeNames()) {
      if (attribute.startsWith(FIELD_PREFIX)) element.removeAttribute(attribute);
    }
  }
  element.removeAttribute("data-site-version-switch");
  const event = describeSiteEvent({
    href: element.getAttribute("href") || "",
    eventName: element.getAttribute(TRACKED_ATTRIBUTE) || "",
    download: element.getAttribute("data-course-download") || "",
    topic: element.getAttribute(`${FIELD_PREFIX}topic`) || "",
  }, currentHref);
  if (!event) return null;

  // Whitelist event fields, including when a previously tagged element is reused.
  for (const attribute of element.getAttributeNames()) {
    if (attribute.startsWith(FIELD_PREFIX)) element.removeAttribute(attribute);
  }
  element.setAttribute(TRACKED_ATTRIBUTE, event.name);
  for (const [key, value] of Object.entries(event.data)) element.setAttribute(`${FIELD_PREFIX}${key}`, value);
  // Umami must see the anchor itself so its keepalive + navigation protection applies.
  if (element.tagName === "A") {
    for (const nested of element.querySelectorAll(`[${TRACKED_ATTRIBUTE}]`)) {
      nested.removeAttribute(TRACKED_ATTRIBUTE);
      for (const attribute of nested.getAttributeNames()) {
        if (attribute.startsWith(FIELD_PREFIX)) nested.removeAttribute(attribute);
      }
    }
  }
  return event;
};

/** Idempotent per window, including callers that initialize again after rendering. */
export const initSiteEvents = (win = typeof window === "undefined" ? null : window) => {
  if (!win?.document) return null;
  const existing = installations.get(win);
  if (existing) { existing.refresh(); return existing; }
  const doc = win.document;
  const refresh = () => {
    for (const element of doc.querySelectorAll(SELECTOR)) decorate(element, win.location.href);
  };
  const onClick = (event) => {
    if (event.button != null && event.button !== 0) return;
    const target = event.target?.closest ? event.target : event.target?.parentElement;
    const element = target?.closest("a[href]") || target?.closest(SELECTOR);
    if (element) decorate(element, win.location.href);
  };
  // The deployed Umami tracker listens on DOCUMENT capture. WINDOW capture runs
  // first even if the async tracker registered before this module.
  win.addEventListener("click", onClick, true);
  const state = { refresh };
  installations.set(win, state);
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
  return state;
};

if (typeof window !== "undefined") initSiteEvents(window);
