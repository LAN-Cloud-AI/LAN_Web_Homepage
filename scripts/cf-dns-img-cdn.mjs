/**
 * Keep img.lancloudtech.com on Aliyun CDN with Cloudflare DNS only (grey cloud).
 * Does not change the CNAME target. Never orange-clouds this host — downloads
 * and images must stay on the domestic Aliyun path.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Edit.
 */

const ZONE_NAME = "lancloudtech.com";
const IMG_HOST = "img.lancloudtech.com";
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

const cnames = await api(`/zones/${zoneId}/dns_records?type=CNAME&name=${IMG_HOST}`);
const record = cnames[0];
if (!record) {
  throw new Error(`${IMG_HOST} CNAME is missing. Bind it in Aliyun CDN first, then recreate the grey-cloud CNAME.`);
}

if (!String(record.content || "").includes("kunlun")) {
  throw new Error(`${IMG_HOST} CNAME is ${record.content}, expected Aliyun CDN (kunlun). Refusing to rewrite.`);
}

if (record.proxied) {
  const updated = await api(`/zones/${zoneId}/dns_records/${record.id}`, {
    method: "PATCH",
    body: {
      type: "CNAME",
      name: IMG_HOST,
      content: record.content,
      ttl: 1,
      proxied: false,
    },
  });
  console.log("updated CNAME", IMG_HOST, "→", updated.content, "proxied=", updated.proxied);
} else {
  console.log("ok", IMG_HOST, "→", record.content, "proxied=false");
}
