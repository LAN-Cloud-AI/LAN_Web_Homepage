# 兰芯云朵官网 · LAN Cloud AI

面向汽车行业 AI 产品、售后解决方案与企业实战培训的三语官网。当前版本是用户批准的“小而美”TDesign 改版，原始导入版本见 `site-source.json`。

- [国内官网](https://lancloudtech.com/)：阿里云 Nginx + 阿里云 CDN。
- [海外官网](https://global.lancloudtech.com/)：Cloudflare Pages，同一套内容。
- [LeadsHunter](https://leadshunter.lancloudtech.com/) / [LeadsHunter Global](https://global-leadshunter.lancloudtech.com/)。

本次改版已于 2026-10-23 正式上线，版本、线上验收证据和回滚目标见 [正式发布记录](docs/compact-production-release-2026-10-23.md)。

## 开发与验证

```bash
npm install
npm run build
npm run verify:production
npm run dev -- --port 18987
```

`site/` 是唯一当前站点源码，含简体、繁体、英文页面，以及完整自托管图片、字体、Three.js 模块。根目录旧站代码、旧页面生成器、`legacy-site/` 仅供历史审计，不参与新站构建。兼容命令 `build:company`、`seo:sync`、`sitemap` 均指向当前构建，不会重建旧版设计。

本地访问 `http://127.0.0.1:18987/`。预览服务读取 `dist-global/` 并去除真实统计脚本，所有静态资产可在本机核查；深浅主题、三种语言和移动端使用同一套适配。

## 发布包

| 产物 | 用途 |
| --- | --- |
| `dist/` | 国内站 HTML；所有静态资源引用阿里云不可变 CDN 发布前缀，同时保留本地静态回退文件 |
| `dist-cdn/` | 完整 CDN 静态资源图，含 CSS、JS、图片、字体、Three.js、许可证 |
| `dist-global/` | 完整海外站，静态资源同源，由 Cloudflare Pages 分发 |
| `release-manifest.json` | CDN 发布前缀、每个对象 key、SHA-256 和文件大小，用于上传与校验 |

发布前缀由规范化源码和构建规则共同哈希得到，重复构建结果一致。发布必须上传整个 CDN 图，保证跨域模块与字体 CORS，再切换国内 HTML。不要覆盖旧发布对象。海外使用 `npm run deploy:pages`，该命令只构建和部署 `dist-global/`，不会覆盖国内包。

构建仅移除演示浮标、演示域名和演示索引限制，并接回生产统计；原有文案与已批准视觉保留。国内允许索引，canonical/hreflang/sitemap 始终以 `https://lancloudtech.com` 为准；海外设置 `X-Robots-Tag: noindex, follow`。HTML 与 JS/CSS 可重新验证缓存，版本化字体和国内发布资源使用长缓存。

## 运行约定

- 国内域名通过灰云 DNS 连接阿里云，图片域 `img.lancloudtech.com` 使用阿里云 CDN；海外 Pages 项目 `lan-homepage-global`。
- Geo 分流保留，`?host=cn` / `?host=global` 可显式选择；大陆留主域，其他地区进入海外站。
- 微信签名服务保留 `wechat.lancloudtech.com`，分享链接为正式 apex，分享图使用绝对生产地址。
- 原 Umami 公司属性和域名限制保留，不为改版新建统计属性，不重复发送点击/PV。
- 旧 `/preview/` 301 到对应正式路径；独立 LeadsHunter 旧站内入口也保留跳转。
- 发布与回滚参见 [发布说明](docs/release.md)，当前源码规则见 [AGENTS.md](AGENTS.md)。密钥只从已批准的本机配置读取，不写入源码或发布包。

联系方式：lance@lancloudtech.com · +86-17380566771
