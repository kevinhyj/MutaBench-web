/* One explanatory pass on entry. No model calls or result data are involved. */
(() => {
  const figure = document.querySelector('.method-workflow');
  if (!figure) return;
  const replay = figure.querySelector('.method-replay');
  const replayLabel = replay.querySelector('span');
  const buttons = [...document.querySelectorAll('.method-step-button')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, elapsed = 0, start = 0, playing = false, entered = false;
  const duration = 7200;
  const routes = [...figure.querySelectorAll('.method-route')].map(path => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '5'); dot.setAttribute('fill', path.classList.contains('method-label-route') ? '#b89460' : '#728ab9');
    dot.setAttribute('class', 'method-particle'); dot.setAttribute('aria-hidden', 'true');
    dot.style.opacity = '0'; path.parentNode.append(dot);
    return {path, dot, length: path.getTotalLength()};
  });
  function select(index) {
    if (index === null) figure.removeAttribute('data-focus');
    else figure.dataset.focus = String(index);
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      button.closest('li').classList.toggle('is-selected', i === index);
    });
  }
  function label() {
    replayLabel.textContent = reduced.matches ? 'Show all steps' : playing ? 'Pause flow' : elapsed > 0 ? 'Resume flow' : 'Replay flow';
  }
  function stop(reset = true) {
    cancelAnimationFrame(frame); playing = false;
    figure.removeAttribute('data-playing');
    if (reset) { figure.removeAttribute('data-animation'); elapsed = 0; routes.forEach(({dot}) => {dot.style.opacity = '0';}); }
    label();
  }
  function tick(now) {
    if (!playing) return;
    elapsed = now - start;
    if (elapsed >= duration) { stop(); select(null); return; }
    select(Math.min(3, Math.floor(elapsed / 1800)));
    routes.forEach(({path, dot, length}) => {
      const source = path.dataset.source;
      const begin = source === 'labels' ? 5100 : Number(source) * 1800 + 650;
      const travel = source === 'labels' ? 1650 : 1050;
      const fraction = (elapsed - begin) / travel;
      dot.style.opacity = fraction >= 0 && fraction <= 1 ? '1' : '0';
      if (fraction >= 0 && fraction <= 1) {
        const point = path.getPointAtLength(length * fraction);
        dot.setAttribute('transform', `translate(${point.x} ${point.y})`);
      }
    });
    frame = requestAnimationFrame(tick);
  }
  function play() {
    if (reduced.matches) { stop(); select(null); return; }
    playing = true; figure.setAttribute('data-animation', ''); figure.setAttribute('data-playing', ''); start = performance.now() - elapsed; label(); frame = requestAnimationFrame(tick);
  }
  replay.hidden = false;
  replay.addEventListener('click', () => { entered = true; if (playing) stop(false); else play(); });
  buttons.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener('click', () => {
      entered = true; stop(); select(figure.dataset.focus === String(index) ? null : index);
    });
  });
  const observer = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !entered && !document.hidden) { entered = true; play(); }
    else if (!visible && playing) { stop(); select(null); }
  }, {threshold: .15});
  observer.observe(figure);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) { stop(); select(null); } });
  reduced.addEventListener('change', () => { stop(); select(null); });
  // Exporters can settle an in-progress illustration into its complete state.
  figure.addEventListener('method:show-all', () => { entered = true; stop(); select(null); });
  label();
})();
