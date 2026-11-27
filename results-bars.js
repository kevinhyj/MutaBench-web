/* Horizontal score bars inspired by DeepRSI's homepage leaderboard.
 * Values come from saved metrics or audited saved assay-level evaluation means.
 */
(() => {
  const chart = document.getElementById('performance-chart');
  if (!chart) return;
  const boards = window.EVAGENT_LEADERBOARDS || {};
  const rowsElement = document.getElementById('performance-rows');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = '', visible = false, played = false, animations = [];

  function settle() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function reveal() {
    settle();
    if (!visible || reduced.matches || document.hidden) return;
    played = true;
    animations = [...chart.querySelectorAll('.performance-bar')].map((bar, i) =>
      bar.animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {
        duration: 700, delay: i*45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
      })
    );
  }
  function render(view, animate = true) {
    if (!boards[view]) return;
    settle(); current = view;
    const board = boards[view];
    const format = row => `${board.percent ? `${row.score.toFixed(1)}%` : row.score.toFixed(3)}`;
    const rows = board.rows.filter(row => Number.isFinite(row.score))
      .slice().sort((a,b) => b.score-a.score);
    // Keep zero in every scale; retain signed correlations and never pad tiny bars.
    const step = board.percent ? 10 : .1;
    const min = Math.min(0, Math.floor(Math.min(...rows.map(row => row.score), 0)/step)*step);
    const max = board.percent ? 100 : Math.max(step, Math.ceil(Math.max(...rows.map(row => row.score), 0)/step)*step);
    const percentage = value => (value-min)/(max-min)*100;
    const zero = percentage(0);
    const metric = `${board.group === 'external' ? '' : 'Mean '}${board.metric}`;
    chart.dataset.view = view;
    chart.dataset.rowCount = rows.length;
    chart.dataset.wideModels = String(!!board.expandedModelList);
    chart.style.setProperty('--zero-position', `${zero}%`);
    chart.style.setProperty('--baseline-color', '#F5B5BF');
    document.getElementById('performance-metric').textContent = metric;
    const scaleFormat = value => board.percent ? `${value.toFixed(0)}%` : value.toFixed(1);
    document.getElementById('performance-scale-min').textContent = scaleFormat(min);
    document.getElementById('performance-scale-max').textContent = scaleFormat(max);
    document.getElementById('performance-coverage').textContent = board.coverage;
    document.getElementById('performance-baseline-label').textContent = board.expandedModelList ? 'RF baselines' : 'Specialist & task-specific baselines';
    document.getElementById('performance-baseline-legend').hidden = !rows.some(row => row.kind === 'baseline');
    chart.setAttribute('aria-label', `${board.label}, ${board.variantLabel || board.group}, ${metric}. Bars share a ${scaleFormat(min)} to ${scaleFormat(max)} scale.`);
    rowsElement.replaceChildren(...rows.map((row, i) => {
      const position = row.rank || i+1;
      const tied = board.expandedModelList && rows.filter(r => r.rank === position).length > 1;
      const item = document.createElement('li');
      item.className = 'performance-row';
      item.dataset.model = row.modelKey; item.dataset.score = row.score; item.dataset.kind = row.kind;
      const rank = document.createElement('span');
      rank.className = 'performance-rank'; rank.textContent = `${tied ? '=' : ''}${position}`; rank.setAttribute('aria-hidden', 'true');
      const model = document.createElement('a');
      model.className = 'performance-model'; model.href = '#model-table'; model.textContent = row.model;
      model.setAttribute('aria-label', `${tied ? 'Tied ' : ''}${position}. ${row.model}, ${row.type}, ${metric} ${format(row)}, ${row.protocol}. View evaluation details.`);
      model.addEventListener('click', () => {
        document.querySelector('.model-comparison').open = true;
        document.getElementById('model-table').focus({preventScroll: true});
      });
      const plot = document.createElement('div'); plot.className = 'performance-plot';
      const track = document.createElement('div'); track.className = 'performance-track';
      const bar = document.createElement('span'); bar.className = 'performance-bar'; bar.setAttribute('aria-hidden', 'true');
      const value = percentage(row.score);
      bar.style.left = `${Math.min(zero, value)}%`;
      bar.style.width = `${Math.abs(value-zero)}%`;
      bar.style.transformOrigin = row.score < 0 ? 'right center' : 'left center';
      const score = document.createElement('span'); score.className = 'performance-score';
      score.textContent = format(row);
      score.style.left = `${Math.max(zero, value)}%`;
      track.append(bar, score); plot.append(track); item.append(rank, model, plot);
      return item;
    }));
    if (animate) reveal();
  }
  document.addEventListener('mutabench:board-change', event => {
    if (event.detail.view !== current) render(event.detail.view);
  });
  chart.addEventListener('focusin', settle);
  reduced.addEventListener('change', settle);
  document.addEventListener('visibilitychange', () => {if (document.hidden) settle();});
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) settle();
    else if (!played) reveal();
  }, {threshold: .15}).observe(chart);
  render(chart.dataset.view || 'protein', false);
})();
