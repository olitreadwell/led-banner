// Blink as a stepper: 0 = Off, 1–10 = flash rate (faster at higher values).
// Floored at 0.40s (~2.5 flashes/sec) so the fastest setting stays under the
// 3 Hz photosensitive-seizure threshold (WCAG 2.3.1).
const rateToSeconds = (r) => `${(1.0 - (Number(r) - 1) * (0.6 / 9)).toFixed(2)}s`;

let blink = 0; // 0 = off, 1–10 = rate
let banner;
let root;
let el;

export default {
  id: 'blink',

  mount(ctx) {
    banner = ctx.banner;
    root = ctx.root;
    el = document.createElement('led-stepper');
    el.label = 'Blink';
    el.min = 0;
    el.max = 10;
    el.step = 1;
    el.zeroLabel = 'Off';
    el.value = blink;
    el.addEventListener('change', (e) => {
      blink = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'fx');
  },

  read(s) {
    s.blink = blink;
  },

  render(s) {
    if (Number(s.blink) > 0) {
      root.style.setProperty('--blink-rate', rateToSeconds(s.blink));
      banner.setAttribute('data-blink', 'on');
    } else {
      banner.removeAttribute('data-blink');
    }
  },

  restore(saved) {
    // Migrate the old shape (boolean blink + separate blinkRate) to one stepper.
    if (saved.blink === true) blink = Number(saved.blinkRate) || 5;
    else if (saved.blink === false) blink = 0;
    else if (saved.blink != null) blink = Number(saved.blink) || 0;
    if (el) el.value = blink;
  },
};
