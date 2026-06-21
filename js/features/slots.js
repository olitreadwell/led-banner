// Saved slots: stash up to 3 full configurations and recall one with a tap.
// Each slot is a Load button (labelled with the saved message, or "Empty") and
// a small Save button that overwrites it with the current settings. Uses its
// own localStorage key, independent of the live settings, and the core
// ctx.readAll() / ctx.applySaved() hooks.
const SLOTS_KEY = 'led-banner-slots';
const COUNT = 3;

let ctxRef;
let container;
let slots = Array(COUNT).fill(null);

function loadSlots() {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      return Array.from({ length: COUNT }, (_, i) => parsed[i] ?? null);
    }
  } catch {}
  return Array(COUNT).fill(null);
}

function persist() {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch {}
}

function render() {
  container.innerHTML = '';
  slots.forEach((slot, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'slot';

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'slot-load' + (slot ? '' : ' empty');
    loadBtn.textContent = slot ? slot.text?.trim() || `Slot ${i + 1}` : 'Empty';
    loadBtn.disabled = !slot;
    loadBtn.setAttribute(
      'aria-label',
      slot ? `Load slot ${i + 1}: ${slot.text}` : `Slot ${i + 1} is empty`,
    );
    loadBtn.addEventListener('click', () => {
      if (slots[i]) ctxRef.applySaved(slots[i]);
    });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'slot-save';
    saveBtn.textContent = 'Save';
    saveBtn.setAttribute('aria-label', `Save current settings to slot ${i + 1}`);
    saveBtn.addEventListener('click', () => {
      slots[i] = ctxRef.readAll();
      persist();
      render();
    });

    wrap.append(loadBtn, saveBtn);
    container.appendChild(wrap);
  });
}

export default {
  id: 'slots',

  mount(ctx) {
    ctxRef = ctx;
    slots = loadSlots();
    container = document.createElement('div');
    container.className = 'slots';
    render();
    ctx.add(container, 'saved');
  },
};
