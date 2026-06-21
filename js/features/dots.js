// Dot-matrix render: mask the text into a grid of round dots so it looks like a
// real LED panel. The mask is a tiled radial-gradient sized in em, so the dots
// scale with the font. Composes with colour, glow and rainbow (the dots take on
// whatever the text shows). A toggle in the Effects tab sets data-dots.
let on = false;
let el;
let banner;

export default {
  id: 'dots',

  mount(ctx) {
    banner = ctx.banner;
    el = document.createElement('led-switch');
    el.label = 'Dots';
    el.checked = on;
    el.addEventListener('change', (e) => {
      on = e.detail.checked;
      ctx.requestApply();
    });
    ctx.add(el, 'fx');
  },

  read(s) {
    s.dots = on;
  },

  render(s) {
    if (s.dots) banner.setAttribute('data-dots', 'on');
    else banner.removeAttribute('data-dots');
  },

  restore(saved) {
    if (saved.dots != null) {
      on = Boolean(saved.dots);
      if (el) el.checked = on;
    }
  },
};
