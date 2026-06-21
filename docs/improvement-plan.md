# LED Banner — Improvement Plan

Driven by a usability complaint (orientation/rotation handling, landscape menu)
and competitor research across the LED-banner app category.

## The problem being solved

Reported pain, in the user's words:

- Typing in portrait then rotating to landscape breaks.
- The menu is hard to use in landscape.
- Things don't resize / re-lay-out on rotation.
- Going portrait↔landscape "doesn't fix itself."

## Root cause (current `index.html`)

1. **Landscape menu unusable** — `#panel` uses `flex-direction:column` +
   `justify-content:center` + `overflow-y:auto`. Centered flex content that
   overflows is clipped at the top and cannot be scrolled to (a known flexbox
   trap). Landscape has little height; opening the keyboard pushes the top
   controls out of reach.
2. **No relayout on rotate** — the scroll uses
   `@keyframes scroll { translateX(100vw) → translateX(-100%) }`. iOS Safari
   caches the `100vw` value when the animation starts and does not recompute it
   on rotation, so the text starts off-screen or jumps. There is no `resize` /
   `orientationchange` listener, so nothing corrects itself.
3. **Type-portrait-then-rotate** is bugs 1 + 2 together: keyboard open +
   centered overflow + stale animation.

## Competitor research

Apps surveyed: LEDit (id307741537, 4.8★, the category's oldest/most-loved),
LED Scroller & Text Banner (id6443862073, 4.6★), Pick Up Sign (id567997800),
plus a broad survey of ~10 store listings.

### Patterns worth borrowing

| Feature | Source | Effort | Notes |
| --- | --- | --- | --- |
| Rotation triggers relayout + optional auto-display | LEDit | low | Directly fixes the core complaint |
| Orientation-aware auto-scaling text | Pick Up Sign | low | Font scales to the active orientation |
| Mirror / horizontal flip | LEDit (universal) | low | `transform: scaleX(-1)`; signature feature |
| Motion modes: scroll / static / blink (+ rate) | all | low | Baseline users expect |
| Glow / neon on text | most | low | `text-shadow` |
| Direction L/R (and up/down/static) | most | low | |
| Named presets (night / chalkboard / club) | Pick Up Sign | low | Tuned defaults beat raw pickers |
| Portrait-display toggle | LEDit | low | Show only in landscape if desired |
| Logo / PNG overlay | Pick Up Sign | med | Branding + pickup use case |
| Background image | LED Scroller | med | |
| Per-element drag / resize | Pick Up Sign | med | |
| Fonts + size + bold, emoji | most | med | |
| Saveable presets / message history | LEDit / Pick Up Sign | med | |
| Brightness / max-brightness | LEDit | med | |
| GIF / MOV export | LEDit / LED Scroller | high | |
| Realistic LED dot-matrix render | category | high | The other category-definer |
| Party / strobe / sound-reactive | survey | high | |

### Anti-pattern to avoid

LED Scroller & Text Banner makes the user physically rotate the phone after
pressing start, and has "oversized button" complaints — the exact awkwardness
reported here. The goal is to beat that, not copy it.

## Plan

### Phase 0 — fix orientation (the actual pain; do first)

1. Panel layout: drop `justify-content:center`; use `flex-start` with an inner
   `margin:auto` wrapper so it centers when it fits and scrolls cleanly when it
   doesn't. In landscape, switch to a 2-column grid via
   `@media (orientation:landscape)`.
2. Add an `orientationchange` / `resize` listener that restarts the scroll
   animation (toggle `animation:none` + reflow) so `vw` recomputes and the
   banner re-lays-out both directions.
3. Verify: portrait↔landscape with the keyboard open; banner never sits
   off-screen.

### Phase 1 — quick high-value features

- Mirror / flip toggle (`scaleX(-1)`).
- Glow (text-shadow on the foreground colour).
- Motion modes: scroll / static / blink + blink rate.
- Direction L/R.
- Named presets (night / chalkboard / club).

### Phase 2 — depth

- Fonts + size + bold, emoji, saveable presets / history, brightness,
  portrait-display toggle, logo / background image overlay.

### Phase 3 — heavy

- LED dot-matrix render layer, GIF / MOV export, party / strobe / sound effects.

## Note on the README

The current `README.md` already advertises motion modes, fonts, a static
multi-line mode, and video export. `index.html` implements none of these yet
(it has text, fg/bg colour, and speed only). Either the README is aspirational
or it drifted ahead of the code; Phases 1–3 would bring the code up to what the
README claims.
