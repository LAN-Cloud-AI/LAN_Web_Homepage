import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const balancedBlock = (source, openingBrace) => {
  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }
  return "";
};

const elementBlock = (source, tag, openingTag) => {
  const start = source.indexOf(openingTag);
  if (start < 0) return "";
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, "g");
  tags.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tags.exec(source))) {
    if (match[0].startsWith(`</${tag}`)) depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(start, tags.lastIndex);
  }
  return "";
};

const rootBlocks = (source) => {
  const blocks = [];
  let cursor = 0;
  while (cursor < source.length) {
    const openingBrace = source.indexOf("{", cursor);
    if (openingBrace < 0) break;
    const body = balancedBlock(source, openingBrace);
    const closingBrace = openingBrace + body.length + 1;
    const prelude = source.slice(cursor, openingBrace).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (prelude) blocks.push({ start: cursor, prelude, body });
    cursor = closingBrace + 1;
  }
  return blocks;
};

const selectorCompounds = (member) => member.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
const hasClassToken = (compound, className) => new RegExp(`\\.${className}(?![\\w-])`, "i").test(compound);
const isTerminalClass = (compound, className) => hasClassToken(compound, className) && !compound.includes("::");
const normalizedMedia = (value) => value
  .replace(/\s*([():])\s*/g, "$1")
  .replace(/\s+/g, " ")
  .trim();

const selectorMemberTargets = (member, target) => {
  const compounds = selectorCompounds(member);
  const terminal = compounds.at(-1) || "";
  if (target === "hero") return isTerminalClass(terminal, "hero");
  if (target === "hero-background") {
    return isTerminalClass(terminal, "hero-background");
  }
  if (target === "hero-copy") return isTerminalClass(terminal, "hero-copy");
  if (target === "hero-scrim") return hasClassToken(terminal, "hero") && /::before$/i.test(terminal);
  const hasBackgroundAncestor = compounds.slice(0, -1).some((part) => hasClassToken(part, "hero-background"));
  if (target === "background-media") return hasBackgroundAncestor && /^(?:picture|img)$/i.test(terminal);
  if (target === "background-image") return hasBackgroundAncestor && /^img$/i.test(terminal);
  return false;
};

const ruleTargets = (rule, target) => rule.prelude.split(",").some((member) => selectorMemberTargets(member, target));

const rulesForSelector = (source, target) => rootBlocks(source)
  .filter((block) => ruleTargets(block, target))
  .map((block) => block.body);

const rulesForMedia = (source, query) => rootBlocks(source)
  .filter((block) => normalizedMedia(block.prelude).startsWith("@media") && normalizedMedia(block.prelude).includes(normalizedMedia(query)))
  .flatMap((block) => rootBlocks(block.body).map((rule) => ({ ...rule, start: block.start })));

const rulesForAnyMedia = (source, queries) => rootBlocks(source)
  .filter((block) => normalizedMedia(block.prelude).startsWith("@media") && queries.some((query) => normalizedMedia(block.prelude).includes(normalizedMedia(query))))
  .flatMap((block) => rootBlocks(block.body).map((rule) => ({ ...rule, start: block.start })));

const declarationsForProperty = (rules, property) => {
  const matcher = new RegExp(`(?:^|;)\\s*${escapeRegExp(property)}\\s*:\\s*([^;{}]+?)(?:;|$)`, "g");
  const values = [];
  for (const rule of rules) {
    for (const match of rule.matchAll(matcher)) values.push(match[1].trim().replace(/\s+/g, " "));
  }
  return values;
};

const hasFinalDeclarations = (rules, declarations) => Object.entries(declarations)
  .every(([property, value]) => {
    const values = declarationsForProperty(rules, property);
    return values.length > 0 && values.every((candidate) => candidate === value);
  });
const sourceTags = (picture) => [...picture.matchAll(/<source\b[^>]*>/g)].map(([tag]) => tag);
const hasAll = (source, values) => values.every((value) => source.includes(value));

export const verifyHero = (page, css) => {
  const hero = elementBlock(page, "section", '<section class="hero">');
  required(hero, "Hero section is required.");

  const heroBackground = elementBlock(hero, "div", '<div class="hero-background" aria-hidden="true">');
  required(heroBackground, "Hero artwork must be a decorative background layer.");
  const heroCopyAt = hero.indexOf('<div class="hero-copy"');
  required(heroCopyAt >= 0 && hero.indexOf(heroBackground) < heroCopyAt, "Hero background must precede hero copy.");
  required(!heroBackground.includes("data-i18n-alt"), "Decorative hero artwork must not be localized as content.");

  const picture = elementBlock(heroBackground, "picture", "<picture>");
  required(picture, "Hero background must use a picture element.");
  const images = [...picture.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
  const image = images.at(-1) || "";
  required(images.length === 1 && /\balt=""/.test(image), "Decorative hero artwork must have empty alternative text.");
  required(/\bfetchpriority="high"/.test(image), "Hero artwork must load at high priority.");
  required(/\bdecoding="async"/.test(image), "Hero artwork must decode asynchronously.");

  const [mobileWebp, mobilePng, desktopWebp] = sourceTags(picture);
  required(sourceTags(picture).length === 3, "Hero picture must retain its complete responsive source chain.");
  required(
    !picture.includes("horizontal-viewport-segments") && !picture.includes("spanning: single-fold"),
    "Hero picture must not use fold dual-pane source switching; width-based responsive only.",
  );
  required(
    hasAll(mobileWebp, [
      'media="(max-width: 640px)"', 'type="image/webp"', 'sizes="100vw"',
      "brand-hero-precision-atelier-mobile-768.webp",
      "brand-hero-precision-atelier-mobile-1280.webp",
      "brand-hero-precision-atelier-mobile.webp",
    ]),
    "Hero picture must include the mobile WebP source.",
  );
  required(
    hasAll(mobilePng, ['media="(max-width: 640px)"', "brand-hero-precision-atelier-mobile.png"]),
    "Hero picture must include the mobile PNG fallback.",
  );
  required(
    hasAll(desktopWebp, [
      'type="image/webp"',
      "brand-hero-precision-atelier-768.webp",
      "brand-hero-precision-atelier-1280.webp",
      "brand-hero-precision-atelier.webp",
      'sizes="(max-width: 1024px) 100vw, min(100vw, 1120px)"',
    ]),
    "Hero picture must finish with the desktop WebP source.",
  );

  required(!hero.includes("hero-visual") && !css.includes(".hero-visual"), "Standalone hero image selectors must be removed.");
  required(hasFinalDeclarations(rulesForSelector(css, "hero"), {
    position: "relative", isolation: "isolate", "min-height": "min(50rem, calc(100svh - 3.25rem))", overflow: "hidden", background: "var(--bg-deep)",
  }), "Hero must establish its clipped stacking context.");
  required(hasFinalDeclarations(rulesForSelector(css, "hero-background"), {
    position: "absolute", inset: "0", "z-index": "0", "pointer-events": "none",
  }), "Hero background needs its own inert CSS layer.");
  required(hasFinalDeclarations(rulesForSelector(css, "background-media"), {
    display: "block", width: "100%", height: "100%",
  }), "Hero picture must fill the background layer.");
  required(hasFinalDeclarations(rulesForSelector(css, "background-image"), {
    "object-fit": "cover", "object-position": "center 57%",
  }), "Hero image must cover with the desktop focal point.");
  required(hasFinalDeclarations(rulesForSelector(css, "hero-scrim"), {
    content: '""', position: "absolute", inset: "0", "z-index": "1", "pointer-events": "none", background: "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.84) 41%, rgba(250, 252, 253, 0.22) 70%, rgba(248, 251, 252, 0.48) 100%)",
  }), "Hero needs a readable image scrim.");
  required(hasFinalDeclarations(rulesForSelector(css, "hero-copy"), {
    position: "relative", "z-index": "2", "max-width": "740px", margin: "0 auto 2.15rem",
  }), "Hero copy must remain above the artwork.");

  const darkRules = rulesForMedia(css, "(prefers-color-scheme: dark)")
    .filter((rule) => rule.start > css.indexOf(".hero::before {") && ruleTargets(rule, "hero-scrim"))
    .map((rule) => rule.body);
  required(hasFinalDeclarations(darkRules, {
    background: "linear-gradient(180deg, rgba(8, 12, 18, 0.90) 0%, rgba(8, 12, 18, 0.76) 46%, rgba(8, 12, 18, 0.36) 72%, rgba(8, 12, 18, 0.58) 100%)",
  }), "Hero needs the specified dark-mode scrim.");
  const mobileRules = rulesForMedia(css, "(max-width: 640px)");
  required(hasFinalDeclarations(mobileRules.filter((rule) => ruleTargets(rule, "background-image")).map((rule) => rule.body), {
    "object-position": "50% 64%",
  }), "Mobile hero needs the lower image focal point.");
  required(hasFinalDeclarations(mobileRules.filter((rule) => ruleTargets(rule, "hero")).map((rule) => rule.body), {
    "min-height": "calc(100svh - 3.25rem)",
  }), "Mobile hero needs its responsive minimum height.");
  required(
    !css.includes("horizontal-viewport-segments") && !css.includes("spanning: single-fold"),
    "Homepage CSS must not use fold dual-pane layout; rely on width breakpoints.",
  );
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
  verifyHero(read("index.html"), read("styles.css"));
  console.log("Homepage hero background verification passed.");
}
