import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";
import { PUBLIC_ROUTES } from "../site-seo.js";
import { SITE_LOCALES } from "../site-identity.js";
import { localeHtmlPath } from "./seo-html.mjs";
import { isPublicAsset } from "./website-versions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(root, "dist");
const maxWorkerAssetBytes = 25 * 1024 * 1024;

const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const walk = (directory, files = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
};

required(fs.existsSync(assetsRoot), "Asset directory is missing. Run node scripts/prepare-worker-assets.mjs first.");

for (const file of [
  "index.html",
  "styles.css",
  "main.js",
  "company.js",
  "company.css",
  "redesign-copy.js",
  "i18n.js",
  "share-meta.js",
  "site-seo.js",
  "geo-host.js",
  "wechat-share.js",
  "robots.txt",
  "sitemap.xml",
  "sitemap/index.html",
  "leadshunter/index.html",
  "leadshunter/leadshunter.css",
  "leadshunter/leadshunter.js",
  "internal-expense/index.html",
  "internal-expense/internal-expense.css",
  "internal-expense/internal-expense.js",
  "ai-course/index.html",
  "ai-course/ai-course.css",
  "ai-course/ai-course.js",
  "ai-course/ai-course-i18n.js",
  "ai-course/course-downloads.js",
  "ai-course/fde/index.html",
  "ai-course/fde/course-summary.js",
  "ai-course/mvp-3day/index.html",
  "contact/wecom/index.html",
  "contact/wecom/wecom-card.css",
  "contact/wecom/wecom-card.js",
]) {
  required(fs.existsSync(path.join(assetsRoot, file)), `Required production asset is missing: ${file}`);
}

for (const route of PUBLIC_ROUTES) {
  for (const locale of SITE_LOCALES) {
    const file = localeHtmlPath(route.html, locale);
    required(fs.existsSync(path.join(assetsRoot, file)), `Public production route missing from production assets: ${file}`);
  }
}

for (const versionRoot of [assetsRoot]) {
for (const forbidden of [".git", ".github", ".cursor", ".superpowers", ".venv", ".venv-share", ".wrangler", "node_modules", "docs", "mocks", "scripts", "workers", "ops", "legacy-site", "images", ".config-templates"]) {
  required(!fs.existsSync(path.join(versionRoot, forbidden)), `Local-only path leaked into production assets: ${forbidden}`);
}

for (const forbidden of [".gitignore", ".assetsignore", "wrangler.jsonc", "AGENTS.md", "README.md", "design-qa.md", "package.json", "package-lock.json"]) {
  required(!fs.existsSync(path.join(versionRoot, forbidden)), `Repository file leaked into production assets: ${forbidden}`);
}
}

const htmlSources = PUBLIC_ROUTES.filter((route) => route.inShareMeta)
  .flatMap((route) => SITE_LOCALES.map((locale) => localeHtmlPath(route.html, locale)));

let ossReferences = 0;
for (const source of htmlSources) {
  const content = fs.readFileSync(path.join(assetsRoot, source), "utf8");
  required(!/(?:(?:\.\.\/)+|\.\/)images\//.test(content), `${source} still uses relative local images/ paths; rewrite to OSS.`);
  const matches = content.match(new RegExp(`${OSS_IMAGES_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[A-Za-z0-9_./-]+\\.(?:png|webp|svg)`, "g")) ?? [];
  required(matches.length > 0, `${source} must reference OSS images under ${OSS_IMAGES_BASE}/`);
  ossReferences += new Set(matches).size;
}

const baiduVerify = fs.readdirSync(assetsRoot).filter((name) => /^baidu_verify_[A-Za-z0-9-]+\.html$/.test(name));
required(baiduVerify.length > 0, "Baidu site-verification HTML must be copied into dist/");

const files = walk(assetsRoot);
for (const file of files) {
  const relative = path.relative(assetsRoot, file).split(path.sep).join("/");
  required(isPublicAsset(relative), `Non-public file leaked into production assets: ${relative}`);
  required(!fs.lstatSync(file).isSymbolicLink(), `Symlink leaked into production assets: ${relative}`);
}
const oversized = files.filter((file) => fs.statSync(file).size > maxWorkerAssetBytes);
required(oversized.length === 0, `Production static assets exceed 25 MiB: ${oversized.map((file) => path.relative(assetsRoot, file)).join(", ")}`);

console.log(`Production asset verification passed: ${files.length} files, ${ossReferences} OSS image references.`);
