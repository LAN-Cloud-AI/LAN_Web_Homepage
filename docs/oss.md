# 兰芯公司 OSS 使用说明

## 概览

| 项 | 值 |
| --- | --- |
| Bucket | `lan-cloud-webpage` |
| 地域 | 华中1（武汉-本地地域）`oss-cn-wuhan-lr` |
| Endpoint | `https://oss-cn-wuhan-lr.aliyuncs.com` |
| 公开基址 | `https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com` |
| 根前缀 | `lanxin/` |
| RAM 用户 | `lan-cloud-oss-agent`（AccessKey 真相源：`~/.config/lanxin/env/aliyun/oss.env`） |

Cloudflare / 源站 Nginx 继续托管 HTML/CSS/JS；**图片等静态媒体走 OSS**。

## 目录约定

```
lanxin/
  webpage/
    images/generated/   # 官网生成图（公开读）
    images/logo/        # 官网 Logo（公开读）
    assets/             # 其它官网静态资源
  shared/
    brand/              # 跨产品品牌（公开读）
    docs/               # 内部文档素材（默认私有）
  apps/
    leadshunter/
    internal-expense/
    wecom/
    miniprogram/        # 微信小程序内容图（公开读；品牌图仍在小程序包内）
  tmp/                  # 临时上传，可定期清理
```

## 本地配置

```bash
# 推荐：写入 ~/.config/lanxin/env/aliyun/oss.env 并聚合到 projects/
# 本仓库 .env 应为软链（见 ~/.config/lanxin/AGENTS.md）
cp .env.example ~/.config/lanxin/env/aliyun/oss.env   # 或编辑已有文件
# 填入 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET
npm install
node scripts/oss/cli.mjs ping
```

## 常用命令

```bash
node scripts/oss/cli.mjs init-layout          # 创建目录占位
node scripts/oss/cli.mjs configure-bucket     # CORS + 公开读（webpage/shared/brand/miniprogram）
node scripts/oss/cli.mjs sync-website-images  # 同步 images/generated 与 images/logo
node scripts/oss/cli.mjs sync-miniprogram-images  # 同步小程序 assets-oss/（可用 MINIPROGRAM_ROOT）
node scripts/oss/cli.mjs ls lanxin/webpage/
node scripts/oss/cli.mjs put ./file.webp lanxin/webpage/images/generated/foo.webp
node scripts/oss/cli.mjs url lanxin/webpage/images/logo/WEB-logo.svg
```

## Agent 规则

所有 Cursor Agent 应遵循 `~/.config/lanxin/AGENTS.md` 与 `.cursor/rules/aliyun-oss.mdc`：从兰芯 env 目录加载密钥、用 `scripts/oss/cli.mjs` 操作桶，不把密钥写进仓库。

## 站点引用

生产页面图片 URL 形如：

```
https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images/generated/...
```

本地预览仍可用仓库内 `images/`；发布前执行 `sync-website-images` 保证 OSS 与仓库一致。

小程序内容图源在 `../LAN_Wechat_Official_miniProgram/assets-oss/`，同步命令 `sync-miniprogram-images`；微信后台须把本桶公开域名加入 downloadFile 合法域名（见小程序仓 `docs/oss.md`）。
