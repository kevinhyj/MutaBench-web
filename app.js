const leaderboardData = window.EVAGENT_LEADERBOARDS || {};
const body = document.getElementById('leaderboard-body');
const groups = [...document.querySelectorAll('[data-result-group]')];
const taskChoices = document.getElementById('performance-tasks');
const variantChoice = document.getElementById('performance-variant');
let selectedBoard = 'protein';
const rememberedBoards = {};
function renderBoard(view = 'protein') {
  if (!body || !leaderboardData[view]) return;
  const board = leaderboardData[view];
  selectedBoard = view;
  rememberedBoards[board.group] = view;
  document.getElementById('performance-chart').dataset.view = view;
  body.replaceChildren(...board.rows.map(row => {
    const tr = document.createElement('tr');
    tr.dataset.kind = row.kind;
    const cells = [
      ['rank', String(row.rank)],
      ['model-cell', row.model],
      ['model-type', row.type],
      ['score', board.percent ? `${row.score.toFixed(1)}%` : row.score.toFixed(3)],
      ['input-arm', row.input]
    ];
    cells.forEach(([className, value]) => {
      const td = document.createElement('td');
      td.className = className;
      td.textContent = value;
      tr.append(td);
    });
    return tr;
  }));
  document.getElementById('leaderboard-summary').textContent = board.summary;
  document.getElementById('leaderboard-score-heading').textContent = board.metric;
  document.getElementById('leaderboard-input-heading').textContent = board.group === 'zero' ? 'Input (Best Performance)' : 'Input';
  groups.forEach(button => {
    const selected = button.dataset.resultGroup === board.group;
    button.setAttribute('aria-pressed', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  // Rebuild task controls only on a group change, preserving keyboard focus otherwise.
  const siblings = Object.entries(leaderboardData).filter(([,item]) => item.group === board.group);
  if (taskChoices.dataset.group !== board.group) {
    taskChoices.dataset.group = board.group;
    const tasks = [...new Set(siblings.map(([,item]) => item.task))];
    taskChoices.replaceChildren(...tasks.map(task => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'selection-control'; button.dataset.task = task;
      button.textContent = siblings.find(([,item]) => item.task === task)[1].label;
      button.setAttribute('aria-controls', 'performance-chart model-table');
      button.addEventListener('click', () => {
        const current = leaderboardData[selectedBoard];
        const options = siblings.filter(([,item]) => item.task === task);
        renderBoard((options.find(([,item]) => item.variant === current.variant) || options[0])[0]);
      });
      return button;
    }));
  }
  [...taskChoices.children].forEach(button => {
    const selected = button.dataset.task === board.task;
    button.setAttribute('aria-pressed', String(selected)); button.tabIndex = selected ? 0 : -1;
  });
  const variants = siblings.filter(([,item]) => item.task === board.task);
  document.getElementById('performance-condition').hidden = variants.length < 2;
  document.querySelector('label[for="performance-variant"]').textContent = board.group === 'multi' ? 'Evaluation round' : 'Comparison & support';
  variantChoice.replaceChildren(...variants.map(([key,item]) => new Option(item.variantLabel || item.label,key,false,key === view)));
  document.getElementById('model-table')?.setAttribute('aria-label', `${board.label}, ${board.variantLabel || board.group}, model comparison`);
  document.dispatchEvent(new CustomEvent('mutabench:board-change', {detail: {view}}));
}
document.addEventListener('mutabench:select-board', event => renderBoard(event.detail.view));
groups.forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.resultGroup;
  renderBoard(rememberedBoards[group] || Object.keys(leaderboardData).find(key => leaderboardData[key].group === group));
}));
variantChoice?.addEventListener('change', () => renderBoard(variantChoice.value));
[document.querySelector('.evaluation-modes'), taskChoices].filter(Boolean).forEach(container => {
  container.addEventListener('keydown', event => {
    const buttons = [...container.querySelectorAll('button')];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    const next = {ArrowRight: (index+1)%buttons.length, ArrowLeft: (index+buttons.length-1)%buttons.length,
      Home: 0, End: buttons.length-1}[event.key];
    if (next === undefined) return;
    event.preventDefault(); buttons[next].focus(); buttons[next].click();
  });
});
renderBoard();

// All section entry points share one selected state. Native links retain history
// and deep-link behavior; a clicked destination stays highlighted during scrolling.
const sectionLinks = [...document.querySelectorAll('.section-navigation a, .home-section-links a')];
const sections = [...document.querySelectorAll('.section-navigation a')]
  .map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
let pending = false;
let destination = null;
let settleTimer;

function selectSection(id) {
  sectionLinks.forEach(link => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function updateSection() {
  pending = false;
  if (destination) return;
  const boundary = (document.querySelector('.section-navigation')?.offsetHeight || 80) + 48;
  let active = sections[0];
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= boundary) active = section;
  });
  selectSection(active?.id);
}

function finishNavigation() {
  clearTimeout(settleTimer);
  destination = null;
  updateSection();
}

function selectDestination(hash) {
  const target = sections.find(section => `#${section.id}` === hash);
  if (!target) return;
  destination = target.id;
  selectSection(destination);
  clearTimeout(settleTimer);
  // Also handles an already-visible destination, where no scroll event fires.
  settleTimer = setTimeout(finishNavigation, 200);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    selectDestination(link.hash);
  });
});
window.addEventListener('scroll', () => {
  if (destination) {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finishNavigation, 160);
  }
  if (!pending) { pending = true; requestAnimationFrame(updateSection); }
}, { passive: true });
// Manual scrolling takes precedence over an in-progress anchor navigation.
window.addEventListener('wheel', finishNavigation, { passive: true });
window.addEventListener('touchstart', finishNavigation, { passive: true });
window.addEventListener('keydown', event => {
  if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)
      && !event.target.closest('button, input, textarea, select, [contenteditable], [role="tab"]')) finishNavigation();
});
window.addEventListener('hashchange', () => {
  if (sections.some(section => `#${section.id}` === location.hash)) selectDestination(location.hash);
  else finishNavigation();
});
window.addEventListener('resize', updateSection);
window.addEventListener('pageshow', () => {
  if (location.hash) selectDestination(location.hash);
  else updateSection();
});
updateSection();
if (location.hash) selectDestination(location.hash);

// Keep the return control outside the homepage reading area. Account for the
// sticky navigation offset used by native section anchors.
const backToTop = document.querySelector('.back-to-top');
const homeHero = document.querySelector('.home-hero');
if (backToTop && homeHero) {
  let homeObserver;
  function observeHomepage() {
    homeObserver?.disconnect();
    const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    homeObserver = new IntersectionObserver(entries => {
      if (backToTop.hasAttribute('data-export-static')) return;
      backToTop.hidden = entries[0].boundingClientRect.bottom > inset;
    }, { threshold: 0, rootMargin: `-${inset}px 0px 0px 0px` });
    homeObserver.observe(homeHero);
  }
  observeHomepage();
  window.addEventListener('resize', observeHomepage);
}
