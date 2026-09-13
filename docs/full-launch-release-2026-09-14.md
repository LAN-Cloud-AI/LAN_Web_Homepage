# 官网全量发布记录（2026-09-13 至 2026-09-14）

本次将新版直接发布到正式根路径，完成国内、国际与线索猎手官网主题联动。旧站不再对外提供；仓库的 `legacy-site/` 仅作离线历史归档。

## 发布版本

- 公司站代码：`daebc24826f9c124e8b1e8fdbee8299ea3712f94`，已推送 `main` 与 `codex/website-business-redesign`。
- 国内：`https://lancloudtech.com/`，阿里云 Nginx 源站 `/var/www/lancloudtech.com/`，发布包同步并通过 `nginx -t` 后重载。
- 国际：`https://global.lancloudtech.com/`，Cloudflare Pages 项目 `lan-homepage-global`，生产部署 `d8e2836e-31e8-4eba-9a94-2ef3ec520f32`，API 确认 production / success，提交对应上述公司站代码。
- 线索猎手：`https://leadshunter.lancloudtech.com/`，代码 `f41485d8596bc760bd3e4b304b491429bdd27d3c`，已推送 `main` 与工作分支；生产部署 `ab830f4a-22ef-4290-a554-be51aa084bf1`。
- 公司站 JS / CSS 发布指纹 `298862b82485`；线索猎手首帧主题脚本 `theme-init.cec6335dfa52.js`。新 HTML 引用指纹资源，避免旧边缘缓存阻碍升级。
- 新增配图及变体已同步 OSS，本次图片同步共处理 195 个文件；抽查新浅深 WebP 均返回 200。

## 上线内容

- 9 个公开路由 × 3 种语言统一主菜单、当前位置、页脚、语言切换与移动菜单；课程保留相关内容导航。
- 页脚和汉堡菜单提供跟随系统 / 白天 / 黑夜；通过 `lancloud.theme` 与共享偏好 cookie `lancloud_theme` 在官网、国际站和线索猎手之间延续选择。颜色、响应式配图与粒子同时切换。
- Hero 场景和三段进度共用 `company-motion-timeline.js`，重播、选幕、后台和离屏恢复保持同步。
- 动效正常环境默认开启，移除首屏与全局暂停按钮；仍尊重系统减少动态效果和节省流量，保留静态兜底。
- 正式根路径只包含新版；`/preview`、`/preview/` 和子路径通过 301 去掉预览前缀，保留路径和查询参数。无旧版返回按钮。
- 404 使用三语正文、统一导航、浅深主题和玉色粒子数字；未知深层路径保留真实 HTTP 404，页面不进入 sitemap。
- 课程运行时不再覆盖静态 SEO；正式主域保持 index，国际地理副本保持 noindex，canonical 和 hreflang 统一指向主域。
- Umami 原网站 ID 与业务事件名保持不变，当前事件标记为 `site_version: current`，退役版本切换事件不再产生。

## 验收

- 国内、国际共 54 个公开页面逐页检查：HTTP 200、标题、描述、语言、canonical、hreflang、OG 分享图、JSON-LD、菜单和主题资源均正确。
- 两个域的旧预览链接均 301 并保留查询参数；三个语言的未知嵌套地址均真实 404。
- 55 项动效、主题、404、微信运行时和签名 Worker 测试通过；线索猎手 11 项主题测试通过。
- 构建、SEO、27 个静态分享元信息、导航、发布资产、业务事件和路由检查通过；33 条指纹化模块导入均指向存在的文件。
- 实际浏览器检查电脑与手机菜单、浅深配图、Hero 重播与进度、粒子 404。没有暂停或旧版按钮，没有横向溢出。
- 正式浏览器往返确认：主域白天 → 线索猎手白天；线索猎手黑夜 → 国际站黑夜 → 主域黑夜。测试后恢复跟随系统。
- 实际浏览器点击产品与方案产生一次 `solutions_overview` 请求，原 LAN 网站 ID、`site_version: current`、`language: zh-Hans` 正确，统计接口返回 200；随后目标页自动 PV 返回 200。未运行制造测试页面 PV 的旧 `seo:live` 脚本。
- 通过只读事务抽查 Umami PostgreSQL 实际入库：最近三条 `solutions_overview` 的 `site_version` 均为 `current`，中英文语言标记对应正确；最新样本同一访问在相邻 10 秒内记录一次业务点击和一次目标页 PV。

## 回滚资料

- 国内发布前备份：`lanxin-official-direct:/var/backups/lancloudtech/20260913-153749/site.tar.gz`。
- 国内配置备份：同目录 `nginx.conf`。
- 国际上一条成功生产部署：`541688ca-a81b-44d9-9834-61cda78aefbb`，代码 `47979b4e7dde322d327ab6f49840946b05910540`。
- 如确需回滚，恢复国内静态目录与配置、验证 Nginx，再回滚国际 Pages 到上述部署。无需修改 DNS、统计服务或 Worker 绑定。

本记录是部署后的文档补充，不改变已发布的运行代码或资源指纹。
