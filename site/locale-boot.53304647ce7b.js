import { applyI18n, persistLocale, resolveLocale, setLocale } from "./i18n.53304647ce7b.js";
import { initWechatShare } from "./wechat-share.53304647ce7b.js";

persistLocale(resolveLocale());
applyI18n();

const shareRoute = document.body?.dataset?.shareRoute;
if (shareRoute) initWechatShare(shareRoute, { getLocale: resolveLocale });

document.querySelectorAll(".lang-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const locale = btn.getAttribute("data-locale");
    if (locale) setLocale(locale);
  });
});
