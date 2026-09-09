/**
 * Pull WorkBuddy classroom packs from the private course repo and publish to:
 * - Aliyun OSS (domestic: img.lancloudtech.com, grey-cloud DNS only)
 * - Cloudflare R2 (overseas: files.lancloudtech.com, orange-cloud)
 */
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { COURSE_DOWNLOADS, COURSE_DOWNLOAD_GITHUB_REF, COURSE_DOWNLOAD_GITHUB_REPO } from "../../ai-course/course-downloads.js";
import { createOssClient } from "./client.mjs";
import { purgeR2PublicUrls, putR2Object } from "../r2/put-object.mjs";

const rfc5987Filename = (filename) =>
  `UTF-8''${encodeURIComponent(filename).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`;

const contentDisposition = (item) => {
  const asciiFallback = item.id === "textbook" ? "Workbuddy-complete-intro.html" : "lesson-1-practice.zip";
  return `${item.disposition}; filename="${asciiFallback}"; filename*=${rfc5987Filename(item.filename)}`;
};

const downloadGhRaw = (apiPath, dest) =>
  new Promise((resolve, reject) => {
    const stream = createWriteStream(dest);
    const child = spawn("gh", ["api", "-H", "Accept: application/vnd.github.raw", apiPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const errors = [];
    child.stdout.pipe(stream);
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    stream.on("error", reject);
    child.on("close", (code) => {
      stream.end(async () => {
        const stderr = Buffer.concat(errors).toString("utf8").trim();
        if (code !== 0) {
          reject(new Error(stderr || `gh api exited ${code}`));
          return;
        }
        const stat = await fs.stat(dest);
        resolve(stat.size);
      });
    });
  });

export const syncAiCourseDownloads = async () => {
  const client = createOssClient();
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "lan-ai-course-"));
  const uploaded = [];

  for (const item of Object.values(COURSE_DOWNLOADS)) {
    const apiPath = `repos/${COURSE_DOWNLOAD_GITHUB_REPO}/contents/${encodeURI(item.githubPath)}?ref=${encodeURIComponent(COURSE_DOWNLOAD_GITHUB_REF)}`;
    const dest = path.join(tmp, item.filename);
    const bytes = await downloadGhRaw(apiPath, dest);
    const result = await client.put(item.ossKey, dest, {
      headers: {
        "Content-Type": item.contentType,
        "Content-Disposition": contentDisposition(item),
        "Cache-Control": item.id === "textbook" ? "public, max-age=300, must-revalidate" : "public, max-age=3600",
        "x-oss-object-acl": "public-read",
      },
    });
    const r2 = await putR2Object({
      key: item.r2Key,
      file: dest,
      contentType: item.contentType,
      contentDisposition: contentDisposition(item),
      cacheControl: item.id === "textbook" ? "public, max-age=300, must-revalidate" : "public, max-age=3600",
    });
    uploaded.push({
      id: item.id,
      key: item.ossKey,
      r2Key: item.r2Key,
      bytes,
      url: item.cn,
      globalUrl: item.global,
      etag: result.res?.headers?.etag,
      r2Url: r2.url,
    });
    console.log(`uploaded OSS ${item.ossKey} and R2 ${item.r2Key} (${bytes} bytes)`);
  }

  try {
    await purgeR2PublicUrls(uploaded.map((item) => item.globalUrl));
    console.log("purged Cloudflare cache for files.lancloudtech.com objects");
  } catch (error) {
    console.warn("R2 cache purge skipped:", error.message);
  }

  await fs.rm(tmp, { recursive: true, force: true });
  return uploaded;
};
