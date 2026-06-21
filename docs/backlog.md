# LED Banner — Improvement Backlog

Standing worklist for the recurring improvement loop. Each iteration: pick the
top unchecked item(s), build (parallel feature agents where isolated), apply
audit fixes, verify in a browser, commit, deploy to Vercel. Check items off as
shipped. Keep features as one-file plugins under `js/features/` where possible;
shared-file (core/CSS/HTML) edits are orchestrator-owned and serialised.

## Direction (decided)
Keep THIS repo's clean ES-module architecture. A far more featured but monolithic
(1621-line) version exists at `~/code/scratchpad` `public/led/index.html`
(scratchpad/main HEAD 9e55a6f, deployed to scratchpad-ashen.vercel.app/led). Use
it as a REFERENCE IMPLEMENTATION to port missing features into clean modules —
do not copy the monolith wholesale. Our orientation fix + a11y/safety work is
ahead of it and must be preserved.

## Shipped
- [x] Phase 0: modular split + orientation fix (landscape menu, rotate relayout)
- [x] Mirror / horizontal flip
- [x] Glow / neon strength
- [x] Scroll direction (L/R)
- [x] Blink (clamped <=2.5 Hz, off under reduced-motion)
- [x] Colour presets (Night / Chalk / Club / Amber / Ice)
- [x] Static motion mode (wraps + auto-fits to fill screen; height-based fit)
- [x] Fix: mirror/blink toggle labels were dark-on-dark (unstyled span)
- [x] a11y: zoom re-enabled, stage keyboard button + fading hint, focus-visible,
      toggle aria-labels, empty-text GO guard, low-contrast warning

## Scratchpad parity — port these into modules (priority order)
Reference: `~/code/scratchpad/public/led/index.html`. Each is a clean plugin
unless noted; bump the SW cache + precache list every time.
- [x] Bounce motion mode (3rd segment; ping-pong scroll) — S, add to motion.js
- [ ] Multiple fonts (system stacks: condensed / serif / mono) + bold — M
- [ ] Text size control (scale multiplier on the scroll font) — S
- [ ] Brightness / dimmer (CSS filter on stage) — S
- [ ] Rainbow text / background / both (CSS-attribute-driven cycle) — M
- [ ] Vertical scroll direction (up/down) — M, core/CSS
- [ ] Saved slots (save/recall full settings; own storage key) — M, needs
      a core applySaved/readAll hook
- [ ] Dot-matrix LED render (mask-overlay variant first) — L
- [ ] Export banner as video (canvas + MediaRecorder) — L
- [ ] Rotate-to-fullscreen auto-display + portrait-display toggle — S, core hook

## Wave 0 — orchestrator core hooks (do before the parallel waves)
These unlock later features and are the only unavoidable shared-file edits.
- [ ] Expose `ctx.enterDisplay` / `ctx.enterEdit` + orientation guard (unblocks
      auto-rotate-display, portrait toggle)
- [ ] Expose `ctx.readAll()` / `ctx.applySaved(obj)` wrapping the restore loop
      (unblocks saveable presets/history)
- [ ] Viewport-change re-fit callback registry (unblocks static/auto-fit, canvas)
- [ ] Emoji-capable font fallback in the `#banner` stack (one CSS line)

## Wave 1 — parallel, isolated, high value-per-effort
- [ ] Typography: fonts + size + bold (README already claims it) — M
- [ ] Brightness / dimmer (visual; note OS backlight isn't web-reachable) — S/M
- [ ] Rainbow / gradient / colour-cycling text (CSS-attribute driven) — M
- [ ] Flash-on-finish + haptics (pair them; `animationiteration` cadence) — S
- [ ] Emoji quick-insert chips (after the font-stack line) — S

## Wave 2 — depends on Wave 0 hooks
- [ ] Auto-start display on rotate-to-landscape + portrait-display toggle — S
- [ ] Saveable presets & message history (own storage key) — M
- [ ] Logo / PNG overlay + background image (inject into `ctx.stage`) — M
- [ ] Static / hold mode with auto-fit text sizing (gateway to multi-line) — M

## Wave 3 — heavy / sequential
- [ ] Multi-line text (needs textarea + static auto-fit) — M
- [ ] Party / strobe (composes blink + rainbow); sound-reactive optional — M/L
- [ ] Realistic LED dot-matrix render (mask-overlay variant first) — L
- [ ] GIF / MOV export (needs a canvas; depends on dot-matrix) — L

## Audit follow-ups (fold into whichever wave touches the area)
- [x] Low-contrast fg/bg guard: compute WCAG ratio, show aria-live warning — P1
- [ ] Panel reorg: presets above raw colour pickers; collapse glow/direction/
      mirror/blink under a "More / Effects" disclosure — P1/P2
- [x] Empty-text guard: disable GO (or show placeholder) when text is blank — P1
- [ ] `aria-valuetext` on speed / glow / blink-rate sliders — P1
- [ ] 44px min touch targets on segment/toggle buttons — P2
- [ ] Scope `user-select:none` to stage/banner only (allow selecting panel text) — P2
- [ ] Pause/Play control for the scroll (WCAG 2.2.2) — P2

## Loop hygiene
- Bump the service worker `CACHE` version on EVERY asset change, and add any new
  files to its precache list (a stale cache-first SW silently serves old JS).
- Verify each change in a real browser (Playwright) before deploying.
- Keep commits atomic and Conventional-Commit formatted.
