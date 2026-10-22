# 小而美改版 · 正式发布记录（2026-10-23）

2026 年 10 月 23 日 01:48（北京时间），已将用户批准的 TDesign 改版切换为正式官网。国内仍由阿里云 Nginx 提供 HTML，静态资源通过阿里云 CDN 分发；海外仍使用原 Cloudflare Pages 项目。上线使用批准版本的文案、Logo、HarmonyOS Sans SC 字体和视觉资产。

## 生产版本

| 项目 | 已上线配置 |
| --- | --- |
| 国内官网 | https://lancloudtech.com/ |
| 海外官网 | https://global.lancloudtech.com/ |
| 国内静态资源 | https://img.lancloudtech.com/ |
| 地域识别 | https://geo.lancloudtech.com/ |
| 发布标识 | `compact-be0e1c4c7667c74f` |
| 批准设计提交 | `e79be5b12d660fb44e0df78af3698efc7472d57b` |
| 已部署生产代码 | `a2cffdacd373ce371bc3dddd94954728640e575f` |
| Pages 项目 | `lan-homepage-global` |
| Pages 生产部署 | `9a0e837c-64e4-4fe7-93e9-31c24c1eb877` |
| 国内活动路径 | `/var/www/lancloudtech-current` → `/var/www/lancloudtech-releases/compact-be0e1c4c7667c74f` |

后续文档与验收证据提交不改变上述已部署代码。`site/` 是正式站唯一源码，来源及导入摘要见 `site-source.json`；不再运行旧版页面生成器覆盖当前设计。

## 国内 CDN 与海外分发

- 国内完整静态依赖图共 292 个对象，使用不可变前缀 `lanxin/webpage/releases/compact-be0e1c4c7667c74f/`，覆盖 CSS、JS、Three.js 模块、图片、Logo、字体及许可证。
- 已启用版本路径一年缓存、跨域资源 CORS、gzip、Brotli；HTML 保持重新验证，避免版本切换后长期读取旧页面。
- 48 个首页关键资源预热任务全部完成。全量对象验证 HTTP 状态、MIME、长度、SHA-256 元信息与缓存头；另下载 5 个代表性文件核对完整摘要，含 20,617,156 字节字体，字体 Range 请求返回 206。
- 海外发布完整同源资源包到现有 Pages 项目，避免依赖国内 CDN。国内为 canonical 索引源；海外副本使用 `noindex, follow`。
- 原主域、www、global、img 的 DNS 分工不变。为既有 `lan-geo` Worker 添加 `geo.lancloudtech.com` 专用域名，替换大陆不可达的历史 workers.dev 请求地址。客户端限时 3 秒，失败留在当前站点。
- 地域分流保留路径、查询与锚点，继续支持 `?host=cn` / `?host=global` 手动选择。国内预览海外站可用 https://global.lancloudtech.com/?host=global 。

## 上线验收

| 检查 | 结果 |
| --- | --- |
| 两地主机 HTTP 验收 | 82 / 82 通过，0 失败 |
| 三语公开路由 | sitemap 的 27 条路由 × 2 主机，共 54 个页面 |
| 404、旧入口及规范化跳转 | 真实 404 与 www、index、preview、LeadsHunter 跳转通过 |
| 国内资源 | 292 / 292 对象可访问，48 / 48 预热完成 |
| 国内发布文件 | 332 / 332 远端 SHA-256 校验通过，Nginx 配置与上线健康检查通过 |
| 生产构建及地域逻辑 | 7 项测试通过；两套包 62 个 HTML、2210 个资源引用完整性通过 |
| 正式域浏览器抽检 | 国内深浅主题、海外英文页面，HarmonyOS 字体已加载，Hero 使用 WebGL，0 破图、无横向溢出 |
| 联系交互 | 培训方向切换、企业微信 inquiry 参数及邮件主题正确 |
| 地域识别 | 本机与大陆源站均返回 CN / mainland / cn，分别约 607ms、821ms |
| 生产元信息与统计 | Demo 浮标移除，canonical / robots / sitemap 保留，单套既有统计与事件脚本 |

机器可读证据在 [`release-evidence/`](../release-evidence/)：`live-http.json`、`cdn-http.json`、`cdn-upload.json`、`cdn-prewarm-status.json`、`pages-deploy.json`、`origin-deploy.json`、`geo-live.json`、`live-geo-controller.json`、`browser-qa.json`。这些记录是本次发布时的快照，不代表持续监控。

## 回滚目标

### 回到改版前正式站

旧官网目录 `/var/www/lancloudtech.com` 仍完整保留，旧正式提交为 `6c65f3df7c6f1f1fd87b920cfad1ea25a0a62ccf`。

- 旧站归档：`/var/backups/lancloudtech/pre-compact-20261023-0122.tar.gz`
- 归档 SHA-256：`ff1f912819b2a57e09855420c3b6c82f9bcd5e9bb982cf106ee589be19a910e4`
- 初始 Nginx 配置备份：`/var/backups/lancloudtech/nginx-pre-compact-20261023-0122.conf`
- 改版前 Pages 生产部署：`ffc76cd9-68f4-4a35-a286-27509a55088c`

需要回滚时，将初始 Nginx 配置恢复到 `/etc/nginx/sites-available/lancloudtech.com`，核实指向仍保留的旧目录，通过 `nginx -t` 后重载；同时将 Pages 回滚到上述旧生产部署。随后复核两地主域及三语路径。无需修改正式域 DNS、删除 CDN 对象或重置统计。

### 仅回到上一版改版构建

上一构建目录 `/var/www/lancloudtech-releases/compact-7b25d9772a65604c` 保留，最终切换前配置备份为 `/var/backups/lancloudtech/20261022-174831`。对应 Pages 部署为 `88883662-c110-4cad-a453-17dda302e33f`。此版本尚未修复旧地域识别地址，应优先保留当前版本；仅在明确需要回退本次地域修复时使用。

回滚操作必须使用本记录的目标，不能套用其他历史发布记录的备份或部署 ID。旧 CDN 发布前缀继续保留，支持已缓存文档和回滚访问。
