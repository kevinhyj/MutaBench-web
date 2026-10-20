/* Decorative molecular mutation study, not a structure or simulation from an assay.
 * A stable backbone with a few changing side groups suggests sequence variation.
 * No external dependencies, network requests, or experimental data are involved.
 */
(() => {
  'use strict';
  const canvas = document.querySelector('.molecular-background');
  const hero = document.querySelector('.home-hero');
  if (!canvas || !hero) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = {
    blue: [114, 138, 185],
    rose: [245, 181, 191],
    cream: [245, 221, 181],
  };
  const mix = (a, b, t) => a.map((channel, i) => channel + (b[i] - channel) * t);
  const rgb = (color, alpha = 1) => `rgba(${color.map(Math.round).join(',')},${alpha})`;
  const smooth = x => { const v = Math.max(0, Math.min(1, x)); return v * v * (3 - 2 * v); };
  let width = 0;
  let height = 0;
  let elapsed = 0;
  let lastFrame = null;
  let frame = null;
  let visible = true;

  function molecule(side, time) {
    const mobile = width < 650;
    const scale = mobile ? Math.min(.82, width / 520) : Math.min(1.48, Math.max(.92, width / 1152));
    const atoms = [];
    const bonds = [];
    const cycle = (time / 1000 + side * 4) % 12;
    // Rest, replace a side group, hold the altered state, then return gently.
    const mutation = smooth((cycle - 1) / 1.8) * (1 - smooth((cycle - 8) / 2));
    const turn = Math.sin(time / 7000 + side * 2) * .34;
    // Bring the chains into the scene: broad opposing silhouettes occupy roughly
    // a third of the desktop background, with the title protected by the CSS mask.
    const drift = Math.sin(time / 5200 + side * 2.5);
    const offsetX = width * (side ? .83 : .17) + drift * (mobile ? 8 : 18);
    const offsetY = height * (mobile ? (side ? .12 : .88) : (side ? .34 : .66))
      + Math.cos(time / 6300 + side * 2) * (mobile ? 8 : 16);
    const angle = (mobile ? -.98 : -.52) + Math.sin(time / 8000 + side) * .07;
    const sin = Math.sin(angle), cos = Math.cos(angle);
    const rotation = time / 6500 + side * 1.6;

    function add(x, y, z, radius, color, emphasis = 0) {
      const rx = x * Math.cos(turn) + z * Math.sin(turn);
      const rz = z * Math.cos(turn) - x * Math.sin(turn);
      const point = {
        x: offsetX + (rx * cos - y * sin) * scale,
        y: offsetY + (rx * sin + y * cos) * scale,
        z: rz,
        radius: radius * scale * (1 + rz / 650),
        color,
        emphasis,
      };
      atoms.push(point);
      return atoms.length - 1;
    }

    let previous;
    for (let i = 0; i < 58; i++) {
      const u = (i - 28.5) / 57;
      const theta = i * 1.74 + rotation;
      // A curved helical backbone gives the silhouette a molecular, folded form.
      const axisX = 65 * Math.sin(u * 6.2 + side);
      const x = axisX + 38 * Math.cos(theta);
      const y = u * 740;
      const z = 42 * Math.sin(theta);
      const core = add(x, y, z, 7, colors.blue);
      if (previous !== undefined) bonds.push([previous, core]);
      previous = core;

      if (i % 2) continue;
      const changing = i === (side ? 34 : 24) || i === (side ? 18 : 40);
      const change = changing ? mutation : 0;
      const direction = theta + .35 + change * .6;
      const branchColor = changing ? mix(colors.blue, colors.rose, change) : (i % 6 ? colors.cream : colors.rose);
      let parent = core;
      for (let j = 1; j <= 3; j++) {
        const reach = 38 + j * 19 + change * j * 6;
        const branch = add(
          axisX + reach * Math.cos(direction + j * .23),
          y + j * 12 - change * j * 8,
          reach * Math.sin(direction + j * .23),
          j === 3 ? 7.8 : 5.2,
          branchColor,
          changing && j === 3 ? change : 0,
        );
        bonds.push([parent, branch]);
        parent = branch;
      }
      if (changing) {
        // A second branch unfolds with the substituted side group.
        const extra = add(
          axisX + (90 + change * 24) * Math.cos(direction - .35),
          y + 25 - change * 30,
          (90 + change * 24) * Math.sin(direction - .35),
          4.5 + change * 2,
          mix(colors.cream, colors.rose, change),
          change * .6,
        );
        bonds.push([parent - 1, extra]);
      }
    }
    return { atoms, bonds, scale };
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    for (let side = 0; side < 2; side++) {
      const { atoms, bonds, scale } = molecule(side, time);
      // Depth sorting and softly lit spheres make the chains read as spatial objects.
      const shapes = [
        ...bonds.map(([a, b]) => ({ bond: [atoms[a], atoms[b]], z: (atoms[a].z + atoms[b].z) / 2 })),
        ...atoms.map(atom => ({ atom, z: atom.z })),
      ].sort((a, b) => a.z - b.z);
      for (const shape of shapes) {
        const depth = Math.max(.28, Math.min(.88, .56 + shape.z / 280));
        if (shape.bond) {
          const [a, b] = shape.bond;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = rgb(mix(a.color, b.color, .5), depth * .70);
          context.lineWidth = 2.6 * scale;
          context.lineCap = 'round';
          context.stroke();
        } else {
          const { x, y, radius, color, emphasis } = shape.atom;
          if (x < -30 || x > width + 30 || y < -30 || y > height + 30) continue;
          if (emphasis > .01) {
            const glow = context.createRadialGradient(x, y, radius, x, y, radius * 4);
            glow.addColorStop(0, rgb(colors.rose, .16 * emphasis));
            glow.addColorStop(1, rgb(colors.rose, 0));
            context.fillStyle = glow;
            context.beginPath();
            context.arc(x, y, radius * 4, 0, Math.PI * 2);
            context.fill();
          }
          const sphere = context.createRadialGradient(x - radius * .35, y - radius * .4, 0, x, y, radius);
          sphere.addColorStop(0, rgb(mix(color, [255, 252, 250], .75), depth));
          sphere.addColorStop(.45, rgb(mix(color, [255, 252, 250], .25), depth));
          sphere.addColorStop(1, rgb(color, depth));
          context.fillStyle = sphere;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
  }

  function tick(now) {
    if (lastFrame === null) lastFrame = now;
    const delta = now - lastFrame;
    // Cap drawing at 30 fps. Never catch up hidden-tab or off-screen time.
    if (delta >= 1000 / 30) {
      elapsed += Math.min(delta, 80);
      lastFrame = now;
      draw(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastFrame = null;
    if (!reducedMotion.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);

  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(elapsed);
  }

  reducedMotion.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updatePlayback();
  }).observe(hero);
  new ResizeObserver(resize).observe(hero);
  resize();
  updatePlayback();
})();
