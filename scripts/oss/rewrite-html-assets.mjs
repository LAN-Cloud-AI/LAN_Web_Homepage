#!/usr/bin/env node
/**
 * Rewrite local images/* paths in HTML/CSS/JS to OSS public URLs.
 * Usage:
 *   node scripts/oss/rewrite-html-assets.mjs                 # rewrite project pages
 *   node scripts/oss/rewrite-html-assets.mjs --dir dist
 *   node scripts/oss/rewrite-html-assets.mjs --dry-run
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOssEnv, webpagePrefix } from "./env.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "mocks",
  "scripts",
  "docs",
  "images",
]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dirIdx = args.indexOf("--dir");
  return {
    dir: dirIdx >= 0 ? path.resolve(args[dirIdx + 1]) : projectRoot,
    dryRun: args.includes("--dry-run"),
  };
};

const walk = async (dir) => {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(html|css|js)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const rewriteContent = (content, publicImagesBase) => {
  let next = content;
  // Production absolute URLs on the same domain
  next = next.replace(/https:\/\/(?:www\.)?lancloudtech\.com\/images\//g, `${publicImagesBase}/`);
  // Nested relative: ../../images/ or ../images/
  next = next.replace(/(?:\.\.\/)+images\//g, `${publicImagesBase}/`);
  // Same-dir relative: ./images/
  next = next.replace(/\.\/images\//g, `${publicImagesBase}/`);
  // Bare images/ (attribute values etc.)
  next = next.replace(/(["'(=]\s*)images\//g, `$1${publicImagesBase}/`);
  return next;
};

const { dir, dryRun } = parseArgs();
const env = getOssEnv({ requireKeys: false });
const publicImagesBase = `${env.publicBaseUrl}/${webpagePrefix(env)}/images`;

let changed = 0;
for (const file of await walk(dir)) {
  const original = await fs.readFile(file, "utf8");
  const next = rewriteContent(original, publicImagesBase);
  if (next === original) continue;
  changed += 1;
  if (!dryRun) await fs.writeFile(file, next);
  console.log(dryRun ? "would rewrite" : "rewrote", path.relative(projectRoot, file));
}

console.log(JSON.stringify({ changed, publicImagesBase, dryRun }, null, 2));
