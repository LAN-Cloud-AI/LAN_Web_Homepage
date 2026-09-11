/**
 * Publish the ZIP-only robots.txt to files.lancloudtech.com (R2)
 * and img.lancloudtech.com (OSS CDN).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeZipOnlyRobots } from "./ai-crawler-policy.mjs";
import { createOssClient } from "./oss/client.mjs";
import { putR2Object, purgeR2PublicUrls } from "./r2/put-object.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "ops/files/robots.txt");
const body = writeZipOnlyRobots();
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, body, "utf8");

const tmp = path.join(os.tmpdir(), `lan-files-robots-${Date.now()}.txt`);
fs.writeFileSync(tmp, body, "utf8");

const oss = createOssClient();
await oss.put("robots.txt", tmp, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=300, must-revalidate",
    "x-oss-object-acl": "public-read",
  },
});

const r2 = await putR2Object({
  key: "robots.txt",
  file: tmp,
  contentType: "text/plain; charset=utf-8",
  cacheControl: "public, max-age=300, must-revalidate",
});

try {
  await purgeR2PublicUrls(["https://files.lancloudtech.com/robots.txt"]);
} catch (error) {
  console.warn("files robots cache purge skipped:", error.message);
}

fs.rmSync(tmp, { force: true });
console.log(
  JSON.stringify(
    {
      wrote: "ops/files/robots.txt",
      oss: "https://img.lancloudtech.com/robots.txt",
      r2: r2.url,
    },
    null,
    2,
  ),
);
