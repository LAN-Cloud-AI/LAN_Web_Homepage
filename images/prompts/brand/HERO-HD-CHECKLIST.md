# 首页 Hero 高清重生成清单

基于 [`brand-hero-homepage.md`](./brand-hero-homepage.md) 与 [`00-VISUAL-SYSTEM.md`](../00-VISUAL-SYSTEM.md)。目标：Retina 下首屏不糊，且 **使用现行 WEB logo**。

## 1. 为什么重做

| 项 | 现状 | 目标 |
| --- | --- | --- |
| 当前源图宽 | 桌面 1537 px / 移动 1448 px | 桌面 **≥2560 px**（理想 3840） |
| 页面显示 | 最大约 1280 CSS px | @2x 需要 ≈2560 源宽 |
| Logo | AI 自造 / 事后 overlay | 生成时锁定官方标 + 必要时贴回 |
| 构图 | 已采用精密运营工坊 | 继续「一张主导视觉」，无笔记本边框 |

## 2. 准备材料

- [ ] Prompt：复制 [`brand-hero-homepage.md`](./brand-hero-homepage.md)「完整 Prompt」+「Negative Prompt」
- [ ] Logo 参考（必选一张）：
  - `images/logo/WEB-logo-transparent.png`（透明底，优先）
  - 或 `images/logo/WEB-logo.svg` / `images/logo/WEB-logo.png`
- [ ] 视觉规范：[`00-VISUAL-SYSTEM.md`](../00-VISUAL-SYSTEM.md)「官方 Logo」节
- [ ] 对照现网文案（图内勿抢戏）：品牌「兰芯云朵」+ lede 在 HTML，图内以 UI 为主

## 3. Logo 核对（生成前写进工具设定）

官方标形态（口头核对）：

1. 颜色：forge teal `#0E766E` / `#0F766E`
2. 外形：圆角云朵剪影
3. 内部：白色 **`>`** + **`_`**（终端提示符），不是电路、不是字母 L、不是彩虹云
4. 锁头：图标 +「兰芯云朵」（可加小号 `LAN Cloud AI`）

工具侧：

- [ ] GPT-Image / Flux / Ideogram：**上传 logo 作 reference**
- [ ] Midjourney：`--sref` / image prompt 挂 logo；桌面 `--ar 3:2`、移动 `--ar 4:3`；尽量高清档
- [ ] 参数写明桌面 native **≥2560 px 宽**、移动 native **≥1440 px 宽**（不要只写 “4K” 却导出 1.5K）

## 4. 构图验收（出图后）

- [ ] 桌面 3:2、移动 4:3；主导面是 **一张** 产品视觉（精密运营工作台 / 工作流）
- [ ] **无** MacBook / 笔记本外框 / 桌面摆拍
- [ ] 地址栏若出现 → 仅 `https://www.lancloudtech.com`
- [ ] 能力带可见：看见 → 理解 → 调度 → 判断
- [ ] 导航 / 营销锁头处的 logo 形态正确（或留白给 post overlay）
- [ ] 无紫渐变、霓虹 HUD、贴纸徽章堆叠
- [ ] 小字在 100% 缩放下仍大致可辨；KPI 卡片优先于密表

## 5. 清晰度验收

- [ ] 源 PNG 像素宽 **≥ 2560**（`sips -g pixelWidth`）
- [ ] 理想：**3840×2160**
- [ ] 非「低清放大」；边缘干净，无严重 JPEG 蚊噪
- [ ] 在 1280 CSS px、DPR=2 预览下，UI 细线不明显发虚

## 6. 入库步骤

```text
images/generated/brand/brand-hero-precision-atelier.png          ← 桌面母版
images/generated/brand/brand-hero-precision-atelier-mobile.png   ← 移动母版
```

- [ ] 覆盖或替换桌面与移动母版 PNG（保留 git 可回滚）
- [ ] Logo 不准时：回到生成源并使用官方 Logo reference；不要在页面中伪造或覆盖品牌标。
- [ ] 刷新 webp（建议把 `export_webp` 的 q 提到 **88–92**）：
  - `brand-hero-precision-atelier.webp`（桌面全尺寸）
  - `brand-hero-precision-atelier-1280.webp`
  - `brand-hero-precision-atelier-768.webp`
  - `brand-hero-precision-atelier-mobile.webp`（移动全尺寸）
  - `brand-hero-precision-atelier-mobile-1280.webp`
  - `brand-hero-precision-atelier-mobile-768.webp`
- [ ] 更新 `index.html`：保留折叠屏、移动端和默认 `<source>`；`width` / `height` 与桌面母版一致
- [ ] 本地 `python3 -m http.server 18987` 在 Retina、移动端与折叠屏下目视 Hero

## 7. 推荐生成组合（按优先级）

| 优先级 | 做法 | 说明 |
| --- | --- | --- |
| A | 高清模型 + logo reference → 选 1 张 → overlay 校正 logo | 性价比最高 |
| B | 生成干净 UI（故意弱化小 logo）→ 全程用真实 logo overlay | logo 100% 准 |
| C | 同 Prompt 出 3–4 变体，只留构图最好的一张升到 4K | 避免在糊图上死磕 |

## 8. 不做的事

- 不要用 1536 宽再「AI upscale」冒充 4K（细字仍糊）
- 不要把首页 HTML 主标题整段烤进大图抢品牌层级
- 不要批量重生成全部产品图；本次清单 **仅 Hero**
- 不要改域名回 `lancloudai.com`

## 9. 一键复制区

**Reference 文件**

```text
images/logo/WEB-logo-transparent.png
```

**输出路径**

```text
images/generated/brand/brand-hero-precision-atelier.png
images/generated/brand/brand-hero-precision-atelier-mobile.png
```

**完整 Prompt / Negative**：见 [`brand-hero-homepage.md`](./brand-hero-homepage.md)
