#!/usr/bin/env node
/**
 * LAN Cloud OSS CLI — operate lan-cloud-webpage for agents & humans.
 *
 * Usage:
 *   node scripts/oss/cli.mjs ping
 *   node scripts/oss/cli.mjs ls [prefix]
 *   node scripts/oss/cli.mjs mkdir <prefix>
 *   node scripts/oss/cli.mjs put <localPath> <objectKey>
 *   node scripts/oss/cli.mjs sync-website-images
 *   node scripts/oss/cli.mjs sync-miniprogram-images
 *   node scripts/oss/cli.mjs init-layout
 *   node scripts/oss/cli.mjs configure-bucket
 *   node scripts/oss/cli.mjs url <objectKey>
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createOssClient, joinKey, publicUrlForKey } from "./client.mjs";
import {
  getOssEnv,
  webpagePrefix,
  sharedPrefix,
  miniprogramPrefix,
  assertEnvFileExists,
} from "./env.mjs";

const usage = () => {
  console.log(`LAN Cloud OSS CLI

Commands:
  ping                         Test credentials & bucket
  ls [prefix]                  List objects
  mkdir <prefix>               Create directory marker (.keep)
  put <local> <key>            Upload one file
  sync-website-images          Sync images/* (except prompts/prototypes) → lanxin/webpage/images/
  sync-miniprogram-images      Sync mini program assets-oss/ → lanxin/apps/miniprogram/
  init-layout                  Create company directory tree
  configure-bucket             Disable BPA, set CORS + public-read policy for webpage/miniprogram assets
  url <key>                    Print public URL
`);
};

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".ico": "image/x-icon",
      ".woff2": "font/woff2",
      ".txt": "text/plain; charset=utf-8",
      ".md": "text/markdown; charset=utf-8",
    }[ext] || "application/octet-stream"
  );
};

const walkFiles = async (dir) => {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.name === ".DS_Store") continue;
    if (entry.isDirectory()) out.push(...(await walkFiles(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
};

const cmdPing = async () => {
  assertEnvFileExists();
  const env = getOssEnv();
  const client = createOssClient();
  const result = await client.getBucketInfo(env.bucket);
  console.log(JSON.stringify({
    ok: true,
    bucket: env.bucket,
    region: env.region,
    endpoint: env.endpoint,
    publicBaseUrl: env.publicBaseUrl,
    rootPrefix: env.rootPrefix,
    owner: result.bucket?.Owner || result.owner,
    creationDate: result.bucket?.CreationDate || result.creationDate,
  }, null, 2));
};

const cmdLs = async (prefixArg) => {
  const env = getOssEnv();
  const client = createOssClient();
  const prefix = prefixArg || `${env.rootPrefix}/`;
  let marker;
  let count = 0;
  do {
    const res = await client.list({ prefix, marker, "max-keys": 100 });
    for (const obj of res.objects || []) {
      console.log(`${obj.size}\t${obj.lastModified}\t${obj.name}`);
      count += 1;
    }
    marker = res.isTruncated ? res.nextMarker : undefined;
  } while (marker);
  console.log(`# ${count} object(s) under ${prefix}`);
};

const cmdMkdir = async (prefix) => {
  if (!prefix) throw new Error("mkdir requires <prefix>");
  const client = createOssClient();
  const key = joinKey(prefix, ".keep");
  await client.put(key, Buffer.from(""), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "x-oss-object-acl": "private" },
  });
  console.log("created", key);
};

const COMPANY_LAYOUT = [
  "lanxin/webpage/images/generated/",
  "lanxin/webpage/images/logo/",
  "lanxin/webpage/assets/",
  "lanxin/shared/brand/",
  "lanxin/shared/docs/",
  "lanxin/apps/leadshunter/",
  "lanxin/apps/internal-expense/",
  "lanxin/apps/wecom/",
  "lanxin/apps/miniprogram/",
  "lanxin/tmp/",
];

const cmdInitLayout = async () => {
  const env = getOssEnv();
  const client = createOssClient();
  const readme = `# LAN Cloud company OSS layout

Bucket: ${env.bucket}
Region: ${env.region}

- lanxin/webpage/     Official website (lancloudtech.com) public assets
- lanxin/shared/      Cross-product brand & shared files
- lanxin/apps/        Product-specific private/public assets
- lanxin/tmp/         Temporary uploads (safe to purge)
`;
  for (const dir of COMPANY_LAYOUT) {
    const key = joinKey(dir, ".keep");
    await client.put(key, Buffer.from(""), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
    console.log("ok", key);
  }
  await client.put(joinKey(env.rootPrefix, "README.md"), Buffer.from(readme, "utf8"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
  console.log("layout ready under", env.rootPrefix + "/");
};

const cmdPut = async (localPath, objectKey) => {
  if (!localPath || !objectKey) throw new Error("put requires <localPath> <objectKey>");
  const client = createOssClient();
  const abs = path.resolve(localPath);
  const headers = {
    "Content-Type": contentTypeFor(abs),
  };
  const result = await client.put(objectKey, abs, { headers });
  console.log(JSON.stringify({ key: objectKey, url: publicUrlForKey(objectKey), etag: result.res?.headers?.etag }, null, 2));
};

const cmdSyncWebsiteImages = async () => {
  const env = getOssEnv();
  const client = createOssClient();
  const imagesRoot = path.join(env.projectRoot, "images");
  const skipTop = new Set(["prompts", "prototypes", "README.md"]);
  const entries = await fs.readdir(imagesRoot, { withFileTypes: true });
  const roots = entries
    .filter((entry) => entry.isDirectory() && !skipTop.has(entry.name))
    .map((entry) => ({
      local: path.join(imagesRoot, entry.name),
      remote: joinKey(webpagePrefix(env), "images", entry.name),
    }));

  let uploaded = 0;
  for (const { local, remote } of roots) {
    const files = await walkFiles(local);
    for (const file of files) {
      const rel = path.relative(local, file).split(path.sep).join("/");
      const key = joinKey(remote, rel);
      await client.put(key, file, {
        headers: {
          "Content-Type": contentTypeFor(file),
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
      uploaded += 1;
      if (uploaded % 25 === 0) console.log(`uploaded ${uploaded}...`);
    }
  }
  console.log(JSON.stringify({
    uploaded,
    folders: roots.map((r) => path.basename(r.local)),
    publicBase: `${env.publicBaseUrl}/${webpagePrefix(env)}/images/`,
  }, null, 2));
};

const resolveMiniprogramRoot = (env) => {
  if (process.env.MINIPROGRAM_ROOT) {
    return path.resolve(process.env.MINIPROGRAM_ROOT);
  }
  return path.resolve(env.projectRoot, "../LAN_Wechat_Official_miniProgram");
};

const cmdSyncMiniprogramImages = async () => {
  const env = getOssEnv();
  const client = createOssClient();
  const mpRoot = resolveMiniprogramRoot(env);
  const assetsOss = path.join(mpRoot, "assets-oss");
  try {
    await fs.access(assetsOss);
  } catch {
    throw new Error(
      `Mini program assets-oss/ not found at ${assetsOss}. Set MINIPROGRAM_ROOT if the repo lives elsewhere.`,
    );
  }

  const remote = miniprogramPrefix(env);
  const files = await walkFiles(assetsOss);
  let uploaded = 0;
  for (const file of files) {
    const rel = path.relative(assetsOss, file).split(path.sep).join("/");
    const key = joinKey(remote, rel);
    await client.put(key, file, {
      headers: {
        "Content-Type": contentTypeFor(file),
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Disposition": "inline",
      },
    });
    uploaded += 1;
    console.log("uploaded", key);
  }
  console.log(JSON.stringify({
    uploaded,
    source: assetsOss,
    publicBase: `${env.publicBaseUrl}/${remote}/`,
  }, null, 2));
};

const setBlockPublicAccess = async (client, enabled) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PublicAccessBlockConfiguration>
  <BlockPublicAccess>${enabled ? "true" : "false"}</BlockPublicAccess>
</PublicAccessBlockConfiguration>`;
  await client.request({
    method: "PUT",
    bucket: client.options.bucket,
    subres: "publicAccessBlock",
    content: xml,
    headers: { "Content-Type": "application/xml" },
    successStatuses: [200, 204],
  });
};

const cmdConfigureBucket = async () => {
  const env = getOssEnv();
  const client = createOssClient();

  // Turn off Block Public Access so public-read policy works for website assets.
  try {
    await setBlockPublicAccess(client, false);
    console.log("disabled Block Public Access");
  } catch (error) {
    console.warn("Block Public Access change skipped:", error.message);
  }

  // CORS for official site + local preview
  await client.putBucketCORS(env.bucket, [
    {
      allowedOrigin: [
        "https://lancloudtech.com",
        "https://www.lancloudtech.com",
        "http://127.0.0.1:18987",
        "http://localhost:18987",
      ],
      allowedMethod: ["GET", "HEAD"],
      allowedHeader: ["*"],
      exposeHeader: ["ETag", "x-oss-request-id"],
      maxAgeSeconds: "86400",
    },
  ]);
  console.log("CORS updated");

  // Public read for webpage, shared brand, and mini program content images
  const policy = {
    Version: "1",
    Statement: [
      {
        Sid: "PublicReadWebpageSharedBrandMiniprogram",
        Effect: "Allow",
        Principal: "*",
        Action: ["oss:GetObject"],
        Resource: [
          `acs:oss:*:*:${env.bucket}/${webpagePrefix(env)}/*`,
          `acs:oss:*:*:${env.bucket}/${sharedPrefix(env)}/brand/*`,
          `acs:oss:*:*:${env.bucket}/${miniprogramPrefix(env)}/*`,
        ],
      },
    ],
  };
  try {
    await client.putBucketPolicy(env.bucket, policy);
    console.log("bucket policy: public-read for webpage + shared/brand + apps/miniprogram");
  } catch (error) {
    console.warn("bucket policy skipped:", error.message);
  }
};

const cmdUrl = async (key) => {
  if (!key) throw new Error("url requires <objectKey>");
  console.log(publicUrlForKey(key));
};

const [cmd, ...args] = process.argv.slice(2);

try {
  switch (cmd) {
    case "ping":
      await cmdPing();
      break;
    case "ls":
      await cmdLs(args[0]);
      break;
    case "mkdir":
      await cmdMkdir(args[0]);
      break;
    case "put":
      await cmdPut(args[0], args[1]);
      break;
    case "sync-website-images":
      await cmdSyncWebsiteImages();
      break;
    case "sync-miniprogram-images":
      await cmdSyncMiniprogramImages();
      break;
    case "init-layout":
      await cmdInitLayout();
      break;
    case "configure-bucket":
      await cmdConfigureBucket();
      break;
    case "url":
      await cmdUrl(args[0]);
      break;
    case undefined:
    case "help":
    case "-h":
    case "--help":
      usage();
      break;
    default:
      usage();
      throw new Error(`Unknown command: ${cmd}`);
  }
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
