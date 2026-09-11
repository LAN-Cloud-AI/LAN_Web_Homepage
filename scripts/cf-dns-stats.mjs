#!/usr/bin/env node
/**
 * Ensure stats.lancloudtech.com → origin A record.
 * Default: orange-cloud (Access needs proxy). CF_PROXIED=false for cert issuance.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const loadEnvFile = (relative) => {
  const file = path.join(os.homedir(), ".config/lanxin/env", relative);
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

loadEnvFile("cloudflare/ops.env");

const ZONE_NAME = "lancloudtech.com";
const HOST = "stats.lancloudtech.com";
const ORIGIN = process.env.ORIGIN_IP || "8.148.22.108";
const PROXIED = process.env.CF_PROXIED !== "false";
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!token) {
  console.error("Need CLOUDFLARE_API_TOKEN from ~/.config/lanxin/env/cloudflare/ops.env.");
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

for (const type of ["CNAME", "AAAA"]) {
  const records = await api(`/zones/${zoneId}/dns_records?type=${type}&name=${HOST}`);
  for (const rec of records) {
    await api(`/zones/${zoneId}/dns_records/${rec.id}`, { method: "DELETE" });
    console.log("deleted", type, HOST);
  }
}

const existing = await api(`/zones/${zoneId}/dns_records?type=A&name=${HOST}`);
const payload = {
  type: "A",
  name: HOST,
  content: ORIGIN,
  ttl: 1,
  proxied: PROXIED,
};

if (existing[0]) {
  const updated = await api(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
    method: "PATCH",
    body: payload,
  });
  console.log("updated A", HOST, updated.content, "proxied=", updated.proxied);
} else {
  const created = await api(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: payload,
  });
  console.log("created A", HOST, created.content, "proxied=", created.proxied);
}

console.log(`stats DNS ready (${PROXIED ? "orange cloud" : "DNS only"}) →`, ORIGIN);
