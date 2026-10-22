import { applyI18n, getI18nTable, persistLocale, resolveLocale, setLocale } from "./i18n.b3059a280c1f.js";
import { initWechatShare } from "./wechat-share.53304647ce7b.js";
import { initPageMotion } from "./company-motion-preference.53304647ce7b.js";
import { initInquiry } from "./company-inquiry.98e775512674.js";

import { initContactParticles } from "./contact-particles.133be64c6d0c.js";

const locale = resolveLocale();
const copy = getI18nTable(locale);
persistLocale(locale);
applyI18n(locale);
initPageMotion();
const route = document.body.dataset.shareRoute || "home";
initWechatShare(route, { getLocale: resolveLocale });
document.querySelectorAll(".lang-opt").forEach(button => button.addEventListener("click", () => setLocale(button.dataset.locale)));

initInquiry({ copy, locale });
initContactParticles();

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
