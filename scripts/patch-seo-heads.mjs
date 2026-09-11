/**
 * One-shot / idempotent SEO head sync for public HTML routes (zh-Hans sources).
 * Run: node scripts/patch-seo-heads.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LOCALE } from "../site-identity.js";
import { PUBLIC_ROUTES } from "../site-seo.js";
import { applySeoHead } from "./seo-html.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const route of PUBLIC_ROUTES) {
  const file = path.join(root, route.html);
  const html = applySeoHead(fs.readFileSync(file, "utf8"), route, DEFAULT_LOCALE);
  fs.writeFileSync(file, html, "utf8");
  console.log(`SEO head synced: ${route.html}`);
}
