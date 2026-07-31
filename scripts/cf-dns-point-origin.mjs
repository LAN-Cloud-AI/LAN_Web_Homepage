#!/usr/bin/env node
/**
 * Point lancloudtech.com / www to origin IP via Cloudflare DNS.
 * Default: Proxied (orange cloud) for CDN. Set CF_PROXIED=false for DNS only.
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Edit.
 */

const ZONE_NAME = "lancloudtech.com";
const ORIGIN = process.env.ORIGIN_IP || "8.148.22.108";
const PROXIED = process.env.CF_PROXIED !== "false";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN with Zone.DNS Edit permission.");
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

const upsertA = async (name) => {
  const existing = await api(`/zones/${zoneId}/dns_records?type=A&name=${name}`);
  const payload = {
    type: "A",
    name,
    content: ORIGIN,
    ttl: 1,
    proxied: PROXIED,
  };
  if (existing[0]) {
    const updated = await api(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PATCH",
      body: payload,
    });
    console.log("updated", name, updated.content, "proxied=", updated.proxied);
  } else {
    // delete conflicting CNAME if any
    const cnames = await api(`/zones/${zoneId}/dns_records?type=CNAME&name=${name}`);
    for (const rec of cnames) {
      await api(`/zones/${zoneId}/dns_records/${rec.id}`, { method: "DELETE" });
      console.log("deleted CNAME", name);
    }
    const created = await api(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: payload,
    });
    console.log("created", name, created.content, "proxied=", created.proxied);
  }
};

await upsertA("lancloudtech.com");
await upsertA("www.lancloudtech.com");
console.log(`DNS ready (${PROXIED ? "orange cloud / proxied" : "DNS only"}) ->`, ORIGIN);
