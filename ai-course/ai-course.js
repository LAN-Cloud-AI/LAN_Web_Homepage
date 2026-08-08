import { resolveLocale } from "../i18n.js";
import { initFooterAccordion } from "../footer-accordion.js";
import {
  LOCALE_STORAGE_KEY,
  applyCourseI18n,
  courseT,
  getStageMeta,
} from "./ai-course-i18n.js";
import { getFdePublicCourses } from "./fde/course-summary.js";
import { initWechatShare, refreshWechatShare } from "../wechat-share.js";

const courseShareRouteByPage = {
  hub: "ai-course",
  fde: "ai-course-fde",
  mvp: "ai-course-mvp-3day",
};

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector("#menu-toggle");
const productNav = document.querySelector("#product-nav");

const setMenuOpen = (open, { restoreFocus = false } = {}) => {
  nav?.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("is-nav-open", open);
  menuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  if (menuToggle) {
    const isOpen = Boolean(open);
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? menuToggle.dataset.closeMenuLabel || "Close menu" : menuToggle.dataset.menuLabel || "Menu"
    );
  }

  if (open) {
    window.requestAnimationFrame(() => productNav?.querySelector("a")?.focus());
  } else if (restoreFocus) {
    menuToggle?.focus();
  }
};

if (menuToggle && productNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav?.classList.contains("is-menu-open");
    setMenuOpen(!isOpen, { restoreFocus: Boolean(isOpen) });
  });

  productNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-menu-open")) {
      setMenuOpen(false, { restoreFocus: true });
    }
  });

  window.matchMedia("(max-width: 720px)").addEventListener("change", (event) => {
    if (!event.matches) setMenuOpen(false);
  });
}

const onScroll = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 12);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const observeReveals = (scope = document) => {
  const revealItems = scope.querySelectorAll(".reveal:not(.is-in)");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
  );
  revealItems.forEach((item) => observer.observe(item));
};

const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character]
  );

const renderFdeSchedule = (locale) => {
  const root = document.querySelector("[data-fde-schedule]");
  if (!root) return;

  const courses = getFdePublicCourses(locale);
  const stageMeta = getStageMeta(locale);
  const order = ["foundation", "prototype", "delivery"];
  const grouped = Object.fromEntries(order.map((key) => [key, []]));

  for (const course of courses) {
    if (grouped[course.stageKey]) grouped[course.stageKey].push(course);
  }

  root.innerHTML = order
    .map((key) => {
      const meta = stageMeta[key];
      const lessons = grouped[key]
        .map(
          (course) => `
          <article class="lesson-card reveal" id="${escapeHTML(course.id)}">
            <div class="lesson-num">${escapeHTML(course.number)}</div>
            <div>
              <h4 class="copy-unit">${escapeHTML(course.title)}</h4>
              <ul>
                ${course.summaryObjectives
                  .map((item) => `<li class="copy-unit">${escapeHTML(item)}</li>`)
                  .join("")}
              </ul>
              <p class="lesson-output"><span>${escapeHTML(courseT("fde.outputLabel", locale))}</span><span class="copy-unit">${escapeHTML(course.summaryOutput)}</span></p>
              <p class="lesson-duration">${escapeHTML(course.duration)}</p>
            </div>
          </article>`
        )
        .join("");

      return `
        <section class="lesson-stage" aria-labelledby="stage-${key}">
          <div class="lesson-stage-head reveal">
            <h3 id="stage-${key}"><span class="copy-unit">${escapeHTML(meta.label)} · ${escapeHTML(meta.title)}</span></h3>
            <span>${escapeHTML(meta.meta)}</span>
          </div>
          <div class="lesson-list">${lessons}</div>
        </section>`;
    })
    .join("");

  observeReveals(root);
};

const refreshStageCards = (locale) => {
  const stageMeta = getStageMeta(locale);
  document.querySelectorAll("[data-stage-card]").forEach((card) => {
    const key = card.getAttribute("data-stage-card");
    const meta = stageMeta[key];
    if (!meta) return;
    const label = card.querySelector("[data-stage-label]");
    const title = card.querySelector("[data-stage-title]");
    const blurb = card.querySelector("[data-stage-blurb]");
    const info = card.querySelector("[data-stage-meta]");
    if (label) label.textContent = `0${["foundation", "prototype", "delivery"].indexOf(key) + 1} · ${meta.label}`;
    if (title) title.textContent = meta.title;
    if (blurb) blurb.textContent = meta.blurb;
    if (info) info.textContent = meta.meta;
  });
};

const refreshPage = (locale) => {
  const resolved = applyCourseI18n(locale);
  refreshStageCards(resolved);
  renderFdeSchedule(resolved);
  observeReveals(document);
  return resolved;
};

document.querySelectorAll(".lang-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const locale = btn.getAttribute("data-locale");
    if (!locale) return;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    refreshPage(locale);
    refreshWechatShare(locale);
  });
});

const shareRoute =
  document.body?.dataset?.shareRoute ||
  courseShareRouteByPage[document.body?.dataset?.coursePage || ""] ||
  null;
if (shareRoute) {
  initWechatShare(shareRoute, { getLocale: resolveLocale });
}

initFooterAccordion();
refreshPage();
