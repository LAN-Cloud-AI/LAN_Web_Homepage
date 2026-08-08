# 发布运行手册

## 目标

将已验证的官网静态资源发布到：

1. **大陆主域**：阿里云源站 `8.148.22.108`（SSH 别名 `lanxin-official`），Nginx + Let’s Encrypt；Cloudflare **灰云 DNS**，访客直连源站。
2. **海外子域**：`global.lancloudtech.com` → Cloudflare Pages 项目 `lan-homepage-global`（橙云）；仅 `CN` 留主域，**港澳台与其它地区算海外**。

## 架构

- DNS：`lancloudtech.com` / `www` → A `8.148.22.108`，**DNS only（灰云）**
- DNS：`global.lancloudtech.com` → CNAME `lan-homepage-global.pages.dev`，**proxied（橙云）**
- HTTPS：源站 Let’s Encrypt（RSA）；Pages 由 Cloudflare 托管证书
- 站点根（源站）：`/var/www/lancloudtech.com`
- 内容：`scripts/prepare-worker-assets.mjs` / `prepare-pages-assets.mjs` 产出的 `dist/`（Pages 额外写入 `_headers`：`X-Robots-Tag: noindex, follow`）
- 图片：阿里云 OSS（不经 CF，见 `docs/oss.md`）
- 分流：前端 [`geo-host.js`](../geo-host.js) + Worker `lan-geo`（`https://lan-geo.mingxuan400.workers.dev/`）；微信/爬虫不跳；`?host=cn|global` 可覆盖
- 微信 JS-SDK：Worker `lan-wechat-jssdk` 的 **workers.dev** URL（不绑 zone 路径）
- SEO：canonical / sitemap 仍指向 apex `https://lancloudtech.com`

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

4. 同步到源站，并部署海外 Pages（及首次/变更时的 geo Worker + global DNS）：

   ```bash
   rsync -avz --delete dist/ lanxin-official:/var/www/lancloudtech.com/
   npm run deploy:geo-worker          # 首次或 Worker 有变更
   npm run deploy:pages               # 自动读 ~/.config/lanxin/env/cloudflare/pages.env
   npm run dns:global                 # 首次或 DNS 漂移时（同上 pages.env）
   ```

5. 用正式域名验证：

   - `https://lancloudtech.com/robots.txt` 与 `https://lancloudtech.com/sitemap.xml`
   - `https://lancloudtech.com/sitemap/`
   - `https://lancloudtech.com/`
   - `https://global.lancloudtech.com/`（海外；响应头含 `X-Robots-Tag: noindex`）
   - `https://lan-geo.mingxuan400.workers.dev/` 返回 `region`
   - `https://lancloudtech.com/leadshunter/`
   - `https://lancloudtech.com/internal-expense/`
   - `https://lancloudtech.com/contact/wecom/`
   - `https://lancloudtech.com/ai-course/`
   - 页脚备案号可见
   - 各路由 `<head>` 的 `og:image` 指向 OSS `.../images/generated/share/og-*-v2.png`（互不相同）
   - 分流：大陆留主域；港澳台/海外进 global；微信 UA 不跳；canonical 仍为 apex

## SEO / 网站地图

1. 路由真相源：`site-seo.js` 的 `PUBLIC_ROUTES`（与 `share-meta.js` 路径对齐，另含 `/sitemap/`）。
2. 变更公开路由后执行：`npm run seo:sync`（同步各页 head + 重写 `sitemap.xml`），再 `npm run seo:verify`。
3. 生产需可访问：`/robots.txt`、`/sitemap.xml`、`/sitemap/`；canonical 一律使用 apex `https://lancloudtech.com`。

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

- **灰云 DNS only（主域）**：`lancloudtech.com` / `www` → A `8.148.22.108`，`proxied: false`；访客 TLS 直连源站。
- **橙云 Pages（海外）**：`global.lancloudtech.com` → Pages `lan-homepage-global`；`npm run dns:global`。
- **不要**给 Worker `lan-homepage` 重新绑定正式主域。
- Geo：`lan-geo` workers.dev；微信 JS-SDK：`lan-wechat-jssdk` workers.dev（均不绑 zone 路径）。
- DNS 脚本：`source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage` 后执行 `CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`（主域灰云）或 `npm run dns:global`（海外子域）。新建 Token 用 `CLOUDFLARE_BOOTSTRAP_API_TOKEN`。

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
