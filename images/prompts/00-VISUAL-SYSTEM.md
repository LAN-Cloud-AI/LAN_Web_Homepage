# 兰芯云朵官网 · UI 生成视觉规范

所有 Prompt 默认**前置拼接**本节「共享风格块」。生成结果用于官网替代真实截屏，必须像**可上线的 B2B SaaS 产品 UI**，而不是科幻仪表盘或营销插画。

## 共享风格块（Copy into every prompt）

```text
Product UI mockup for LAN Cloud AI (兰芯云朵), a Chinese automotive retail & aftersales SaaS.
Clean light-mode enterprise interface, soft cool-gray canvas (#F4F6F8), charcoal text (#1A2332),
single accent color forge teal (#0F766E), secondary steel blue (#334155) for charts.
Dense but readable SaaS layout like Linear + Notion + modern DMS: left sidebar, top bar with store switcher,
crisp 1px borders, subtle elevation, 8px grid, Inter/Noto Sans SC hybrid typography.
Realistic Chinese UI labels (Simplified Chinese), believable automotive dealer data (anonymized),
no real personal IDs, no real phone numbers, no license plates with real patterns.
MacBook Pro browser chrome OR frameless app window. Sharp UI screenshot aesthetic, not 3D, not isometric.
High fidelity, 4K, straight-on orthographic view, ample whitespace hierarchy, professional automotive ops software.
If a browser address bar is visible, use ONLY the official domain lancloudtech.com
(e.g. https://www.lancloudtech.com, https://console.lancloudtech.com/..., https://vect.lancloudtech.com/..., https://tact.lancloudtech.com/...).
Never use lancloudai.com, lancloud.com, or example.com as the product URL.
Demo emails in UI must use @lancloudtech.com (never @example.com).
```

## 禁止（Negative，可统一追加）

```text
purple gradient, neon glow, glassmorphism overload, cyberpunk, sci-fi HUD, dark mode default,
stock photo people faces, watermark, blurry text, lorem ipsum Latin-only UI, emoji clutter,
cartoon, low contrast, skeuomorphism, heavy drop shadows, rounded-full pill spam, cream terracotta aesthetic,
newspaper layout, holographic, robot mascot,
wrong domains (lancloudai.com, lancloud.com, example.com in address bar or emails)
```

## 画幅建议

| 用途 | 比例 | 标注 |
| --- | --- | --- |
| 官网 Hero / 全宽产品图 | 16:9 | `aspect 16:9` |
| 产品页双栏截图 | 3:2 或 16:10 | `aspect 3:2` |
| 手机 App | 9:19.5 | `aspect 9:19.5` |
| 方形 OG / 社交 | 1:1 | `aspect 1:1` |
| 宽幅功能条 | 21:9 | `aspect 21:9` |

## 文件命名

`{产品}-{场景}-{视角}.md`  
对应生成图建议：`images/generated/{产品}/{同名}.png`

## 使用方式

1. 打开具体 Prompt 文件  
2. 复制「完整 Prompt」= 共享风格块 + 场景正文 + Negative  
3. 用 Midjourney / Flux / Ideogram / GPT-Image 等生成  
4. 输出放入 `images/generated/...`，文件名与 Prompt 对齐  

中文界面文案已写在各场景 Prompt 内；若模型吞字，可二次用「inpaint / edit」只修文字层。
