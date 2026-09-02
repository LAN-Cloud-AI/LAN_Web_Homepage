import { spawn } from "node:child_process";
import { loadR2WebsiteEnv } from "./env.mjs";

const runWranglerPut = (env, args) =>
  new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      cwd: "/tmp",
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: env.token,
        CLOUDFLARE_ACCOUNT_ID: env.accountId,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const chunks = [];
    const errors = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const stdout = Buffer.concat(chunks).toString("utf8").trim();
      const stderr = Buffer.concat(errors).toString("utf8").trim();
      if (code !== 0) {
        reject(new Error(stderr || stdout || `wrangler r2 object put exited ${code}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });

export const putR2Object = async ({ key, file, contentType, contentDisposition, cacheControl, retries = 3 }) => {
  const env = loadR2WebsiteEnv();
  const args = [
    "wrangler",
    "r2",
    "object",
    "put",
    `${env.bucket}/${key}`,
    "--remote",
    "--file",
    file,
    "--content-type",
    contentType,
  ];
  if (contentDisposition) {
    args.push("--content-disposition", contentDisposition);
  }
  if (cacheControl) {
    args.push("--cache-control", cacheControl);
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const output = await runWranglerPut(env, args);
      return {
        bucket: env.bucket,
        key,
        url: `${env.publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`,
        ...output,
      };
    } catch (error) {
      lastError = error;
      console.warn(`R2 put ${key} attempt ${attempt}/${retries} failed: ${error.message}`);
    }
  }
  throw lastError;
};

export const purgeR2PublicUrls = async (urls) => {
  const env = loadR2WebsiteEnv();
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.zoneId}/purge_cache`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: urls }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`cache purge failed: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
};
