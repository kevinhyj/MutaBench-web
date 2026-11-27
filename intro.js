/* Decorative molecular sketches; transforms do not simulate molecular dynamics. */
(() => {
  const visual = document.querySelector('.scope-visual');
  const toggle = visual?.querySelector('.scope-motion-toggle');
  if (!visual || !toggle) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let paused = false;
  function syncMotion() {
    const running = visible && !paused && !preference.matches && !document.hidden;
    visual.dataset.motion = running ? 'running' : 'paused';
    toggle.hidden = preference.matches;
    toggle.toggleAttribute('data-paused', paused);
    toggle.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncMotion();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
  }, { threshold: 0 }).observe(visual);
  document.addEventListener('visibilitychange', syncMotion);
  preference.addEventListener('change', syncMotion);
  syncMotion();
})();
