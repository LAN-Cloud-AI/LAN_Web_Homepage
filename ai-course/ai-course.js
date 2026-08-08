const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector("#menu-toggle");
const productNav = document.querySelector("#product-nav");

const setMenuOpen = (open, { restoreFocus = false } = {}) => {
  nav?.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("is-nav-open", open);
  menuToggle?.setAttribute("aria-expanded", open ? "true" : "false");

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

const revealItems = document.querySelectorAll(".reveal");
if (prefersReduced || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-in"));
} else {
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
}

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

const stageMeta = {
  foundation: {
    label: "初阶",
    title: "AI 与 Agent 应用实践",
    blurb: "建立可靠使用 AI 与设计任务工作流的基础。",
    meta: "4 课 · 16 课时",
  },
  prototype: {
    label: "中阶",
    title: "业务发现与模块化构建",
    blurb: "从真实业务问题走向可运行的全栈 MVP。",
    meta: "10 课 · 40 课时",
  },
  delivery: {
    label: "高阶",
    title: "生产交付与业务落地",
    blurb: "把 MVP 扩展为可治理、可验证的生产交付。",
    meta: "7 课 · 28 课时",
  },
};

const renderFdeSchedule = () => {
  const root = document.querySelector("[data-fde-schedule]");
  const courses = window.FDE_PUBLIC_COURSES;
  if (!root || !Array.isArray(courses)) return;

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
              <p class="lesson-output"><span>主要产出 · </span><span class="copy-unit">${escapeHTML(course.summaryOutput)}</span></p>
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

  const nestedReveals = root.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    nestedReveals.forEach((item) => item.classList.add("is-in"));
  } else {
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
    nestedReveals.forEach((item) => observer.observe(item));
  }
};

renderFdeSchedule();
