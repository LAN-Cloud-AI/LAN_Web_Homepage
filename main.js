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
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
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
  setInterval(tick, 1400);
} else {
  flowSpans.forEach((span) => span.classList.add("is-active"));
}

document.querySelectorAll(".btn, .repo, .nav-cta").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    if (prefersReduced || !(el instanceof HTMLElement)) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
  });
  el.addEventListener("pointerleave", () => {
    if (el instanceof HTMLElement) el.style.transform = "";
  });
});
