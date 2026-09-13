/**
 * Generate /en/ and /zh-Hant/ HTML trees from zh-Hans sources.
 * Do not hand-edit those trees.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCourseTable } from "../ai-course/ai-course-i18n.js";
import { getI18nTable } from "../i18n.js";
import {
  DEFAULT_LOCALE,
  SITE_ORIGIN,
  SITE_LOCALES,
  absoluteLocaleUrl,
  getIdentity,
  getPageCopy,
  withLocalePrefix,
} from "../site-identity.js";
import { PUBLIC_ROUTES } from "../site-seo.js";
import { COURSE_DOWNLOADS } from "../ai-course/course-downloads.js";
import { writeWelcomeRobots, writeZipOnlyRobots } from "./ai-crawler-policy.mjs";
import { applySeoHead, localeHtmlPath, upsertAnalytics } from "./seo-html.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENERATED_LOCALES = SITE_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const ASSET_EXT = /\.(css|js|mjs|map|xml|txt|png|jpe?g|webp|svg|ico|woff2?|ttf)$/i;

const lookupFor = (html, locale) => {
  const home = getI18nTable(locale);
  const course = /data-course-page=/.test(html) ? getCourseTable(locale) : {};
  return (key) => course[key] ?? home[key] ?? null;
};

const applyI18nHtml = (html, lookup) => {
  let next = html;
  next = next.replace(
    /data-i18n-html="([^"]+)"([^>]*)>([\s\S]*?)<\/(p|h1|h2|h3|h4|span|div|li|dt|dd|small|strong)>/gi,
    (match, key, attrs, _inner, tag) => {
      const value = lookup(key);
      if (value == null) return match;
      return `data-i18n-html="${key}"${attrs}>${value}</${tag}>`;
    }
  );
  next = next.replace(/data-i18n="([^"]+)"([^>]*)>([^<]*)</g, (match, key, attrs, text) => {
    const value = lookup(key);
    if (value == null) return match;
    if (text.includes("{{") || attrs.includes("data-i18n-html")) return match;
    return `data-i18n="${key}"${attrs}>${value}<`;
  });
  next = next.replace(/data-i18n-alt="([^"]+)"/g, (match, key) => {
    const value = lookup(key);
    if (value == null) return match;
    return match;
  });
  next = next.replace(/alt="([^"]*)"([^>]*data-i18n-alt="([^"]+)")/g, (match, _alt, rest, key) => {
    const value = lookup(key);
    if (value == null) return match;
    return `alt="${value}"${rest}`;
  });
  next = next.replace(/(data-i18n-alt="([^"]+)"[^>]*alt=")([^"]*)(")/g, (match, prefix, key, _alt, suffix) => {
    const value = lookup(key);
    if (value == null) return match;
    return `${prefix}${value}${suffix}`;
  });
  next = next.replace(/data-i18n-aria="([^"]+)"/g, (match, key) => match);
  next = next.replace(/aria-label="([^"]*)"([^>]*data-i18n-aria="([^"]+)")/g, (match, _label, rest, key) => {
    const value = lookup(key);
    if (value == null) return match;
    return `aria-label="${value}"${rest}`;
  });
  next = next.replace(/(data-i18n-aria="([^"]+)"[^>]*aria-label=")([^"]*)(")/g, (match, prefix, key, _label, suffix) => {
    const value = lookup(key);
    if (value == null) return match;
    return `${prefix}${value}${suffix}`;
  });
  return next;
};

const splitRef = (href) => {
  const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
  const withoutHash = hash ? href.slice(0, href.indexOf("#")) : href;
  const query = withoutHash.includes("?") ? withoutHash.slice(withoutHash.indexOf("?")) : "";
  const pathPart = query ? withoutHash.slice(0, withoutHash.indexOf("?")) : withoutHash;
  return { pathPart, extra: `${query}${hash}` };
};

const resolveLocalPath = (href, sourceDir) => {
  if (href.startsWith("/")) return href;
  const base = sourceDir ? `/${sourceDir}/` : "/";
  return path.posix.normalize(`${base}${href}`);
};

const rewriteRef = (href, sourceDir, locale) => {
  if (!href) return href;
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:") ||
    /^(https?:)?\/\//i.test(href)
  ) {
    return href;
  }
  const { pathPart, extra } = splitRef(href);
  const resolved = resolveLocalPath(pathPart, sourceDir);
  if (ASSET_EXT.test(resolved) || resolved === "/sitemap.xml" || resolved === "/robots.txt") {
    return `${resolved}${extra}`;
  }
  let page = resolved === "/index.html" ? "/" : resolved;
  if (page !== "/" && !page.endsWith("/") && !path.posix.basename(page).includes(".")) {
    page = `${page}/`;
  }
  return `${withLocalePrefix(page, locale)}${extra}`;
};

const rewriteRefs = (html, sourceDir, locale) => {
  let next = html;
  next = next.replace(/\b(href|src)="([^"]+)"/g, (_, attr, href) => `${attr}="${rewriteRef(href, sourceDir, locale)}"`);
  next = next.replace(/from ["'](\.\.?\/[^"']+)["']/g, (_, href) => `from "${rewriteRef(href, sourceDir, locale)}"`);
  return next;
};

const writeFile = (relative, contents) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, "utf8");
};

const generateRoute = (route, locale) => {
  const source = fs.readFileSync(path.join(root, route.html), "utf8");
  const sourceDir = path.posix.dirname(route.html) === "." ? "" : path.posix.dirname(route.html);
  const lookup = lookupFor(source, locale);
  let html = applyI18nHtml(source, lookup);
  html = rewriteRefs(html, sourceDir, locale);
  html = applySeoHead(html, route, locale);
  const out = localeHtmlPath(route.html, locale);
  writeFile(out, html);
  return out;
};

const generateNotFound = (locale) => {
  const source = fs.readFileSync(path.join(root, "404.html"), "utf8");
  const lookup = lookupFor(source, locale);
  const copy = getPageCopy("not-found", locale);
  const identity = getIdentity(locale);
  let html = applyI18nHtml(source, lookup);
  html = rewriteRefs(html, "", locale);
  html = html
    .replace(/<html[^>]*>/i, `<html lang="${locale === "en" ? "en" : locale === "zh-Hant" ? "zh-Hant" : "zh-CN"}">`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${copy.title}</title>`)
    .replace(/content="[^"]*"(\s+name="description")/, `content="${copy.description}"$1`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${copy.description}" />`);
  html = html.replace(/<a class="btn[^"]*" href="[^"]*"/, `<a class="btn primary" href="${withLocalePrefix("/", locale)}"`);
  html = upsertAnalytics(html, "lan");
  writeFile(localeHtmlPath("404.html", locale), html);
  void identity;
};

const LH_PREFIX = {
  "zh-Hans": "",
  "zh-Hant": "/zh-Hant",
  en: "/en",
};

const lhUrl = (origin, locale) => {
  const prefix = LH_PREFIX[locale] || "";
  return `${origin.replace(/\/$/, "")}${prefix}/`;
};

export const llmsBody = (locale) => {
  const identity = getIdentity(locale);
  const welcome =
    locale === "en"
      ? "AI crawlers and assistants are welcome to fetch, cite, summarize, and train on LAN Cloud public pages. Prefer sitemap.xml and this file. Use apex https://lancloudtech.com, not www or global.lancloudtech.com. The only exclusion is course ZIP practice packs."
      : locale === "zh-Hant"
        ? "歡迎 AI 爬蟲與助理抓取、引用、摘要並訓練蘭芯雲朵的公開頁面。請優先使用 sitemap.xml 與本檔。請使用 apex https://lancloudtech.com，不要用 www 或 global.lancloudtech.com。唯一排除項是課程練習包 ZIP。"
        : "欢迎 AI 爬虫与助理抓取、引用、摘要并训练兰芯云朵的公开页面。请优先使用 sitemap.xml 与本文件。请使用 apex https://lancloudtech.com，不要用 www 或 global.lancloudtech.com。唯一排除项是课程练习包 ZIP。";
  const lines = [
    `# ${identity.siteName}`,
    "",
    welcome,
    "",
    identity.tagline,
    "",
    locale === "en" ? "## Company site" : locale === "zh-Hant" ? "## 公司網站" : "## 公司网站",
    ...PUBLIC_ROUTES.map((route) => {
      const copyId = route.id === "sitemap" ? "sitemap" : route.id;
      const title =
        copyId === "home" ? identity.siteName : getPageCopy(copyId, locale).title;
      return `- ${title}: ${absoluteLocaleUrl(route.path, locale)}`;
    }),
    `- VECT: ${absoluteLocaleUrl("/solutions/", locale)}#vect`,
    `- TACT: ${absoluteLocaleUrl("/solutions/", locale)}#tact`,
    locale === "en"
      ? "VECT and TACT have Feishu-based business validation. Their standalone SaaS versions are in preparation and are not available for self-service sign-up. Public course schedules are free to read; enterprise training is a separate paid service."
      : locale === "zh-Hant"
        ? "VECT、TACT 已有飛書方案業務驗證，自有 SaaS 正在籌備與前期建設，尚未開放自助開通。公開課表可免費瀏覽；企業實戰培訓為另行洽談的付費服務。"
        : "VECT、TACT 已有飞书方案业务验证，自有 SaaS 正在筹备与前期建设，尚未开放自助开通。公开课表可免费浏览；企业实战培训为另行洽谈的付费服务。",
    "",
    locale === "en" ? "## LeadsHunter" : locale === "zh-Hant" ? "## 線索獵手" : "## 线索猎手",
    `- ${lhUrl("https://leadshunter.lancloudtech.com", locale)}`,
    `- ${lhUrl("https://leadshunter-guide.lancloudtech.com", locale)}`,
    `- ${lhUrl("https://leadshunter-contact.lancloudtech.com", locale)}`,
    "",
    locale === "en" ? "## Contact" : locale === "zh-Hant" ? "## 聯繫" : "## 联系",
    `- ${identity.company}`,
    `- lance@lancloudtech.com`,
    `- +86-17380566771`,
    "",
    locale === "en" ? "## Do not train on" : locale === "zh-Hant" ? "## 請勿用於訓練" : "## 请勿用于训练",
    `- ${COURSE_DOWNLOADS.practice.cn}`,
    `- ${COURSE_DOWNLOADS.practice.global}`,
  ];
  return `${lines.join("\n")}\n`;
};

const writeAiRobots = () => {
  writeFile("robots.txt", writeWelcomeRobots({ origin: SITE_ORIGIN }));
  const filesDir = path.join(root, "ops/files");
  fs.mkdirSync(filesDir, { recursive: true });
  fs.writeFileSync(path.join(filesDir, "robots.txt"), writeZipOnlyRobots(), "utf8");
};

export const generateLocalePages = () => {
  const written = [];
  for (const locale of GENERATED_LOCALES) {
    for (const route of PUBLIC_ROUTES) {
      written.push(generateRoute(route, locale));
    }
    generateNotFound(locale);
    written.push(localeHtmlPath("404.html", locale));
    const llmsPath = localeHtmlPath("llms.txt", locale);
    writeFile(llmsPath, llmsBody(locale));
    written.push(llmsPath);
  }
  writeFile("llms.txt", llmsBody(DEFAULT_LOCALE));
  written.push("llms.txt");
  writeFile("404.html", upsertAnalytics(fs.readFileSync(path.join(root, "404.html"), "utf8"), "lan"));
  written.push("404.html");
  writeAiRobots();
  written.push("robots.txt", "ops/files/robots.txt");
  return written;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const written = generateLocalePages();
  console.log(`Generated ${written.length} locale files.`);
}
