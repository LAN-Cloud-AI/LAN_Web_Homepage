# 页脚字体说明移除 · 生产发布（2026-10-23）

按用户要求，移除全站页脚的“字体：HarmonyOS Sans SC”及英文、繁体对应说明。共修改 31 个 HTML 文件，覆盖三语普通页面、404 与历史产品跳转页；字体声明、文件与许可证保留。生产 `site/` 和原设计工作区 `dist/` 均已同步移除；未发现运行时重新注入说明的逻辑。

## 已上线

- 国内：https://lancloudtech.com/ ，活动版本 `compact-ad2aff2888034b54`，2026-10-23 11:36 北京时间完成。
- 海外：https://global.lancloudtech.com/ ，Cloudflare Pages 项目 `lan-homepage-global`，生产部署 `247117d9-d929-424a-be72-85338ce2958f`。
- 部署代码：`fec92cfffb6c3ce2dfa6dc9fbef40ecf6d8aa075`。
- 国内 CDN 完整新前缀：`https://img.lancloudtech.com/lanxin/webpage/releases/compact-ad2aff2888034b54/`。292 个对象上传并验证，332 个源站文件远端校验通过；Nginx 配置测试与切换健康检查通过。

## 验收

- 已确认差异仅为 31 个字体说明段落的删除。
- 7 项现有构建及地域逻辑测试通过；两套发布包 62 个 HTML 文档、2148 个静态引用通过完整性检查。
- 82 项正式域 HTTP 检查全部通过。
- 两地三语正常路由及 404 共 60 个页面均无字体说明，并保留字体样式表。
- 正式站浏览器确认页脚无字体说明、HarmonyOS Sans SC 已加载；截图与结果见 `release-evidence/font-credit-browser.json`。
- CDN 全量对象状态、长度、摘要元信息、CORS 和缓存验证通过；5 个完整文件摘要及字体 Range 206 验证通过。

本次证据：`release-evidence/font-credit-before.json`、`font-credit-live.json`、`font-credit-browser.json`，以及更新后的 `cdn-upload.json`、`cdn-http.json`、`origin-deploy.json`、`pages-deploy.json`、`live-http.json`。早前预热记录保留为首次改版上线的历史快照，其发布标识不属于本次版本。

## 回滚

国内上一活动目录：`/var/www/lancloudtech-releases/compact-be0e1c4c7667c74f`。本次配置与上一目标备份目录：`/var/backups/lancloudtech/20261023-033558`。需要时原子切回上一目录，通过 `nginx -t` 后重载并验活。

海外上一生产部署：`9a0e837c-64e4-4fe7-93e9-31c24c1eb877`。回滚时使用该 Pages 部署，并复核两地正式域。旧 CDN 前缀继续保留，DNS 与既有地域分流分工不变。
