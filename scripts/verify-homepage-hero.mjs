import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const required = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/\s([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
  .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? ""]));
const hasClass = (tag, name) => (attributes(tag).class || "").split(/\s+/).includes(name);

function element(source, tag, predicate = () => true) {
  const tokens = [...source.matchAll(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"))];
  const start = tokens.findIndex((token) => !token[0].startsWith("</") && predicate(token[0]));
  if (start < 0) return "";
  let depth = 0;
  for (const token of tokens.slice(start)) {
    depth += token[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return source.slice(tokens[start].index, token.index + token[0].length);
  }
  return "";
}

function splitTopLevel(source, separator) {
  const pieces = [];
  let start = 0, depth = 0, quote = "";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== "\\") quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === separator && depth === 0) {
      pieces.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  pieces.push(source.slice(start).trim());
  return pieces;
}

function cssRules(source, media = []) {
  const rules = [];
  source = source.replace(/\/\*[\s\S]*?\*\//g, "");
  let cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf("{", cursor);
    if (opening < 0) break;
    let end = opening + 1, depth = 1, quote = "";
    for (; end < source.length && depth; end += 1) {
      const char = source[end];
      if (quote) {
        if (char === quote && source[end - 1] !== "\\") quote = "";
      } else if (char === '"' || char === "'") quote = char;
      else if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
    }
    required(depth === 0, "Hero stylesheet contains an unclosed CSS block.");
    const selector = source.slice(cursor, opening).trim();
    const body = source.slice(opening + 1, end - 1);
    if (/^@media\b/i.test(selector)) rules.push(...cssRules(body, [...media, selector]));
    else if (/^@(?:supports|layer|container)\b/i.test(selector)) rules.push(...cssRules(body, media));
    else if (!selector.startsWith("@")) {
      const declarations = splitTopLevel(body, ";").flatMap((declaration) => {
        const colon = declaration.indexOf(":");
        return colon < 0 ? [] : [[declaration.slice(0, colon).trim().toLowerCase(), declaration.slice(colon + 1).trim()]];
      });
      rules.push({ selector, media, declarations });
    }
    cursor = end;
  }
  return rules;
}

const normalized = (value) => value.toLowerCase().replace(/\s*!important\s*$/, "").trim();
const classPattern = (name) => new RegExp(`\\.${name}(?![\\w-])`);
const terminal = (selector) => selector.trim().split(/\s*[>+~]\s*|\s+/).at(-1);
const targets = (rule, name) => splitTopLevel(rule.selector, ",").some((selector) => {
  const end = terminal(selector);
  return classPattern(name).test(end) && !end.includes("::");
});
const values = (rules, property) => rules.flatMap((rule) => rule.declarations
  .filter(([name]) => name === property).map(([, value]) => normalized(value)));
const everyValue = (rules, property, predicate) => {
  const found = values(rules, property);
  return found.length > 0 && found.every(predicate);
};
const containsMedia = (rule, feature) => rule.media.some((media) => media.replace(/\s+/g, "").includes(feature));
const hiddenAttribute = (tag) => {
  const attrs = attributes(tag);
  return "hidden" in attrs || attrs["aria-hidden"] === "true";
};

function checkSource(source) {
  const attrs = attributes(source);
  required(!attrs.type || ["image/webp", "image/avif", "image/png", "image/jpeg"].includes(attrs.type),
    "Hero sources must use a supported image MIME type.");
  const candidates = (attrs.srcset || "").split(",").map((candidate) => candidate.trim().match(/^(\S+)\s+(\d+)w$/));
  required(candidates.length >= 2 && candidates.every((match) => match && Number(match[2]) > 0
    && /\.(?:webp|avif|png|jpe?g)(?:[?#].*)?$/i.test(match[1])), "Hero sources need valid image candidates with width descriptors.");
  const widths = candidates.map((match) => Number(match[2]));
  required(new Set(widths).size === widths.length && new Set(candidates.map((match) => match[1])).size === candidates.length,
    "Hero responsive candidates must have distinct widths and URLs.");
  const sizes = splitTopLevel(attrs.sizes || "", ",");
  required(sizes.every((size) => {
    // Check the source size separately from an optional leading media condition.
    const length = size.replace(/^\([^)]*\)\s*/, "");
    return /^(?:\d*\.?\d+(?:px|vw|vh|vmin|vmax|rem|em)|(?:calc|min|max|clamp)\(.+\))$/i.test(length)
      && [...length.matchAll(/(\d*\.?\d+)(?:px|vw|vh|vmin|vmax|rem|em)/g)].some((match) => Number(match[1]) > 0);
  }), "Hero width candidates need nonempty, usable sizes attributes.");
  return attrs;
}

export function verifyHero(page, css) {
  // Ignore decoys in comments and scripts instead of checking whole-file substrings.
  page = page.replace(/<!--[\s\S]*?-->/g, "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const hero = element(page, "section", (tag) => hasClass(tag, "hero"));
  required(hero, "Hero section is required.");
  required(!hiddenAttribute(hero.match(/^<[^>]+>/)[0]), "Hero content must remain accessible.");
  const background = element(hero, "div", (tag) => hasClass(tag, "hero-background"));
  required(background && attributes(background.match(/^<[^>]+>/)[0])["aria-hidden"] === "true",
    "Hero artwork must be a decorative background layer.");
  const copy = element(hero, "div", (tag) => hasClass(tag, "hero-copy"));
  required(copy && !background.includes(copy) && !hiddenAttribute(copy.match(/^<[^>]+>/)[0]),
    "Hero copy must be accessible outside the decorative background.");
  const heading = element(copy, "h1");
  required(heading && !hiddenAttribute(heading.match(/^<[^>]+>/)[0])
    && heading.replace(/<[^>]*>/g, "").replace(/&(?:nbsp|#160);/g, " ").trim(), "Hero needs a visible text h1 in its copy.");
  required(!background.includes("data-i18n-alt"), "Decorative hero artwork must not be localized as content.");
  const picture = element(background, "picture");
  required(picture, "Hero background must use a picture element.");
  const images = [...picture.matchAll(/<img\b[^>]*>/gi)];
  const image = attributes(images[0]?.[0] || "");
  required(images.length === 1 && image.alt === "", "Decorative hero artwork must have empty alternative text.");
  required(image.fetchpriority === "high" && image.loading !== "lazy", "Hero artwork must load at high priority without lazy loading.");
  required(image.decoding === "async", "Hero artwork must decode asynchronously.");
  required(/^\d+$/.test(image.width || "") && Number(image.width) > 0
    && /^\d+$/.test(image.height || "") && Number(image.height) > 0, "Hero image needs positive intrinsic width and height.");
  required(/\.png(?:[?#].*)?$/i.test(image.src || ""), "Hero picture needs a PNG image fallback.");
  const sources = [...picture.matchAll(/<source\b[^>]*>/gi)].map(([tag]) => tag);
  required(sources.length >= 2, "Hero needs width-responsive and default image sources.");
  required(sources.every((tag) => picture.indexOf(tag) < images[0].index), "Hero sources must precede the fallback image.");
  const sourceAttrs = sources.map(checkSource);
  required(sourceAttrs.some((attrs) => /\(\s*max-width\s*:\s*[\d.]+(?:px|em|rem)\s*\)/i.test(attrs.media || ""))
    && !sourceAttrs.at(-1).media && sourceAttrs.slice(0, -1).every((attrs) => attrs.media),
    "Hero responsive sources must precede the default source.");

  const rules = cssRules(css);
  const heroRules = rules.filter((rule) => targets(rule, "hero"));
  const backgroundRules = rules.filter((rule) => targets(rule, "hero-background"));
  const copyRules = rules.filter((rule) => targets(rule, "hero-copy"));
  const unconditional = (selected) => selected.filter((rule) => rule.media.length === 0);
  required(values(unconditional(heroRules), "position").length && values(unconditional(heroRules), "isolation").length
    && everyValue(heroRules, "position", (value) => ["relative", "absolute", "fixed", "sticky"].includes(value))
    && everyValue(heroRules, "isolation", (value) => value === "isolate"), "Hero must establish an isolated positioning context.");
  const decorationRules = rules.filter((rule) => classPattern("hero-background").test(rule.selector));
  required(values(unconditional(backgroundRules), "position").length && values(unconditional(backgroundRules), "pointer-events").length
    && everyValue(backgroundRules, "position", (value) => value === "absolute")
    && values(decorationRules, "pointer-events").every((value) => value === "none")
    && everyValue(backgroundRules, "pointer-events", (value) => value === "none"), "Hero background must stay positioned and inert.");
  required(values(unconditional(copyRules), "position").length
    && everyValue(copyRules, "position", (value) => ["relative", "absolute", "fixed", "sticky"].includes(value)),
    "Hero copy must participate in the positioned content layer.");
  const backdropLayers = values(backgroundRules, "z-index");
  const copyLayers = values(copyRules, "z-index").map((value) => value === "auto" ? "0" : value);
  if (!copyLayers.length) copyLayers.push("0");
  required(values(unconditional(backgroundRules), "z-index").length && [...backdropLayers, ...copyLayers].every((value) => /^-?\d+$/.test(value))
    && Math.max(...backdropLayers.map(Number)) < Math.min(...copyLayers.map(Number)), "Hero artwork must remain below the copy layer.");
  const contentRules = rules.filter((rule) => targets(rule, "hero") || targets(rule, "hero-copy") || targets(rule, "hero-line")
    || splitTopLevel(rule.selector, ",").some((selector) => classPattern("hero").test(selector) && terminal(selector) === "h1"));
  required(!values(contentRules, "display").includes("none") && !values(contentRules, "visibility").some((value) => ["hidden", "collapse"].includes(value))
    && !values(contentRules, "opacity").some((value) => Number(value) === 0), "Hero text must not be hidden by CSS.");
  const darkRules = rules.filter((rule) => containsMedia(rule, "(prefers-color-scheme:dark)"));
  const heroVisualRules = darkRules.filter((rule) => classPattern("hero").test(rule.selector) || classPattern("hero-background").test(rule.selector));
  const darkTextRules = darkRules.filter((rule) => /(?:^|[,\s])(?::root|html|body)(?:$|[,\s])/.test(rule.selector)
    || /\.hero(?:$|[\s.#:]|-(?:copy|line|intro|foot))/.test(rule.selector));
  required(heroVisualRules.some((rule) => rule.declarations.some(([name]) => ["background", "background-color", "filter", "opacity"].includes(name)))
    && darkTextRules.some((rule) => rule.declarations.some(([name]) => ["color", "--ink", "--muted"].includes(name))),
    "Hero needs dark-mode foreground and artwork treatments.");
  const reducedRules = rules.filter((rule) => containsMedia(rule, "(prefers-reduced-motion:reduce)"));
  const globalMotionRules = reducedRules.filter((rule) => splitTopLevel(rule.selector, ",").includes("*"));
  required(everyValue(globalMotionRules, "animation", (value) => value === "none")
    && everyValue(globalMotionRules, "transition", (value) => value === "none"), "Reduced motion must disable decorative animations and transitions.");
  const reducedHeroRules = reducedRules.filter((rule) => /\.hero(?:\b|-)/.test(rule.selector));
  required([...values(reducedHeroRules, "animation"), ...values(reducedHeroRules, "animation-name"), ...values(reducedHeroRules, "transition")]
    .every((value) => value === "none"), "Reduced-motion hero rules must not restart motion.");
  required(everyValue(reducedRules.filter((rule) => splitTopLevel(rule.selector, ",").includes("html")), "scroll-behavior", (value) => value === "auto"),
    "Reduced motion must disable smooth document scrolling.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  verifyHero(fs.readFileSync(path.join(root, "index.html"), "utf8"), fs.readFileSync(path.join(root, "company.css"), "utf8"));
  console.log("Homepage hero accessibility, responsive image and theme checks passed; visual contrast is reviewed in the browser.");
}
