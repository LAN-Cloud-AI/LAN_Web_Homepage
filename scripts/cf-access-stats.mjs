#!/usr/bin/env node
/**
 * Keep stats.lancloudtech.com off Cloudflare Access.
 * Umami already has its own admin login; Access OTP is not used.
 *
 * Daily ops token cannot write Access. This script will reuse
 * ~/.config/lanxin/env/cloudflare/access.env, or create that token
 * with CLOUDFLARE_BOOTSTRAP_API_TOKEN.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const envDir = path.join(os.homedir(), ".config/lanxin/env");
const accessEnv = path.join(envDir, "cloudflare/access.env");

const loadEnvFile = (relative) => {
  const file = path.join(envDir, relative);
  if (!fs.existsSync(file)) return false;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (!process.env[trimmed.slice(0, eq).trim()]) {
      process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return true;
};

loadEnvFile("cloudflare/access.env");
loadEnvFile("cloudflare/ops.env");
loadEnvFile("cloudflare/bootstrap.env");
loadEnvFile("umami/ops.env");

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const emailDomain = process.env.UMAMI_ACCESS_EMAIL_DOMAIN || "lancloudtech.com";
const extraEmails = String(process.env.UMAMI_ACCESS_EMAILS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const callApi = async (token, pathname, { method = "GET", body } = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { ok: res.ok && data.success, status: res.status, data };
};

const provisionAccessToken = async () => {
  if (process.env.CLOUDFLARE_ACCESS_API_TOKEN) return process.env.CLOUDFLARE_ACCESS_API_TOKEN;
  const bootstrap = process.env.CLOUDFLARE_BOOTSTRAP_API_TOKEN;
  if (!bootstrap || !ACCOUNT_ID) return "";

  const created = await callApi(bootstrap, "/user/tokens", {
    method: "POST",
    body: {
      name: "lanxin-zero-trust-access",
      policies: [
        {
          effect: "allow",
          resources: { [`com.cloudflare.api.account.${ACCOUNT_ID}`]: "*" },
          permission_groups: [
            { id: "1e13c5124ca64b72b1969a67e8829049" }, // Access: Apps and Policies Write
            { id: "bfe0d8686a584fa680f4c53b5eb0de6d" }, // Access: Orgs / IdPs / Groups Write
            { id: "b33f02c6f7284e05a6f20741c0bb0567" }, // Zero Trust Write
          ],
        },
      ],
    },
  });
  const value = created.data?.result?.value;
  if (!created.ok || !value) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          reason: "Could not create Access API token",
          status: created.status,
          errors: created.data?.errors || [],
        },
        null,
        2,
      ),
    );
    return "";
  }
  const body = [
    "# Cloudflare Zero Trust / Access — created via bootstrap, chmod 600",
    `# Name: lanxin-zero-trust-access · id: ${created.data.result.id}`,
    `CLOUDFLARE_ACCESS_API_TOKEN=${value}`,
    `CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}`,
    "",
  ].join("\n");
  fs.mkdirSync(path.dirname(accessEnv), { recursive: true });
  fs.writeFileSync(accessEnv, body, { mode: 0o600 });
  fs.chmodSync(accessEnv, 0o600);
  process.env.CLOUDFLARE_ACCESS_API_TOKEN = value;
  return value;
};

const token =
  process.env.CLOUDFLARE_ACCESS_API_TOKEN ||
  (await provisionAccessToken()) ||
  process.env.CLOUDFLARE_API_TOKEN;

if (!token || !ACCOUNT_ID) {
  console.error("Need an Access-capable Cloudflare token and CLOUDFLARE_ACCOUNT_ID.");
  process.exit(1);
}

const api = (pathname, init) => callApi(token, pathname, init);
const notes = [];

const ensureOrg = async () => {
  const current = await api(`/accounts/${ACCOUNT_ID}/access/organizations`);
  if (current.ok) {
    notes.push(`org ${current.data.result?.auth_domain || "ready"}`);
    return true;
  }
  const created = await api(`/accounts/${ACCOUNT_ID}/access/organizations`, {
    method: "POST",
    body: {
      name: "兰芯云朵",
      auth_domain: "lancloudtech.cloudflareaccess.com",
    },
  });
  notes.push(
    created.ok
      ? "created Zero Trust org"
      : `could not create org: ${created.status} ${(created.data.errors || []).map((item) => item.message).join("; ")}`,
  );
  return created.ok || current.status === 409;
};

const ensureOtp = async () => {
  const listed = await api(`/accounts/${ACCOUNT_ID}/access/identity_providers`);
  const existing = (listed.data?.result || []).find((item) =>
    /one.?time|otp|pin|onetimepin/i.test(`${item.type} ${item.name}`),
  );
  if (existing) return existing.id;
  const created = await api(`/accounts/${ACCOUNT_ID}/access/identity_providers`, {
    method: "POST",
    body: { name: "One-time PIN", type: "onetimepin", config: {} },
  });
  notes.push(created.ok ? "created one-time PIN IdP" : `could not create OTP IdP: ${created.status}`);
  return created.data?.result?.id || "";
};

const upsertPolicy = async (appId, { name, decision, include }) => {
  const listed = await api(`/accounts/${ACCOUNT_ID}/access/apps/${appId}/policies`);
  const policies = listed.data?.result || [];
  const existing = policies.find((item) => item.name === name);
  const body = { name, decision, include };
  if (existing) {
    const updated = await api(`/accounts/${ACCOUNT_ID}/access/apps/${appId}/policies/${existing.id}`, {
      method: "PUT",
      body,
    });
    notes.push(updated.ok ? `updated policy ${name}` : `could not update policy ${name}: ${updated.status}`);
    return updated.ok;
  }
  const created = await api(`/accounts/${ACCOUNT_ID}/access/apps/${appId}/policies`, {
    method: "POST",
    body,
  });
  notes.push(created.ok ? `created policy ${name}` : `could not create policy ${name}: ${created.status}`);
  return created.ok;
};

const upsertApp = async ({ name, domain, decision, include, allowedIdps }) => {
  const listed = await api(`/accounts/${ACCOUNT_ID}/access/apps`);
  const apps = listed.data?.result || [];
  const existing = apps.find((app) => app.name === name || app.domain === domain);
  const body = {
    name,
    domain,
    type: "self_hosted",
    session_duration: "24h",
    auto_redirect_to_identity: Boolean(allowedIdps?.length),
    allowed_idps: allowedIdps?.length ? allowedIdps : undefined,
    app_launcher_visible: false,
  };
  let app = existing;
  if (existing) {
    const updated = await api(`/accounts/${ACCOUNT_ID}/access/apps/${existing.id}`, {
      method: "PUT",
      body,
    });
    notes.push(updated.ok ? `updated ${name}` : `could not update ${name}: ${updated.status}`);
    if (!updated.ok) return false;
  } else {
    const created = await api(`/accounts/${ACCOUNT_ID}/access/apps`, {
      method: "POST",
      body,
    });
    notes.push(created.ok ? `created ${name}` : `could not create ${name}: ${created.status}`);
    if (!created.ok) {
      notes.push((created.data.errors || []).map((item) => item.message).join("; "));
      return false;
    }
    app = created.data.result;
  }
  return upsertPolicy(app.id, { name: `${name} policy`, decision, include });
};

if (!(await ensureOrg())) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        notes,
        dashboard:
          "Open Cloudflare Zero Trust once to finish org onboarding, then rerun npm run cf:access-stats.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const removeApp = async (name) => {
  const listed = await api(`/accounts/${ACCOUNT_ID}/access/apps`);
  const existing = (listed.data?.result || []).find((app) => app.name === name);
  if (!existing) {
    notes.push(`no Access app ${name}`);
    return true;
  }
  const deleted = await api(`/accounts/${ACCOUNT_ID}/access/apps/${existing.id}`, { method: "DELETE" });
  notes.push(deleted.ok ? `removed ${name}` : `could not remove ${name}: ${deleted.status}`);
  return deleted.ok;
};

const removed = [];
for (const name of [
  "Umami console",
  "Umami collect script",
  "Umami collect api",
  "Umami robots",
]) {
  removed.push(await removeApp(name));
}

console.log(
  JSON.stringify(
    {
      ok: removed.every(Boolean),
      notes,
      entry: "https://stats.lancloudtech.com",
      auth: "Umami admin login only",
    },
    null,
    2,
  ),
);
