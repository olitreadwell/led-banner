// Mirror / horizontal flip as an on/off switch. Toggles the --flip CSS variable
// (1 normal, -1 mirrored), which the banner transform and keyframes read.
let mirror = false;
let root;
let el;

export default {
  id: 'mirror',

  mount(ctx) {
    root = ctx.root;
    el = document.createElement('led-switch');
    el.label = 'Mirror';
    el.checked = mirror;
    el.addEventListener('change', (e) => {
      mirror = e.detail.checked;
      ctx.requestApply();
    });
    ctx.add(el);
  },

  read(s) {
    s.mirror = mirror;
  },

  render(s) {
    root.style.setProperty('--flip', s.mirror ? '-1' : '1');
  },

  restore(saved) {
    if (saved.mirror != null) {
      mirror = Boolean(saved.mirror);
      if (el) el.checked = mirror;
    }
  },
};
