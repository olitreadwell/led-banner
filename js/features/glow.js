// Neon glow strength as a segmented control: None / Low / Med / Max (0–3),
// mapped to the --glow CSS variable the banner's text-shadow reads.
const LEVELS = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Low' },
  { value: '2', label: 'Med' },
  { value: '3', label: 'Max' },
];
const GLOW_MAP = [0, 2, 4.5, 8]; // level 0–3 → --glow value

let glow = 0;
let el;
let root;

export default {
  id: 'glow',

  mount(ctx) {
    root = ctx.root;
    el = document.createElement('led-segmented');
    el.label = 'Glow';
    el.options = LEVELS;
    el.value = String(glow);
    el.addEventListener('change', (e) => {
      glow = Number(e.detail.value);
      ctx.requestApply();
    });
    ctx.add(el, 'fx');
  },

  read(s) {
    s.glow = glow;
  },

  render(s) {
    root.style.setProperty('--glow', String(GLOW_MAP[s.glow] ?? 0));
  },

  restore(saved) {
    if (saved.glow != null) {
      glow = Math.min(3, Math.max(0, Number(saved.glow) || 0));
      if (el) el.value = String(glow);
    }
  },
};
