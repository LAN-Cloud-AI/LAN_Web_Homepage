import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyHero } from "./verify-homepage-hero.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "lancloud-hero-verifier-"));

const legacyContractsPass = (page, css) => [
  page.includes('<div class="hero-background" aria-hidden="true">'),
  page.includes('alt=""'),
  page.includes('brand-hero-precision-atelier-mobile-768.webp'),
  !page.includes('class="hero-visual'),
  css.includes('.hero-background {'),
  css.includes('.hero::before {'),
  css.includes('pointer-events: none'),
  css.includes('@media (prefers-color-scheme: dark)'),
  css.includes('.hero-background img { object-position: 50% 64%; }'),
].every(Boolean);

const currentPage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const currentCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
assert.throws(
  () => verifyHero(currentPage, `${currentCss}\n.hero-background { pointer-events: auto; }\n`),
  /Hero background needs its own inert CSS layer\./,
  "A later CSS-layer pointer-events override must be rejected.",
);

try {
  fs.mkdirSync(path.join(fixture, "scripts"));
  fs.copyFileSync(path.join(root, "scripts", "verify-homepage-hero.mjs"), path.join(fixture, "scripts", "verify-homepage-hero.mjs"));
  const page = `
    <img alt="" />
    <span>brand-hero-precision-atelier-mobile-768.webp</span>
    <section class="hero">
      <div class="hero-background" aria-hidden="true"><picture><img alt="meaningful but wrong" /></picture></div>
      <div class="hero-copy">Copy</div>
    </section>
  `;
  const css = `
    .hero-background { color: red; }
    .hero-background img { object-position: 50% 64%; }
    .hero::before { color: red; }
    .utility { pointer-events: none; }
    @media (prefers-color-scheme: dark) { .utility { color: white; } }
    @media (max-width: 640px) { .utility { object-position: 50% 64%; } }
  `;
  assert.ok(legacyContractsPass(page, css), "The legacy substring-only verifier fixture must reproduce its false positive.");
  fs.writeFileSync(path.join(fixture, "index.html"), page);
  fs.writeFileSync(path.join(fixture, "styles.css"), css);
  const result = spawnSync(process.execPath, ["scripts/verify-homepage-hero.mjs"], {
    cwd: fixture,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0, `Malformed hero fixture passed unexpectedly:\n${result.stdout}${result.stderr}`);
  console.log("Homepage hero verifier rejects decoy contracts.");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
