import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const excludedDirectories = new Set([
  ".git",
  ".github",
  ".venv",
  ".wrangler",
  "dist",
  "docs",
  "mocks",
  "node_modules",
  "scripts",
]);

const excludedRelativeDirectories = new Set([
  "images/prompts",
  "images/prototypes",
]);

const excludedRootFiles = new Set([
  ".assetsignore",
  ".gitignore",
  "AGENTS.md",
  "README.md",
  "design-qa.md",
  "wrangler.jsonc",
]);

const shouldSkipFile = (relativePath) => {
  const name = path.basename(relativePath);
  if (excludedRootFiles.has(relativePath)) return true;
  if (name === ".DS_Store" || name.endsWith(".log") || name.endsWith(".code-workspace")) return true;
  if (name === ".env" || name.startsWith(".env.") || name.startsWith(".dev.vars")) return true;
  return name.endsWith(".md");
};

const shouldSkipDirectory = (relativePath, name) => excludedDirectories.has(name) || excludedRelativeDirectories.has(relativePath);

const copyDirectory = async (source, destination, relativePath = "") => {
  await fs.mkdir(destination, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    const relative = relativePath ? path.posix.join(relativePath, entry.name) : entry.name;
    const nextSource = path.join(source, entry.name);
    const nextDestination = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(relative, entry.name)) await copyDirectory(nextSource, nextDestination, relative);
      continue;
    }

    if (entry.isFile() && !shouldSkipFile(relative)) await fs.copyFile(nextSource, nextDestination);
  }
};

export const prepareWorkerAssets = async ({ root = projectRoot, output = path.join(root, "dist") } = {}) => {
  await fs.rm(output, { recursive: true, force: true });
  await copyDirectory(root, output);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareWorkerAssets();
  console.log("Worker static asset directory prepared: dist/");
}
