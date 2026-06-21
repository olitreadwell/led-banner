// Text size as a segmented control: S / M / L. Scales the banner's scroll/bounce
// font via the --text-scale CSS variable. Static mode (speed 0) ignores this —
// it auto-fits to the screen regardless.
const SIZES = [
  { value: 's', label: 'S', scale: '0.7' },
  { value: 'm', label: 'M', scale: '1' },
  { value: 'l', label: 'L', scale: '1.35' },
];

let size = 'm';
let el;
let root;

export default {
  id: 'size',

  mount(ctx) {
    root = ctx.root;
    el = document.createElement('led-segmented');
    el.label = 'Size';
    el.options = SIZES.map((s) => ({ value: s.value, label: s.label }));
    el.value = size;
    el.addEventListener('change', (e) => {
      size = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'style');
  },

  read(s) {
    s.size = size;
  },

  render(s) {
    const match = SIZES.find((x) => x.value === s.size) || SIZES[1];
    root.style.setProperty('--text-scale', match.scale);
  },

  restore(saved) {
    if (saved.size != null) {
      size = saved.size;
      if (el) el.value = size;
    }
  },
};
