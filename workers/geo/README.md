# lan-geo

Lightweight Cloudflare Worker that exposes the visitor country for host steering between:

- `https://lancloudtech.com` (Aliyun origin, grey-cloud DNS)
- `https://global.lancloudtech.com` (Cloudflare Pages)

## Rules

- `region: "mainland"` only when `CF-IPCountry` / `request.cf.country` is `CN`
- `HK` / `MO` / `TW` and every other code → `region: "overseas"`

## Endpoint

Production (dedicated custom domain):

```
https://geo.lancloudtech.com/
```

The website release builder replaces the legacy workers.dev URL in the approved source and bounds lookup to 3 seconds with AbortController. On timeout or failure the visitor remains on the current host. Manual `?host=` and cached choices are handled before any network request.

Also accepts `GET /api/geo`. Response:

```json
{ "country": "HK", "region": "overseas", "hostHint": "global" }
```

## Deploy

```bash
source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
npx wrangler deploy --config workers/geo/wrangler.toml
```

The custom-domain binding is recorded in `wrangler.toml`; do **not** bind this Worker to apex/www homepage or zone path routes.
