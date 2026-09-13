import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readLegacySnapshot, publicAssetFiles, versionedHtml, rebaseApexUrls,
  previewRedirects, VERSION_SWITCH_CSS,
} from "./website-versions.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function copyVersion({ source, output, files, version, legacyPaths }) {
  for (const relative of files) {
    // Host-level controls are composed at the package root, never served as nested artifacts.
    if (version === "preview" && ["_headers", "_redirects", "site-events.js"].includes(relative)) continue;
    const destination = path.join(output, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    let data = await fs.readFile(path.join(source, relative));
    if (relative.endsWith(".html")) data = versionedHtml(data.toString("utf8"), { relative, version, legacyPaths });
    else if (version === "preview" && /(?:\.xml|\.txt)$/.test(relative)) data = rebaseApexUrls(data.toString("utf8"));
    await fs.writeFile(destination, data);
  }
}

export const prepareWorkerAssets = async ({ root = projectRoot, output = path.join(root, "dist") } = {}) => {
  const resolvedRoot = await fs.realpath(root);
  const resolvedOutput = path.resolve(output);
  if (resolvedOutput !== path.join(resolvedRoot, "dist")) throw new Error("The prelaunch output must be the repository dist/ directory.");
  const snapshot = await readLegacySnapshot(resolvedRoot);
  const currentFiles = await publicAssetFiles(resolvedRoot);
  if (!currentFiles.includes("site-events.js")) throw new Error("Shared site-events.js is required before packaging.");
  await fs.rm(resolvedOutput, { recursive: true, force: true });
  await fs.mkdir(resolvedOutput, { recursive: true });
  await copyVersion({ source: snapshot.directory, output: resolvedOutput, files: [...snapshot.paths], version: "legacy", legacyPaths: snapshot.paths });
  await copyVersion({ source: resolvedRoot, output: path.join(resolvedOutput, "preview"), files: currentFiles, version: "preview", legacyPaths: snapshot.paths });
  await fs.copyFile(path.join(resolvedRoot, "site-events.js"), path.join(resolvedOutput, "site-events.js"));
  await fs.writeFile(path.join(resolvedOutput, "website-versions.css"), VERSION_SWITCH_CSS);
  const oldHeaders = await fs.readFile(path.join(snapshot.directory, "_headers"), "utf8");
  await fs.writeFile(path.join(resolvedOutput, "_headers"), `${oldHeaders.trimEnd()}\n\n/preview\n  X-Robots-Tag: noindex, follow\n\n/preview/*\n  X-Robots-Tag: noindex, follow\n`);
  const oldRedirects = await fs.readFile(path.join(snapshot.directory, "_redirects"), "utf8");
  const currentRedirects = await fs.readFile(path.join(resolvedRoot, "_redirects"), "utf8");
  await fs.writeFile(path.join(resolvedOutput, "_redirects"), `${oldRedirects.trimEnd()}\n\n# New website preview\n${previewRedirects(currentRedirects).trim()}\n`);
  return resolvedOutput;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareWorkerAssets();
  console.log("Prelaunch assets prepared: frozen legacy at dist/; new website at dist/preview/.");
}
