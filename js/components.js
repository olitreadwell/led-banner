// Tiny native web components for the edit panel — no framework, no build, fully
// offline. Each encapsulates its markup/styles in a shadow root and emits a
// `change` event. Theming comes from inherited CSS custom properties (--fg
// pierces the shadow boundary), so one colour change recolours every control.

const SHARED = `
  :host { display: block; }
  .row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 38px;
  }
  .lbl {
    flex: 0 0 4.3rem;
    color: #aaa;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  button {
    font: inherit;
    cursor: pointer;
    border: 2px solid #333;
    background: #111;
    color: #ccc;
    border-radius: 0.5rem;
  }
  button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
`;

// --- <led-segmented> — a radio-group of pill buttons ------------------------
class LedSegmented extends HTMLElement {
  #options = [];
  #value = null;
  #label = '';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set label(v) {
    this.#label = v;
    this.#render();
  }
  set options(v) {
    this.#options = v || [];
    this.#render();
  }
  set value(v) {
    this.#value = String(v);
    this.#sync();
  }
  get value() {
    return this.#value;
  }
  connectedCallback() {
    this.#render();
  }
  #render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED}
        .seg { flex: 1; display: flex; flex-wrap: wrap; gap: 0.3rem; }
        button {
          flex: 1 1 auto;
          min-width: 2.6rem;
          min-height: 34px;
          padding: 0.35rem 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }
        button[aria-checked='true'] {
          border-color: var(--fg, #39ff14);
          background: #1c1c1c;
          color: #fff;
        }
        .ico { font-size: 1rem; line-height: 1; }
      </style>
      <div class="row">
        ${this.#label ? `<span class="lbl">${this.#label}</span>` : ''}
        <div class="seg" role="radiogroup" aria-label="${this.#label}"></div>
      </div>`;
    const seg = this.shadowRoot.querySelector('.seg');
    for (const opt of this.#options) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.dataset.value = opt.value;
      b.innerHTML =
        (opt.icon ? `<span class="ico">${opt.icon}</span>` : '') +
        (opt.label ? `<span>${opt.label}</span>` : '');
      b.addEventListener('click', () => this.#select(opt.value));
      b.addEventListener('keydown', (e) => this.#onKey(e));
      seg.appendChild(b);
    }
    this.#sync();
  }
  #onKey(e) {
    const vals = this.#options.map((o) => o.value);
    let i = vals.indexOf(this.#value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i++;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i--;
    else return;
    e.preventDefault();
    this.#select(vals[(i + vals.length) % vals.length]);
    this.shadowRoot
      .querySelector(`button[data-value="${this.#value}"]`)
      ?.focus();
  }
  #select(value) {
    this.#value = String(value);
    this.#sync();
    this.dispatchEvent(
      new CustomEvent('change', { detail: { value: this.#value } }),
    );
  }
  #sync() {
    if (!this.shadowRoot) return;
    for (const b of this.shadowRoot.querySelectorAll('button')) {
      const on = b.dataset.value === this.#value;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
  }
}

// --- <led-stepper> — −/value/+ with a special label at zero -----------------
class LedStepper extends HTMLElement {
  #label = '';
  #value = 0;
  #min = 0;
  #max = 10;
  #step = 1;
  #zeroLabel = '';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set label(v) {
    this.#label = v;
    this.#render();
  }
  set zeroLabel(v) {
    this.#zeroLabel = v;
    this.#render();
  }
  set min(v) {
    this.#min = Number(v);
  }
  set max(v) {
    this.#max = Number(v);
  }
  set step(v) {
    this.#step = Number(v);
  }
  set value(v) {
    this.#value = Number(v);
    this.#sync();
  }
  get value() {
    return this.#value;
  }
  connectedCallback() {
    this.#render();
  }
  #render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED}
        .ctl { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
        button {
          width: 2.4rem;
          height: 34px;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1;
        }
        button:disabled { opacity: 0.35; cursor: not-allowed; }
        .val {
          flex: 1;
          text-align: center;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .val[data-zero='true'] { color: #aaa; }
      </style>
      <div class="row">
        <span class="lbl">${this.#label}</span>
        <div class="ctl">
          <button type="button" class="dec" aria-label="${this.#label} down">−</button>
          <span class="val" role="status" aria-live="polite"></span>
          <button type="button" class="inc" aria-label="${this.#label} up">+</button>
        </div>
      </div>`;
    this.shadowRoot
      .querySelector('.dec')
      .addEventListener('click', () => this.#bump(-this.#step));
    this.shadowRoot
      .querySelector('.inc')
      .addEventListener('click', () => this.#bump(this.#step));
    // Name the whole control for assistive tech (e.g. "Speed, group").
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', this.#label);
    this.#sync();
  }
  #bump(delta) {
    const next = Math.min(this.#max, Math.max(this.#min, this.#value + delta));
    if (next === this.#value) return;
    this.#value = next;
    this.#sync();
    this.dispatchEvent(
      new CustomEvent('change', { detail: { value: this.#value } }),
    );
  }
  #sync() {
    if (!this.shadowRoot) return;
    const val = this.shadowRoot.querySelector('.val');
    const isZero = this.#value === 0 && this.#zeroLabel;
    const display = isZero ? this.#zeroLabel : String(this.#value);
    val.textContent = display;
    val.dataset.zero = String(Boolean(isZero));
    // The live region announces the change with its control's name for context,
    // e.g. "Speed: Static" / "Blink: 5", rather than a bare number.
    val.setAttribute('aria-label', `${this.#label}: ${display}`);
    this.shadowRoot.querySelector('.dec').disabled = this.#value <= this.#min;
    this.shadowRoot.querySelector('.inc').disabled = this.#value >= this.#max;
  }
}

// --- <led-switch> — an on/off toggle ----------------------------------------
class LedSwitch extends HTMLElement {
  #label = '';
  #checked = false;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set label(v) {
    this.#label = v;
    this.#render();
  }
  set checked(v) {
    this.#checked = Boolean(v);
    this.#sync();
  }
  get checked() {
    return this.#checked;
  }
  connectedCallback() {
    this.#render();
  }
  #render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED}
        button.sw {
          flex: 0 0 auto;
          width: 3.2rem;
          height: 1.9rem;
          border-radius: 1rem;
          padding: 0;
          position: relative;
        }
        .knob {
          position: absolute;
          top: 2px; left: 2px;
          width: 1.4rem; height: 1.4rem;
          border-radius: 50%;
          background: #ccc;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        button.sw[aria-checked='true'] { border-color: var(--fg, #39ff14); }
        button.sw[aria-checked='true'] .knob {
          transform: translateX(1.3rem);
          background: var(--fg, #39ff14);
        }
        .spacer { flex: 1; }
      </style>
      <div class="row">
        <span class="lbl">${this.#label}</span>
        <span class="spacer"></span>
        <button type="button" class="sw" role="switch" aria-label="${this.#label}">
          <span class="knob"></span>
        </button>
      </div>`;
    const btn = this.shadowRoot.querySelector('.sw');
    btn.addEventListener('click', () => this.#toggle());
    this.#sync();
  }
  #toggle() {
    this.#checked = !this.#checked;
    this.#sync();
    this.dispatchEvent(
      new CustomEvent('change', { detail: { checked: this.#checked } }),
    );
  }
  #sync() {
    const btn = this.shadowRoot?.querySelector('.sw');
    if (btn) btn.setAttribute('aria-checked', String(this.#checked));
  }
}

customElements.define('led-segmented', LedSegmented);
customElements.define('led-stepper', LedStepper);
customElements.define('led-switch', LedSwitch);
