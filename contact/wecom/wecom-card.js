const returnLink = document.querySelector("[data-card-return]");

returnLink?.addEventListener("click", (event) => {
  if (!document.referrer) return;

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return;
  } catch {
    return;
  }

  event.preventDefault();
  window.history.back();
});
