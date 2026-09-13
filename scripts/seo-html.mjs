import {
  DEFAULT_LOCALE,
  HTML_LANG,
  HREFLANG,
  OG_LOCALE,
  SITE_LOCALES,
  absoluteLocaleUrl,
  getIdentity,
  getPageCopy,
  hreflangLinks,
  localePrefix,
} from "../site-identity.js";
import { SHARE_BY_ROUTE } from "../share-meta.js";
import { buildWebPageJsonLd } from "../site-seo.js";
import { analyticsScriptTag } from "../site-analytics.js";

export const upsertMeta = (html, { attr, key, content }) => {
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  if (html.includes('rel="canonical"')) {
    return html.replace(/(<link\s+rel="canonical"[^>]*>)/i, `$1\n  ${tag}`);
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
};

export const upsertOg = (html, property, content) =>
  upsertMeta(html, { attr: "property", key: property, content });

export const upsertTwitter = (html, name, content) =>
  upsertMeta(html, { attr: "name", key: name, content });

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

export const upsertTitle = (html, title) => {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  }
  return html.replace(/<head[^>]*>/i, `$&\n  <title>${title}</title>`);
};

export const upsertCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${url}" />`;
  if (/<link\s+rel="canonical"[^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"[^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
};

export const upsertAnalytics = (html, websiteKey = "lan") => {
  const tag = analyticsScriptTag(websiteKey);
  const stripped = html.replace(/\s*<script[^>]*data-lan-analytics="umami"[^>]*>\s*<\/script>/gi, "");
  if (!tag) return stripped;
  if (/<\/head>/i.test(stripped)) return stripped.replace(/<\/head>/i, `  ${tag}\n</head>`);
  return `${stripped}\n${tag}\n`;
};

export const upsertLdJson = (html, json) => {
  const block = `  <script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n  </script>`;
  if (/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
    return html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i, block.trimStart());
  }
  return html.replace(/<\/head>/i, `${block}\n</head>`);
};

export const upsertHtmlLang = (html, locale) =>
  html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${HTML_LANG[locale]}"`).replace(
    /<html(?![^>]*\slang=)/i,
    `<html lang="${HTML_LANG[locale]}"`
  );

export const upsertHreflang = (html, path) => {
  const links = hreflangLinks(path)
    .map((item) => `<link rel="alternate" hreflang="${item.hreflang}" href="${item.href}" />`)
    .join("\n  ");
  const stripped = html.replace(/\s*<link\s+rel="alternate"[^>]*hreflang="[^"]+"[^>]*>/gi, "");
  if (/<link\s+rel="canonical"[^>]*>/i.test(stripped)) {
    return stripped.replace(/(<link\s+rel="canonical"[^>]*>)/i, `$1\n  ${links}`);
  }
  return stripped.replace(/<\/head>/i, `  ${links}\n</head>`);
};

export const applySeoHead = (html, route, locale = DEFAULT_LOCALE) => {
  const copy = getPageCopy(route.id, locale);
  const identity = getIdentity(locale);
  const url = absoluteLocaleUrl(route.path, locale);
  const share = route.inShareMeta ? SHARE_BY_ROUTE[route.id] : null;
  const shareTitle = share?.locales?.[locale]?.title || copy.title;
  const shareDesc = share?.locales?.[locale]?.desc || copy.description;
  const imageAlt = copy.imageAlt;

  let next = upsertHtmlLang(html, locale);
  next = upsertTitle(next, copy.title);
  next = upsertCanonical(next, url);
  next = upsertHreflang(next, route.path);
  next = upsertMeta(next, {
    attr: "name",
    key: "description",
    content: copy.description,
  });
  next = upsertMeta(next, {
    attr: "name",
    key: "robots",
    content: "index,follow,max-image-preview:large",
  });
  next = upsertOg(next, "og:site_name", identity.siteName);
  next = upsertOg(next, "og:type", "website");
  next = upsertOg(next, "og:locale", OG_LOCALE[locale]);
  next = upsertOg(next, "og:url", url);
  next = upsertOg(next, "og:title", shareTitle);
  next = upsertOg(next, "og:description", shareDesc);
  if (imageAlt) next = upsertOg(next, "og:image:alt", imageAlt);
  next = upsertMeta(next, { attr: "itemprop", key: "name", content: shareTitle });
  next = upsertMeta(next, { attr: "itemprop", key: "description", content: shareDesc });
  next = upsertTwitter(next, "twitter:title", shareTitle);
  next = upsertTwitter(next, "twitter:description", shareDesc);
  next = upsertTwitter(next, "twitter:card", "summary_large_image");
  if (share) {
    next = upsertOg(next, "og:image", share.image);
    next = upsertOg(next, "og:image:width", share.imageWidth);
    next = upsertOg(next, "og:image:height", share.imageHeight);
    next = upsertMeta(next, { attr: "itemprop", key: "image", content: share.image });
    next = upsertTwitter(next, "twitter:image", share.image);
  }
  if (imageAlt) next = upsertTwitter(next, "twitter:image:alt", imageAlt);
  next = upsertLdJson(next, buildWebPageJsonLd(route.id, copy, locale));
  next = upsertAnalytics(next, "lan");
  return next;
};

export const localeHtmlPath = (sourceHtml, locale) => {
  const prefix = localePrefix(locale).replace(/^\//, "");
  if (!prefix) return sourceHtml;
  return `${prefix}/${sourceHtml}`;
};

void HREFLANG;
void SITE_LOCALES;
