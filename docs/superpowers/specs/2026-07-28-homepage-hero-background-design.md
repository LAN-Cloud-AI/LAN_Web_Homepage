# Homepage Hero Background Design

**Status:** Approved by the user on 2026-07-28.

## Goal

Make `brand-hero-precision-atelier` the visual background of the LAN Cloud AI homepage hero, so the opening copy and actions read as one integrated automotive-operations statement rather than a text block followed by a separate image card.

## Chosen approach

1. Reuse the existing responsive `<picture>` candidates as an absolutely positioned, decorative `.hero-background` layer. This keeps the dedicated mobile WebP asset and avoids stretching a single bitmap through CSS.
2. Put a subtle theme-aware gradient scrim between the image and the hero copy. In light mode it preserves the image while protecting the dark text; in dark mode it deepens the image enough for light text and controls to remain legible.
3. Remove the standalone image-card presentation. The hero keeps its existing copy, buttons, navigation, translations, and anchor links.

## Responsive behavior

- Desktop: cover the first section, with the automotive materials visible in the lower half and the copy in the visually quiet upper region.
- Mobile and narrow foldables: use the existing mobile image candidate, keep the copy in the high-contrast upper zone, and move the image focal point down so the wheel/material details are visible without colliding with the CTAs.
- Dual-screen/foldable layouts: keep the existing `<picture>` segment source selection and allow the background layer to span the section behind the existing two-column rules.

## Accessibility and performance

- Because the image becomes decorative background art, the background wrapper is hidden from assistive technology and its `<img>` has empty alt text.
- Preserve `fetchpriority="high"`, async decoding, and the existing responsive image candidates.
- The background layer cannot intercept pointer or keyboard input.

## Verification

- A static homepage-hero verifier confirms the responsive background markup, scrim, mobile focal-point rule, dark-mode treatment, and removal of the standalone visual card.
- Browser captures validate the hero at desktop and mobile viewports in both color schemes, including no horizontal overflow and readable primary copy/actions.
