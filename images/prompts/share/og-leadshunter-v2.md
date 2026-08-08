# LeadsHunter 微信分享卡

| 字段 | 值 |
| --- | --- |
| ID | `og-leadshunter-v2` |
| 产品线 | `share` |
| 画幅 | `1:1` |
| 官网用途 | 路由 `/leadshunter/` 的微信 / OG 分享封面 |
| 建议输出 | `images/generated/share/og-leadshunter-v2.png` |
| 生成方式 | `scripts/generate-share-og.py`（品牌锁 + 路由文案合成） |

## 完整 Prompt（设计意图）

```text
Use the official LAN Cloud AI white-background logo (images/logo/WEB-logo.png)
as the entire 1:1 WeChat / Open Graph share card. Solid white canvas, centered
teal cloud + white CLI prompt mark. No extra titles, taglines, gradients, or
product UI. Generated via scripts/generate-share-og.py.
```

## Negative Prompt

```text
purple gradient, neon glow, cluttered dashboard, tiny unreadable text,
real phone numbers, license plates, watermark, cream terracotta aesthetic
```
