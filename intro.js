/* An illustrative input comparison, never a prediction request or result view. */
(() => {
  const stage = document.querySelector('.benchmark-stage');
  if (!stage) return;
  const buttons = [...stage.querySelectorAll('.benchmark-setting-switch button')];
  const support = stage.querySelector('.support-board');
  const empty = stage.querySelector('.support-empty');
  function choose(setting, interacted = false) {
    stage.dataset.setting = setting;
    if (interacted) stage.setAttribute('data-interacted', '');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setting === setting)));
    support.hidden = setting === 'zero';
    empty.hidden = setting !== 'zero';
    stage.querySelectorAll('.benchmark-mode-copy p').forEach(copy => { copy.hidden = copy.id !== `intro-${setting}-copy`; });
    // Query inputs and their masked measurements intentionally never change.
  }
  buttons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => choose(button.dataset.setting, true));
  });
  choose('few');
})();

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
