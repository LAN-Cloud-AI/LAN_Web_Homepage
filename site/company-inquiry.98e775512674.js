const TOPICS = {
  product: ["new.inquiryProduct", "new.inquiryHint"],
  training: ["new.inquiryTraining", "new.inquiryTrainingHint"],
  global: ["new.inquiryGlobal", "new.inquiryGlobalHint"],
  project: ["new.inquiryProject", "new.inquiryProjectHint"],
};

/** Inquiry is an explicit choice. Decorative motion never changes its destination. */
export function initInquiry({ copy, locale, win = window }) {
  const doc = win.document;
  const contact = doc.querySelector("#contact .contact-options");
  if (!contact) return () => {};
  const buttons = [...contact.querySelectorAll("[data-inquiry]")];
  const values = buttons.map(button => button.dataset.inquiry).filter(value => TOPICS[value]);
  if (!values.length) return () => {};
  const hint = contact.querySelector("#inquiry-hint");
  const email = contact.querySelector("#inquiry-email");
  const wecom = contact.querySelector('[data-umami-event="inquiry_wecom"]');
  const query = new URLSearchParams(win.location.search).get("inquiry");
  const cleanups = [];
  const hints = new Map();
  let selected = null;
  const listen = (target, type, listener) => {
    target.addEventListener(type, listener);
    cleanups.push(() => target.removeEventListener(type, listener));
  };
  contact.dataset.inquiryRotation = "manual";
  // All four descriptions contribute to the grid's height; only one is visible/readable.
  // This reserves the exact space required by the current language and screen width.
  if (hint) {
    hint.replaceChildren();
    hint.removeAttribute("data-i18n");
    hint.setAttribute("aria-live", "polite");
    hint.setAttribute("aria-atomic", "true");
    for (const value of values) {
      const span = doc.createElement("span");
      span.className = "inquiry-hint-text";
      span.textContent = copy[TOPICS[value][1]];
      span.setAttribute("aria-hidden", "true");
      hint.append(span);
      hints.set(value, span);
    }
  }
  for (const button of buttons) {
    const mark = button.lastElementChild;
    if (!mark) continue;
    mark.className = "inquiry-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  const select = value => {
    if (!values.includes(value) || value === selected) return;
    selected = value;
    contact.dataset.inquirySelected = value;
    for (const button of buttons) {
      const active = button.dataset.inquiry === value;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    }
    for (const [key, span] of hints) {
      const active = key === value;
      span.classList.toggle("is-active", active);
      span.setAttribute("aria-hidden", String(!active));
    }
    const [topicKey] = TOPICS[value];
    if (email) {
      const body = locale === "en" ? "Hello LAN Cloud AI,\n\nOur team / company:\nWhat we would like to discuss:\n" : locale === "zh-Hant" ? "蘭芯雲朵，你好：\n\n我們的團隊／公司：\n希望交流的具體問題：\n" : "兰芯云朵，你好：\n\n我们的团队／公司：\n希望交流的具体问题：\n";
      email.href = `mailto:lance@lancloudtech.com?subject=${encodeURIComponent(`${copy[topicKey]} · LAN Cloud AI`)}&body=${encodeURIComponent(body)}`;
      email.dataset.umamiEventTopic = value;
    }
    if (wecom) {
      const destination = new URL(wecom.getAttribute("href"), win.location.href);
      destination.searchParams.set("inquiry", value);
      wecom.href = `${destination.pathname}${destination.search}${destination.hash}`;
      wecom.dataset.umamiEventTopic = value;
    }
  };
  for (const button of buttons) listen(button, "click", () => select(button.dataset.inquiry));
  for (const link of doc.querySelectorAll("[data-select-inquiry]")) {
    listen(link, "click", () => select(link.dataset.selectInquiry));
  }
  select(values.includes(query) ? query : values[0]);
  return () => { for (const cleanup of cleanups) cleanup(); };
}
