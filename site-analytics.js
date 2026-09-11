export const UMAMI_ORIGIN = "https://stats.lancloudtech.com";
export const UMAMI_SCRIPT_PATH = "/u.js";

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
  return `<script defer src="${UMAMI_ORIGIN}${UMAMI_SCRIPT_PATH}" data-website-id="${id}" data-do-not-track="true" data-lan-analytics="umami"></script>`;
};
