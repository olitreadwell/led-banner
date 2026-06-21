// Pause: freeze the scroll/bounce (and blink) motion. WCAG 2.2.2 requires a
// keyboard-operable way to pause content that moves automatically; this switch
// in the Motion tab sets data-paused, and the CSS pauses the banner animation.
let paused = false;
let el;
let banner;

export default {
  id: 'pause',

  mount(ctx) {
    banner = ctx.banner;
    el = document.createElement('led-switch');
    el.label = 'Pause';
    el.checked = paused;
    el.addEventListener('change', (e) => {
      paused = e.detail.checked;
      ctx.requestApply();
    });
    ctx.add(el, 'motion');
  },

  read(s) {
    s.paused = paused;
  },

  render(s) {
    if (s.paused) banner.setAttribute('data-paused', 'on');
    else banner.removeAttribute('data-paused');
  },

  restore(saved) {
    if (saved.paused != null) {
      paused = Boolean(saved.paused);
      if (el) el.checked = paused;
    }
  },
};
