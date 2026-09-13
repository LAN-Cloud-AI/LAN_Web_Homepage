import { applyI18n, getI18nTable, persistLocale, resolveLocale, setLocale } from "./i18n.js";
import { initWechatShare } from "./wechat-share.js";
import { initHeroMotion } from "./company-hero-motion.js";
import { initParticleFields } from "./company-particle-fields.js";
import { initPageMotion } from "./company-motion-preference.js";

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

// The selection carries context into the actual email draft; no fake form submission.
const topics = {
  product: ["new.inquiryProduct", "new.inquiryHint"],
  training: ["new.inquiryTraining", "new.inquiryTrainingHint"],
  global: ["new.inquiryGlobal", "new.inquiryGlobalHint"],
  project: ["new.inquiryProject", "new.inquiryProjectHint"],
};
const selectInquiry = value => {
  if (!topics[value]) return;
  document.querySelectorAll("[data-inquiry]").forEach(button => {
    const selected = button.dataset.inquiry === value;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.lastElementChild.textContent = selected ? "✓" : "+";
  });
  const [topicKey, hintKey] = topics[value];
  const hint = document.querySelector("#inquiry-hint");
  if (hint) hint.textContent = copy[hintKey];
  const email = document.querySelector("#inquiry-email");
  if (email) {
    email.href = `mailto:lance@lancloudtech.com?subject=${encodeURIComponent(`${copy[topicKey]} · LAN Cloud AI`)}&body=${encodeURIComponent(locale === "en" ? "Hello LAN Cloud AI,\n\nOur team / company:\nWhat we would like to discuss:\n" : locale === "zh-Hant" ? "蘭芯雲朵，你好：\n\n我們的團隊／公司：\n希望交流的具體問題：\n" : "兰芯云朵，你好：\n\n我们的团队／公司：\n希望交流的具体问题：\n")}`;
    email.dataset.umamiEventTopic = value;
  }
  const wecom = document.querySelector('[data-umami-event="inquiry_wecom"]');
  if (wecom) wecom.dataset.umamiEventTopic = value;
};
document.querySelectorAll("[data-inquiry]").forEach(button => button.addEventListener("click", () => selectInquiry(button.dataset.inquiry)));
document.querySelectorAll("[data-select-inquiry]").forEach(link => link.addEventListener("click", () => selectInquiry(link.dataset.selectInquiry)));
selectInquiry(new URLSearchParams(location.search).get("inquiry") || "product");

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
