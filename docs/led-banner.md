# LED Banner — PWA & app-store guide

A vanilla HTML/CSS/JS PWA that shows fullscreen scrolling LED-style text, like a
banner you'd hold up in a club. It is a self-contained static site with no build
step or framework — served straight from the repo root.

- **Live URL:** `<YOUR_DEPLOY_URL>` (set once deployed, e.g. a Vercel/Pages URL)
- **Source:** repo root (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`)
- **Icons:** regenerate with `node scripts/gen-led-icons.mjs`

## How it works

- The scrolling banner is **always rendered** fullscreen. Edit mode is a
  translucent controls panel layered on top; display mode just hides the panel.
  Tapping the screen in display mode reopens the panel.
- All controls (text, text colour, background colour, speed) apply **live** via
  CSS custom properties, so changes show immediately in either mode.
- **Wake Lock** is requested on entering display mode and re-acquired on
  `visibilitychange`. If the browser lacks the API it's a silent no-op.
- The service worker (`/sw.js`, scope `/`) cache-firsts the app shell so it loads
  and runs offline.

### Hosting note

The app is served from the domain root, so `start_url` and the service-worker
scope are both `/`. Any static host works (Vercel, GitHub Pages, Netlify, plain
nginx) — no build step. For reliable SW updates, serve `sw.js` with a short or
no-cache `Cache-Control` so new versions roll out promptly instead of being
pinned by HTTP caching.

## Install (no app store needed)

This is the zero-cost, instant-update path and covers ~95% of the native feel:

- **iOS (Safari 16.4+):** open the URL → Share → **Add to Home Screen**.
- **Android (Chrome):** open the URL → **Install app** prompt / menu.

You get a home-screen icon, fullscreen standalone display, offline support, and
wake lock — no review, no fees.

---

## Google Play (Android) — TWA wrapper

A **Trusted Web Activity** ships the PWA as a Play Store app in a Chrome-backed
shell. This is the easy store path.

### Prerequisites

- Google Play Developer account ($25 one-time).
- The PWA live over HTTPS (already true).

### Steps

1. **Generate the project.** Use [PWABuilder](https://www.pwabuilder.com/) — paste
   your deployed URL, choose the **Android** package, or run Bubblewrap locally:
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest <YOUR_DEPLOY_URL>/manifest.json
   bubblewrap build
   ```
2. **Set Digital Asset Links.** Bubblewrap/PWABuilder prints the signing key's
   SHA-256 fingerprint. Put it in `.well-known/assetlinks.json` (replace
   `REPLACE_WITH_YOUR_PLAY_APP_SIGNING_SHA256_FINGERPRINT`) and set the real
   `package_name`. **Important:** if you use Play App Signing (recommended),
   Google re-signs the app — copy the fingerprint Play shows under
   _Setup → App integrity_, not your local upload key. Commit and redeploy so the
   file is live; this is what removes the browser URL bar from the installed app.
3. **Upload** the generated `.aab` to the Play Console, fill the listing, and
   submit for review. PWA-backed apps are accepted without issue.

Total effort: a few hours including account setup. No Mac required.

---

## Apple App Store (iOS) — WKWebView wrapper

Harder, and approval is **not guaranteed**. Budget for review back-and-forth.

### Prerequisites

- Apple Developer Program ($99/year).
- A **Mac with Xcode** (required to build and submit).

### Steps

1. **Generate the project.** Use PWABuilder's **iOS** package (wraps the PWA in a
   `WKWebView`), or Capacitor. Open the generated project in Xcode.
2. **Set bundle ID, icons, and signing** with your Apple Developer team.
3. **Test** on a real device, then archive and upload via Xcode / App Store
   Connect.

### The real blocker — Guideline 4.2 ("Minimum Functionality")

Apple routinely **rejects apps that are "just a website"** or a thin web wrapper.
A bare scrolling-text banner is squarely in that danger zone. To pass review,
add genuinely native value before submitting, e.g.:

- Native **share / save-image** of a banner preset.
- **Saved presets** persisted via native storage (not only localStorage).
- A **Home Screen widget** or Shortcuts action.
- **Haptics** on scroll/tap, native colour pickers, or a Live Activity.
- Make offline feel app-like (bundled assets, no "open in Safari" affordances).

Frame the App Store description around these native features, not "a webpage that
scrolls text." Even so, expect possible rejections and a few review cycles.

### Recommendation

Ship Play (TWA) for a store presence cheaply; treat the iOS App Store as a
separate, larger project only if discoverability genuinely matters. For most
uses, **Add to Home Screen** on iOS is the better trade-off.
