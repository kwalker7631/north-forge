# North Forge AI Studio — Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.5.0] — 2026-03-22

### Added

- **`public/cast-data.js`** (new file) — Canonical single source of truth for all Pine Barron Farms cast data. `CAST_DB` (9 characters, full fields: id, name, soraId, role, icon, color, photo, bio, vibe, props, looks, voice) and `CAST_LOCATIONS` (10 filming locations). Previously duplicated across 6 files with diverging values.
- **`public/utils.js`** (new file) — Shared HTML-escape utility. Single canonical `esc()` covering `&`, `<`, `>`, and `"`. Previously 5 separate local implementations across rooms.

### Changed

- **`public/cast-data.js`** replaces duplicated cast data in: `cast.js`, `north.js`, `api.js`, `chat-form.js`, `slots.js`, `idioms.js`. If a Sora ID, name, prop, or color changes, it now requires editing exactly **one file**.
- **`public/north.js`** — `CAST` array is now derived from `CAST_DB` via `.map()`. Removed stale character IDs (`wren`→`salem`, `shadow`→`skully`, `bronze`→`tank`) and name mismatches (`Shadowblaz`→`Skully`, `Bronzedogg`→`Tank`, `Salem / Wren`→`Salem`). Eleanor color corrected from `#f9a8d4` to `#fb7185` (matches CLAUDE.md spec and CAST_DB).
- **`public/api.js`** — `CAST_PROPS_CONTEXT` is now generated from `CAST_DB` instead of a hardcoded string. Adding a character or changing props in `cast-data.js` now automatically updates the AI context injected into every North call.
- **`public/rooms/chat-form.js`** — Local `CAST` array (9 entries) replaced with `import { CAST_DB as CAST }` from `cast-data.js`.
- **`public/rooms/slots.js`** — Local `CAST_DATA` object (9 entries) replaced with dynamic `CAST_DB.find()` lookup. Props are now derived from the canonical array.
- **`public/rooms/idioms.js`** — Local `CAST_POOL` array (8 entries) replaced with `CAST_DB.filter().map()` derivation. Excludes Randy (who is the idiom speaker), preserves `[farm dog]` and `[pygmy goat]` labels for Tank and Luna.
- **`public/rooms/cast.js`** — `CAST_DB` and `LOCATIONS` local definitions removed; now imported as `CAST_DB` and `CAST_LOCATIONS` from `cast-data.js`. `locationsHTML()` updated to use `CAST_LOCATIONS`.
- **`public/app.js`** — Removed unused `CAST` import from `north.js` (was imported but never referenced in app.js).
- **`public/rooms/chat.js`**, **`digest.js`**, **`idioms.js`**, **`profile.js`** — Local `esc()` declarations replaced with `import { esc } from '../utils.js'`. All 5 affected rooms now use the same implementation (4-character escape including `&quot;`).

---

## [1.4.1] — 2026-03-22

### Fixed

- **`public/rooms/home.js`** — Luna was missing from the crew strip on the Home tab despite being a full cast member with a Sora ID, cutout photo, and appearance in multiple shot calls. Added `🐐 Luna` chip to the crew strip.
- **`public/app.js`** — `fontSize` loaded from Firestore prefs was hard-reset to 16 if the saved value exceeded 22 (e.g. a value of 28 from an older session would be silently wiped). Now clamped to `[12, 22]` range with `Math.min/max`, preserving the user's intent.
- **`public/rooms/share.js`** — Public call sheet viewer (`/s/{token}`) escaped `<` and `>` in prompt text but missed `&` and `"`. Ampersands in prompts rendered as broken HTML. Fixed to escape all four characters (`&`, `<`, `>`, `"`).
- **`public/rooms/digest.js`** — `digestSaveMD` built lines with `s.idea ? ... : ''` (producing empty strings, not `null`) then filtered with `.filter(l => l !== null)`, so empty strings passed through as blank lines in the exported markdown. Changed to `.filter(Boolean)` to remove all falsy values.

### Added

- **`public/api.js`** — `fetchWeather()` now requests `&daily=sunrise,sunset` from Open-Meteo and returns `sunrise` and `sunset` ISO strings in the weather object. This enables the golden hour countdown in `home.js` which was always returning `null` due to missing fields. No state schema change required — the fields are additive.

---

## [1.4.0] — 2026-03-22

### Fixed

#### CRITICAL

- **`public/rooms/cast.js`** — `castSoraSheet` and `castChemistry` referenced `CAST` (the north.js export) which was never imported into cast.js. Both functions now use `CAST_DB` (the module-local cast array), which also provides richer `looks`, `vibe`, and `voice` fields that improve generated prompt quality. Previously caused `ReferenceError: CAST is not defined` whenever "Build Sora Character Sheet" or "Chemistry Scene" was clicked.

- **`public/rooms/profile.js`** — `let _hydrated = false` was declared at the bottom of the file (after helpers) but referenced inside `render()` near the top. JavaScript `let` is subject to the Temporal Dead Zone (TDZ) and cannot be accessed before its declaration point. This caused `ReferenceError: Cannot access '_hydrated' before initialization` on the first render of the Profile room. Moved the declaration to the top of the module state block, before `render()`.

#### HIGH

- **`public/api.js`** — Gemini fallback call used `gemini-1.5-flash` model URL. Spec requires `gemini-2.0-flash`. Updated the API endpoint in `callGemini()` to match the specified model version, ensuring the fallback AI matches the test used in Setup.

- **`public/rooms/setup.js`** — `window.testGeminiKey` read `window._state?.keys?.gemini` to retrieve the stored Gemini key. `window._state` is never assigned anywhere in the codebase, so the test always returned "No key" even with a valid key saved. Replaced with a module-level `_setupState` variable set in `mount(state)`, and updated the test function to read from `_setupState?.keys?.gemini`.

- **`public/rooms/setup.js`** — The copy and reforge buttons in the Call Sheet History panel embedded text directly into `onclick` attributes using `JSON.stringify().replace(/"/g,'&quot;')`. This pattern breaks silently when prompt text contains escaped quotes or HTML-significant character sequences. Replaced with a `_clipStore` array that holds text by index. Buttons now call `setupCopySheet(idx)` and `setupReforge(idx)`, which retrieve text safely by index at click time.

### Changed

- **`public/north.js`** — Version bumped from `1.3.0` to `1.4.0`. Build date updated to `2026-03-22`.

---

## [1.3.0] — 2026-03-15

### Added

- North's Notes — pin button saves call sheets to `users/{uid}/notes`; Notes tab in Digest
- Crew Share — share button saves to public `shares/{token}` Firestore; read-only `share.js` viewer at `/s/{token}`
- Weekly Brief — Firebase Scheduled Function (Mon 8am ET) generates North's one-liner per user; surfaces as North Peek on sign-in
- Platform Quick-Pick — rule-based "North suggests" card in Prompt Engine above platform selector
- Cast Sora ID Quick-Copy — tap any Sora ID in Cast room to copy to clipboard
- Digest Remix — re-forge any call sheet with fresh take via Remix button
- Digest Export Week — export all call sheets in a week as a single `.md` file
- 7-Day Filming Almanac — Open-Meteo daily forecast strip on Home tab
- Best-of-Week card in Digest

### Changed

- Output/Export system standardized: every call sheet now has Copy Prompt, Copy Full Sheet, and Save MD actions
- `copyFull()` now uses `id="msg-text-{idx}"` directly instead of fragile DOM index scan
- `seasonalOverlay()` fixed to return correct overlay image by month/date (was hardcoded to return null)
- Node.js runtime updated to Node 22 for Cloud Functions
- Firebase hosting now sets `no-cache` on all JS/MJS/HTML files to prevent stale module cache issues

---

## [1.2.0] — 2026-02-15

### Added

- Render Guard (`render-guard.mjs`) — prevents stale async renders on fast tab switching
- Unified logging (`logs/logger.js`) — NorthLog + localStorage diagnostics replace scattered console calls
- Chat history persistence via Firestore (survives page refresh, last 50 messages retained)
- Sora Scout card in Platforms room — North surfaces Sora 2 tips on demand
- User Character Profile (`rooms/profile.js`) — age, build, hair, eyes, style + up to 3 Sora IDs + preferred duration; auto-injected into every North prompt

---

## [1.1.0] — 2026-01-20

### Added

- North Digest (`rooms/digest.js`) — weekly content calendar of all forged call sheets
- Idioms room upgrade — Randy reactions with location picker + Forge This Scene
- Call Sheet History — saved to Firestore, viewable in Digest and Setup

---

## [1.0.0] — 2026-01-01

### Added

- Initial release of North Forge AI Studio
- All three layers shipped: World Engine, Craft Engine, Intelligence Engine
- 13 navigation rooms: home, chat, slots, rocklab, racing, weird, jeeb, idioms, platforms, cast, digest, profile, setup
- North AI character with full system prompt, CAST registry, and locked Sora IDs
- Firebase Auth (Google Sign-In), Firestore prefs, Anthropic + Gemini dual-provider AI
- Weather Agent via Open-Meteo (real sky FX, filming condition, golden hour)
- Viral Video Checker (score badge on call sheets)
- Platform knowledge base (Sora 2, Kling AI, VEO 3, Grok Aurora)
