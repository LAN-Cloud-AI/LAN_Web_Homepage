/**
 * Returns visitor country from Cloudflare edge metadata.
 * mainland = CN only; HK / MO / TW and all other codes are overseas.
 */

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Accept, Content-Type",
  "access-control-max-age": "86400",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, max-age=300",
      ...corsHeaders,
    },
  });

const regionForCountry = (country) => {
  const code = String(country || "").toUpperCase();
  if (code === "CN") return "mainland";
  return "overseas";
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/api/geo") {
      return json({ error: "not_found" }, 404);
    }

    const country = String(request.cf?.country || "XX").toUpperCase();
    const region = regionForCountry(country);

    return json({
      country,
      region,
      hostHint: region === "mainland" ? "cn" : "global",
    });
  },
};
