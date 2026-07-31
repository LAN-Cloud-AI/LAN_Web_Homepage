import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";

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
  "i18n.js",
  "leadshunter/index.html",
  "leadshunter/leadshunter.css",
  "leadshunter/leadshunter.js",
  "internal-expense/index.html",
  "internal-expense/internal-expense.css",
  "internal-expense/internal-expense.js",
  "contact/wecom/index.html",
  "contact/wecom/wecom-card.css",
  "contact/wecom/wecom-card.js",
]) {
  required(fs.existsSync(path.join(assetsRoot, file)), `Required production asset is missing: ${file}`);
}

for (const forbidden of [".git", ".github", ".venv", ".wrangler", "node_modules", "docs", "mocks", "scripts", "images/prompts", "images/prototypes", "images/generated", "images/logo", "images/contact"]) {
  required(!fs.existsSync(path.join(assetsRoot, forbidden)), `Local-only path leaked into production assets: ${forbidden}`);
}

for (const forbidden of [".gitignore", ".assetsignore", "wrangler.jsonc", "AGENTS.md", "README.md", "design-qa.md"]) {
  required(!fs.existsSync(path.join(assetsRoot, forbidden)), `Repository file leaked into production assets: ${forbidden}`);
}

const htmlSources = ["index.html", "leadshunter/index.html", "internal-expense/index.html", "contact/wecom/index.html"];
let ossReferences = 0;
for (const source of htmlSources) {
  const content = fs.readFileSync(path.join(assetsRoot, source), "utf8");
  required(!/(?:(?:\.\.\/)+|\.\/)images\//.test(content), `${source} still uses relative local images/ paths; rewrite to OSS.`);
  const matches = content.match(new RegExp(`${OSS_IMAGES_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[A-Za-z0-9_./-]+\\.(?:png|webp|svg)`, "g")) ?? [];
  required(matches.length > 0, `${source} must reference OSS images under ${OSS_IMAGES_BASE}/`);
  ossReferences += new Set(matches).size;
}

const files = walk(assetsRoot);
const oversized = files.filter((file) => fs.statSync(file).size > maxWorkerAssetBytes);
required(oversized.length === 0, `Production static assets exceed 25 MiB: ${oversized.map((file) => path.relative(assetsRoot, file)).join(", ")}`);

console.log(`Production asset verification passed: ${files.length} files, ${ossReferences} OSS image references.`);
