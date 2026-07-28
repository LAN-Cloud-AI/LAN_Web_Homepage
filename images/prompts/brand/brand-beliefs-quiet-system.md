# 信念区 · 可信工作流

| 字段 | 值 |
| --- | --- |
| ID | `brand-beliefs-quiet-system` |
| 产品线 | `brand` |
| 视觉模式 | `editorial-system` |
| 画幅 | `3:2` |
| 目标分辨率 | `1536×1024` |
| 官网用途 | Beliefs 桌面/平板配图；手机继续只展示可翻译文字列表 |
| 建议输出 | `images/generated/brand/brand-beliefs-quiet-system.png` |

## 完整 Prompt（直接复制）

```text
Use case: stylized-concept
Asset type: premium data-trust visual for an automotive operations system
Target dimensions: 1536 x 1024 pixels, 3:2.

Show four sparse signal clusters moving left to right through four elegant verification gates
and resolving into one calm, verified operational record. Build the gates as restrained porcelain,
frosted-acrylic and brushed-metal structures: a clear lens, a faceted evidence layer,
a concentric explanation layer, and a precise contract-like final gate.
Let one fine forge-teal signal path travel continuously through the composition.

This visual should imply trusted data, accountable action, explainability, and controlled release
without telling the story in words. Use generous negative space, faint technical guide lines,
and soft gallery light. Keep every important element inside the central 85% of the canvas.

Color palette: porcelain #F6F7F5, fog gray, charcoal hairlines, forge teal #0F766E,
small restrained steel-blue details. No readable text, letters, Chinese characters, numerals,
logos, wordmarks, watermark, browser frame, app chrome, people, or dashboard panels.
```

## Negative Prompt

```text
infographic labels, four text cards, logo, headline, browser chrome, dashboard,
purple gradient, neon glow, dark mode, cyberpunk, heavy glassmorphism, isometric scene,
stock photography, fake UI typography, watermark, visual clutter
```

## 接入规则

- 此图不能复述页面标题或四条信念；叙事文本始终保留在 HTML 中。
- 小于等于 640px 时隐藏图片，让列表拥有完整的阅读空间。
- 生成后导出 `.webp`、`-1280.webp` 和 `-768.webp`，再更新 `srcset`。
