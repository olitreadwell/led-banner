// Blink. Hard on/off flash of the text while it scrolls. The stylesheet already
// defines a `blink` keyframe and applies it when #banner has data-blink='on',
// reading the flash speed from the `--blink-rate` CSS variable. So this feature
// just toggles that attribute and sets the variable. Module-local state lives in
// a closure (no globals).

// Map the 1–10 rate slider to seconds: higher = faster. Floored at 0.40s
// (~2.5 flashes/sec) so the fastest setting stays under the 3 Hz photosensitive
// seizure threshold (WCAG 2.3.1). Rate 10 → 0.40s, rate 1 → 1.00s.
const rateToSeconds = (rate) =>
  `${(1.0 - (Number(rate) - 1) * (0.6 / 9)).toFixed(2)}s`;

let blink = false; // current on/off state
let button; // the toggle button, kept so render/restore can sync its UI
let input; // the rate range input, reused by read/restore
let root; // the document root we set the --blink-rate variable on
let banner; // the #banner element we toggle data-blink on

// Reflect the current state onto the button (label text + aria-pressed).
function syncButton() {
  if (!button) return;
  button.setAttribute('aria-pressed', String(blink));
  button.textContent = blink ? 'On' : 'Off';
}

export default {
  id: 'blink',
  defaults: { blink: false, blinkRate: 5 },

  mount(ctx) {
    root = ctx.root;
    banner = ctx.banner;

    // Toggle: a .row > .toggle > (label span + button).
    const toggleRow = ctx.addRow(null, { section: 'more' });
    const toggle = document.createElement('div');
    toggle.className = 'toggle';

    const label = document.createElement('span');
    label.textContent = 'Blink';

    button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Blink'); // label span isn't associated
    syncButton();

    // Clicking flips state, updates the button UI, and re-applies the banner.
    button.addEventListener('click', () => {
      blink = !blink;
      syncButton();
      ctx.requestApply();
    });

    toggle.appendChild(label);
    toggle.appendChild(button);
    toggleRow.appendChild(toggle);

    // Rate slider (1–10, higher = faster).
    const rateRow = ctx.addRow('Blink rate', { id: 'blink-rate', section: 'more' });
    input = document.createElement('input');
    input.type = 'range';
    input.id = 'blink-rate';
    input.min = '1';
    input.max = '10';
    input.step = '1';
    input.value = '5';
    rateRow.appendChild(input);
    ctx.onInput(input);
  },

  read(s) {
    s.blink = blink;
    s.blinkRate = input.value;
  },

  render(s) {
    root.style.setProperty('--blink-rate', rateToSeconds(s.blinkRate));
    if (s.blink) {
      banner.setAttribute('data-blink', 'on');
    } else {
      banner.removeAttribute('data-blink');
    }
  },

  restore(saved) {
    if (saved.blink != null) {
      blink = Boolean(saved.blink);
      syncButton();
    }
    if (saved.blinkRate != null) input.value = saved.blinkRate;
  },
};
