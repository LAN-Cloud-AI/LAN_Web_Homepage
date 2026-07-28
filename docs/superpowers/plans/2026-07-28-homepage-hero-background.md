# Homepage Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing precision-atelier image into the responsive, accessible background of the homepage hero.

**Architecture:** The existing `<picture>` remains the source of the hero artwork but moves into a decorative, absolutely positioned background layer. CSS supplies the stacking order, image crop, and theme-aware scrim; semantic copy and actions remain ordinary foreground content.

**Tech Stack:** Static HTML, CSS media queries, Node.js built-in `fs`/`path` static verification, browser capture QA.

## Global Constraints

- Reuse `brand-hero-precision-atelier` responsive candidates; do not generate, stretch, or duplicate image assets.
- The hero image is decorative once it is background art: use `aria-hidden="true"` on its wrapper and an empty `alt` on the `<img>`.
- Preserve `fetchpriority="high"`, async decoding, current translations, CTA targets, and foldable source selection.
- No standalone image card remains below the hero copy.
- Light and dark themes must retain readable foreground copy and controls.
- The mobile image must use the dedicated `brand-hero-precision-atelier-mobile` candidates and a lower focal point.

---

### Task 1: Add the homepage hero regression verifier

**Files:**
- Create: `scripts/verify-homepage-hero.mjs`

**Interfaces:**
- Consumes: `index.html` and `styles.css` from `process.cwd()`.
- Produces: process exit code `0` on compliance; descriptive thrown errors when a required background, responsive image, or accessibility contract is absent.

- [ ] **Step 1: Write the failing test**

```js
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const page = read("index.html");
const css = read("styles.css");

required(page.includes('<div class="hero-background" aria-hidden="true">'), "Hero artwork must be a decorative background layer.");
required(page.includes('alt=""'), "Decorative hero artwork must have empty alternative text.");
required(page.includes('brand-hero-precision-atelier-mobile-768.webp'), "Hero background must retain the mobile WebP candidate.");
required(!page.includes('class="hero-visual'), "Standalone hero image card must be removed.");
required(css.includes('.hero-background {'), "Hero background needs its own CSS layer.");
required(css.includes('.hero::before {'), "Hero needs a readable image scrim.");
required(css.includes('pointer-events: none'), "Background layer must not block hero actions.");
required(css.includes('@media (prefers-color-scheme: dark)'), "Hero needs dark-mode treatment.");
required(css.includes('.hero-background img { object-position: 50% 64%; }'), "Mobile hero needs the lower image focal point.");

console.log("Homepage hero background verification passed.");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/verify-homepage-hero.mjs`

Expected: FAIL with `Hero artwork must be a decorative background layer.` because the current page still uses `.hero-visual`.

- [ ] **Step 3: Keep the verifier focused**

Do not add rendering assertions or unrelated product-page checks. The script owns only the structural, responsive, and accessibility contracts above.

- [ ] **Step 4: Re-run the test after each later task**

Run: `node scripts/verify-homepage-hero.mjs`

Expected before Tasks 2–3 complete: a descriptive failure that identifies the next missing contract.

### Task 2: Convert the existing hero picture into decorative background markup

**Files:**
- Modify: `index.html:61-109`
- Test: `scripts/verify-homepage-hero.mjs`

**Interfaces:**
- Consumes: the existing `brand-hero-precision-atelier` `<picture>` candidates.
- Produces: `.hero-background` as the first visual child of `.hero`; `.hero-copy` remains an unchanged foreground content block.

- [ ] **Step 1: Run the verifier to establish the red state**

Run: `node scripts/verify-homepage-hero.mjs`

Expected: FAIL with `Hero artwork must be a decorative background layer.`

- [ ] **Step 2: Replace only the hero visual wrapper**

Move the current `<picture>` before `.hero-copy` and change the wrapper to:

```html
<div class="hero-background" aria-hidden="true">
  <picture>
    <!-- preserve every existing responsive <source> candidate -->
    <img
      src="./images/generated/brand/brand-hero-precision-atelier.png"
      alt=""
      width="1537"
      height="1023"
      fetchpriority="high"
      decoding="async"
    />
  </picture>
</div>
```

Remove only `data-i18n-alt` and the meaningful image alt. Keep the existing source order, `sizes`, foldable media query, image dimensions, and image URLs unchanged.

- [ ] **Step 3: Run the verifier**

Run: `node scripts/verify-homepage-hero.mjs`

Expected: FAIL at the first missing CSS contract, beginning with `Hero background needs its own CSS layer.`

### Task 3: Layer, crop, and theme the background with CSS

**Files:**
- Modify: `styles.css:79-83`, `styles.css:386-545`, `styles.css:1324-1337`, `styles.css:1445-1450`
- Test: `scripts/verify-homepage-hero.mjs`

**Interfaces:**
- Consumes: `.hero`, `.hero-background`, `.hero-copy`, the site light/dark tokens, and existing reduced-motion rules.
- Produces: an image background at stack level 0, gradient scrim at 1, and readable copy/actions at 2.

- [ ] **Step 1: Run the verifier to establish the red state**

Run: `node scripts/verify-homepage-hero.mjs`

Expected: FAIL with `Hero background needs its own CSS layer.`

- [ ] **Step 2: Implement the minimum background layering rules**

Replace the standalone `.hero-visual` rules with:

```css
.hero {
  position: relative;
  isolation: isolate;
  min-height: min(50rem, calc(100svh - 3.25rem));
  overflow: hidden;
  background: var(--bg-deep);
}
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hero-background picture,
.hero-background img {
  display: block;
  width: 100%;
  height: 100%;
}
.hero-background img {
  object-fit: cover;
  object-position: center 57%;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.84) 41%, rgba(250, 252, 253, 0.22) 70%, rgba(248, 251, 252, 0.48) 100%);
}
.hero-copy {
  position: relative;
  z-index: 2;
}
```

Keep the existing desktop copy sizing, actions, and its centered alignment. Remove the image-card border radius, box shadow, and rise-in animation because the image is no longer a card.

- [ ] **Step 3: Add responsive and theme variants**

```css
@media (prefers-color-scheme: dark) {
  .hero::before {
    background: linear-gradient(180deg, rgba(8, 12, 18, 0.90) 0%, rgba(8, 12, 18, 0.76) 46%, rgba(8, 12, 18, 0.36) 72%, rgba(8, 12, 18, 0.58) 100%);
  }
}

@media (max-width: 640px) {
  .hero {
    min-height: calc(100svh - 3.25rem);
    padding-bottom: 2rem;
  }
  .hero-background img { object-position: 50% 64%; }
}
```

Retain the existing mobile copy and button rules. Remove `.hero-visual img` from the reduced-motion selector because there is no animation on the new background layer.

- [ ] **Step 4: Run the verifier**

Run: `node scripts/verify-homepage-hero.mjs`

Expected: PASS with `Homepage hero background verification passed.`

- [ ] **Step 5: Run static and browser QA**

Run:

```bash
node scripts/verify-homepage-hero.mjs
git diff --check -- index.html styles.css scripts/verify-homepage-hero.mjs
```

Then capture the first viewport in the selected browser at 1280×720 and 390×844 in both `prefers-color-scheme: light` and `dark`. Confirm that the headline, lede, primary CTA, secondary CTA, and mobile menu all remain readable; the hero has no horizontal overflow; the car materials remain visible beneath the copy; and no browser-console errors occur.

- [ ] **Step 6: Commit (only if separately authorized)**

Do not stage or commit the dirty shared worktree by default. If the user later requests a commit, stage only `index.html`, `styles.css`, `scripts/verify-homepage-hero.mjs`, and the associated design/plan documents after rechecking their diff.
