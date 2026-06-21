// Mirror / horizontal flip. Toggles the `--flip` CSS variable on the document
// root between 1 (normal) and -1 (mirrored). The banner's transform and scroll
// keyframe already read `scaleX(var(--flip))`, so flipping the variable mirrors
// the text live. Module-local state lives in a closure (no globals).
let mirror = false; // current on/off state
let button; // the toggle button, kept so render/restore can sync its UI

// Reflect the current state onto the button (label text + aria-pressed).
function syncButton() {
  if (!button) return;
  button.setAttribute('aria-pressed', String(mirror));
  button.textContent = mirror ? 'On' : 'Off';
}

export default {
  id: 'mirror',
  defaults: { mirror: false },

  mount(ctx) {
    // Structure: a .row > .toggle > (label span + button).
    const row = ctx.addRow();
    const toggle = document.createElement('div');
    toggle.className = 'toggle';

    const label = document.createElement('span');
    label.textContent = 'Mirror';

    button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Mirror'); // label span isn't associated
    syncButton();

    // Clicking flips state, updates the button UI, and re-applies the banner.
    button.addEventListener('click', () => {
      mirror = !mirror;
      syncButton();
      ctx.requestApply();
    });

    toggle.appendChild(label);
    toggle.appendChild(button);
    row.appendChild(toggle);
  },

  read(s) {
    s.mirror = mirror;
  },

  render(s) {
    document.documentElement.style.setProperty('--flip', s.mirror ? '-1' : '1');
  },

  restore(saved) {
    if (saved.mirror != null) {
      mirror = Boolean(saved.mirror);
      syncButton();
    }
  },
};
