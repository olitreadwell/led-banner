// Export the banner as a short video. MediaRecorder can only capture a canvas,
// not CSS-animated DOM, so we redraw the banner onto an offscreen canvas and
// record that. Captures text / colour / font / scroll only — the rainbow, glow
// and dot-matrix layers are CSS and aren't reproduced. Feature-detected: on any
// missing API the button disables itself instead of throwing (e.g. iOS Safari).
const FONT_STACKS = {
  block: 'system-ui, -apple-system, sans-serif',
  narrow: "'Arial Narrow', 'Roboto Condensed', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
};
const SIZE_SCALE = { s: 0.7, m: 1, l: 1.35 };
const TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

function pickType() {
  for (const t of TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {}
  }
  return null;
}

function supported() {
  return (
    typeof MediaRecorder === 'function' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    typeof MediaRecorder.isTypeSupported === 'function' &&
    pickType() !== null
  );
}

let btn;
let ctxRef;

async function exportVideo() {
  if (!supported()) {
    btn.disabled = true;
    btn.textContent = 'Export not supported';
    return;
  }
  const mime = pickType();
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  const c = ctxRef.readAll();
  const text = (c.text || '').trim() || 'LED BANNER';

  // Match the viewport orientation, long side capped at 1280; even dimensions
  // keep encoders happy.
  const LONG = 1280;
  const portrait = window.innerHeight > window.innerWidth;
  let w = (portrait ? Math.round(LONG * (9 / 16)) : LONG) & ~1;
  let h = (portrait ? LONG : Math.round(LONG * (9 / 16))) & ~1;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const cx = canvas.getContext('2d');
  if (!cx) {
    btn.disabled = true;
    return;
  }

  const stack = FONT_STACKS[c.font] || FONT_STACKS.block;
  const fontPx = Math.max(0.2 * w, 0.62 * h) * (SIZE_SCALE[c.size] ?? 1);
  cx.font = `900 ${fontPx}px ${stack}`;
  cx.textBaseline = 'middle';
  cx.textAlign = 'left';
  const textW = cx.measureText(text).width;

  const isStatic = Number(c.speed) === 0;
  const reverse = c.direction === 'rtl';
  const travel = w + textW;
  const liveTravel = window.innerWidth + textW || travel;
  const passSec = isStatic
    ? 4
    : Math.max(2, (22 / Number(c.speed)) * (travel / liveTravel));
  const durationMs = passSec * 1000;
  const midY = h / 2;

  const draw = (t) => {
    cx.fillStyle = c.bg;
    cx.fillRect(0, 0, w, h);
    cx.fillStyle = c.fg;
    let x;
    if (isStatic) x = (w - textW) / 2;
    else if (reverse) x = -textW + travel * t;
    else x = w - travel * t;
    cx.fillText(text, x, midY);
  };

  let recorder;
  try {
    recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: mime });
  } catch {
    btn.disabled = true;
    btn.textContent = 'Export not supported';
    return;
  }

  const chunks = [];
  recorder.addEventListener('dataavailable', (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });
  const done = new Promise((resolve) => {
    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `led-banner.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    });
  });

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Recording…';
  recorder.start();
  const start = performance.now();
  const frame = (now) => {
    const elapsed = now - start;
    draw(Math.min(1, elapsed / durationMs));
    if (elapsed < durationMs) requestAnimationFrame(frame);
    else recorder.stop();
  };
  requestAnimationFrame(frame);

  await done;
  btn.disabled = false;
  btn.textContent = original;
}

export default {
  id: 'export',

  mount(ctx) {
    ctxRef = ctx;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'export-btn';
    btn.textContent = 'Export video ⬇';
    if (!supported()) {
      btn.disabled = true;
      btn.textContent = 'Export not supported';
    }
    btn.addEventListener('click', exportVideo);
    ctx.add(btn, 'saved');
  },
};
