import { applyI18n, setLocale } from "./i18n.js";

applyI18n();

document.querySelectorAll(".lang-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const locale = btn.getAttribute("data-locale");
    if (locale) setLocale(locale);
  });
});

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nav = document.querySelector(".nav");
const onScroll = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 12);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

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
  setInterval(tick, 1600);
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
    card._dots = dots;

    if (prefersReduced) {
      dots.forEach((dot, i) => {
        if (i % 7 === 0) dot.classList.add("is-lit");
      });
      continue;
    }

    const twinkle = () => {
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

    twinkle();
    card._twinkleId = window.setInterval(twinkle, 700 + Math.random() * 500);

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
        window.setInterval(cycle, 2400);
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
