# 云朵记账产品页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an elegant, responsive, open-source product site for 云朵记账 (Internal Expense) that tells the subscription-assets and reimbursement-closure story with anonymized App Store-style visual assets.

**Architecture:** A static `/internal-expense/` route owns its own semantic HTML, theme-aware CSS, and progressively enhanced navigation/motion. Its three product scenes use dedicated light/dark responsive images stored under `images/generated/cloud-ledger-page/`. A focused Node verifier owns the cross-page and visual contracts; the homepage open-source card links to the local route, while the public GitHub repository remains a product-page CTA.

**Tech Stack:** Static HTML, CSS media queries, vanilla JavaScript, Node.js built-in `fs`/`path` verification, ImageGen raster assets, `sips` and `cwebp` asset derivation, Cloudflare Workers static assets.

## Global Constraints

- The public display name is `云朵记账`; use `Internal Expense` only as an English supporting name.
- The two equal feature lines are subscription assets and reimbursement closure; do not position the product as an auto-payment or fully automated reimbursement system.
- Product mockups use only fictitious teams, values, service labels and abstract UI. Never include actual product screenshots, account names, people, IDs, phone numbers, payment data, real client data, third-party logos, tokens, OTP, MFA values, or full card numbers.
- The only public source link is `https://github.com/LAN-Cloud-AI/LAN_Cloud_Internal_Expense`; state Apache-2.0 in the product page. Do not surface the authenticated product-instance URL.
- Start at 320px, preserve foldable safe areas, use light/dark dedicated `<picture>` sources, and never use `filter: invert()` for product imagery.
- Chinese text must use semantic `copy-unit` phrases together with `word-break: normal` and `line-break: strict`; do not use `word-break: keep-all`.
- Product imagery has its own rounded crop only: no outer image shadow, no blurred glow/halo, no mock browser chrome, and no surrounding device frame built in CSS.
- Motion must be progressive, keyboard navigation must remain functional without JavaScript, and all motion must respect `prefers-reduced-motion`.
- Do not stage, commit, push, or deploy unless separately authorized; this shared worktree contains unrelated user changes.

---

### Task 1: Add the failing 云朵记账 route contract

**Files:**
- Create: `scripts/verify-internal-expense-route.mjs`
- Test: `scripts/verify-internal-expense-route.mjs`

**Interfaces:**
- Consumes: `/internal-expense/` HTML/CSS/JS, six visual asset families, homepage markup, i18n copy, and prompt catalog.
- Produces: exit code `0` only when the product route, responsive visuals, Chinese wrapping guardrails, open-source CTA, and homepage integration are all present.

- [ ] **Step 1: Write the failing verifier before production files exist**

```js
const scenes = [
  "cloud-ledger-appstore-overview-v1",
  "cloud-ledger-appstore-overview-dark-v1",
  "cloud-ledger-subscription-dashboard-v1",
  "cloud-ledger-subscription-dashboard-dark-v1",
  "cloud-ledger-reimbursement-flow-v1",
  "cloud-ledger-reimbursement-flow-dark-v1",
];

for (const file of [
  "internal-expense/index.html",
  "internal-expense/internal-expense.css",
  "internal-expense/internal-expense.js",
  ...scenes.flatMap((scene) => [
    `images/generated/cloud-ledger-page/${scene}.png`,
    `images/generated/cloud-ledger-page/${scene}-768.png`,
    `images/generated/cloud-ledger-page/${scene}.webp`,
    `images/generated/cloud-ledger-page/${scene}-768.webp`,
  ]),
]) required(exists(file), `Missing 云朵记账 route asset: ${file}`);
```

- [ ] **Step 2: Run the verifier to establish red**

Run: `node scripts/verify-internal-expense-route.mjs`

Expected: FAIL with `Missing 云朵记账 route asset: internal-expense/index.html`.

- [ ] **Step 3: Encode behavioral contracts in the verifier**

Assert the actual static markup and styles for: visible `云朵记账` title, `Internal Expense` support text, the public GitHub URL and Apache-2.0 copy, no `ie-oa.lancloudtech.com`, return/skip links, three content anchors, light/dark theme tags and `<picture>` sources, portrait/landscape image `sizes`, 920px and 760px breakpoints, `copy-unit` phrase usage, normal/strict Chinese breaking, no `keep-all`, no image `box-shadow`/blur halo/inversion, progressive mobile navigation, IntersectionObserver motion, reduced-motion override, and homepage card/footer links to `./internal-expense/`.

### Task 2: Record image prompts and produce anonymous responsive visual assets

**Files:**
- Create: `images/prompts/internal-expense/cloud-ledger-appstore-overview-v1.md`
- Create: `images/prompts/internal-expense/cloud-ledger-appstore-overview-dark-v1.md`
- Create: `images/prompts/internal-expense/cloud-ledger-subscription-dashboard-v1.md`
- Create: `images/prompts/internal-expense/cloud-ledger-subscription-dashboard-dark-v1.md`
- Create: `images/prompts/internal-expense/cloud-ledger-reimbursement-flow-v1.md`
- Create: `images/prompts/internal-expense/cloud-ledger-reimbursement-flow-dark-v1.md`
- Create: `images/generated/cloud-ledger-page/*.png`
- Create: `images/generated/cloud-ledger-page/*-768.png`
- Create: `images/generated/cloud-ledger-page/*.webp`
- Create: `images/generated/cloud-ledger-page/*-768.webp`
- Modify: `images/prompts/INDEX.md`
- Modify: `images/prompts/catalog.json`
- Test: `scripts/verify-internal-expense-route.mjs`

**Interfaces:**
- Consumes: real product workflows only as private structure references and the visual system rules in `images/prompts/00-VISUAL-SYSTEM.md`.
- Produces: six documented image-generation prompts and six light/dark visual families that the product route can safely reference.

- [ ] **Step 1: Add prompt documents before generating imagery**

Each document must state the output filename, aspect ratio, page use, and the data boundary. Use these exact scene contracts:

```text
cloud-ledger-appstore-overview-v1: 5:8 portrait; one front-on tablet; abstract subscription, candidate-expense, and payment-status panels; pale fog-blue background.
cloud-ledger-subscription-dashboard-v1: 3:2 landscape; centered silver laptop; anonymous cost rhythm, renewal-status tiles, and subscription table geometry; cool-white background.
cloud-ledger-reimbursement-flow-v1: 5:8 portrait; one front-on smartphone; candidate-fee grouping and approval/paid progression; pale powder-blue background.
```

The three `-dark-v1` companions use midnight navy/indigo studio surfaces, dark UI, restrained cobalt/mint signals, and the same safe composition. Every prompt must explicitly prohibit readable text, numerals, logos, browser chrome, third-party marks, people, real data, watermarks, and fake gibberish typography.

- [ ] **Step 2: Add the catalog and index records**

Add one `internal-expense` table group with six rows in `INDEX.md`, update the total count by six, and add six matching JSON `items` with `id`, `category`, `title`, `aspect`, `prompt`, `negative`, `output`, and `source`. Increment the catalog `count` by six so the written prompt files and catalog agree exactly.

- [ ] **Step 3: Generate the six source PNGs**

Use the built-in ImageGen tool once per scene/theme pair. Preserve the prompt scene structure but make every displayed interface language-neutral and fictitious. Store versioned source PNGs under `images/generated/cloud-ledger-page/`; never overwrite an earlier asset.

- [ ] **Step 4: Derive browser assets and verify geometry**

For every full PNG, use `sips` to make a same-ratio 768px-wide PNG, then use `cwebp` to write full and 768px WebP variants. Verify all 24 generated files exist and that the overview/reimbursement sources are portrait while the subscription dashboard sources are landscape.

- [ ] **Step 5: Re-run focused verification**

Run: `node scripts/verify-internal-expense-route.mjs`

Expected: it continues past missing assets and fails at the first missing route markup contract.

### Task 3: Implement the semantic, accessible 云朵记账 product route

**Files:**
- Create: `internal-expense/index.html`
- Create: `internal-expense/internal-expense.css`
- Create: `internal-expense/internal-expense.js`
- Test: `scripts/verify-internal-expense-route.mjs`

**Interfaces:**
- Consumes: the six asset families from Task 2 and the existing official WEB logo.
- Produces: a directly navigable `/internal-expense/` page with no JavaScript dependency for primary navigation or CTA links.

- [ ] **Step 1: Write semantic HTML with the confirmed content structure**

Use a skip link to `<main id="main" tabindex="-1">`, a return brand link to `../`, a menu toggle controlling `#product-nav`, and product nav anchors `#subscriptions`, `#reimbursements`, `#open-source`. Build these page sections:

```html
<p class="eyebrow">CLOUD LEDGER <span>云朵记账</span></p>
<h1 id="hero-title"><span class="copy-unit">每笔订阅都清楚，</span><br /><span class="copy-unit">每次报销都有据可查</span></h1>
<a class="button button-primary" href="https://github.com/LAN-Cloud-AI/LAN_Cloud_Internal_Expense" target="_blank" rel="noopener">在 GitHub 查看源码</a>
```

Use the three documented `<picture>` blocks with four `<source>` candidates each: dark WebP, light WebP, dark PNG, light PNG. The portrait `sizes` value is `(max-width: 920px) min(27rem, calc(100vw - 2.5rem)), 432px`; the landscape value is `(max-width: 920px) calc(100vw - 2.5rem), 600px`. Include `fetchpriority="high"` on only the Hero image. Use descriptive Chinese image alternatives that name the anonymized feature, not real data.

- [ ] **Step 2: Implement page styling without image decoration**

Create a light system with a high-key pale-blue canvas, near-black reading text, ink/navy buttons, and blue/mint interaction accents. Create a dark system with dedicated readable dark tokens. Set these exact baseline rules:

```css
:root {
  color-scheme: light dark;
  word-break: normal;
  line-break: strict;
  --leading-display: 1.08;
  --leading-heading: 1.18;
  --leading-hero: 1.8;
  --leading-body: 1.84;
  --leading-detail: 1.62;
  --shell: min(1180px, calc(100% - 3rem));
}
.copy-unit { display: inline-block; white-space: nowrap; }
.appstore-visual > picture { display: block; overflow: hidden; border-radius: var(--visual-radius); }
.appstore-visual img { width: 100%; height: 100%; }
```

Use `minmax(0, …)` in every content grid. Add 920px one-column and 760px navigation/full-width CTA rules. Keep image `object-fit: contain` for portraits and `cover` for landscape. Do not add `box-shadow` or pseudo-element blur to `.appstore-visual` or its picture.

- [ ] **Step 3: Add progressive mobile navigation and entry motion**

Implement the same progressive pattern as `/leadshunter/`: the static nav remains visible when JavaScript is unavailable; JS toggles `.is-menu-open`, maintains `aria-expanded`, closes on navigation and only moves focus after Escape when the menu is open. Use an `IntersectionObserver` to add `.motion-enter` items once, guarded by `prefers-reduced-motion`; keep hover transforms inside `@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`.

- [ ] **Step 4: Run the route verifier green**

Run: `node scripts/verify-internal-expense-route.mjs`

Expected: it fails only for homepage/i18n/Worker integration until Task 4, then passes all product-route assertions.

### Task 4: Connect the product route to the homepage and deployment checks

**Files:**
- Modify: `index.html:418-422, 460-468`
- Modify: `i18n.js` `repo.expense` in `zh-Hans`, `zh-Hant`, and `en`
- Modify: `scripts/verify-worker-assets.mjs`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Test: `scripts/verify-internal-expense-route.mjs`, `scripts/verify-worker-assets.mjs`

**Interfaces:**
- Consumes: the static product route and its image source references.
- Produces: a discoverable site route, accurate multilingual descriptor, and Worker packaging checks that include the new public assets.

- [ ] **Step 1: Change the homepage source card to the official product route**

Replace only the Internal Expense repository-card href with `./internal-expense/`, remove its `target` and `rel`, and preserve its `Public` status pill. Display `云朵记账` as the card title; set `repo.expense` translations to `开源订阅与报销管理`, `開源訂閱與報銷管理`, and `Open-source subscription and reimbursement management`.

- [ ] **Step 2: Add the footer product entry**

Add `<a href="./internal-expense/">云朵记账</a>` inside the homepage product footer column beside the existing LeadsHunter, VECT, and TACT links.

- [ ] **Step 3: Expand Worker verification**

Require the three new `internal-expense` files in `dist` and include `internal-expense/index.html` in the page list scanned for referenced `images/` assets. Preserve all existing route checks.

- [ ] **Step 4: Update documentation**

Add `/internal-expense/` to AGENTS and README route lists, add its local preview URL, and add `node scripts/verify-internal-expense-route.mjs` to each verification command list. State the same public/open-source routing rule in AGENTS: homepage and footer route visitors to `/internal-expense/`, while the product page may link to the public GitHub source.

- [ ] **Step 5: Run focused integration checks**

Run:

```bash
node scripts/verify-internal-expense-route.mjs
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
```

Expected: all commands exit `0`; `dist/internal-expense/` and every referenced generated image exist.

### Task 5: Run full static and visual regression QA

**Files:**
- Test: existing verifiers, static Worker package, local preview

**Interfaces:**
- Consumes: the completed route, images, homepage integrations, and all project regression scripts.
- Produces: fresh evidence for the local user handoff.

- [ ] **Step 1: Run full automated validation**

Run:

```bash
node scripts/verify-homepage-hero.mjs
node scripts/verify-homepage-hero.test.mjs
node scripts/verify-homepage-hero-regression.mjs
node scripts/verify-leadshunter-route.mjs
node scripts/verify-wecom-card-route.mjs
node scripts/verify-internal-expense-route.mjs
node --check main.js
node --check i18n.js
node --check leadshunter/leadshunter.js
node --check contact/wecom/wecom-card.js
node --check internal-expense/internal-expense.js
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
npx --yes wrangler@4.114.0 deploy --dry-run --config wrangler.jsonc
git diff --check
```

- [ ] **Step 2: Inspect the new route in the local browser**

Open `http://127.0.0.1:18987/internal-expense/` at desktop, 390px, and 320px widths in both color schemes. Confirm nav and CTA reachability, no horizontal scroll, no broken phrase wrapping, image sources swap by system color scheme, only rounded image crops appear, and the GitHub link is present while the authenticated product URL is absent. At a foldable-width viewport confirm two-column layouts preserve content within both segments. With reduced motion enabled confirm entry/hover motion is suppressed.

- [ ] **Step 3: Preserve scope at handoff**

Report the local route, generated asset set, and fresh validation evidence. Leave the local preview running if it was already running. Do not stage, commit, push, or deploy unless the user separately requests it.
