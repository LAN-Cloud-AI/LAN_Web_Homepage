# 发布运行手册

## 目标

将已验证的官网静态资源发布到阿里云源站 `8.148.22.108`（SSH 别名 `lanxin-official`），由本机 Nginx 提供静态文件与源站 HTTPS；Cloudflare 橙云代理提供边缘 CDN / TLS。

## 架构

- DNS：Cloudflare `lancloudtech.com` / `www` → A `8.148.22.108`，**Proxied（橙云）**
- 边缘 HTTPS：Cloudflare；源站回源：SSL/TLS **Full (Strict)**（源站 Let’s Encrypt）
- 站点根：`/var/www/lancloudtech.com`
- 内容：`scripts/prepare-worker-assets.mjs` 产出的 `dist/`（排除 mocks、prompts、docs 等）
- 图片：阿里云 OSS（可不经 CF，见 `docs/oss.md`）

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
   - 页脚备案号可见

## 缓存策略

Nginx 对 HTML / JS / CSS 使用短缓存或 `must-revalidate`。橙云下 Cloudflare 会缓存符合规则的边缘资源；图片主要在 OSS。图片内容有变化时，优先使用带版本或内容哈希的新文件名，并同步更新 HTML 引用。必要时在 Cloudflare Dashboard → Caching → Custom Purge 按 URL 清边缘缓存（不能清浏览器 `immutable` 本地缓存）。

## Cloudflare 角色

- **橙云 CDN**：`lancloudtech.com` / `www` 保持 Proxied；SSL/TLS 模式为 **Full (Strict)**。
- **不要**给 Worker `lan-homepage` 重新绑定正式域名（会抢占 DNS / 路由）。
- 若需用 API 改 DNS：`source ~/.config/lanxin/bin/load-env.sh cloudflare`（`CLOUDFLARE_API_TOKEN` 已含 Zone DNS Write），可运行 `node scripts/cf-dns-point-origin.mjs`（默认 `proxied: true`；`CF_PROXIED=false` 可临时灰云）。新建 Token 用 `CLOUDFLARE_BOOTSTRAP_API_TOKEN`。

## 证书与运维

- 证书目录：`/etc/letsencrypt/live/lancloudtech.com/`
- 续期：`certbot.timer`（系统已启用）；必要时手动 `certbot renew --dry-run`
- Nginx 站点：`/etc/nginx/sites-available/lancloudtech.com`
- 日志：`/var/log/nginx/lancloudtech.*.log`
- 资源机（约 1.6G RAM）：仅跑 Nginx 静态站，不跑 Docker / Node 常驻进程

## 失败处理

- `rsync` 失败：检查 SSH 别名 `lanxin-official` 与密钥，确认目标目录权限为 `www-data` 可读。
- HTTPS 异常：`nginx -t` 后 `systemctl reload nginx`；确认 80/443 安全组放行；Dashboard 确认 SSL 为 Full (Strict)，且 apex/www 仍为橙云指向源站 IP。
- 证书续期失败：Let’s Encrypt HTTP-01 需能直连源站 80；橙云下一般仍可完成（CF 会回源）。查 `/var/log/letsencrypt/letsencrypt.log`。
- 本机 dig 若出现 `198.18.x` Fake-IP，改用公网 DNS 或 `curl --resolve`；橙云时公网 A 记录为 Cloudflare Anycast IP，不是 `8.148.22.108`。

## 回滚

1. 临时绕过 CDN：将 apex / www 改为 DNS only（灰云），仍指向 `8.148.22.108`。
2. 或重新为 `lan-homepage` Worker 绑定自定义域（会离开当前 Nginx 架构）。
3. 源站 Nginx / OSS 可保留。
