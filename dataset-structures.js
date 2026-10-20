/* Decorative structure illustration motion; no molecular simulation. */
(() => {
  const atlas = document.querySelector('.source-atlas');
  if (!atlas) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');

  function update() {
    atlas.dataset.motion = preference.matches || document.hidden ? 'paused' : 'playing';

  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
  }, { threshold: .1 });
  atlas.querySelectorAll('.source-figure').forEach(figure => observer.observe(figure));
  update();
  atlas.classList.add('motion-ready');
  preference.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
