// Motion mode: Scroll (default) or Static. Scroll is the marquee. Static holds
// the message centred, wrapped to multiple lines, and auto-sized to fill the
// screen — so it needs JS to fit the text, which CSS alone can't do. The fit
// re-runs whenever the text or viewport changes (including rotation). Ported
// from the scratchpad LED build's static mode, adapted to the plugin contract.

const MODES = [
  { value: 'scroll', label: 'Scroll' },
  { value: 'static', label: 'Static' },
  { value: 'bounce', label: 'Bounce' },
];

let current = 'scroll';
let banner;
let stage;
const buttons = new Map();

function syncButtons() {
  for (const [value, btn] of buttons) {
    btn.setAttribute('aria-pressed', String(value === current));
  }
}

// Binary-search the largest font size at which the wrapped text fits the stage
// box (with a small margin). Only meaningful in static mode.
function fitStatic() {
  if (current !== 'static' || !banner || !stage) return;
  const text = banner.textContent.trim();
  if (!text) {
    banner.style.fontSize = '';
    return;
  }
  // The banner is full-width, so wrapping already bounds the width; we only
  // need to fit the height. (scrollWidth would just report the element width,
  // never the text width, so a width check is useless here.) A too-wide line
  // wraps and grows scrollHeight, so the height check self-corrects for width.
  const maxH = stage.clientHeight * 0.94;
  let lo = 8;
  let hi = Math.max(stage.clientHeight, stage.clientWidth);
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    banner.style.fontSize = `${mid}px`;
    if (banner.scrollHeight <= maxH) lo = mid;
    else hi = mid;
  }
  banner.style.fontSize = `${Math.floor(lo)}px`;
}

export default {
  id: 'motion',
  defaults: { motion: 'scroll' },

  mount(ctx) {
    banner = ctx.banner;
    stage = ctx.stage;

    const row = ctx.addRow('Motion');
    const segment = document.createElement('div');
    segment.className = 'segment';
    for (const { value, label } of MODES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.setAttribute('aria-pressed', String(value === current));
      btn.addEventListener('click', () => {
        current = value;
        syncButtons();
        ctx.requestApply();
      });
      buttons.set(value, btn);
      segment.appendChild(btn);
    }
    row.appendChild(segment);

    // Re-fit static text when the viewport changes (core restarts the scroll
    // animation separately; this covers the static path). Defer to two frames
    // so the measurement runs after the post-rotation layout has settled —
    // measuring too early was sizing the text to the pre-rotation dimensions.
    let raf = 0;
    const scheduleFit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(fitStatic));
    };
    window.addEventListener('resize', scheduleFit);
    window.addEventListener('orientationchange', () =>
      setTimeout(scheduleFit, 250),
    );
  },

  read(s) {
    s.motion = current;
  },

  render(s) {
    if (s.motion === 'static') {
      banner.setAttribute('data-motion', 'static');
      fitStatic(); // sets the inline font-size to fill the screen
    } else if (s.motion === 'bounce') {
      banner.setAttribute('data-motion', 'bounce');
      banner.style.fontSize = ''; // revert to the CSS max(20vw, 62vh)
    } else {
      banner.removeAttribute('data-motion');
      banner.style.fontSize = '';
    }
  },

  restore(saved) {
    if (saved.motion != null) {
      current = saved.motion;
      syncButtons();
    }
  },
};
