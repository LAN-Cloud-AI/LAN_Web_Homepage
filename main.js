import { applyI18n, resolveLocale, setLocale } from "./i18n.js";
import { initWechatShare, refreshWechatShare } from "./wechat-share.js";

applyI18n();
initWechatShare("home", { getLocale: resolveLocale });

document.querySelectorAll(".lang-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const locale = btn.getAttribute("data-locale");
    if (locale) {
      setLocale(locale);
      refreshWechatShare(locale);
    }
  });
});

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#primary-nav");

const setMenuOpen = (open, { restoreFocus = false } = {}) => {
  nav?.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("is-nav-open", open);
  navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle?.setAttribute(
    "aria-label",
    open ? navToggle.dataset.closeMenuLabel || "Close menu" : navToggle.dataset.menuLabel || "Menu"
  );

  if (open) {
    window.requestAnimationFrame(() => navLinks?.querySelector("a")?.focus());
  } else if (restoreFocus) {
    navToggle?.focus();
  }
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav?.classList.contains("is-menu-open");
    setMenuOpen(!isOpen, { restoreFocus: Boolean(isOpen) });
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-menu-open")) {
      setMenuOpen(false, { restoreFocus: true });
    }
  });

  window.matchMedia("(max-width: 1024px)").addEventListener("change", (event) => {
    if (!event.matches) setMenuOpen(false);
  });
}

const onScroll = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 12);
  document.documentElement.classList.toggle("is-wechat-float-visible", window.scrollY > 240);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll, { once: true });

/** Interval that auto-pauses while the tab is hidden. */
const createVisibilityInterval = (fn, ms) => {
  let id = null;
  const start = () => {
    if (id != null || document.hidden) return;
    id = window.setInterval(fn, ms);
  };
  const stop = () => {
    if (id == null) return;
    window.clearInterval(id);
    id = null;
  };
  const sync = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener("visibilitychange", sync);
  start();
  return { start, stop };
};

if (!prefersReduced) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

const flowSpans = [...document.querySelectorAll("#capability-flow span")];
if (flowSpans.length && !prefersReduced) {
  let index = 0;
  const tick = () => {
    flowSpans.forEach((span, i) => span.classList.toggle("is-active", i === index));
    index = (index + 1) % flowSpans.length;
  };
  tick();
  createVisibilityInterval(tick, 1600);
} else {
  flowSpans.forEach((span) => span.classList.add("is-active"));
}

const DOT_COLS = 16;
const DOT_ROWS = 10;
const DOT_COUNT = DOT_COLS * DOT_ROWS;

const initDotCards = () => {
  const cards = [...document.querySelectorAll(".pillar-card")];
  if (!cards.length) return;

  for (const card of cards) {
    const field = card.querySelector(".dot-field");
    if (!field || field.childElementCount) continue;

    const frag = document.createDocumentFragment();
    const dots = [];
    for (let i = 0; i < DOT_COUNT; i += 1) {
      const dot = document.createElement("span");
      dot.className = "dot";
      frag.append(dot);
      dots.push(dot);
    }
    field.append(frag);

    if (prefersReduced) {
      dots.forEach((dot, i) => {
        if (i % 7 === 0) dot.classList.add("is-lit");
      });
      continue;
    }

    let twinkleId = null;
    let visible = false;

    const twinkle = () => {
      if (!visible || document.hidden) return;
      const flips = 4 + Math.floor(Math.random() * 5);
      for (let n = 0; n < flips; n += 1) {
        const dot = dots[Math.floor(Math.random() * dots.length)];
        if (!dot || dot.classList.contains("is-hot")) continue;
        dot.classList.add("is-lit");
        window.setTimeout(() => {
          if (!dot.classList.contains("is-hot")) dot.classList.remove("is-lit");
        }, 280 + Math.random() * 520);
      }
    };

    const startTwinkle = () => {
      if (twinkleId != null || !visible || document.hidden) return;
      twinkle();
      twinkleId = window.setInterval(twinkle, 700 + Math.random() * 500);
    };

    const stopTwinkle = () => {
      if (twinkleId == null) return;
      window.clearInterval(twinkleId);
      twinkleId = null;
    };

    const visibilityIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (visible) startTwinkle();
          else stopTwinkle();
        }
      },
      { threshold: 0.12 }
    );
    visibilityIo.observe(card);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopTwinkle();
      else if (visible) startTwinkle();
    });

    if (!canFineHover) continue;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const cx = Math.round(x * (DOT_COLS - 1));
      const cy = Math.round(y * (DOT_ROWS - 1));

      dots.forEach((dot, i) => {
        const dx = (i % DOT_COLS) - cx;
        const dy = Math.floor(i / DOT_COLS) - cy;
        const dist = Math.hypot(dx, dy);
        dot.classList.toggle("is-hot", dist <= 1.5);
        dot.classList.toggle("is-near", dist > 1.5 && dist <= 2.6);
      });
    });

    card.addEventListener("pointerleave", () => {
      dots.forEach((dot) => {
        dot.classList.remove("is-hot", "is-near");
      });
    });
  }
};

initDotCards();

const beliefList = document.querySelector("#belief-stream");
const beliefItems = beliefList ? [...beliefList.querySelectorAll("li")] : [];
if (beliefList && beliefItems.length) {
  if (prefersReduced) {
    beliefItems.forEach((li) => li.classList.add("is-in"));
  } else {
    const startBeliefStream = () => {
      beliefItems.forEach((li, i) => {
        window.setTimeout(() => li.classList.add("is-in"), i * 380);
      });
      window.setTimeout(() => {
        beliefList.classList.add("is-cycling");
        let active = 0;
        const cycle = () => {
          beliefItems.forEach((li, i) => li.classList.toggle("is-active", i === active));
          active = (active + 1) % beliefItems.length;
        };
        cycle();
        createVisibilityInterval(cycle, 2400);
      }, beliefItems.length * 380 + 500);
    };

    const beliefIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          startBeliefStream();
          beliefIo.unobserve(entry.target);
        }
      },
      { threshold: 0.35 }
    );
    beliefIo.observe(beliefList);
  }
}
