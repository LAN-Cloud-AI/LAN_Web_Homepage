# 发布运行手册

## 目标

将已验证的官网与 LeadsHunter 产品页发布到 Cloudflare Pages，并避免旧的不可变缓存图片继续展示。

## 常规流程

1. 在本地运行 README 中的全部验证命令，并确认 `git diff --check` 没有输出。
2. 明确本次提交只包含生产代码、实际引用的图片和可追溯 Prompt；不要提交 `mocks/leadshunter/`、`images/prototypes/`、Python 缓存或本地 QA 截图。
3. 提交并推送 `main`：

   ```bash
   git push origin main
   ```

4. 若 Cloudflare Pages 已连接 `main`，在 Dashboard → Workers & Pages → 项目 → Deployments 中确认该提交状态为 **Success**。
5. 用正式域名验证首页和 `/leadshunter/`；至少检查 HTML、CSS、JavaScript 与首屏 / 产品页关键 WebP 图。

## 缓存策略

HTML、CSS 和 JavaScript 应重新验证；生成图通常使用长时间 `immutable` 缓存。图片内容有变化时，优先使用带版本或内容哈希的新文件名，并同步更新 HTML 引用；紧急发布可使用版本化 URL 参数。这会让已访问用户请求一个新的资源 URL。随后可在 Cloudflare Dashboard → Cache → Purge Cache → Custom Purge 中按完整 URL 清理相关边缘缓存，但它**不能**覆盖用户浏览器已保存的 `immutable` 本地缓存。不要因为视觉更新而执行全站 Purge Everything。

## Git 自动部署未触发时

先在 Dashboard 核对项目、生产分支和 Git 连接。确认项目名后，使用已登录的 Wrangler 或设置 `CLOUDFLARE_API_TOKEN`。上传目录必须是**只包含生产静态文件**的显式目录；不要把仓库根目录、Mock、Prompt 或本地 QA 资料直接上传：

```bash
npx --yes wrangler@latest pages deploy <PRODUCTION_DIRECTORY> --project-name=<VERIFIED_PROJECT_NAME> --branch=main --commit-hash="$(git rev-parse HEAD)" --commit-message="$(git log -1 --pretty=%s)"
```

Git 连接部署的生产内容以提交到仓库的文件为准；手工上传则必须由发布人员明确准备生产目录。

## 失败处理

- Git 自动部署失败：修复后提交新版本，再推送 `main`。
- 同一版本需重跑：在 Cloudflare Deployments 中使用 **Retry deployment**。
- 没有 Cloudflare 权限：不要尝试临时预览账号或新建项目；请拥有账号权限的成员在 Dashboard 执行部署 / 重试 / 定向清缓存。
