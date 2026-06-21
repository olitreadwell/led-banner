# LED Banner — Improvement Backlog

Standing worklist for the recurring improvement loop. Each iteration: pick the
top unchecked item, build it (features are plugins under `js/features/`; shared
core/CSS/HTML edits are serialised), verify in a real browser (Playwright),
bump the SW cache, commit, deploy, check it off.

## Direction (decided)
Keep THIS repo's clean ES-module architecture. The UI is built from native web
components in `js/components.js` (`<led-stepper>`, `<led-segmented>`,
`<led-switch>`) — no library, no build, fully offline; theme via inherited
`--fg`. A more-featured but monolithic version exists at
`~/code/scratchpad/public/led/index.html` (deployed scratchpad-ashen.vercel.app/led);
use it as a REFERENCE to port features into clean modules, never copy wholesale.

## Shipped
- [x] Phase 0: modular split + orientation fix (landscape menu, rotate relayout)
- [x] Mirror (switch), Glow (segmented None/Low/Med/Max), Direction (arrow icons)
- [x] Blink stepper (0 = Off; clamped <=2.5 Hz, off under reduced-motion)
- [x] Static + Scroll + Bounce motion; Static is speed 0 (auto-fit to screen)
- [x] Speed + Blink as steppers; Glow/Motion/Direction as segmented controls
- [x] Native web-component panel; every option fits an iPhone SE (no scroll)
- [x] Tabbed panel (Style / Motion / Effects) — message + GO always visible,
      one control group at a time; panel ~295px and scales to any feature count
- [x] Colour presets — REMOVED by request (steppers/segmented replaced them)
- [x] a11y/safety: zoom re-enabled, stage keyboard button + fading hint,
      focus-visible, empty-text GO guard, low-contrast warning

## Feature backlog — port from scratchpad reference (priority order)
Reference: `~/code/scratchpad/public/led/index.html`. Build each as a web
component where it fits; keep the iPhone-SE one-screen constraint in mind.
- [x] Multiple fonts (Block / Narrow / Serif / Mono system stacks) — M
- [x] Text size control (segmented S/M/L scale on the scroll font) — S
- [x] Brightness / dimmer (segmented Low/Med/High/Max; CSS filter on stage) — S
- [x] Rainbow text / background / both (@property --hue cycle, reduced-motion safe) — M
- [x] Vertical scroll direction (Right/Left/Up/Down with arrow icons) — M
- [x] Saved slots (3 slots in a Saved tab; save/recall full settings; core
      readAll/applySaved hook added)
- [ ] Auto-fullscreen on rotate-to-landscape + portrait-display toggle — S,
      core hook (expose enterDisplay/enterEdit on ctx)
- [ ] Dot-matrix LED render (mask-overlay variant first) — L
- [ ] Export banner as video (canvas + MediaRecorder) — L

## Audit follow-ups (fold into whichever change touches the area)
- [ ] `aria-valuetext` / better SR announcements on the stepper value — P1
- [ ] Pause/Play affordance for scroll/bounce (WCAG 2.2.2) — P2
- [ ] Scope `user-select:none` to stage/banner only (allow selecting panel text) — P2

## Loop hygiene
- Bump the SW `CACHE` version on EVERY asset change and add new files to its
  precache list (a stale cache-first SW silently serves old JS — verified pain).
- When browser-testing, unregister the SW + clear caches before reloading.
- Verify each change in a real browser before deploying. Atomic Conventional Commits.
- Keep the panel fitting an iPhone SE (375x667) with no scrolling.
