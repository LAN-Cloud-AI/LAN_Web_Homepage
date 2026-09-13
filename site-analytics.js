export const UMAMI_ORIGIN = "https://stats.lancloudtech.com";
export const UMAMI_SCRIPT_PATH = "/u.js";
export const UMAMI_CORPORATE_DOMAINS = Object.freeze([
  "lancloudtech.com", "www.lancloudtech.com", "global.lancloudtech.com",
]);

/** Public website IDs. Filled by `npm run umami:apply` after Umami is up. */
export const UMAMI_WEBSITE_IDS = {
  lan: "d93294b3-1e1c-4127-9289-1fb8bdc42293",
  leadshunter: "ee4b1080-73af-42b3-8a8f-b675afd51f0b",
  guide: "022c8956-5069-4b9f-9141-8b7fa35f603a",
  contact: "50d0080c-d9f9-40b4-832b-b1ca8d67b063",
};

export const analyticsScriptTag = (websiteKey) => {
  const id = UMAMI_WEBSITE_IDS[websiteKey];
  if (!id) return "";
  const domains = websiteKey === "lan" ? ` data-domains="${UMAMI_CORPORATE_DOMAINS.join(",")}"` : "";
  return `<script defer src="${UMAMI_ORIGIN}${UMAMI_SCRIPT_PATH}" data-website-id="${id}" data-do-not-track="true"${domains} data-lan-analytics="umami"></script>`;
};

/** Inject once alongside the existing tracker; use the same module for both versions. */
export const siteEventsScriptTag = (src = "/site-events.js") => {
  const escaped = String(src).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<script type="module" src="${escaped}" data-lan-events="umami"></script>`;
};
