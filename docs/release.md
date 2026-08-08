# 发布运行手册

## 目标

将已验证的官网静态资源发布到阿里云源站 `8.148.22.108`（SSH 别名 `lanxin-official`），由本机 Nginx 提供静态文件与 HTTPS（Let’s Encrypt）；Cloudflare **仅 DNS（灰云）**，访客直连源站。

## 架构

- DNS：Cloudflare `lancloudtech.com` / `www` → A `8.148.22.108`，**DNS only（灰云）**
- HTTPS：源站 Let’s Encrypt（RSA，`certbot.timer` 自动续期）
- 站点根：`/var/www/lancloudtech.com`
- 内容：`scripts/prepare-worker-assets.mjs` 产出的 `dist/`（排除 mocks、prompts、docs 等）
- 图片：阿里云 OSS（不经 CF，见 `docs/oss.md`）
- 微信 JS-SDK：Cloudflare Worker `lan-wechat-jssdk` 的 **workers.dev** URL（灰云下不再使用 zone 路径路由）

## 常规流程

1. 在本地运行 README 中的验证命令，并确认 `git diff --check` 没有输出。
2. 明确本次提交只包含生产代码、实际引用的图片和可追溯 Prompt；不要提交 `mocks/`、`images/prototypes/`、Python 缓存或本地 QA 截图。
3. 同步图片到 OSS，再打包并校验：

   ```bash
   node scripts/oss/cli.mjs sync-website-images
   node scripts/prepare-worker-assets.mjs
   node scripts/verify-worker-assets.mjs
   ```

   HTML 中的图片路径应指向
   `https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images/...`
   （可用 `node scripts/oss/rewrite-html-assets.mjs` 批量改写）。`dist/` 不再打包本地 `images/generated|logo|contact`。

4. 同步到源站：

   ```bash
   rsync -avz --delete dist/ lanxin-official:/var/www/lancloudtech.com/
   ```

5. 用正式域名验证：

   - `https://lancloudtech.com/`
   - `https://lancloudtech.com/leadshunter/`
   - `https://lancloudtech.com/internal-expense/`
   - `https://lancloudtech.com/contact/wecom/`
   - `https://lancloudtech.com/ai-course/`
   - 页脚备案号可见
   - 各路由 `<head>` 的 `og:image` 指向 OSS `.../images/generated/share/og-*-v2.png`（互不相同）

## 微信分享卡片

1. **链接预览卡**：靠各页静态 `og:*` + `itemprop`；抓取器不跑 JS。改封面必须换版本化文件名（如 `og-home-v2.png`）并更新 HTML / `share-meta.js`，否则微信会强缓存旧图。
2. **微信内自定义分享**：前端 `wechat-share.js` → `GET https://lan-wechat-jssdk.mingxuan400.workers.dev/api/wechat/jssdk?url=...`（见 `workers/wechat-jssdk/`）。
3. 部署签名 Worker（与静态站分开）：

   ```bash
   source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
   # 首次：写入 ~/.config/lanxin/env/wechat/oa.env，并 wrangler secret put WECHAT_OA_APP_ID / WECHAT_OA_APP_SECRET
   npx wrangler deploy --config workers/wechat-jssdk/wrangler.toml
   ```

4. 公众号后台把 `lancloudtech.com` 配进 **JS接口安全域名**；密钥不得进仓库。未配置密钥时接口返回 `503`，前端静默降级为 OG 预览卡。
5. 真机验收：微信内打开各路由 → ··· → 发送给朋友 / 分享到朋友圈；另把链接发给文件传输助手检查预览卡。

## 缓存策略

Nginx 对 HTML / JS / CSS 使用短缓存或 `must-revalidate`。图片主要在 OSS。图片内容有变化时，优先使用带版本或内容哈希的新文件名，并同步更新 HTML 引用。微信分享预览卡缓存很强，务必版本化 `og:image` 文件名。

## Cloudflare 角色

- **灰云 DNS only**：`lancloudtech.com` / `www` → A `8.148.22.108`，`proxied: false`；访客 TLS 直连源站。
- **不要**给 Worker `lan-homepage` 重新绑定正式域名。
- 微信 JS-SDK 签名使用独立 Worker `lan-wechat-jssdk` 的 **workers.dev** 地址（不绑 zone 路径路由）。
- DNS 脚本：`source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage` 后执行 `CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`（灰云）或省略/`CF_PROXIED=true`（橙云回滚）。新建 Token 用 `CLOUDFLARE_BOOTSTRAP_API_TOKEN`。

## 证书与运维

- 证书目录：`/etc/letsencrypt/live/lancloudtech.com/`
- 续期：`certbot.timer`（系统已启用）；必要时手动 `certbot renew --dry-run`
- Nginx 站点：`/etc/nginx/sites-available/lancloudtech.com`
- 日志：`/var/log/nginx/lancloudtech.*.log`
- 资源机（约 1.6G RAM）：仅跑 Nginx 静态站，不跑 Docker / Node 常驻进程

## 失败处理

- `rsync` 失败：检查 SSH 别名 `lanxin-official` 与密钥，确认目标目录权限为 `www-data` 可读。
- HTTPS 异常：`nginx -t` 后 `systemctl reload nginx`；确认安全组放行公网 80/443；灰云下 `curl -IIhttps://lancloudtech.com` 应见 `Server: nginx`。
- 证书续期失败：Let’s Encrypt HTTP-01 需能直连源站 80。查 `/var/log/letsencrypt/letsencrypt.log`。续期保持 `key_type = rsa`，避免再签易触发旧橙云 525 的 ECDSA/YE 链。
- 本机 dig 若出现 `198.18.x` Fake-IP，改用未劫持的公共 DNS、源站上 dig，或 `curl --resolve lancloudtech.com:443:8.148.22.108`。

## 回滚

1. 恢复橙云：`CF_PROXIED=true node scripts/cf-dns-point-origin.mjs`（需同时恢复 Worker zone 路由，并把 `wechat-share.js` 改回同源 `/api/wechat/jssdk`）。
2. 源站 Nginx / OSS 可保留。
