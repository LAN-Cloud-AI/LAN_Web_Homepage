/**
 * Pull WorkBuddy classroom packs from the private course repo and publish to OSS.
 * Domestic pages then download via img.lancloudtech.com (Aliyun CDN, CF DNS only).
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { COURSE_DOWNLOADS, COURSE_DOWNLOAD_GITHUB_REF, COURSE_DOWNLOAD_GITHUB_REPO } from "../../ai-course/course-downloads.js";
import { createOssClient } from "./client.mjs";

const rfc5987Filename = (filename) =>
  `UTF-8''${encodeURIComponent(filename).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`;

const contentDisposition = (item) => {
  const asciiFallback = item.id === "textbook" ? "Workbuddy-complete-intro.html" : "WorkBuddy-classroom-exercises.zip";
  return `${item.disposition}; filename="${asciiFallback}"; filename*=${rfc5987Filename(item.filename)}`;
};

const runGhJson = (apiPath) =>
  new Promise((resolve, reject) => {
    const child = spawn("gh", ["api", apiPath], { stdio: ["ignore", "pipe", "pipe"] });
    const chunks = [];
    const errors = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const stderr = Buffer.concat(errors).toString("utf8").trim();
      if (code !== 0) {
        reject(new Error(stderr || `gh api exited ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
  });

const downloadToFile = async (url, dest, headers = {}) => {
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) {
    throw new Error(`download ${res.status} ${url}`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, bytes);
  return bytes.length;
};

export const syncAiCourseDownloads = async () => {
  const client = createOssClient();
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "lan-ai-course-"));
  const uploaded = [];

  for (const item of Object.values(COURSE_DOWNLOADS)) {
    const apiPath = `repos/${COURSE_DOWNLOAD_GITHUB_REPO}/contents/${encodeURI(item.githubPath)}?ref=${encodeURIComponent(COURSE_DOWNLOAD_GITHUB_REF)}`;
    const meta = await runGhJson(apiPath);
    if (!meta?.download_url) {
      throw new Error(`GitHub did not return download_url for ${item.githubPath}`);
    }
    const dest = path.join(tmp, item.filename);
    const bytes = await downloadToFile(meta.download_url, dest);
    const result = await client.put(item.ossKey, dest, {
      headers: {
        "Content-Type": item.contentType,
        "Content-Disposition": contentDisposition(item),
        "Cache-Control": "public, max-age=3600",
        "x-oss-object-acl": "public-read",
      },
    });
    uploaded.push({
      id: item.id,
      key: item.ossKey,
      bytes,
      url: item.cn,
      etag: result.res?.headers?.etag,
    });
    console.log(`uploaded ${item.ossKey} (${bytes} bytes)`);
  }

  await fs.rm(tmp, { recursive: true, force: true });
  return uploaded;
};
