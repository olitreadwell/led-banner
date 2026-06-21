// LED Banner — core. Owns the stage, the base controls (text, colour, speed),
// motion resolution, persistence, wake lock, orientation handling, and a small
// feature registry so optional controls live in their own files under
// js/features/. Speed is a stepper: 0 = Static (held, auto-fit to the screen),
// 1–10 = scroll/bounce speed.
import './components.js';
import { features } from './features/index.js';

const root = document.documentElement;
const stage = document.getElementById('stage');
const panel = document.getElementById('panel');
const banner = document.getElementById('banner');
const displayHint = document.getElementById('display-hint');
const goButton = document.getElementById('go');
const contrastWarn = document.getElementById('contrast-warn');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const $ = (id) => document.getElementById(id);
const STORE_KEY = 'led-banner-settings';

// Speed (1–10) → animation duration. Higher speed = shorter duration = faster.
const speedToDuration = (s) => `${22 / Number(s)}s`;

// --- WCAG contrast helpers (warn, don't block, on hard-to-read colour pairs) -
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

// Speed is a core <led-stepper>, created here so the rest of the panel (the
// features) mounts after it.
const speedStepper = document.createElement('led-stepper');
speedStepper.label = 'Speed';
speedStepper.min = 0;
speedStepper.max = 10;
speedStepper.step = 1;
speedStepper.zeroLabel = 'Static';
speedStepper.value = 0;
speedStepper.addEventListener('change', () => applyAll());

// --- Feature plugin contract -------------------------------------------------
// A feature default-exports { id, mount?(ctx), read?(settings), render?(settings),
// restore?(saved) }. mount: append a control (usually a web component) via
// ctx.add and wire its change event to ctx.requestApply. read: copy its value
// into settings. render: apply settings to the DOM. restore: rehydrate on load.
const ctx = {
  root,
  stage,
  banner,
  panel,
  $,
  // Append a control to a tab's panel ('style' | 'motion' | 'fx' | 'saved').
  add(el, tab = 'style') {
    document.querySelector(`.tab-panel[data-tab="${tab}"]`).appendChild(el);
    return el;
  },
  requestApply: () => applyAll(),
  // Whole-settings read/restore, for features like saved slots.
  readAll: () => readControls(),
  applySaved: (obj) => applySaved(obj),
  // Mode switches, for features like auto-rotate display.
  enterDisplay: () => enterDisplay(),
  enterEdit: () => enterEdit(),
  isDisplaying: () => panel.hidden,
};

function baseSettings() {
  return {
    text: $('text').value,
    fg: $('fg').value,
    bg: $('bg').value,
    speed: speedStepper.value,
  };
}

function readControls() {
  const s = baseSettings();
  for (const f of features) f.read?.(s);
  return s;
}

// --- Static auto-fit ---------------------------------------------------------
// Static mode (speed 0) holds the message, wrapped to multiple lines and sized
// to fill the screen. The banner is full-width, so wrapping bounds the width;
// we binary-search the largest font whose wrapped height fits the stage.
function fitStatic() {
  const text = banner.textContent.trim();
  if (!text) {
    banner.style.fontSize = '';
    return;
  }
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

function applyAll() {
  const s = readControls();
  banner.textContent = s.text || ' ';
  root.style.setProperty('--fg', s.fg);
  root.style.setProperty('--bg', s.bg);
  themeMeta.content = s.bg;
  // The animated #banner is aria-hidden; expose the message on the stage button
  // so screen readers announce it without reading the moving node.
  stage.setAttribute(
    'aria-label',
    `Banner: ${s.text?.trim() || 'blank'}. Activate to edit.`,
  );

  // Motion resolution: speed 0 = static (hold + fit); otherwise scroll or
  // bounce at the chosen speed (motion style comes from the motion feature).
  if (Number(s.speed) === 0) {
    banner.setAttribute('data-motion', 'static');
    fitStatic();
  } else {
    banner.style.fontSize = ''; // revert to the CSS max(20vw, 62vh)
    root.style.setProperty('--duration', speedToDuration(s.speed));
    if (s.motionStyle === 'bounce') banner.setAttribute('data-motion', 'bounce');
    else banner.removeAttribute('data-motion');
  }

  for (const f of features) f.render?.(s);

  // Empty text would show a blank screen in display mode — disable GO instead.
  const blank = !s.text.trim();
  goButton.disabled = blank;

  const ratio = contrastRatio(s.fg, s.bg);
  if (blank || ratio >= 3) {
    contrastWarn.hidden = true;
  } else {
    contrastWarn.hidden = false;
    contrastWarn.textContent = `Low contrast (${ratio.toFixed(1)}:1) — the banner may be hard to read.`;
  }

  save(s);
}

function save(settings) {
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

// Push a full settings object into every control and re-render. Used on init
// and by the saved-slots feature.
function applySaved(obj) {
  if (!obj) return;
  if (obj.text != null) $('text').value = obj.text;
  if (obj.fg != null) $('fg').value = obj.fg;
  if (obj.bg != null) $('bg').value = obj.bg;
  if (obj.speed != null) speedStepper.value = obj.speed;
  for (const f of features) f.restore?.(obj);
  applyAll();
}

// --- Wake Lock: keep the screen awake in display mode, degrade silently. ---
let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch {}
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
  $('text').focus();
  releaseWakeLock();
}

// --- Orientation handling ----------------------------------------------------
// Restart the scroll/bounce animation so its vw-based keyframe recomputes after
// a rotation, and re-fit static text to the new viewport. Both are deferred so
// they measure the post-rotation layout.
function restartAnimation() {
  banner.style.animation = 'none';
  void banner.offsetWidth;
  banner.style.animation = '';
}
let raf = 0;
function onViewportChange() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      restartAnimation();
      if (banner.getAttribute('data-motion') === 'static') fitStatic();
    }),
  );
}
window.addEventListener('resize', onViewportChange);
window.addEventListener('orientationchange', () =>
  setTimeout(onViewportChange, 250),
);

// --- Wire core + mount features ---------------------------------------------
['text', 'fg', 'bg'].forEach((id) =>
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
    enterEdit();
  }
});

// Speed leads the Motion tab; then features mount into their tabs.
ctx.add(speedStepper, 'motion');
for (const f of features) f.mount?.(ctx);

// --- Tabs: show one group of controls at a time -----------------------------
const tabButtons = [...document.querySelectorAll('.tabs [role="tab"]')];
const tabPanels = [...document.querySelectorAll('.tab-panel')];
function selectTab(name) {
  for (const t of tabButtons) {
    const on = t.dataset.tab === name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  }
  for (const p of tabPanels) p.hidden = p.dataset.tab !== name;
}
tabButtons.forEach((t) => {
  t.addEventListener('click', () => selectTab(t.dataset.tab));
  t.addEventListener('keydown', (e) => {
    const i = tabButtons.indexOf(t);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % tabButtons.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + tabButtons.length) % tabButtons.length;
    if (j === null) return;
    e.preventDefault();
    selectTab(tabButtons[j].dataset.tab);
    tabButtons[j].focus();
  });
});

// Init from saved settings (falling back to the markup defaults).
const saved = load();
if (saved) applySaved(saved);
else applyAll();

// Register the service worker for offline use.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
