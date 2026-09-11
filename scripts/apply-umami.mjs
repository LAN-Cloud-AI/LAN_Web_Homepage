#!/usr/bin/env node
/**
 * Create umami secrets, install Docker on the origin, start Umami,
 * issue the stats cert, create the four websites, and write public IDs.
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.LANXIN_NGINX_HOST || "lanxin-official-direct";
const envFile = path.join(os.homedir(), ".config/lanxin/env/umami/ops.env");
const compose = path.join(root, "ops/umami/docker-compose.yml");
const remoteDir = "/opt/lanxin/umami";
const lhAnalytics = path.join("/Users/i/myCode/LH_WebPage/scripts/site-analytics.mjs");

const loadEnvFile = (file) => {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
};

const run = (command, args, opts = {}) => {
  const result = spawnSync(command, args, { stdio: "inherit", ...opts });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
};

const ssh = (script) => run("ssh", [host, script]);
const sshOut = (script) => {
  const result = spawnSync("ssh", [host, script], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `ssh failed: ${script}`);
  }
  return result.stdout;
};

const ensureSecrets = () => {
  fs.mkdirSync(path.dirname(envFile), { recursive: true });
  if (!fs.existsSync(envFile)) {
    const body = [
      "# Generated locally. Do not commit. chmod 600.",
      `POSTGRES_PASSWORD=${randomBytes(24).toString("base64url")}`,
      `APP_SECRET=${randomBytes(48).toString("hex")}`,
      "UMAMI_ADMIN_USERNAME=admin",
      `UMAMI_ADMIN_PASSWORD=${randomBytes(18).toString("base64url")}`,
      "UMAMI_ACCESS_EMAIL_DOMAIN=lancloudtech.com",
      "UMAMI_ACCESS_EMAILS=",
      "",
    ].join("\n");
    fs.writeFileSync(envFile, body, { mode: 0o600 });
    console.log("wrote umami ops.env");
  }
  fs.chmodSync(envFile, 0o600);
  loadEnvFile(envFile);
};

const analyticsModule = (ids) => `export const UMAMI_ORIGIN = "https://stats.lancloudtech.com";
export const UMAMI_SCRIPT_PATH = "/u.js";

/** Public website IDs. Filled by \`npm run umami:apply\` after Umami is up. */
export const UMAMI_WEBSITE_IDS = {
  lan: "${ids.lan}",
  leadshunter: "${ids.leadshunter}",
  guide: "${ids.guide}",
  contact: "${ids.contact}",
};

export const analyticsScriptTag = (websiteKey) => {
  const id = UMAMI_WEBSITE_IDS[websiteKey];
  if (!id) return "";
  return \`<script defer src="\${UMAMI_ORIGIN}\${UMAMI_SCRIPT_PATH}" data-website-id="\${id}" data-do-not-track="true" data-lan-analytics="umami"></script>\`;
};

export const upsertAnalytics = (html, websiteKey) => {
  const tag = analyticsScriptTag(websiteKey);
  const stripped = html.replace(/\\s*<script[^>]*data-lan-analytics="umami"[^>]*>\\s*<\\/script>/gi, "");
  if (!tag) return stripped;
  if (/<\\/head>/i.test(stripped)) return stripped.replace(/<\\/head>/i, \`  \${tag}\\n</head>\`);
  return \`\${stripped}\\n\${tag}\\n\`;
};
`;

const writeWebsiteIds = (ids) => {
  fs.writeFileSync(path.join(root, "site-analytics.js"), analyticsModule(ids));
  if (fs.existsSync(path.dirname(lhAnalytics))) fs.writeFileSync(lhAnalytics, analyticsModule(ids));
};

const umamiFetch = async (pathname, { method = "GET", token, body } = {}) => {
  const payload = body ? JSON.stringify(body) : "";
  const tmp = `/tmp/umami-req-${Date.now()}.json`;
  const header = token ? `-H "Authorization: Bearer ${token}"` : "";
  const dataFlag = body ? `-d @${tmp}` : "";
  if (body) {
    run("ssh", [host, `cat > ${tmp}`], { input: payload, stdio: ["pipe", "inherit", "inherit"] });
  }
  const raw = sshOut(
    `curl -sS -X ${method} http://127.0.0.1:3000${pathname} -H "Content-Type: application/json" ${header} ${dataFlag}; rm -f ${tmp}`,
  );
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Umami ${pathname} returned non-JSON`);
  }
};

ensureSecrets();

ssh(
  [
    "set -e",
    "if ! command -v docker >/dev/null; then apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 && systemctl enable --now docker; fi",
    `mkdir -p ${remoteDir} /var/www/acme`,
  ].join(" && "),
);
run("scp", [compose, `${host}:${remoteDir}/docker-compose.yml`]);
run("scp", [envFile, `${host}:${remoteDir}/.env`]);
ssh(`chmod 600 ${remoteDir}/.env`);
const pull = spawnSync("ssh", [host, `cd ${remoteDir} && docker compose pull`], { stdio: "inherit" });
if (pull.status !== 0) {
  console.log("compose pull failed; using already-loaded images if present");
}
ssh(`cd ${remoteDir} && docker compose up -d`);

let ready = false;
for (let attempt = 0; attempt < 36; attempt += 1) {
  const ping = spawnSync("ssh", [host, "curl -fsS http://127.0.0.1:3000/api/heartbeat"], {
    encoding: "utf8",
  });
  if (ping.status === 0) {
    ready = true;
    break;
  }
  ssh("sleep 5");
}
if (!ready) throw new Error("Umami did not become healthy on :3000");

run("node", [path.join(root, "scripts/cf-dns-stats.mjs")], {
  env: { ...process.env, CF_PROXIED: "false" },
});

run("node", [path.join(root, "scripts/apply-nginx.mjs")]);

ssh(
  "test -f /etc/letsencrypt/live/stats.lancloudtech.com/fullchain.pem || certbot certonly --webroot -w /var/www/acme -d stats.lancloudtech.com --non-interactive --agree-tos --register-unsafely-without-email",
);
run("node", [path.join(root, "scripts/apply-nginx.mjs")]);
run("node", [path.join(root, "scripts/cf-dns-stats.mjs")], {
  env: { ...process.env, CF_PROXIED: "true" },
});

const username = process.env.UMAMI_ADMIN_USERNAME || "admin";
const desiredPassword = process.env.UMAMI_ADMIN_PASSWORD;
let login = await umamiFetch("/api/auth/login", {
  method: "POST",
  body: { username, password: "umami" },
});
if (!login.token) {
  login = await umamiFetch("/api/auth/login", {
    method: "POST",
    body: { username, password: desiredPassword },
  });
}
if (!login.token) throw new Error("Could not log in to Umami admin");

const userId = login.user?.id || login.userId;
if (userId && desiredPassword) {
  await umamiFetch(`/api/users/${userId}`, {
    method: "POST",
    token: login.token,
    body: { password: desiredPassword },
  }).catch(() => null);
}

const wanted = [
  { key: "lan", name: "兰芯云朵", domain: "lancloudtech.com" },
  { key: "leadshunter", name: "线索猎手", domain: "leadshunter.lancloudtech.com" },
  { key: "guide", name: "线索猎手手册", domain: "leadshunter-guide.lancloudtech.com" },
  { key: "contact", name: "线索猎手联系", domain: "leadshunter-contact.lancloudtech.com" },
];

const existing = await umamiFetch("/api/websites", { token: login.token });
const list = existing.data || existing || [];
const ids = { lan: "", leadshunter: "", guide: "", contact: "" };
for (const site of wanted) {
  const found = list.find((item) => item.domain === site.domain);
  if (found) {
    ids[site.key] = found.id;
    continue;
  }
  const created = await umamiFetch("/api/websites", {
    method: "POST",
    token: login.token,
    body: { name: site.name, domain: site.domain },
  });
  ids[site.key] = created.id || created.data?.id;
}
if (Object.values(ids).some((id) => !id)) {
  throw new Error("Umami website IDs were not created");
}
writeWebsiteIds(ids);
console.log("Umami websites ready:", Object.keys(ids).join(", "));
console.log("Entry: https://stats.lancloudtech.com");
