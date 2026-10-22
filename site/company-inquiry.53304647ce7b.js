const TOPICS = {
  product: ["new.inquiryProduct", "new.inquiryHint"],
  training: ["new.inquiryTraining", "new.inquiryTrainingHint"],
  global: ["new.inquiryGlobal", "new.inquiryGlobalHint"],
  project: ["new.inquiryProject", "new.inquiryProjectHint"],
};
export const INQUIRY_INTERVAL = 2500;

/** Rotate the introduction without changing an inquiry the visitor has chosen. */
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
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const query = new URLSearchParams(win.location.search).get("inquiry");
  let selected = values.includes(query) ? query : values[0];
  let locked = values.includes(query);
  let visible = false, hovered = false, focused = false, suspended = false, disposed = false;
  let timer = null, hintAnimation = null;
  const cleanups = [];
  const listen = (target, type, listener, options) => {
    target.addEventListener(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  };
  const stop = () => { if (timer !== null) win.clearTimeout(timer); timer = null; };
  const canRotate = () => !disposed && !locked && visible && !hovered && !focused && !suspended && !doc.hidden && !reduced.matches;
  // The changing hint remains available to readers without announcing a new topic every 2.5s.
  hint?.setAttribute("aria-live", "off");
  const select = (value, animate = false) => {
    if (!values.includes(value)) return;
    selected = value;
    for (const button of buttons) {
      const active = button.dataset.inquiry === value;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
      button.lastElementChild.textContent = active ? "✓" : "+";
    }
    const [topicKey, hintKey] = TOPICS[value];
    hintAnimation?.cancel();
    hintAnimation = null;
    if (hint) {
      hint.textContent = copy[hintKey];
      if (animate && !reduced.matches && typeof hint.animate === "function") {
        hintAnimation = hint.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
      }
    }
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
  const schedule = () => {
    stop();
    contact.dataset.inquiryRotation = locked ? "manual" : canRotate() ? "running" : "paused";
    if (canRotate()) timer = win.setTimeout(() => {
      timer = null;
      if (!canRotate()) return;
      select(values[(values.indexOf(selected) + 1) % values.length], true);
      schedule();
    }, INQUIRY_INTERVAL);
  };
  const lock = () => { locked = true; schedule(); };
  const choose = value => { if (values.includes(value)) { lock(); select(value, true); } };
  for (const button of buttons) listen(button, "click", () => choose(button.dataset.inquiry));
  for (const link of doc.querySelectorAll("[data-select-inquiry]")) {
    listen(link, "click", () => choose(link.dataset.selectInquiry));
  }
  // Freeze before the click is dispatched so the destination and its analytics agree.
  for (const action of [email, wecom].filter(Boolean)) {
    listen(action, "pointerdown", lock);
    listen(action, "click", lock);
    listen(action, "keydown", event => { if (event.key === "Enter" || event.key === " ") lock(); });
  }
  listen(contact, "pointerenter", event => { if (event.pointerType !== "touch") { hovered = true; schedule(); } });
  listen(contact, "pointerleave", () => { hovered = false; schedule(); });
  listen(contact, "focusin", () => { focused = true; schedule(); });
  listen(contact, "focusout", event => { focused = contact.contains(event.relatedTarget); schedule(); });
  listen(doc, "visibilitychange", schedule);
  listen(reduced, "change", () => { hintAnimation?.cancel(); schedule(); });

  let observer;
  if ("IntersectionObserver" in win) {
    observer = new win.IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === contact);
      if (entry) { visible = entry.isIntersecting && entry.intersectionRatio >= 0.12; schedule(); }
    }, { threshold: [0, 0.12] });
    observer.observe(contact);
  } else {
    const measureVisibility = () => {
      const rect = contact.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < win.innerHeight;
      schedule();
    };
    listen(win, "scroll", measureVisibility, { passive: true });
    listen(win, "resize", measureVisibility, { passive: true });
    measureVisibility();
  }
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    hintAnimation?.cancel();
    observer?.disconnect();
    for (const cleanup of cleanups) cleanup();
  };
  listen(win, "pagehide", event => {
    if (!event.persisted) { dispose(); return; }
    suspended = true;
    schedule();
  });
  listen(win, "pageshow", () => { suspended = false; schedule(); });
  select(selected);
  schedule();
  return dispose;
}
