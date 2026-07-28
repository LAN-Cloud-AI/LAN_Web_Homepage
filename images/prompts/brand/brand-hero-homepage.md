# 官网首页 Hero · 精密运营工坊

| 字段 | 值 |
| --- | --- |
| ID | `brand-hero-homepage` |
| 产品线 | `brand` |
| 视觉模式 | `editorial-system` |
| 桌面画幅 | `3:2` · 1536×1024（页面最大展示约 1120 CSS px） |
| 手机画幅 | `4:3` · 1440×1080 左右 |
| 官网用途 | 首页首屏主视觉；品牌和文字由 HTML 承担 |
| 当前输出 | `images/generated/brand/brand-hero-precision-atelier.png` |
| 手机输出 | `images/generated/brand/brand-hero-precision-atelier-mobile.png` |

## 视觉职责

这不是一张带品牌锁头、导航、标题和仪表盘文字的截图。它只负责传达“汽车运营由一条可信工作流贯穿”，让页面自己的真实 Logo、H1、主张和多语言文案保持唯一。

使用 [`00-VISUAL-SYSTEM.md`](../00-VISUAL-SYSTEM.md) 中的 `editorial-system` 风格块；**不要**附官方 Logo 参考图。

## 桌面完整 Prompt（直接复制）

```text
Use case: stylized-concept
Asset type: desktop landing-page hero visual for an automotive operations system
Target dimensions: 1536 x 1024 pixels, 3:2.

Create a “precision operating atelier”: one elegant, calm physical-digital workbench.
Center a refined unlabelled porcelain work surface with a subtle translucent automotive contour.
Across it, run one luminous forge-teal operational progress path with a small number of clear checkpoint nodes.
Use a few carefully spaced evidence/material tiles around the lower portion: brushed wheel metal,
frosted glass, restrained leather or engineering material, all presented as physical samples.

The image must feel tactile, assured, and premium — industrial design for a modern automotive
operations platform — not a generic SaaS dashboard. Keep the main car outline and teal path
inside the central 70% so the image remains attractive when reduced on tablets and folded panes.

Style/medium: premium 2.5D editorial industrial-design illustration; porcelain white, frosted acrylic,
brushed aluminium, faint technical guide lines, and soft gallery daylight. Straight-on or only slightly elevated;
never isometric and never a device mockup.
Color palette: porcelain #F6F7F5, fog gray, charcoal hairlines, forge teal #0F766E, muted steel blue.
Constraints: no readable text, letters, Chinese characters, numbers, logos, brand marks, watermark,
browser chrome, phone/computer bezel, people, license plates, or fake UI panels.
```

## 手机完整 Prompt（直接复制）

```text
Use case: stylized-concept
Asset type: mobile landing-page hero companion for an automotive operations system
Target dimensions: 1440 x 1080 pixels, 4:3 landscape, designed to remain clear at 390 CSS pixels wide.

Recompose the precision operating atelier into one mobile-safe hero image.
Show one porcelain work surface with a translucent automotive contour and one luminous forge-teal
operational progress curve. Use only three quiet evidence/material tiles along the lower edge;
remove all peripheral workspace detail. The car outline and teal path are the sole focal idea.

Keep every important form inside the central 84% of the canvas. Use porcelain white, frosted acrylic,
brushed aluminium, thin technical guide lines, and gallery-soft light.
No readable text, letters, Chinese characters, numbers, logos, brand marks, watermark,
browser chrome, phone frame, people, license plates, dense UI, dashboard, or fake typography.
```

## Negative Prompt

```text
purple gradient, neon glow, cyberpunk, dark mode, dense dashboard, browser chrome,
side navigation, logo, wordmark, headline, readable text, fake gibberish typography,
phone frame, stock photo people, license plate, heavy shadows, noisy glassmorphism,
isometric scene, generic 3D car advertisement, watermark
```

## 入库与响应式

- 桌面图保存为 `brand-hero-precision-atelier.png`，并导出 `-1280.webp`、`-768.webp` 和完整 `.webp`。
- 手机图保存为 `brand-hero-precision-atelier-mobile.png`，并导出相同的 WebP 梯度。
- `index.html` 先匹配真实纵向折叠屏的桌面图，再在 `max-width: 640px` 选择手机图；不要在图片中补回任何文字或 Logo。
