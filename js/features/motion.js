// Motion style: how the text moves when speed > 0 (Scroll or Bounce). Speed 0
// is Static and is handled by the core, which reads s.motionStyle to decide
// between scroll and bounce — so this feature only owns the control + value.
let style = 'scroll';
let el;

export default {
  id: 'motion',

  mount(ctx) {
    el = document.createElement('led-segmented');
    el.label = 'Motion';
    el.options = [
      { value: 'scroll', label: 'Scroll' },
      { value: 'bounce', label: 'Bounce' },
    ];
    el.value = style;
    el.addEventListener('change', (e) => {
      style = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'motion');
  },

  read(s) {
    s.motionStyle = style;
  },

  restore(saved) {
    if (saved.motionStyle != null) {
      style = saved.motionStyle;
      if (el) el.value = style;
    }
  },
};
