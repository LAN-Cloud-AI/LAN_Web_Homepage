# 兰芯云朵官网 · LAN Cloud AI

静态官网，面向 [Cloudflare Pages](https://pages.cloudflare.com/) 部署。

- 正式域名：https://lancloudtech.com
- 联系邮箱：lance@lancloudtech.com
- 电话：+86-17380566771
- 公司：四川兰芯云朵智能科技有限公司
- 站点入口：`index.html`
- 语言：简体 / 繁體 / EN；默认跟设备语言，右上角可切换并写入 localStorage
- 主题：跟随系统浅色 / 深色模式
- 图片与 Prompt：`images/`
- 组织 GitHub：https://github.com/LAN-Cloud-AI

## 本地预览

```bash
python3 -m http.server 8787
```

打开 http://localhost:8787

## 部署（Cloudflare Pages）

仓库：https://github.com/LAN-Cloud-AI/LAN_Web_Homepage

### 推荐：Git 连接（持续部署）

1. 打开 [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. **Create** → **Pages** → **Connect to Git**
3. 选择 `LAN-Cloud-AI/LAN_Web_Homepage`，分支 `main`
4. 构建设置（静态站点，无需构建）：
   - Framework preset: `None`
   - Build command: （留空）
   - Build output directory: `/`
5. 保存并部署；部署完成后把自定义域绑到 `lancloudtech.com` / `www.lancloudtech.com`

### 或：命令行直推

需先设置 `CLOUDFLARE_API_TOKEN`：

```bash
npx wrangler pages deploy . --project-name=lan-cloud-ai --commit-dirty=true
```