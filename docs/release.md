# 发布运行手册

本文维护新版全量发布流程：根目录源码是唯一公开站点，构建后整体发布 `dist/`。`legacy-site/` 仅作离线 Git 存档，不发布；`/preview` 及子路径 301 到对应正式根路径，保留路径与查询参数。页面不再提供版本切换或暂停动效按钮。

本次上线结果、线上验收和回滚目标见 [2026-09-14 全量发布记录](full-launch-release-2026-09-14.md)。本文维护配置与操作要求；[2026-09-13 预上线记录](prelaunch-release-2026-09-13.md) 仅供历史追溯，不代表当前发布模式。

最新增量发布见 [2026-09-14 配图与联系区更新](visual-contact-release-2026-09-14.md)。

## 目标

将已验证的官网静态资源发布到：

1. **大陆主域**：阿里云源站 `8.148.22.108`（SSH 别名 `lanxin-official-direct`），Nginx + Let’s Encrypt；Cloudflare **灰云 DNS**，访客直连源站。
2. **海外子域**：`global.lancloudtech.com` → Cloudflare Pages 项目 `lan-homepage-global`（橙云）；仅 `CN` 留主域，**港澳台与其它地区算海外**。

## 架构

- DNS：`lancloudtech.com` / `www` → A `8.148.22.108`，**DNS only（灰云）**
- DNS：`global.lancloudtech.com` → CNAME `lan-homepage-global.pages.dev`，**proxied（橙云）**
- HTTPS：源站 Let’s Encrypt（RSA）；Pages 由 Cloudflare 托管证书
- 站点根（源站）：`/var/www/lancloudtech.com`
- Nginx 配置真相源：[`ops/nginx/lancloudtech.com.conf`](../ops/nginx/lancloudtech.com.conf)；安装 `npm run nginx:apply`（SSH `lanxin-official-direct`）。`www` 301 到 apex；未知路径真 404；`/leadshunter` 301 到线索猎手官网。
- 内容：`scripts/prepare-worker-assets.mjs` 产出仅含当前站点的 `dist/` 根树；没有公开的 legacy 或 preview 副本。`prepare-pages-assets.mjs` 额外给国际 Pages 写入 `_headers`：`X-Robots-Tag: noindex, follow`。
- 图片 / 国内课程下载包：阿里云 OSS + CDN `img.lancloudtech.com`（Cloudflare **灰云**，不经 CF 代理；见 `docs/oss.md`）
- 海外课程下载包：Cloudflare R2 `files.lancloudtech.com`（橙云，桶 `lan-ai-course`；`npm run dns:files`）
- 分流：前端 [`geo-host.js`](../geo-host.js) + Worker `lan-geo`（`https://lan-geo.mingxuan400.workers.dev/`）；微信/爬虫不跳；`?host=cn|global` 可覆盖
- 微信 JS-SDK：Worker `lan-wechat-jssdk` 的专用域 `wechat.lancloudtech.com`（主站仍走 Nginx）
- SEO：主域正常公开页允许索引，国际地理副本 noindex；canonical / hreflang / sitemap 统一指向 apex `https://lancloudtech.com`。404 保持真实状态码和 noindex。
- 共享页面结构：`scripts/site-shell.mjs` 与 `scripts/apply-site-shell.mjs` 生成同一导航和页脚，`site-shell.js` / `.css` 负责交互和布局。页脚与汉堡菜单都提供语言、系统 / 白天 / 黑夜选择。
- 主题：`site-theme.js` 使用 `lancloud.theme` 和 Domain=lancloudtech.com 的 `lancloud_theme` cookie；CSS、图片和粒子共享 `html[data-theme]` 与 `lan:theme-change`。LeadsHunter 独立部署时保留相同协议。
- 动效：默认开启，取消全局与 Hero 暂停按钮，保留重播；系统减少动效、节省流量或 WebGL 不可用时自动回退，离屏及后台暂停计算。

## 常规流程

1. 运行 `npm run build:company`：打包动效 → 生成公司三页 → 应用 site-shell → 同步 SEO → 生成三语页面与三语粒子 404 → 更新 sitemap。再运行 README 中的验证命令，确认 `git diff --check` 没有输出。不要只替换生成的首页，漏掉共享导航或语言产物。
2. 明确本次提交只包含生产代码、实际引用的图片和可追溯 Prompt；不要提交 `mocks/`、`images/prototypes/`、Python 缓存或本地 QA 截图。
3. 同步图片到 OSS，再打包并校验：

   ```bash
   node scripts/oss/cli.mjs sync-website-images
   node scripts/prepare-worker-assets.mjs
   node scripts/verify-worker-assets.mjs
   ```

   HTML 中的图片路径应指向
   `https://img.lancloudtech.com/lanxin/webpage/images/...`
   （可用 `node scripts/oss/rewrite-html-assets.mjs` 批量改写）。`dist/` 不打包本地 `images/generated|logo|contact`。

   打包流程自动调用 `scripts/fingerprint-assets.mjs`：根据本次 JS / CSS 集合生成统一指纹，输出带指纹的文件并改写 HTML 与模块依赖；同时保留无指纹基础文件，供仍使用稳定文件名的已缓存客户端访问。不要手工改写指纹或混用不同候选包。

4. 备份当前国内目录与 Nginx 配置，记录国际站上一条成功生产部署。Nginx 路由配置变更时先运行 `npm run nginx:apply` 并确认配置检查通过；随后同步源站和海外 Pages（geo Worker / DNS 仅在相关配置变更时操作）：

   ```bash
   rsync -avz --delete --delay-updates dist/ lanxin-official-direct:/var/www/lancloudtech.com/
   npm run deploy:geo-worker          # 首次或 Worker 有变更
   npm run deploy:pages               # 自动读 ~/.config/lanxin/env/cloudflare/pages.env
   npm run dns:global                 # 首次或 DNS 漂移时（同上 pages.env）
   npm run dns:img                    # 确认 img.lancloudtech.com 保持灰云 → 阿里云 CDN
   npm run dns:files                  # 确认 files.lancloudtech.com → R2（橙云）
   ```

5. 用正式域名验证：

   - `https://lancloudtech.com/robots.txt` 与 `https://lancloudtech.com/sitemap.xml`
   - `https://lancloudtech.com/sitemap/`
   - `https://lancloudtech.com/`（直接为新版，允许 index，无旧版/暂停按钮）
   - `/preview/`、`/preview/solutions/?host=cn` 等旧链接 301 到对应正式路由并保留查询参数
   - 任意不存在的根路径与嵌套路径返回美化粒子 404，状态码为 404，菜单不误选中正常页面
   - `https://global.lancloudtech.com/`（海外；响应头含 `X-Robots-Tag: noindex`）
   - `https://lan-geo.mingxuan400.workers.dev/` 返回 `region`
   - `https://lancloudtech.com/leadshunter/`（应 301 / 跳转到 `https://leadshunter.lancloudtech.com/`）
   - `https://leadshunter.lancloudtech.com/`
   - `https://lancloudtech.com/internal-expense/`
   - `https://lancloudtech.com/contact/wecom/`
   - `https://lancloudtech.com/ai-course/`
   - 页脚备案号可见；桌面与汉堡导航顺序、当前页标识、跳转语言一致
   - 页脚和汉堡菜单的系统 / 白天 / 黑夜选择同时切换 CSS、图片与粒子；跨公司子域保留主题偏好
   - Hero 图形阶段与进度线同步，重播与阶段跳转正常，减少动效时内容仍完整
   - 各路由 `<head>` 的 `og:image` 指向 OSS `.../images/generated/share/og-*-v3.jpg`（各正式路由独立；历史 v2 素材只作存档）
   - 分流：大陆留主域；港澳台/海外进 global；微信 UA 不跳；canonical 仍为 apex

## SEO / 网站地图

1. 路由真相源：`site-seo.js` 的 `PUBLIC_ROUTES`（与 `share-meta.js` 路径对齐，另含 `/sitemap/`）。
2. 变更公开路由、共享结构或文案后执行 `npm run build:company`，再 `npm run seo:verify`。单独修改 SEO 源配置可用 `npm run seo:sync`，它同步 head、生成 `/en/` / `/zh-Hant/` 与 404、重写 `sitemap.xml`。不要手改语言产物；正文翻译脚本不得在运行时重写静态 SEO 元信息。
3. 生产需可访问：`/robots.txt`、`/sitemap.xml`、`/sitemap/`；canonical 一律使用 apex `https://lancloudtech.com`。
4. 线索猎手独立官网 `https://leadshunter.lancloudtech.com/` 由 `LH_WebPage` 单独部署；公司站只保留首页产品卡、页脚与网站地图索引，以及 `/leadshunter/` 跳转。
5. 公开站欢迎 AI 抓取与训练：`robots.txt` 写 `ai-train=yes` 并显式 Allow GPTBot / ClaudeBot / Google-Extended / Bytespider 等。`llms.txt` 是给模型的站点大纲。课件 ZIP 仍排除：`npm run files:robots` 把 ZIP-only robots 发到 `files.lancloudtech.com` 与 `img.lancloudtech.com`。橙云 AI Crawl Control 保持 Block 关闭；不要再打开托管 robots。`global.lancloudtech.com` 继续 `noindex`（地理副本，不作为收录源）。
6. 路由调整须在国内 Nginx 与国际发布包同时落地；抽检 `www` / `/index.html` / `/leadshunter/` 与旧 `/preview` 路径均为预期 301，乱路径为真 404，`/en/` 与 `/zh-Hant/` 的 lang / title / hreflang 正确。LeadsHunter 按独立仓库发布流程部署；只有爬虫配置有变更时才运行 `npm run cf:ai-crawlers`。
7. 公开路由变更后推百度普通收录：`npm run seo:baidu`（token 在 `~/.config/lanxin/env/baidu/ziyuan.env`）。新站日配额很小，先推简体：`npm run seo:baidu -- --zh-only`。

## 访问统计（Umami）

- **书签入口**（不要写进官网导航、页脚、sitemap 或 `llms.txt`）：`https://stats.lancloudtech.com`
- 把该 URL 存进 1Password / 浏览器书签。页面上不放「统计」链接。
- 打开后直接进 Umami 自带登录。管理员账号在 `~/.config/lanxin/env/umami/ops.env`（`UMAMI_ADMIN_USERNAME` / `UMAMI_ADMIN_PASSWORD`）。不要把密码写进仓库或聊天。
- 统计域不再套 Cloudflare Access；控制台只靠 Umami 登录。`npm run cf:access-stats` 会清掉 `stats` 上残留的 Access 应用。
- 收集脚本 `/u.js` 与接口 `/api/a` 保持公开。
- 首次或重建：`npm run umami:apply`（源站 Docker + 证书 + 四个 website id）→ `npm run seo:sync` 后按上面顺序发布。
- `dns:stats` 默认橙云指向源站 `8.148.22.108`。签发证书时脚本会先灰云再切回橙云。
- 沿用既有 LAN website ID，不新增站点或重复发送器；正式业务事件使用 `site_version: current`，保留语言与咨询主题字段，版本切换事件退役。具体口径见 [事件说明](website-events.md)。
- 上线抽检：`npm run seo:live`（含 `/u.js` 200、公开页埋点、课件 ZIP 训练 UA 403）。无痕打开页面后核实单次自动 PV；业务点击只产生一次对应事件，并确认 Realtime / 实际入库。

## 微信分享卡片

1. **链接预览卡**：靠各页静态 `og:*` + `itemprop`；抓取器不跑 JS。改封面必须换版本化文件名（如 `og-home-v3.jpg`）并更新 HTML / `share-meta.js`，否则微信会强缓存旧图。
2. **微信内自定义分享**：前端 `wechat-share.js` → `GET https://wechat.lancloudtech.com/api/wechat/jssdk?url=...`（见 `workers/wechat-jssdk/`）。
3. 部署签名 Worker（与静态站分开）：

   ```bash
   source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
   # 首次：写入 ~/.config/lanxin/env/wechat/oa.env，并 wrangler secret put WECHAT_OA_APP_ID / WECHAT_OA_APP_SECRET
   npx wrangler deploy --config workers/wechat-jssdk/wrangler.toml
   ```

4. 公众号后台核实 `lancloudtech.com` 与 `global.lancloudtech.com` 均在 **JS接口安全域名**（使用 www 访问时也需核实对应域）；密钥不得进仓库。未配置密钥时接口返回 `503`，前端静默降级为 OG 预览卡。
5. 真机验收：微信内打开各路由 → ··· → 发送给朋友 / 分享到朋友圈；另把链接发给文件传输助手检查预览卡。

## 缓存策略

HTML 应重新验证，正式文档引用本次打包生成的 JS / CSS 发布指纹，所有模块依赖保持同一发布版本；无指纹基础文件继续提供，以兼容此前缓存 HTML 的稳定引用。不要把基础文件改成不可更新的长期缓存，也不要只部署 HTML。具体 HTTP 缓存头以 Nginx 与 Pages 配置为准。

图片主要在 OSS；内容变化时使用带版本或内容哈希的新文件名，并同步更新 HTML 引用。微信分享预览卡缓存很强，必须版本化 `og:image` 文件名。

## Cloudflare 角色

- **灰云 DNS only（主域）**：`lancloudtech.com` / `www` → A `8.148.22.108`，`proxied: false`；访客 TLS 直连源站。
- **橙云 Pages（海外）**：`global.lancloudtech.com` → Pages `lan-homepage-global`；`npm run dns:global`。
- **橙云 R2（海外课件）**：`files.lancloudtech.com` → 桶 `lan-ai-course`；`npm run dns:files`。不要把约 39MB 的课件放进 Pages。
- **不要**给 Worker `lan-homepage` 重新绑定正式主域。
- Geo：`lan-geo` workers.dev；微信 JS-SDK：`lan-wechat-jssdk` 的专用域 `wechat.lancloudtech.com`；部署保留既有 API 路由，不绑定主页通配。
- DNS 脚本：`source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage` 后执行 `CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`（主域灰云）、`npm run dns:img`（`img` 灰云直连阿里云 CDN）、`npm run dns:global`（海外子域）或 `npm run dns:files`（海外课件 R2）。新建 Token 用 `CLOUDFLARE_BOOTSTRAP_API_TOKEN`。

## 证书与运维

- 证书目录：`/etc/letsencrypt/live/lancloudtech.com/`
- 续期：`certbot.timer`（系统已启用）；必要时手动 `certbot renew --dry-run`
- Nginx 站点：`/etc/nginx/sites-available/lancloudtech.com`
- 日志：`/var/log/nginx/lancloudtech.*.log`
- 资源机（约 1.6G RAM）：仅跑 Nginx 静态站，不跑 Docker / Node 常驻进程

## 失败处理

- `rsync` 失败：检查 SSH 别名 `lanxin-official-direct` 与密钥，确认目标目录权限为 `www-data` 可读。
- HTTPS 异常：`nginx -t` 后 `systemctl reload nginx`；确认安全组放行公网 80/443；灰云下 `curl -IIhttps://lancloudtech.com` 应见 `Server: nginx`。
- 证书续期失败：Let’s Encrypt HTTP-01 需能直连源站 80。查 `/var/log/letsencrypt/letsencrypt.log`。续期保持 `key_type = rsa`，避免再签易触发旧橙云 525 的 ECDSA/YE 链。
- 本机 dig 若出现 `198.18.x` Fake-IP，改用未劫持的公共 DNS、源站上 dig，或 `curl --resolve lancloudtech.com:443:8.148.22.108`。

## 回滚

发布前备份国内站点与 Nginx 配置，记录国际站上一条成功生产部署。内容回滚恢复备份并验证 Nginx，再将 Pages 回滚到记录的生产部署；两地正式域复核后完成。实际备份位置、提交和 Pages 部署标识写入对应发布记录；[预上线记录](prelaunch-release-2026-09-13.md) 只说明历史发布，不可直接假定为本次回滚目标。

内容回滚不应改变 DNS、橙灰云或 Worker 绑定，也不应重置 Umami。基础设施迁移是单独的运维任务。
