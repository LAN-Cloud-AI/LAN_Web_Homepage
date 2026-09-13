const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector("#menu-toggle");
const productNav = document.querySelector("#product-nav");

const closeMenu = () => {
  nav?.classList.remove("is-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

menuToggle?.addEventListener("click", () => {
  const open = !nav?.classList.contains("is-menu-open");
  nav?.classList.toggle("is-menu-open", open);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

productNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-menu-open")) {
    closeMenu();
    menuToggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!nav?.classList.contains("is-menu-open")) return;
  if (nav.contains(event.target)) return;
  closeMenu();
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const enableEntryMotion = () => {
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) return;

  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      motionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7%" });

  const motionTargets = [
    [".hero-copy", 0],
    [".hero-visual", 80],
    [".subscription-grid .story-copy", 0],
    [".subscription-grid .product-visual", 85],
    [".reimbursement-grid .story-copy", 0],
    [".reimbursement-grid .product-visual", 85],
    [".open-intro", 0],
    [".boundary-grid article", 65],
    [".contact-band-inner > *", 0],
  ];

  motionTargets.forEach(([selector, baseDelay]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("motion-enter");
      element.style.setProperty("--motion-delay", `${Math.min(baseDelay + index * 70, 240)}ms`);
      motionObserver.observe(element);
    });
  });

  document.documentElement.classList.add("motion-ready");
};

enableEntryMotion();
