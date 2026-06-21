// LED Banner — core. Owns the stage, the four base controls (text, fg, bg,
// speed), persistence, wake lock, orientation handling, and a small feature
// registry so optional features live in their own files under js/features/.
import { features } from './features/index.js';

const root = document.documentElement;
const stage = document.getElementById('stage');
const panel = document.getElementById('panel');
const panelGrid = document.getElementById('panel-grid');
const banner = document.getElementById('banner');
const displayHint = document.getElementById('display-hint');
const goButton = document.getElementById('go');
const contrastWarn = document.getElementById('contrast-warn');
const themeMeta = document.querySelector('meta[name="theme-color"]');

// --- WCAG contrast helpers ---------------------------------------------------
// Used to warn (not block) when the chosen text/background colours are too close
// to read. The banner is large text, whose AA contrast floor is 3:1.
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = srgbToLinear((n >> 16) & 255);
  const g = srgbToLinear((n >> 8) & 255);
  const b = srgbToLinear(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
const $ = (id) => document.getElementById(id);
const STORE_KEY = 'led-banner-settings';

// Speed slider (1–10) → animation duration. Higher speed = shorter duration =
// faster scroll.
const speedToDuration = (s) => `${22 / Number(s)}s`;

// --- Feature plugin contract -------------------------------------------------
// Each feature module default-exports:
//   { id, defaults?, mount?(ctx), read?(settings), render?(settings),
//     restore?(saved) }
// mount: add controls to ctx.panelGrid and wire them with ctx.onInput.
// read:  copy this feature's control values into the settings object.
// render: apply settings to the DOM/CSS (runs on every change + on init).
// restore: set control values from previously saved settings on load.
const ctx = {
  root,
  stage,
  banner,
  panel,
  panelGrid,
  $,
  // Append a labelled control row to the panel grid and return its container.
  addRow(labelText, { id } = {}) {
    const row = document.createElement('div');
    row.className = 'row';
    if (labelText) {
      const label = document.createElement('label');
      label.textContent = labelText;
      if (id) label.setAttribute('for', id);
      row.appendChild(label);
    }
    panelGrid.appendChild(row);
    return row;
  },
  // Wire any control so changing it re-applies the whole banner live.
  onInput(el, evt = 'input') {
    el.addEventListener(evt, applyAll);
  },
  requestApply: () => applyAll(),
};

function baseSettings() {
  return {
    text: $('text').value,
    fg: $('fg').value,
    bg: $('bg').value,
    speed: $('speed').value,
  };
}

function readControls() {
  const s = baseSettings();
  for (const f of features) f.read?.(s);
  return s;
}

function applyAll() {
  const s = readControls();
  banner.textContent = s.text || ' ';
  root.style.setProperty('--fg', s.fg);
  root.style.setProperty('--bg', s.bg);
  root.style.setProperty('--duration', speedToDuration(s.speed));
  themeMeta.content = s.bg;
  // The animated #banner is aria-hidden; expose the message on the stage button
  // so screen readers announce it without reading the moving node.
  stage.setAttribute(
    'aria-label',
    `Banner: ${s.text?.trim() || 'blank'}. Activate to edit.`,
  );
  for (const f of features) f.render?.(s);

  // Empty text would show a blank screen in display mode — disable GO instead.
  const blank = !s.text.trim();
  goButton.disabled = blank;

  // Warn (don't block — it's a creative tool) on hard-to-read colour pairs.
  const ratio = contrastRatio(s.fg, s.bg);
  if (blank) {
    contrastWarn.hidden = true;
  } else if (ratio < 3) {
    contrastWarn.hidden = false;
    contrastWarn.textContent = `Low contrast (${ratio.toFixed(1)}:1) — the banner may be hard to read.`;
  } else {
    contrastWarn.hidden = true;
  }

  save(s);
}

function save(settings) {
  // Safari private mode throws on localStorage; settings still apply for the
  // session.
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(settings));
  } catch {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

// --- Wake Lock: keep the screen awake in display mode, degrade silently on
// browsers without the API. ---
let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return; // unsupported → no-op, no error
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch {
    // e.g. tab not visible or permission denied — not user-facing.
  }
}
async function releaseWakeLock() {
  try {
    await wakeLock?.release();
  } catch {}
  wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && panel.hidden) requestWakeLock();
});

// Briefly show the "tap to edit" pill, then fade it out.
let hintTimer;
function flashHint() {
  if (!displayHint) return;
  displayHint.classList.add('show');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => displayHint.classList.remove('show'), 2400);
}

function enterDisplay() {
  save(readControls());
  panel.hidden = true;
  flashHint();
  stage.focus();
  requestWakeLock();
}

function enterEdit() {
  panel.hidden = false;
  displayHint?.classList.remove('show');
  // Move focus into the panel so keyboard users aren't stranded on the stage.
  $('text').focus();
  releaseWakeLock();
}

// --- Orientation handling ----------------------------------------------------
// CSS animations cache the computed value of vw/vh units (e.g. the scroll
// keyframe's translateX(100vw)) at the moment they start; rotating the device
// does not recompute them, so the text can sit off-screen or jump. Restarting
// the animation forces a recompute against the new viewport, which fixes the
// "rotation doesn't lay out cleanly" problem. font-size (vw/vh) already
// recomputes live, so the text auto-scales to the active orientation.
function restartAnimation() {
  banner.style.animation = 'none';
  void banner.offsetWidth; // reflow so the next assignment restarts the anim
  banner.style.animation = '';
}

let resizeTimer;
function onViewportChange() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(restartAnimation, 150);
}
window.addEventListener('resize', onViewportChange);
window.addEventListener('orientationchange', () =>
  setTimeout(restartAnimation, 300),
);

// --- Wire core + mount features ---------------------------------------------
['text', 'fg', 'bg', 'speed'].forEach((id) =>
  $(id).addEventListener('input', applyAll),
);
$('go').addEventListener('click', enterDisplay);
// Tapping the stage in display mode reopens the panel; first stray tap just
// re-flashes the hint so a passing touch doesn't yank a held-up banner away.
let hintShownAt = 0;
function activateStage() {
  if (!panel.hidden) return;
  const now = performance.now();
  if (!displayHint.classList.contains('show') && now - hintShownAt > 2600) {
    flashHint();
    hintShownAt = now;
    return;
  }
  enterEdit();
}
stage.addEventListener('click', activateStage);
stage.addEventListener('keydown', (e) => {
  if (panel.hidden && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    if (panel.hidden) enterEdit();
  }
});

for (const f of features) f.mount?.(ctx);

// Init from saved settings (falling back to the markup defaults).
const saved = load();
if (saved) {
  if (saved.text != null) $('text').value = saved.text;
  if (saved.fg != null) $('fg').value = saved.fg;
  if (saved.bg != null) $('bg').value = saved.bg;
  if (saved.speed != null) $('speed').value = saved.speed;
  for (const f of features) f.restore?.(saved);
}
applyAll();

// Register the service worker for offline use.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
