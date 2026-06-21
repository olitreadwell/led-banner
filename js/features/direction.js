// Scroll direction feature. A segmented control toggles the banner between
// scrolling right (ltr, default) and left (rtl). The CSS reverses the scroll
// animation for #banner[data-dir='rtl'], so this module just sets or removes
// the data-dir attribute. Selection state lives in this closure, mirrored onto
// each button's aria-pressed for styling and accessibility.
const OPTIONS = [
  { value: 'ltr', label: '→ Right' },
  { value: 'rtl', label: '← Left' },
];

let direction = 'ltr';
let banner = null;
const buttons = new Map();

// Reflect the current selection onto every button's aria-pressed state.
function syncButtons() {
  for (const [value, btn] of buttons) {
    btn.setAttribute('aria-pressed', String(value === direction));
  }
}

export default {
  id: 'direction',
  defaults: { direction: 'ltr' },

  mount(ctx) {
    banner = ctx.banner;
    const row = ctx.addRow('Direction');
    const segment = document.createElement('div');
    segment.className = 'segment';
    for (const { value, label } of OPTIONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.setAttribute('aria-pressed', String(value === direction));
      btn.addEventListener('click', () => {
        direction = value;
        syncButtons();
        ctx.requestApply();
      });
      buttons.set(value, btn);
      segment.appendChild(btn);
    }
    row.appendChild(segment);
  },

  read(s) {
    s.direction = direction;
  },

  render(s) {
    if (s.direction === 'rtl') banner.setAttribute('data-dir', 'rtl');
    else banner.removeAttribute('data-dir');
  },

  restore(saved) {
    if (saved.direction != null) {
      direction = saved.direction;
      syncButtons();
    }
  },
};
