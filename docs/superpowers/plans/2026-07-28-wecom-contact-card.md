# WeCom Contact Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished, accessible enterprise-WeChat contact path that opens a dedicated LAN Cloud AI sales-manager card with a locally generated QR code.

**Architecture:** The homepage contact section presents the WeChat path as a peer of email and phone, while a restrained desktop-only floating action improves reachability on large screens. Both routes enter `/contact/wecom/`, a static card page with UA-specific copy, a locally stored scan-only QR code, and a same-origin-aware return action. A Node verifier owns the cross-page route and asset contract; a Swift script generates and decodes the QR without external services.

**Tech Stack:** Static HTML, CSS media queries, vanilla JavaScript, Node.js built-in `fs`/`path` checks, macOS Swift CoreImage/Vision/ImageIO, Cloudflare Workers static assets.

## Global Constraints

- Encode exactly `https://work.weixin.qq.com/u/vc02eca5bffac64589?src=wx&bb=7a2bd84343` in the QR payload; HTML attributes may encode `&` as `&amp;`.
- Use an opaque black-and-white PNG at `images/contact/wecom-sales-manager-qr.png`, with ECC M, a four-module quiet zone, no logo, no gradient, no shadow, and 900 × 900 pixels.
- Default card copy must be `我是兰芯云朵销售经理，这是我的企业微信，请您使用微信扫描二维码与我取得联系`.
- In WeChat or WeCom browsers (`/(?:MicroMessenger|wxwork)/i`), card copy must be `我是兰芯云朵销售经理，请您长按二维码，添加我的企业微信`.
- The contact page must support light mode, dark mode, 320px widths, foldable safe areas, keyboard access, and `prefers-reduced-motion`; QR pixels must never be inverted in dark mode.
- Do not provide an enterprise-WeChat hyperlink or a direct-open control on the card page: visitors must scan or long-press the QR code.
- Keep Chinese card copy in semantic no-wrap phrase units so terms such as `兰芯云朵` and `企业微信` never split mid-phrase.
- The desktop floating entry may appear only at `min-width: 1025px` with `hover: hover` and `pointer: fine`; it must not appear on mobile or coarse/foldable devices.
- Preserve the existing site’s relative URL convention and do not expose a private LeadsHunter repository.
- Do not commit, push, or deploy unless separately authorized; this shared worktree may contain unrelated user changes.

---

### Task 1: Add the failing enterprise-WeChat route contract

**Files:**
- Create: `scripts/verify-wecom-card-route.mjs`
- Test: `scripts/verify-wecom-card-route.mjs`

**Interfaces:**
- Consumes: homepage, LeadsHunter page, card HTML/CSS/JS, QR PNG, and `main.js` from the repository root.
- Produces: exit code `0` only when all route, copy, accessibility, responsive-entry, and image-size contracts are present.

- [ ] **Step 1: Write the failing verifier**

```js
const payload = "https://work.weixin.qq.com/u/vc02eca5bffac64589?src=wx&bb=7a2bd84343";
required(exists("contact/wecom/index.html"), "Missing WeCom card route asset: contact/wecom/index.html");
required(exists("images/contact/wecom-sales-manager-qr.png"), "Missing WeCom QR asset.");
required(homeContact.includes('href="./contact/wecom/"'), "Homepage contact section must link to the WeCom card.");
required(!card.includes("work.weixin.qq.com"), "Card must not expose a direct enterprise-WeChat URL.");
```

- [ ] **Step 2: Run the verifier to establish red**

Run: `node scripts/verify-wecom-card-route.mjs`

Expected: FAIL with `Missing WeCom card route asset: contact/wecom/index.html`.

- [ ] **Step 3: Keep the checks behavioral**

Assert the real public markup and local image dimensions rather than implementation-only details. Verify default and WeChat copy, the QR image source, absence of direct enterprise-WeChat hyperlinks, skip link/main focus target, return fallback, semantic Chinese phrase units, WeChat UA detection, same-origin history handling, homepage and LeadsHunter entry links, desktop-only float media query, and the 900 × 900 PNG dimensions.

### Task 2: Generate and validate a local QR image

**Files:**
- Create: `scripts/generate-wecom-qr.swift`
- Create: `images/contact/wecom-sales-manager-qr.png`
- Test: `scripts/verify-wecom-card-route.mjs`

**Interfaces:**
- Consumes: the exact payload from Task 1.
- Produces: `wecom-sales-manager-qr.png` and a `--verify` mode that uses Vision to decode it back to the exact payload.

- [ ] **Step 1: Run the verifier to preserve red**

Run: `node scripts/verify-wecom-card-route.mjs`

Expected: FAIL because the card route and QR image do not yet exist.

- [ ] **Step 2: Implement deterministic image generation**

Use `CIQRCodeGenerator` with correction level `M`, add four white quiet-zone modules, scale the integral bitmap to 900 × 900, and write an opaque PNG using ImageIO. Do not use a network QR service or an npm dependency.

- [ ] **Step 3: Generate and decode-check the asset**

Run:

```bash
swift scripts/generate-wecom-qr.swift
swift scripts/generate-wecom-qr.swift --verify
sips -g pixelWidth -g pixelHeight images/contact/wecom-sales-manager-qr.png
```

Expected: Vision prints the exact payload and `sips` reports `900` for both dimensions.

### Task 3: Implement the responsive, accessible business-card route

**Files:**
- Create: `contact/wecom/index.html`
- Create: `contact/wecom/wecom-card.css`
- Create: `contact/wecom/wecom-card.js`
- Test: `scripts/verify-wecom-card-route.mjs`

**Interfaces:**
- Consumes: the QR asset from Task 2 and the enterprise-WeChat URL from Task 1.
- Produces: a directly navigable `/contact/wecom/` page with a robust `../../#contact` no-JS return path.

- [ ] **Step 1: Create semantic card markup**

Include a skip link, `<main id="main-content" tabindex="-1">`, the LAN Cloud AI logo, both exact copy variants, a non-link QR image, and one `<a href="../../#contact">返回兰芯云朵官网</a>` action. Split the title and each instruction into semantic Chinese phrase spans. Add both light and dark `theme-color` tags and `color-scheme` support.

- [ ] **Step 2: Implement page CSS**

Use a centered single card, safe-area-aware page padding, a maximum readable width, a clear 44px interaction target, high-contrast focus rings, and a static white QR tile with only its own rounded crop. The QR tile must remain normal black-on-white in dark mode. Use no desktop mock device, outer image frame, blurred halo, or outer image shadow.

- [ ] **Step 3: Implement progressive enhancement**

Set `.is-wechat-browser` in a small head script before paint using `/(?:MicroMessenger|wxwork)/i`. In `wecom-card.js`, detect a same-origin `document.referrer` before intercepting the return link to call `history.back()`; otherwise retain the anchor fallback. Respect `prefers-reduced-motion`, do not auto-redirect visitors away from the card, and do not expose a direct enterprise-WeChat URL in page markup.

- [ ] **Step 4: Run the focused verifier**

Run: `node scripts/verify-wecom-card-route.mjs`

Expected: it advances beyond missing route and reports only any remaining homepage/LeadsHunter integration requirement.

### Task 4: Add site-level contact entries without compromising mobile layout

**Files:**
- Modify: `index.html:427-440`
- Modify: `styles.css:1041-1079`, mobile and reduced-motion sections
- Modify: `main.js:onScroll`
- Modify: `i18n.js` contact keys in `zh-Hans`, `zh-Hant`, and `en`
- Modify: `leadshunter/index.html:287-296`
- Test: `scripts/verify-wecom-card-route.mjs`

**Interfaces:**
- Consumes: the local `/contact/wecom/` route.
- Produces: localized homepage contact CTA, desktop-only floating entry, and an optional conversion action in the LeadsHunter contact band.

- [ ] **Step 1: Add the peer homepage contact link**

Place a single `./contact/wecom/` text link alongside the existing email and phone links. Add `contact.wecom` translations: `添加微信`, `新增微信`, and `Add WeChat`.

- [ ] **Step 2: Add the restrained desktop entry**

Add a fixed `wechat-float` anchor with the same route. Toggle an HTML state in the existing passive `onScroll` handler after 240px. CSS must reveal the pill only under `@media (min-width: 1025px) and (hover: hover) and (pointer: fine)`, stay below nav z-index 40, and reduce transition motion when requested.

- [ ] **Step 3: Add the LeadsHunter conversion action**

Add `href="../contact/wecom/"` beside its product inquiry and return actions. Keep it a site route, never a private-source URL.

- [ ] **Step 4: Run the focused verifier green**

Run: `node scripts/verify-wecom-card-route.mjs`

Expected: PASS with the QR dimensions and every cross-route contract confirmed.

### Task 5: Make Worker packaging and repository guidance aware of the route

**Files:**
- Modify: `scripts/verify-worker-assets.mjs`
- Modify: `AGENTS.md`
- Modify: `README.md` only if it has a route list suitable for public navigation documentation
- Test: `scripts/prepare-worker-assets.mjs`, `scripts/verify-worker-assets.mjs`

**Interfaces:**
- Consumes: all public production route files and their image references.
- Produces: deployment verification that fails when the new static page, stylesheet, JavaScript, or QR PNG is omitted from `dist/`.

- [ ] **Step 1: Extend production asset checks**

Require `contact/wecom/index.html`, `contact/wecom/wecom-card.css`, `contact/wecom/wecom-card.js`, and `images/contact/wecom-sales-manager-qr.png`. Scan image references in the new card page as well as existing pages.

- [ ] **Step 2: Record the route and verification command**

Add `/contact/wecom/` and `node scripts/verify-wecom-card-route.mjs` to the agent verification guide so later site changes retain the contact contract.

- [ ] **Step 3: Run packaging verification**

Run:

```bash
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
npx --yes wrangler@4.114.0 deploy --dry-run --config wrangler.jsonc
```

Expected: all commands exit `0`; the dist tree contains the card and its QR PNG.

### Task 6: Run focused and full regression QA

**Files:**
- Test: existing verifiers, local static server, browser inspection

**Interfaces:**
- Consumes: completed route, assets, and static Worker package.
- Produces: fresh evidence for the final user handoff.

- [ ] **Step 1: Execute static checks**

Run:

```bash
node scripts/verify-homepage-hero.mjs
node scripts/verify-homepage-hero.test.mjs
node scripts/verify-homepage-hero-regression.mjs
node scripts/verify-leadshunter-route.mjs
node scripts/verify-wecom-card-route.mjs
node --check main.js
node --check i18n.js
node --check leadshunter/leadshunter.js
node --check contact/wecom/wecom-card.js
swift scripts/generate-wecom-qr.swift --verify
git diff --check
```

- [ ] **Step 2: Inspect local browser behavior**

Open `http://127.0.0.1:18987/contact/wecom/`, confirm the default copy, scan-only QR image, and sole return link. Inspect the homepage at desktop width after scrolling beyond 240px to confirm the float is visible, then at a 390px mobile width to confirm it is absent while the three peer contact links remain available. Verify the card in light and dark system themes with no horizontal overflow.

- [ ] **Step 3: Preserve scope at handoff**

Report the local route and verification evidence. Leave the existing local preview server running. Do not stage, commit, push, or deploy without a separate user request.
