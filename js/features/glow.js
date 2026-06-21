// Neon glow strength. Drives the --glow CSS variable on the document root,
// which the stylesheet feeds into #banner's text-shadow (0 = no glow). The
// slider runs 0–10; the CSS multiplies that against em-based blur radii.

// Closure state: the range input (created in mount, reused by read/restore)
// and the document root we set the --glow variable on.
let input;
let root;

export default {
  id: 'glow',
  defaults: { glow: 3 },

  mount(ctx) {
    root = ctx.root;
    const row = ctx.addRow('Glow', { id: 'glow', section: 'more' });
    input = document.createElement('input');
    input.type = 'range';
    input.id = 'glow';
    input.min = '0';
    input.max = '10';
    input.step = '1';
    input.value = '3';
    row.appendChild(input);
    ctx.onInput(input);
  },

  read(s) {
    s.glow = input.value;
  },

  render(s) {
    root.style.setProperty('--glow', String(Number(s.glow)));
  },

  restore(saved) {
    if (saved.glow != null) input.value = saved.glow;
  },
};
