# 事件审计时间线

| 字段 | 值 |
| --- | --- |
| ID | `tact-event-audit` |
| 产品线 | `tact` |
| 画幅 | `16:9` |
| 官网用途 | TACT SaaS/契约可信 |
| 建议输出 | `images/generated/tact/tact-event-audit.png` |

## 完整 Prompt（直接复制）

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

Audit timeline UI for a repair order: append-only events with actor, role, store, ruleSet version,
idempotency key truncated, revision numbers. Banner 「命令不是事实 · 事件才是事实」. Developer-trust meets ops.

Aspect ratio 16:9. UI screenshot, photoreal product interface.
```

## Negative Prompt

```text
purple gradient, neon glow, glassmorphism overload, cyberpunk, sci-fi HUD, dark mode default, stock photo people faces, watermark, blurry text, lorem ipsum Latin-only UI, emoji clutter, cartoon, low contrast, skeuomorphism, heavy drop shadows, rounded-full pill spam, cream terracotta aesthetic, newspaper layout, holographic, robot mascot
```

## 场景要点

Audit timeline UI for a repair order: append-only events with actor, role, store, ruleSet version,
idempotency key truncated, revision numbers. Banner 「命令不是事实 · 事件才是事实」. Developer-trust meets ops.
