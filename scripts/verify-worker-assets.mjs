import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

required(fs.existsSync(assetsRoot), "Worker asset directory is missing. Run node scripts/prepare-worker-assets.mjs first.");

for (const file of ["index.html", "styles.css", "main.js", "i18n.js", "leadshunter/index.html", "leadshunter/leadshunter.css", "leadshunter/leadshunter.js"]) {
  required(fs.existsSync(path.join(assetsRoot, file)), `Required production asset is missing: ${file}`);
}

for (const forbidden of [".git", ".github", ".venv", ".wrangler", "node_modules", "docs", "mocks", "scripts", "images/prompts", "images/prototypes"]) {
  required(!fs.existsSync(path.join(assetsRoot, forbidden)), `Local-only path leaked into Worker assets: ${forbidden}`);
}

for (const forbidden of [".gitignore", ".assetsignore", "wrangler.jsonc", "AGENTS.md", "README.md", "design-qa.md"]) {
  required(!fs.existsSync(path.join(assetsRoot, forbidden)), `Repository file leaked into Worker assets: ${forbidden}`);
}

const references = [];
for (const source of ["index.html", "leadshunter/index.html"]) {
  const directory = path.dirname(path.join(assetsRoot, source));
  const content = fs.readFileSync(path.join(assetsRoot, source), "utf8");
  const matches = content.match(/(?:\.\.\/|\.\/)?images\/generated\/[A-Za-z0-9_./-]+\.(?:png|webp)(?:\?[^\s\"'<,)]+)?/g) ?? [];
  for (const reference of new Set(matches)) {
    const file = reference.split("?")[0];
    references.push({ source, reference, path: path.resolve(directory, file) });
  }
}

for (const reference of references) {
  required(fs.existsSync(reference.path), `Referenced Worker asset is missing: ${reference.source} → ${reference.reference}`);
}

const files = walk(assetsRoot);
const oversized = files.filter((file) => fs.statSync(file).size > maxWorkerAssetBytes);
required(oversized.length === 0, `Worker static assets exceed 25 MiB: ${oversized.map((file) => path.relative(assetsRoot, file)).join(", ")}`);

console.log(`Worker static asset verification passed: ${files.length} files, ${references.length} generated-image references.`);
