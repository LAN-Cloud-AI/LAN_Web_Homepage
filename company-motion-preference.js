/** Remove the preview's session pause preference; accessible fallbacks remain automatic. */
export function initPageMotion() {
  function resetPreviewPreference() {
    document.documentElement.dataset.motionPaused = 'false';
    try { sessionStorage.removeItem('lan.motion.paused'); } catch { /* Storage is optional. */ }
  }
  resetPreviewPreference();
  // An older preview page in the same tab must not reintroduce a stale pause on return.
  window.addEventListener('pageshow', resetPreviewPreference);
  return () => window.removeEventListener('pageshow', resetPreviewPreference);
}
