// Font family as a segmented control. Each option is a system-font stack (no
// web-font downloads, so it stays offline + instant) set on the --banner-font
// CSS variable the banner reads. Ported from the scratchpad build's font list.
const FONTS = [
  { value: 'block', label: 'Block', stack: 'system-ui, -apple-system, sans-serif' },
  {
    value: 'narrow',
    label: 'Narrow',
    stack: "'Arial Narrow', 'Roboto Condensed', system-ui, sans-serif",
  },
  { value: 'serif', label: 'Serif', stack: "Georgia, 'Times New Roman', serif" },
  { value: 'mono', label: 'Mono', stack: "ui-monospace, 'SF Mono', Menlo, monospace" },
];

let font = 'block';
let el;
let root;

export default {
  id: 'font',

  mount(ctx) {
    root = ctx.root;
    el = document.createElement('led-segmented');
    el.label = 'Font';
    el.options = FONTS.map((f) => ({ value: f.value, label: f.label }));
    el.value = font;
    el.addEventListener('change', (e) => {
      font = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'style');
  },

  read(s) {
    s.font = font;
  },

  render(s) {
    const f = FONTS.find((x) => x.value === s.font) || FONTS[0];
    root.style.setProperty('--banner-font', f.stack);
  },

  restore(saved) {
    if (saved.font != null) {
      font = saved.font;
      if (el) el.value = font;
    }
  },
};
