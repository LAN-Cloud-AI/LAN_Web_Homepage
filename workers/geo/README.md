# lan-geo

Lightweight Cloudflare Worker that exposes the visitor country for host steering between:

- `https://lancloudtech.com` (Aliyun origin, grey-cloud DNS)
- `https://global.lancloudtech.com` (Cloudflare Pages)

## Rules

- `region: "mainland"` only when `CF-IPCountry` / `request.cf.country` is `CN`
- `HK` / `MO` / `TW` and every other code → `region: "overseas"`

## Endpoint

Production (workers.dev):

```
https://lan-geo.mingxuan400.workers.dev/
```

Also accepts `GET /api/geo`. Response:

```json
{ "country": "HK", "region": "overseas", "hostHint": "global" }
```

## Deploy

```bash
source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
npx wrangler deploy --config workers/geo/wrangler.toml
```

Do **not** bind this Worker to the production zone path routes.
