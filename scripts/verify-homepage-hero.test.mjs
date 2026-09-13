import assert from "node:assert/strict";
import { verifyHero } from "./verify-homepage-hero.mjs";

// An independent example deliberately uses different assets, dimensions and layer values.
const page = `<section id='welcome' class='featured hero'>
  <div aria-hidden='true' class='hero-background artwork'><picture>
    <source type='image/webp' media='(max-width: 45rem)' srcset='/small.webp 360w, /medium.webp 900w' sizes='100vw'>
    <source type='image/webp' srcset='/medium.webp 900w, /large.webp 1800w' sizes='(max-width: 70rem) 100vw, 1100px'>
    <img height='1000' width='1800' src='/fallback.png' decoding='async' fetchpriority='high' alt=''>
  </picture></div>
  <div class='hero-copy'><h1>Products that help teams work</h1><a href='/products/'>Explore</a></div>
</section>`;
const css = `
  .hero { position: relative; isolation: isolate; background: #fafafa; }
  .hero-background { position: absolute; pointer-events: none; z-index: 1; }
  .hero-copy { position: relative; z-index: 3; }
  .hero-visual { border-radius: 2rem; }
  @media screen and (prefers-color-scheme: dark) {
    :root { --ink: white; }
    .hero { background: black; }
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;
assert.doesNotThrow(() => verifyHero(page, css));

const reject = (name, nextPage, nextCss, message) => {
  assert.ok(nextPage !== page || nextCss !== css, `${name}: mutation must change the fixture`);
  assert.throws(() => verifyHero(nextPage, nextCss), message, name);
};

reject("decorative image has no alt", page.replace(" alt=''", ""), css, /empty alternative text/);
reject("unrelated alt cannot hide missing hero alt", `<img alt=''>${page.replace(" alt=''", "")}`, css, /empty alternative text/);
reject("commented markup cannot supply a heading", page.replace("<h1>Products that help teams work</h1>", "<!-- <h1>Decoy</h1> -->"), css, /visible text h1/);
reject("aria-hidden copy", page.replace("class='hero-copy'", "class='hero-copy' aria-hidden='true'"), css, /copy must be accessible/);
reject("missing image height", page.replace("height='1000'", ""), css, /intrinsic width and height/);
reject("invalid width descriptor", page.replace("360w", "360px"), css, /width descriptors/);
reject("non-image source type", page.replace("type='image/webp'", "type='application/json'"), css, /image MIME type/);
reject("duplicate width candidates", page.replace("360w", "900w"), css, /distinct widths/);
reject("missing source sizes", page.replace("sizes='100vw'", ""), css, /usable sizes/);
reject("lazy hero download", page.replace("fetchpriority='high'", "fetchpriority='high' loading='lazy'"), css, /without lazy loading/);
reject("no PNG fallback", page.replace("/fallback.png", "/fallback.webp"), css, /PNG image fallback/);
reject("decoy pointer-events rule", page, css.replace("pointer-events: none;", "") + ".unrelated { pointer-events: none; }", /positioned and inert/);
reject("only mobile decoration is inert", page, css.replace("pointer-events: none;", "") + "@media(max-width:40rem){.hero-background{pointer-events:none}}", /positioned and inert/);
reject("image restores pointer events", page, css + ".hero-background img { pointer-events: auto; }", /positioned and inert/);
reject("copy beneath artwork", page, css + "main>.hero-copy { z-index: -1 }", /below the copy layer/);
reject("irrelevant dark media", page, css.replace(":root { --ink: white; }", ".unrelated { color: white; }").replace(".hero { background: black; }", ".unrelated { background: black; }"), /dark-mode foreground/);
reject("nested mobile pointer override", page, css + "@media (max-width: 50rem) { @supports (display: grid) { .hero .hero-background { pointer-events: auto } } }", /positioned and inert/);
reject("reduced motion leaves transitions running", page, css.replace("transition: none !important;", ""), /disable decorative animations/);
reject("smooth scrolling retained for reduced motion", page, css.replace("scroll-behavior: auto", "scroll-behavior: smooth"), /disable smooth document scrolling/);

console.log("Homepage hero verifier accepts independent layouts and rejects 19 accessibility, delivery and CSS regressions.");
