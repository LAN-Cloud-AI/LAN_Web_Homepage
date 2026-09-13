import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyHero } from "./verify-homepage-hero.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "company.css"), "utf8");
verifyHero(page, css);

function reject(name, nextPage, nextCss, message) {
  assert.ok(nextPage !== page || nextCss !== css, `${name}: regression mutation did not apply`);
  assert.throws(() => verifyHero(nextPage, nextCss), message, name);
}

// Target the high-priority image by semantic attributes, without asset names or formatting.
const mutateHeroImage = (change) => page.replace(/<img\b[^>]*\bfetchpriority=["']high["'][^>]*>/i, change);
reject("missing hero alt", mutateHeroImage((tag) => tag.replace(/\s+alt=["'][^"']*["']/, "")), css, /empty alternative text/);
reject("missing intrinsic width", mutateHeroImage((tag) => tag.replace(/\s+width=["'][^"']*["']/, "")), css, /intrinsic width and height/);
reject("lazy high-priority image", mutateHeroImage((tag) => tag.replace(/\s+loading=["'][^"']*["']/, "").replace(/\s*\/?\s*>$/, ' loading="lazy">')), css, /without lazy loading/);

for (const selector of [".hero-background", "section.hero .hero-background", ".hero-background:hover", "main>.hero-background, .unrelated"]) {
  reject(`interactive decoration: ${selector}`, page, `${css}\n${selector} { pointer-events: auto; }`, /positioned and inert/);
}
reject("media override loses isolation", page, `${css}\n@media (max-width: 44rem) { .hero { isolation: auto; } }`, /isolated positioning context/);
reject("background covers content", page, `${css}\n.hero-background { z-index: 999; }`, /below the copy layer/);
reject("hidden mobile heading", page, `${css}\n@media (max-width: 40rem) { .hero h1 { display: none; } }`, /text must not be hidden/);
reject("nested dark-mode pointer override", page, `${css}\n@media (prefers-color-scheme: dark) { @media (max-width: 40rem) { .hero-background { pointer-events: auto; } } }`, /positioned and inert/);
reject("motion restarted for reduced-motion users", page, `${css}\n@media (prefers-reduced-motion: reduce) { .hero-background { animation: drift 5s infinite !important; } }`, /must not restart motion/);

// Unrelated visual choices are intentionally outside this static contract.
assert.doesNotThrow(() => verifyHero(page, `${css}\n.hero { border-radius: 0; min-height: 42rem; } .hero-background img { object-position: 30% 40%; } .hero-visual { display: block; }`));
console.log("Homepage hero regression checks passed against company.css without binding visual design values.");
