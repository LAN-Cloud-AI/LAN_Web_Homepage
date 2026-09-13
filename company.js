import { applyI18n, getI18nTable, persistLocale, resolveLocale, setLocale } from "./i18n.js";
import { initWechatShare } from "./wechat-share.js";
import { initHeroMotion } from "./company-hero-motion.js";
import { initParticleFields } from "./company-particle-fields.js";
import { initPageMotion } from "./company-motion-preference.js";
import { initInquiry } from "./company-inquiry.js";

const locale = resolveLocale();
const copy = getI18nTable(locale);
persistLocale(locale);
applyI18n(locale);
initPageMotion();
initHeroMotion();
initParticleFields();
const route = document.body.dataset.shareRoute || "home";
initWechatShare(route, { getLocale: resolveLocale });
document.querySelectorAll(".lang-opt").forEach(button => button.addEventListener("click", () => setLocale(button.dataset.locale)));

initInquiry({ copy, locale });

// Motion never gates readable content, and is disabled when the user requests it.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("has-entered");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".section-heading, .product, .academy-feature, .method-statement").forEach(element => observer.observe(element));
}
