# lan-wechat-jssdk

Cloudflare Worker that signs WeChat Official Account JS-SDK configs for `lancloudtech.com`.

Site DNS stays **grey-cloud** (direct to origin Nginx). The new website calls the dedicated Worker domain **wechat.lancloudtech.com**. The existing workers.dev address and apex/www API-only routes remain available for compatibility; no homepage wildcard is added.

## Endpoint

Production (used by [`wechat-share.js`](../../wechat-share.js)):

`GET https://wechat.lancloudtech.com/api/wechat/jssdk?url=<encoded absolute page URL without hash>`

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

Signed page URLs must use `https://lancloudtech.com`, `https://www.lancloudtech.com`, or `https://global.lancloudtech.com` (no hash or embedded credentials). Sign the actual URL including its query string, not the canonical URL. The payload shared by the new website retains `/preview/` and the selected language.

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

Token/ticket cache (configure before provisioning live credentials):

```bash
npx wrangler kv namespace create WECHAT_CACHE
# paste id into wrangler.toml, uncomment [[kv_namespaces]], redeploy
```

## WeChat admin checklist

1. 公众平台 → 设置与开发 → 公众号设置 → 功能设置 → 核实 JS接口安全域名覆盖 `lancloudtech.com` 与 `global.lancloudtech.com`（使用 www 访问时也核实该域）。这里配置网页所在域，不是签名 API 域。
2. 使用**已认证公众号** AppID/AppSecret（不是小程序）
3. 真机在微信内打开页面 → ··· → 发送给朋友 / 分享到朋友圈

Until secrets are set, the Worker returns `503 not_provisioned`. Static OG metadata remains present, but this does not prove WeChat has accepted a custom friend/timeline card. The current provisioning and release state is recorded in [wechat-share-v3.md](../../docs/wechat-share-v3.md).

For agents, pass secrets through subprocess stdin, never command arguments or shell echo. Do not print signatures, tickets, tokens, or credentials when probing; report HTTP status and safe error codes only.

If using an existing authorized Wrangler OAuth session, run from a directory without a project `.env` (for example `/tmp`), pass this config by absolute path, and remove inherited API-token/key/email environment variables. Wrangler reloads the current working directory's `.env`; deleting environment variables alone while staying at the repository root can silently select a different API token. This is an auth selection rule, not a request to log in or grant new permissions.
