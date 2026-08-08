import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyHero } from "./verify-homepage-hero.mjs";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const page = read("index.html");
const css = read("styles.css");

const expectedFailure = (name, nextPage, nextCss, message) => {
  try {
    verifyHero(nextPage, nextCss);
  } catch (error) {
    if (String(error.message).includes(message)) return;
    throw new Error(`${name} failed for the wrong reason: ${error.message}`);
  }
  throw new Error(`${name} did not fail.`);
};

verifyHero(page, css);

expectedFailure(
  "hero image alternative text",
  page.replace(`src="${OSS_IMAGES_BASE}/generated/brand/brand-hero-precision-atelier.png"\n            alt=""`, `src="${OSS_IMAGES_BASE}/generated/brand/brand-hero-precision-atelier.png"\n            alt="兰芯云朵"`),
  css,
  "Decorative hero artwork must have empty alternative text."
);

expectedFailure(
  "hero background pointer events",
  page,
  css.replace("  pointer-events: none;\n}\n.hero-background picture,", "}\n.hero-background picture,"),
  "Hero background needs its own inert CSS layer."
);

expectedFailure(
  "dark hero scrim",
  page,
  css.replace("  .hero::before {\n    background: linear-gradient(180deg, rgba(8, 12, 18, 0.90)", "  .not-hero::before {\n    background: linear-gradient(180deg, rgba(8, 12, 18, 0.90)"),
  "Hero needs the specified dark-mode scrim."
);

expectedFailure(
  "stale standalone hero selector",
  page,
  `${css}\n.hero-visual { display: block; }\n`,
  "Standalone hero image selectors must be removed."
);

expectedFailure(
  "later hero position override",
  page,
  `${css}\n.hero { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "later hero background pointer-events override",
  page,
  `${css}\n.hero-background { pointer-events: auto; }\n`,
  "Hero background needs its own inert CSS layer.",
);

expectedFailure(
  "later hero copy z-index override",
  page,
  `${css}\n.hero-copy { z-index: 0; }\n`,
  "Hero copy must remain above the artwork.",
);

expectedFailure(
  "later mobile focal-point override",
  page,
  `${css}\n@media (max-width: 640px) { .hero-background img { object-position: center 10%; } }\n`,
  "Mobile hero needs the lower image focal point.",
);

expectedFailure(
  "semicolonless hero position override",
  page,
  `${css}\n.hero { position: static }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "compound hero selector override",
  page,
  `${css}\nsection.hero { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "descendant hero background override",
  page,
  `${css}\n.hero .hero-background { pointer-events: auto; }\n`,
  "Hero background needs its own inert CSS layer.",
);

expectedFailure(
  "hero comma-list override",
  page,
  `${css}\n.hero, .utility { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "screen mobile focal-point override",
  page,
  `${css}\n@media screen and (max-width: 640px) { .hero-background img { object-position: center 10%; } }\n`,
  "Mobile hero needs the lower image focal point.",
);

expectedFailure(
  "qualified dark scrim override",
  page,
  `${css}\n@media (prefers-color-scheme: dark) and (min-width: 0px) { .hero::before { background: red; } }\n`,
  "Hero needs the specified dark-mode scrim.",
);

expectedFailure(
  "terminal hero selector override",
  page,
  `${css}\nmain .hero { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "dark comma-list scrim override",
  page,
  `${css}\n@media (prefers-color-scheme: dark) { .hero::before, .utility { background: red; } }\n`,
  "Hero needs the specified dark-mode scrim.",
);

expectedFailure(
  "fold dual-pane layout regresses in",
  page,
  `${css}\n@media (horizontal-viewport-segments: 2) { .hero { grid-template-columns: 1fr 1fr; } }\n`,
  "Homepage CSS must not use fold dual-pane layout; rely on width breakpoints.",
);

expectedFailure(
  "no-space combinator hero override",
  page,
  `${css}\nmain>.hero { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "hero class-compound override",
  page,
  `${css}\n.hero.is-condensed { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "hero pseudo-class override",
  page,
  `${css}\n.hero:hover { position: static; }\n`,
  "Hero must establish its clipped stacking context.",
);

expectedFailure(
  "compact mobile media override",
  page,
  `${css}\n@media screen and (max-width:640px) { .hero-background img { object-position: center 10%; } }\n`,
  "Mobile hero needs the lower image focal point.",
);

console.log("Homepage hero verifier regression checks passed.");
