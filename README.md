# 兰芯云朵官网 · LAN Cloud AI

静态官网，面向 [Cloudflare Pages](https://pages.cloudflare.com/) 部署。

- 正式域名：https://lancloudtech.com
- 联系邮箱：lance@lancloudtech.com
- 电话：17713573150
- 公司：四川兰芯云朵智能科技有限公司
- 站点入口：`index.html`
- 图片与 Prompt：`images/`
- 组织 GitHub：https://github.com/LAN-Cloud-AI

## 本地预览

```bash
python3 -m http.server 8787
```

打开 http://localhost:8787

## 部署（Cloudflare Pages）

```bash
npx wrangler pages deploy . --project-name=lan-cloud-ai --commit-dirty=true
```

或将本仓库推送到 GitHub 后，在 Cloudflare Dashboard 连接 `LAN-Cloud-AI/LAN_Web_Homepage`，构建命令留空，输出目录为 `/`。
