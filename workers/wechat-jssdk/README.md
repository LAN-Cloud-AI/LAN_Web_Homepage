# lan-wechat-jssdk

Cloudflare Worker that signs WeChat Official Account JS-SDK configs for `lancloudtech.com`.

Site DNS is **grey-cloud** (direct to origin Nginx). The browser calls this Worker on **workers.dev**, not via a zone path route.

## Endpoint

Production (used by [`wechat-share.js`](../../wechat-share.js)):

`GET https://lan-wechat-jssdk.mingxuan400.workers.dev/api/wechat/jssdk?url=<encoded absolute page URL without hash>`

Also accepts path `/jssdk` for local `wrangler dev`.

Returns:

```json
{
  "appId": "...",
  "timestamp": 1710000000,
  "nonceStr": "...",
  "signature": "..."
}
```

Signed page URLs must be `https://lancloudtech.com` or `https://www.lancloudtech.com` (no hash).

## Secrets

Local / agent truth source:

```bash
# ~/.config/lanxin/env/wechat/oa.env
WECHAT_OA_APP_ID=...
WECHAT_OA_APP_SECRET=...
```

```bash
source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
npx wrangler secret put WECHAT_OA_APP_ID --config workers/wechat-jssdk/wrangler.toml
npx wrangler secret put WECHAT_OA_APP_SECRET --config workers/wechat-jssdk/wrangler.toml
```

## Deploy

```bash
source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
# Always pass --config so root wrangler.jsonc (lan-homepage assets) is not used.
npx wrangler deploy --config workers/wechat-jssdk/wrangler.toml
```

Optional KV cache:

```bash
npx wrangler kv namespace create WECHAT_CACHE
# paste id into wrangler.toml, uncomment [[kv_namespaces]], redeploy
```

## WeChat admin checklist

1. 公众平台 → 设置与开发 → 公众号设置 → 功能设置 → JS接口安全域名：`lancloudtech.com`
2. 使用**已认证公众号** AppID/AppSecret（不是小程序）
3. 真机在微信内打开页面 → ··· → 发送给朋友 / 分享到朋友圈

Until secrets are set, the Worker returns `503 not_provisioned` and the site silently falls back to static OG cards.
