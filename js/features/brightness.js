// Brightness as a segmented dimmer: Low / Med / High / Max. Applies a CSS
// filter to the stage (the display), not the panel, so the controls stay fully
// lit while editing. Note: this dims the rendered pixels — the OS backlight is
// not reachable from the web.
const LEVELS = [
  { value: 'low', label: 'Low', amount: '0.4' },
  { value: 'med', label: 'Med', amount: '0.6' },
  { value: 'high', label: 'High', amount: '0.8' },
  { value: 'max', label: 'Max', amount: '1' },
];

let level = 'max';
let el;
let root;

export default {
  id: 'brightness',

  mount(ctx) {
    root = ctx.root;
    el = document.createElement('led-segmented');
    el.label = 'Bright';
    el.options = LEVELS.map((l) => ({ value: l.value, label: l.label }));
    el.value = level;
    el.addEventListener('change', (e) => {
      level = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'fx');
  },

  read(s) {
    s.brightness = level;
  },

  render(s) {
    const match = LEVELS.find((l) => l.value === s.brightness) || LEVELS[3];
    root.style.setProperty('--brightness', match.amount);
  },

  restore(saved) {
    if (saved.brightness != null) {
      level = saved.brightness;
      if (el) el.value = level;
    }
  },
};
