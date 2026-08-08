#!/usr/bin/env node
/**
 * Ensure global.lancloudtech.com → Cloudflare Pages (orange-cloud CNAME).
 * Does not modify apex / www grey-cloud A records.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Edit (+ Account Pages write to attach domain).
 */

import { loadCloudflarePagesEnv } from "./load-cloudflare-pages-env.mjs";

loadCloudflarePagesEnv();

const ZONE_NAME = "lancloudtech.com";
const GLOBAL_HOST = "global.lancloudtech.com";
const PAGES_PROJECT = process.env.CF_PAGES_PROJECT || "lan-homepage-global";
const PAGES_TARGET = process.env.CF_PAGES_TARGET || `${PAGES_PROJECT}.pages.dev`;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!token) {
  console.error("Need ~/.config/lanxin/env/cloudflare/pages.env (or CLOUDFLARE_API_TOKEN with Pages + DNS).");
  process.exit(1);
}

const api = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`${method} ${path}: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
};

const zones = await api(`/zones?name=${ZONE_NAME}`);
const zoneId = zones[0]?.id;
if (!zoneId) throw new Error(`Zone not found: ${ZONE_NAME}`);

// Remove conflicting A/AAAA on global.
for (const type of ["A", "AAAA"]) {
  const records = await api(`/zones/${zoneId}/dns_records?type=${type}&name=${GLOBAL_HOST}`);
  for (const rec of records) {
    await api(`/zones/${zoneId}/dns_records/${rec.id}`, { method: "DELETE" });
    console.log("deleted", type, GLOBAL_HOST);
  }
}

const cnames = await api(`/zones/${zoneId}/dns_records?type=CNAME&name=${GLOBAL_HOST}`);
const cnamePayload = {
  type: "CNAME",
  name: GLOBAL_HOST,
  content: PAGES_TARGET,
  ttl: 1,
  proxied: true,
};

if (cnames[0]) {
  const updated = await api(`/zones/${zoneId}/dns_records/${cnames[0].id}`, {
    method: "PATCH",
    body: cnamePayload,
  });
  console.log("updated CNAME", GLOBAL_HOST, "→", updated.content, "proxied=", updated.proxied);
} else {
  const created = await api(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: cnamePayload,
  });
  console.log("created CNAME", GLOBAL_HOST, "→", created.content, "proxied=", created.proxied);
}

if (ACCOUNT_ID) {
  try {
    const domains = await api(
      `/accounts/${ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}/domains`
    );
    const list = Array.isArray(domains) ? domains : domains?.result || domains || [];
    const has = (Array.isArray(list) ? list : []).some((d) => d.name === GLOBAL_HOST);
    if (!has) {
      await api(`/accounts/${ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}/domains`, {
        method: "POST",
        body: { name: GLOBAL_HOST },
      });
      console.log("attached Pages custom domain", GLOBAL_HOST);
    } else {
      console.log("Pages custom domain already attached", GLOBAL_HOST);
    }
  } catch (err) {
    console.warn("Pages domain attach skipped/failed:", err.message);
    console.warn("Attach manually in Cloudflare Dashboard → Pages → Custom domains if needed.");
  }
} else {
  console.warn("CLOUDFLARE_ACCOUNT_ID unset; skipped Pages custom-domain API attach.");
}

console.log("global DNS ready →", PAGES_TARGET, "(orange cloud)");
