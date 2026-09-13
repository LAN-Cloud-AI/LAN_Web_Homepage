import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareWorkerAssets } from "./prepare-worker-assets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Preview-only headers must never suppress the additional host-wide Pages noindex. */
export const withGlobalNoindex = (raw) => {
  const lines = raw.split("\n");
  const globalRule = lines.findIndex((line) => line.trim() === "/*");
  if (globalRule < 0) return `${raw.trimEnd()}\n\n/*\n  X-Robots-Tag: noindex, follow\n`;
  let end = globalRule + 1;
  while (end < lines.length && (!lines[end].trim() || /^\s/.test(lines[end]))) end += 1;
  const existing = lines.slice(globalRule + 1, end).findIndex((line) => /^\s+X-Robots-Tag:/i.test(line));
  if (existing >= 0) lines[globalRule + 1 + existing] = "  X-Robots-Tag: noindex, follow";
  else lines.splice(globalRule + 1, 0, "  X-Robots-Tag: noindex, follow");
  return lines.join("\n");
};

export const preparePagesAssets = async () => {
  const dist = await prepareWorkerAssets({ root });
  const headers = await fs.readFile(path.join(dist, "_headers"), "utf8");
  await fs.writeFile(path.join(dist, "_headers"), withGlobalNoindex(headers));
  return dist;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await preparePagesAssets();
  console.log("Prelaunch Pages assets prepared: both versions use host-wide noindex, follow.");
}
