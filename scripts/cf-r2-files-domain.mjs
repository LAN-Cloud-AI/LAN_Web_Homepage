/**
 * Ensure files.lancloudtech.com → R2 bucket lan-ai-course (orange-cloud custom domain).
 * Also installs a Cache Everything rule so the ~39MB HTML courseware is edge-cached.
 *
 * Does not modify apex / www / img grey-cloud records.
 */
import { loadR2WebsiteEnv } from "./r2/env.mjs";

const env = loadR2WebsiteEnv();
const ZONE_NAME = "lancloudtech.com";
const FILES_HOST = env.publicHost;
const BUCKET = env.bucket;

const api = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.token}`,
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

const buckets = await api(`/accounts/${env.accountId}/r2/buckets`);
const names = (buckets.buckets || buckets || []).map((item) => item.name);
if (!names.includes(BUCKET)) {
  await api(`/accounts/${env.accountId}/r2/buckets`, { method: "POST", body: { name: BUCKET } });
  console.log("created R2 bucket", BUCKET);
} else {
  console.log("R2 bucket exists", BUCKET);
}

const domains = await api(`/accounts/${env.accountId}/r2/buckets/${BUCKET}/domains/custom`);
const list = domains.domains || domains || [];
const attached = list.some((item) => (item.domain || item.name) === FILES_HOST);
if (!attached) {
  await api(`/accounts/${env.accountId}/r2/buckets/${BUCKET}/domains/custom`, {
    method: "POST",
    body: {
      domain: FILES_HOST,
      enabled: true,
      zoneId: env.zoneId,
      minTLS: "1.2",
    },
  });
  console.log("attached custom domain", FILES_HOST);
} else {
  const current = list.find((item) => (item.domain || item.name) === FILES_HOST);
  console.log(
    "custom domain already attached",
    FILES_HOST,
    "ssl=",
    current?.status?.ssl,
    "ownership=",
    current?.status?.ownership,
  );
}

const zones = await api(`/zones?name=${ZONE_NAME}`);
const zoneId = zones[0]?.id;
if (!zoneId) throw new Error(`Zone not found: ${ZONE_NAME}`);

const cnames = await api(`/zones/${zoneId}/dns_records?type=CNAME&name=${FILES_HOST}`);
if (cnames[0] && cnames[0].proxied !== true) {
  const updated = await api(`/zones/${zoneId}/dns_records/${cnames[0].id}`, {
    method: "PATCH",
    body: { proxied: true, ttl: 1 },
  });
  console.log("updated CNAME", FILES_HOST, "→", updated.content, "proxied=", updated.proxied);
} else if (cnames[0]) {
  console.log("CNAME ready", FILES_HOST, "→", cnames[0].content, "proxied=", cnames[0].proxied);
} else {
  console.warn("R2 custom-domain API should have created the CNAME; none found for", FILES_HOST);
}

const cacheExpression = `(http.host eq "${FILES_HOST}")`;
const cacheRule = {
  action: "set_cache_settings",
  description: "Cache all files.lancloudtech.com R2 objects including HTML courseware",
  enabled: true,
  expression: cacheExpression,
  action_parameters: {
    cache: true,
    edge_ttl: {
      mode: "override_origin",
      default: 3600,
    },
    browser_ttl: {
      mode: "respect_origin",
    },
  },
};

try {
  const entry = await api(`/zones/${zoneId}/rulesets/phases/http_request_cache_settings/entrypoint`);
  const rules = [...(entry.rules || [])];
  const index = rules.findIndex((rule) => rule.expression === cacheExpression);
  if (index >= 0) {
    rules[index] = { ...rules[index], ...cacheRule, id: rules[index].id };
  } else {
    rules.push(cacheRule);
  }
  await api(`/zones/${zoneId}/rulesets/${entry.id}`, {
    method: "PUT",
    body: { rules },
  });
  console.log("cache rule ready for", FILES_HOST);
} catch (error) {
  if (!String(error.message).includes("could not find entrypoint ruleset")) {
    throw error;
  }
  await api(`/zones/${zoneId}/rulesets/phases/http_request_cache_settings/entrypoint`, {
    method: "PUT",
    body: { rules: [cacheRule] },
  });
  console.log("created cache ruleset for", FILES_HOST);
}

console.log("files R2 domain ready →", BUCKET, "(orange cloud)");
