const MOBILE_MQ = "(max-width: 640px)";

/**
 * Apple-style footer directory: collapsed columns on small screens,
 * always expanded on larger viewports.
 */
export const initFooterAccordion = () => {
  const cols = [...document.querySelectorAll(".footer-col")];
  if (!cols.length) return;

  const mq = window.matchMedia(MOBILE_MQ);

  const setOpen = (col, open) => {
    const toggle = col.querySelector(".footer-col-toggle");
    col.classList.toggle("is-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const syncViewport = () => {
    // Desktop: always open for AT + CSS; mobile: start collapsed.
    cols.forEach((col) => setOpen(col, !mq.matches));
  };

  cols.forEach((col) => {
    const toggle = col.querySelector(".footer-col-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      if (!mq.matches) return;
      setOpen(col, !col.classList.contains("is-open"));
    });
  });

  syncViewport();
  mq.addEventListener("change", syncViewport);
};
