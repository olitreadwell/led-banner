// Rainbow colour cycling: Off / Text / Bg / Both. Sets data-rainbow on the
// banner; the CSS animates a single inherited --hue on :root and recolours the
// text and/or stage background from it, so it composes with the scroll/bounce
// motion without fighting the banner's own animation.
const MODES = [
  { value: 'off', label: 'Off' },
  { value: 'text', label: 'Text' },
  { value: 'bg', label: 'Bg' },
  { value: 'both', label: 'Both' },
];
const ATTR = { text: 'text', bg: 'bg', both: 'text bg' };

let mode = 'off';
let el;
let banner;

export default {
  id: 'rainbow',

  mount(ctx) {
    banner = ctx.banner;
    el = document.createElement('led-segmented');
    el.label = 'Rainbow';
    el.options = MODES;
    el.value = mode;
    el.addEventListener('change', (e) => {
      mode = e.detail.value;
      ctx.requestApply();
    });
    ctx.add(el, 'style');
  },

  read(s) {
    s.rainbow = mode;
  },

  render(s) {
    const attr = ATTR[s.rainbow];
    if (attr) banner.setAttribute('data-rainbow', attr);
    else banner.removeAttribute('data-rainbow');
  },

  restore(saved) {
    if (saved.rainbow != null) {
      mode = saved.rainbow;
      if (el) el.value = mode;
    }
  },
};
