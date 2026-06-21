# LED Banner

> Fullscreen scrolling LED marquee for your phone. Installable PWA, works offline, no build step.

A self-contained static web app: hold your phone up and show a glowing, scrolling
message. Vanilla HTML/CSS/JS in a single file, served from the domain root.

## Features

- **Text input** with live updating (new text replaces the old word).
- **Motion modes:** scroll, loop, static, bounce.
- **Direction**, **colour + glow**, **font**, and **text size** controls.
- **Static mode** wraps to multiple lines and auto-sizes to fill the screen.
- **Fullscreen** + **wake lock** so the screen stays on while displaying.
- **Installable PWA** with offline support via a service worker.
- **Export to video** (MediaRecorder) to save a clip of the banner.

## Run it locally

No dependencies, no build. Serve the repo root over HTTP (a service worker needs
an HTTP origin, not `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Layout

The app is served from the root, so `start_url` and the service-worker scope are
both `/`.

| File | Purpose |
| --- | --- |
| `index.html` | The entire app (HTML + CSS + JS inline). |
| `sw.js` | Service worker — caches the app shell for offline use. |
| `manifest.json` | PWA manifest (icons, name, display mode). |
| `icon-192.png`, `icon-512.png` | App icons. |
| `scripts/gen-led-icons.mjs` | Regenerates the icons (pure Node, no deps). |
| `docs/led-banner.md` | Design notes + Google Play / App Store guides. |

## Regenerate icons

```bash
node scripts/gen-led-icons.mjs
```

## Deploy

Any static host works (Vercel, GitHub Pages, Netlify, plain nginx). Serve `sw.js`
with a short or no-cache `Cache-Control` so service-worker updates roll out
promptly. See [docs/led-banner.md](docs/led-banner.md) for install and app-store
packaging notes.
