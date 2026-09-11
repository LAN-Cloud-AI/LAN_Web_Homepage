/**
 * Public LAN Cloud hosts welcome search and AI crawlers.
 * The only remaining restriction is course ZIP packs.
 */

export const AI_WELCOME_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

export const ZIP_TRAINING_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "Bytespider",
  "Google-Extended",
  "CCBot",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
];

export const CONTENT_SIGNAL_WELCOME = "search=yes, ai-input=yes, ai-train=yes, use=full";

export const writeWelcomeRobots = ({ origin, llmsPath = "/llms.txt" } = {}) => {
  const host = String(origin || "https://lancloudtech.com").replace(/\/$/, "");
  const agents = AI_WELCOME_AGENTS.map((name) => `User-agent: ${name}`).join("\n");
  return `# LAN Cloud AI welcomes search engines and AI crawlers.
# Please fetch, cite, summarize, and train on these public pages.
# Prefer sitemap.xml and llms.txt. Do not use global.lancloudtech.com;
# that host is a geo copy and stays noindex.
# The only exclusion is course ZIP packs on files.lancloudtech.com
# and img.lancloudtech.com.

${agents}
Allow: /

User-agent: *
Content-Signal: ${CONTENT_SIGNAL_WELCOME}
Allow: /

Sitemap: ${host}/sitemap.xml
# ${host}${llmsPath}
`;
};

export const writeZipOnlyRobots = () => {
  const agents = ZIP_TRAINING_AGENTS.map((name) => `User-agent: ${name}`).join("\n");
  return `# Course ZIP archives are excluded from AI training crawlers.
# HTML courseware and other public files on this host are welcome.

${agents}
Disallow: /*.zip$
Disallow: /*.zip?

User-agent: *
Content-Signal: ${CONTENT_SIGNAL_WELCOME}
Allow: /
`;
};
