// Auto-fullscreen on rotation. When on, rotating to landscape enters the
// fullscreen display and rotating back to portrait returns to the editor — so
// the banner only shows in landscape (the "portrait-display" toggle is the same
// behaviour). Uses the core ctx.enterDisplay / ctx.enterEdit hooks.
let auto = false;
let el;
let ctxRef;
const landscapeMQ = window.matchMedia('(orientation: landscape)');

function onOrientation() {
  if (!auto) return;
  if (landscapeMQ.matches) ctxRef.enterDisplay();
  else ctxRef.enterEdit();
}

export default {
  id: 'autorotate',

  mount(ctx) {
    ctxRef = ctx;
    el = document.createElement('led-switch');
    el.label = 'Rotate';
    el.checked = auto;
    el.addEventListener('change', (e) => {
      auto = e.detail.checked;
      ctx.requestApply();
      // If turning it on while already landscape, go straight to display.
      if (auto) onOrientation();
    });
    ctx.add(el, 'motion');
    landscapeMQ.addEventListener('change', onOrientation);
  },

  read(s) {
    s.autoRotate = auto;
  },

  restore(saved) {
    if (saved.autoRotate != null) {
      auto = Boolean(saved.autoRotate);
      if (el) el.checked = auto;
    }
  },
};
