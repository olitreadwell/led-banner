// Scroll direction: Right (ltr, default) or Left (rtl), shown with arrow icons.
// The CSS reverses the scroll/bounce animation for #banner[data-dir='rtl'].
let direction = 'ltr';
let banner;
let el;

export default {
  id: 'direction',

  mount(ctx) {
    banner = ctx.banner;
    el = document.createElement('led-segmented');
    el.label = 'Direction';
    el.options = [
      { value: 'ltr', label: 'Right', icon: '→' },
      { value: 'rtl', label: 'Left', icon: '←' },
    ];
    el.value = direction;
    el.addEventListener('change', (e) => {
      direction = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el);
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
      if (el) el.value = direction;
    }
  },
};
