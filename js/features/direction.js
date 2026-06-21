// Scroll direction with arrow icons: Right (default) / Left / Up / Down. Left
// reverses the horizontal scroll; Up/Down switch the banner to a vertical
// scroll keyframe. The CSS keys off data-dir.
const OPTIONS = [
  { value: 'ltr', label: 'Right', icon: '→' },
  { value: 'rtl', label: 'Left', icon: '←' },
  { value: 'up', label: 'Up', icon: '↑' },
  { value: 'down', label: 'Down', icon: '↓' },
];

let direction = 'ltr';
let banner;
let el;

export default {
  id: 'direction',

  mount(ctx) {
    banner = ctx.banner;
    el = document.createElement('led-segmented');
    el.label = 'Scroll';
    el.options = OPTIONS;
    el.value = direction;
    el.addEventListener('change', (e) => {
      direction = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'motion');
  },

  read(s) {
    s.direction = direction;
  },

  render(s) {
    if (s.direction && s.direction !== 'ltr') {
      banner.setAttribute('data-dir', s.direction);
    } else {
      banner.removeAttribute('data-dir');
    }
  },

  restore(saved) {
    if (saved.direction != null) {
      direction = saved.direction;
      if (el) el.value = direction;
    }
  },
};
