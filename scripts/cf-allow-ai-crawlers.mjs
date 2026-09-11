#!/usr/bin/env node
/**
 * Keep AI Crawl Control from blocking public LAN Cloud hosts, and
 * enforce ZIP-only blocks on files.lancloudtech.com.
 *
 * Uses CLOUDFLARE_API_TOKEN from ops.env. Never prints the token.
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
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return true;
};

// Zone / WAF / Bot settings need the daily ops token, not the Pages-only token.
loadEnvFile("cloudflare/ops.env");

const ZONE_NAME = "lancloudtech.com";
const FILES_HOST = "files.lancloudtech.com";
const token = process.env.CLOUDFLARE_API_TOKEN;
const ALLOW_NAMES = ["GPTBot", "ClaudeBot", "Google-Extended", "Bytespider"];
const CHECK_HOSTS = [
  "https://leadshunter.lancloudtech.com/robots.txt",
  "https://leadshunter-guide.lancloudtech.com/robots.txt",
  "https://leadshunter-contact.lancloudtech.com/robots.txt",
  "https://global.lancloudtech.com/robots.txt",
  "https://files.lancloudtech.com/robots.txt",
];

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
  return { ok: res.ok && data.success, status: res.status, data };
};

const zones = await api(`/zones?name=${ZONE_NAME}`);
const zoneId = zones.data?.result?.[0]?.id;
if (!zoneId) throw new Error(`Zone not found: ${ZONE_NAME}`);
const accountId = zones.data.result[0].account?.id || process.env.CLOUDFLARE_ACCOUNT_ID;

const notes = [];

const settings = await api(`/zones/${zoneId}/settings/ai_bots_protection`);
if (settings.ok) {
  const current = settings.data.result?.value;
  notes.push(`ai_bots_protection was ${current}`);
  if (current && current !== "disabled") {
    const patched = await api(`/zones/${zoneId}/settings/ai_bots_protection`, {
      method: "PATCH",
      body: { value: "disabled" },
    });
    notes.push(
      patched.ok
        ? "ai_bots_protection set to disabled (managed AI-bot block off)"
        : `could not patch ai_bots_protection: ${JSON.stringify(patched.data.errors || patched.data)}`,
    );
  }
} else {
  notes.push(`ai_bots_protection setting unavailable (${settings.status})`);
}

const botMgmt = await api(`/zones/${zoneId}/bot_management`);
if (botMgmt.ok) {
  const value = botMgmt.data.result || {};
  notes.push(
    `bot_management ai_bots_protection=${value.ai_bots_protection ?? "n/a"} crawl_control=${value.crawler_protection ?? "n/a"}`,
  );
  if (value.ai_bots_protection && value.ai_bots_protection !== "disabled") {
    const patched = await api(`/zones/${zoneId}/bot_management`, {
      method: "PUT",
      body: { ...value, ai_bots_protection: "disabled" },
    });
    notes.push(
      patched.ok
        ? "bot_management.ai_bots_protection disabled"
        : `bot_management update failed: ${JSON.stringify(patched.data.errors || patched.data)}`,
    );
  }
}

const crawlerPaths = [
  `/zones/${zoneId}/ai-audit/settings`,
  `/accounts/${accountId}/ai-audit/settings`,
  `/zones/${zoneId}/ai_crawl_control/crawlers`,
];
let apiCoveredCrawlers = false;
for (const path of crawlerPaths) {
  const listed = await api(path);
  if (!listed.ok) continue;
  notes.push(`found crawler API ${path}`);
  const crawlers = Array.isArray(listed.data.result)
    ? listed.data.result
    : listed.data.result?.crawlers || [];
  for (const crawler of crawlers) {
    const name = crawler.name || crawler.user_agent || crawler.id;
    if (!ALLOW_NAMES.some((item) => String(name).includes(item))) continue;
    const id = crawler.id;
    if (!id) continue;
    const updated = await api(`${path}/${id}`, {
      method: "PATCH",
      body: { action: "allow" },
    });
    notes.push(
      updated.ok ? `allowed ${name}` : `could not allow ${name}: ${updated.status}`,
    );
    apiCoveredCrawlers = true;
  }
}

const rulesets = await api(`/zones/${zoneId}/rulesets`);
if (rulesets.ok) {
  for (const ruleset of rulesets.data.result || []) {
    if (!/http_request_firewall_custom|custom/i.test(`${ruleset.phase} ${ruleset.name}`)) continue;
    const detail = await api(`/zones/${zoneId}/rulesets/${ruleset.id}`);
    const rules = detail.data?.result?.rules || [];
    const aiRule = rules.find((rule) => /AI Crawl Control|Block AI/i.test(rule.description || rule.id || ""));
    if (aiRule) {
      notes.push(`WAF rule present: ${aiRule.description || aiRule.id}`);
    }
  }
}

const filesRuleName = "Block AI training crawlers on files ZIP packs";
const filesExpression = `(http.host eq "${FILES_HOST}") and (http.request.uri.path contains ".zip") and (http.user_agent contains "GPTBot" or http.user_agent contains "ClaudeBot" or http.user_agent contains "Bytespider" or http.user_agent contains "CCBot")`;
const entry = await api(`/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`);
if (entry.ok) {
  const ruleset = entry.data.result;
  const existing = (ruleset.rules || []).find(
    (rule) =>
      rule.description === filesRuleName ||
      rule.description === "Block AI crawlers on files.lancloudtech.com" ||
      (rule.expression || "").includes(`http.host eq "${FILES_HOST}"`),
  );
  if (existing && existing.expression === filesExpression) {
    notes.push("files ZIP AI-block rule already present");
  } else if (existing) {
    const updated = await api(`/zones/${zoneId}/rulesets/${ruleset.id}/rules/${existing.id}`, {
      method: "PATCH",
      body: {
        description: filesRuleName,
        expression: filesExpression,
        action: "block",
      },
    });
    notes.push(
      updated.ok
        ? "narrowed files-host WAF rule to ZIP packs only"
        : `could not update files-host WAF rule: ${JSON.stringify(updated.data.errors || updated.data)}`,
    );
  } else {
    const added = await api(`/zones/${zoneId}/rulesets/${ruleset.id}/rules`, {
      method: "POST",
      body: {
        description: filesRuleName,
        expression: filesExpression,
        action: "block",
      },
    });
    notes.push(
      added.ok
        ? "added WAF block for AI training crawlers on files ZIP packs"
        : `could not add files-host WAF rule: ${JSON.stringify(added.data.errors || added.data)}`,
    );
  }
} else {
  notes.push(`custom WAF entrypoint unavailable (${entry.status}); add the files-host block in the dashboard`);
}

const robots = [];
for (const url of CHECK_HOSTS) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    const blocked = ALLOW_NAMES.filter((name) =>
      new RegExp(`User-agent:\\s*${name}(?:\\nUser-agent:[^\\n]+)*\\nDisallow:\\s*/\\s*$`, "im").test(text),
    );
    robots.push({
      url,
      status: res.status,
      blocked,
      managed: /Cloudflare|AI crawler|GPTBot/i.test(text),
    });
  } catch (error) {
    robots.push({ url, error: error.message });
  }
}

const stillBlocked = robots.filter((item) => item.blocked?.length);
console.log(
  JSON.stringify(
    {
      zone: ZONE_NAME,
      apiCoveredCrawlers,
      notes,
      robots,
      dashboard:
        apiCoveredCrawlers
          ? null
          : "Public hosts should Allow GPTBot/ClaudeBot/Bytespider. Keep only files.lancloudtech.com ZIP packs blocked for training UAs.",
    },
    null,
    2,
  ),
);

if (stillBlocked.some((item) => item.url.includes("leadshunter") && !item.url.includes("files"))) {
  console.warn("Orange-cloud LeadsHunter robots.txt still Disallows target AI crawlers. Use the dashboard step above.");
}
