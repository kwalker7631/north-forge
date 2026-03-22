# North Forge AI Studio — Full Engineering Audit
**Date:** 2026-03-22
**Auditor:** Claude Code (Senior Principal Software Engineer)
**Version Audited:** 1.3.0
**Version Post-Audit:** 1.4.0

---

## FILES AUDITED

| File | Lines | Status |
|------|-------|--------|
| public/index.html | 441 | Clean |
| public/app.js | 437 | Clean |
| public/north.js | 111 | Fixed (version bump) |
| public/data.js | 170 | Clean |
| public/api.js | 219 | Fixed (Gemini model version) |
| public/firebase.js | 236 | Clean |
| public/platforms.js | 322 | Clean |
| public/render-guard.mjs | 14 | Clean |
| public/logs/logger.js | 69 | Clean |
| public/rooms/home.js | ~578 | Clean |
| public/rooms/chat.js | 394 | Clean |
| public/rooms/chat-form.js | 383 | Clean |
| public/rooms/cast.js | ~492 | Fixed (CAST reference bug) |
| public/rooms/platforms.js | 344 | Clean |
| public/rooms/setup.js | ~445 | Fixed (state access, clipboard safety) |
| public/rooms/slots.js | 251 | Clean |
| public/rooms/rocklab.js | 90 | Clean |
| public/rooms/racing.js | 63 | Clean |
| public/rooms/weird.js | 57 | Clean |
| public/rooms/jeeb.js | 59 | Clean |
| public/rooms/idioms.js | 234 | Clean |
| public/rooms/digest.js | 446 | Clean |
| public/rooms/profile.js | 249 | Fixed (TDZ bug) |
| public/rooms/share.js | 99 | Clean |
| firebase.json | 43 | Clean |
| .firebaserc | 6 | Clean |

---

## ISSUES FOUND

### CRITICAL

#### C-01: `cast.js` — `CAST` referenced but never imported
**File:** `public/rooms/cast.js`, lines 444 and 468
**Severity:** CRITICAL
**Root Cause:** `window.castSoraSheet` and `window.castChemistry` called `CAST.find(...)` and `CAST.filter(...)` where `CAST` is the exported array from `north.js`. However, `cast.js` never imports `CAST` from `north.js`. This would cause a `ReferenceError: CAST is not defined` at runtime whenever a user clicked "Build Sora Character Sheet" or "Chemistry Scene" on any character card.
**Fix Applied:** Changed both functions to use `CAST_DB` (the module-local cast array in cast.js) instead of the unimported `CAST`. `CAST_DB` is actually better for this use case because it contains the full `looks`, `vibe`, and `voice` fields that north.js `CAST` lacks — making the generated prompts richer.
**Status:** FIXED

#### C-02: `profile.js` — `_hydrated` used before declaration (Temporal Dead Zone)
**File:** `public/rooms/profile.js`, line 27 (render function) vs line 212 (declaration)
**Severity:** CRITICAL
**Root Cause:** `let _hydrated = false` was declared at line 212, well after the `render()` function at line 25. The `render()` function references `_hydrated` on line 27. In JavaScript ES modules, `let` declarations are subject to the Temporal Dead Zone (TDZ) — they are not accessible before their declaration point in the source. When `render()` was called (which happens before `mount()`), accessing `_hydrated` would throw `ReferenceError: Cannot access '_hydrated' before initialization`.
**Fix Applied:** Moved the `let _hydrated = false` declaration to before the `render()` function (top of the local state section). Replaced the duplicate lower declaration with a comment.
**Status:** FIXED

---

### HIGH

#### H-01: `api.js` — Gemini model version mismatch
**File:** `public/api.js`, line 65
**Severity:** HIGH
**Root Cause:** The fallback Gemini call used `gemini-1.5-flash` but CLAUDE.md specifies `gemini-2.0-flash` and the setup.js test uses `gemini-2.0-flash`. This inconsistency means the fallback AI would use an older model than the test, potentially giving different quality results and causing confusion when diagnosing issues.
**Fix Applied:** Updated the API endpoint in `callGemini()` from `gemini-1.5-flash` to `gemini-2.0-flash`.
**Status:** FIXED

#### H-02: `setup.js` — `testGeminiKey` accesses `window._state` which is never assigned
**File:** `public/rooms/setup.js`, line 398
**Severity:** HIGH
**Root Cause:** `window.testGeminiKey` reads `window._state?.keys?.gemini` to get the stored Gemini API key. However `window._state` is never assigned anywhere in the codebase. This means clicking "Test" on the Gemini key would always fail with "No key" error even if a key was properly saved, making it impossible to confirm the Gemini key works.
**Fix Applied:** Added `let _setupState = null` module variable, set it in `mount(state)`, and replaced `window._state?.keys?.gemini` with `_setupState?.keys?.gemini`.
**Status:** FIXED

#### H-03: `setup.js` — Inline clipboard copy uses fragile `JSON.stringify().replace()` pattern
**File:** `public/rooms/setup.js`, line 301
**Severity:** HIGH
**Root Cause:** The copy button for call sheets in the history panel embedded the text directly into the `onclick` attribute using `JSON.stringify(s.clean||'').replace(/"/g,'&quot;')`. This pattern breaks when the text contains sequences like `\"` (escaped quotes in JSON) or HTML special characters that interact with attribute parsing. Long call sheet prompts frequently contain apostrophes, quotes, and special characters.
**Fix Applied:** Introduced a `_clipStore` array that holds the actual text values. The rendered buttons reference indices into this array (`onclick="setupCopySheet(0)"`). Two new window functions `setupCopySheet(idx)` and `setupReforge(idx)` safely retrieve and use the text.
**Status:** FIXED

---

### MEDIUM (Not Fixed — Documented for Backlog)

#### M-01: `home.js` — Luna missing from crew strip
**File:** `public/rooms/home.js`, crewStrip function
**Severity:** MEDIUM
**Root Cause:** The `crewStrip()` function lists 8 crew chips (Ken, Marguerite, Randy, Salem, Shadowblaz, Bronzedogg, BigTheSqua, Eleanor) but omits Luna the goat. Luna is a full cast member with a Sora ID, listed in CAST_DB, north.js CAST, and prominently featured in the character cutouts on the same page.
**Recommendation:** Add Luna to the crew strip array.
**Status:** DOCUMENTED — see BACKLOG.md

#### M-02: Cast data duplicated across 4 files
**Severity:** MEDIUM
**Root Cause:** The cast Sora IDs and props appear in: `north.js` (CAST array + NORTH_SYSTEM prompt), `api.js` (CAST_PROPS_CONTEXT), `cast.js` (CAST_DB), `chat-form.js` (local CAST), `rooms/slots.js` (CAST_DATA), and `rooms/idioms.js` (CAST_POOL). Each has slightly different fields and some have slightly different prop lists. This creates divergence risk: if a Sora ID changes, it must be updated in 6+ places.
**Recommendation:** The ideal fix is a single source-of-truth import for cast data throughout. The CAST_DB in cast.js is the richest and should be the canonical source. Medium-effort refactor.
**Status:** DOCUMENTED — see BACKLOG.md

#### M-03: `app.js` line 151 — fontSize guard uses magic number 22
**File:** `public/app.js`, line 151
**Severity:** LOW
**Root Cause:** `if (state.fontSize > 22) state.fontSize = 16;` resets fontSize to 16 if loaded prefs have a value > 22. The original CLAUDE.md spec mentions `fontSize: 28` as default but the current code initializes `fontSize: 16` and caps it at 22. If a user ever had a fontSize of 28 saved from an older version, it would be silently reset to 16 instead of clamped to 22.
**Recommendation:** Change the guard to `state.fontSize = Math.min(22, Math.max(12, state.fontSize))` to clamp rather than hard-reset.
**Status:** DOCUMENTED — see BACKLOG.md

#### M-04: `app.js` — `state.chatMode` mutation side-channel
**File:** `public/app.js`, line 62 and `chat.js` line 23
**Severity:** MEDIUM
**Root Cause:** `window.send()` in app.js sets `state.chatMode = 'chat'` before calling `window.goTo('chat')`. `chat.js` render() reads and clears this: `if (state.chatMode) { chatMode = state.chatMode; state.chatMode = null; }`. This "one-shot side channel" works but is fragile — it relies on render() consuming the flag exactly once and assumes no re-render can occur between setting and consuming it. It's also invisible to anyone reading chat.js in isolation.
**Recommendation:** Pass the desired mode as a URL hash parameter or explicit state field. Low priority since it works.
**Status:** DOCUMENTED — see BACKLOG.md

#### M-05: `home.js` mount() — northTipTimer and cameoTimer leak on fast navigation
**File:** `public/rooms/home.js`, mount() function
**Severity:** MEDIUM
**Root Cause:** The home room registers `northTipTimer` (setInterval) and `cameoTimer` (setInterval) in mount(). The render guard prevents stale renders, but these intervals run independently. If the user navigates away and back rapidly, and the home module is re-imported (it's cached after first import, so this is rare), new intervals could stack. The `clearInterval` calls at the start of mount() handle most cases, but the module-level variables persist across navigations so re-entry into mount() properly clears them.
**Recommendation:** Verify the module cache behavior ensures only one copy of the module variables exist (it does in browser ES module systems). Current implementation is acceptable.
**Status:** ACCEPTABLE — no action needed

---

### LOW

#### L-01: Multiple `const esc = ...` declarations
**Severity:** LOW
**Files:** `chat.js`, `digest.js`, `idioms.js`, `profile.js`, `share.js` all define their own `esc()` helper with slightly different implementations.
**Root Cause:** No shared utility module for HTML escaping.
**Recommendation:** Create `public/utils.js` with a shared `esc()` export.
**Status:** DOCUMENTED — see BACKLOG.md

#### L-02: `share.js` — only escapes `<` and `>` for cleanText, misses `&` and `"`
**File:** `public/rooms/share.js`, line 26
**Severity:** LOW
**Root Cause:** `const cleanText = (d.clean || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')` does not escape `&` characters. This is technically an XSS concern but the data comes from Firestore (user's own previously-generated content), not untrusted external input. Still, `&` in prompt text would render incorrectly (e.g., `&` appearing literally broken).
**Recommendation:** Use the full `esc()` function pattern.
**Status:** DOCUMENTED — see BACKLOG.md

#### L-03: `home.js` — goldenHour() relies on `wx.sunrise`/`wx.sunset` never returned by fetchWeather
**File:** `public/rooms/home.js` line 104, `public/api.js` fetchWeather
**Severity:** LOW
**Root Cause:** `goldenHour(wx)` checks `if (!wx?.sunrise && !wx?.sunset) return null`. The `fetchWeather()` function in api.js returns an object with `{ temp, condition, wind, location }` — it never includes `sunrise` or `sunset` fields. So the golden hour countdown will always return `null` and never display. The check correctly guards against null, but the feature is silently disabled.
**Recommendation:** Add `sunrise` and `sunset` parsing to `fetchWeather()` using Open-Meteo's `daily=sunrise,sunset` parameter.
**Status:** DOCUMENTED — see BACKLOG.md

#### L-04: `digest.js` — `digestSaveMD` uses `.filter(l => l !== null)` but l can be `undefined` or `''`
**File:** `public/rooms/digest.js`, line 438
**Severity:** LOW
**Root Cause:** The filter `filter(l => l !== null)` will not remove empty strings `''` or `undefined` values, only explicit `null`. The array can contain `''` from conditionals like `s.idea ? ... : ''`.
**Recommendation:** Change to `.filter(Boolean)` to remove all falsy values.
**Status:** DOCUMENTED — see BACKLOG.md

#### L-05: `app.js` — `shareCS()` does not check `state.user` before saving
**File:** `public/app.js`, line 389
**Severity:** LOW
**Root Cause:** `window.shareCS` writes to Firestore `shares/{token}` and includes `sharedBy: state.user?.uid || null`. The write itself will succeed (shares collection is presumably public-write in Firestore rules). However if the user is not signed in, the share will have no attribution. This is acceptable behavior but could be made explicit with a toast.
**Status:** ACCEPTABLE — no action needed

---

## ARCHITECTURE OBSERVATIONS

### What Works Well
- Render guard pattern (`render-guard.mjs`) correctly prevents stale async renders on fast tab switching
- Unified logging (`logs/logger.js`) with NorthLog + localStorage diagnostics is clean and well-structured
- Firebase write patterns all wrapped in try/catch with NorthLog warnings — no unhandled rejections
- Dynamic room import (`import('./rooms/${tab}.js')`) with error boundary is robust
- `sanitizeMessages()` in api.js correctly handles the "API requires user message first" constraint
- Weather-to-scene mapping is clean and well-thought-out

### Navigation Architecture
All 13 nav tabs are correctly wired:
- home, chat, slots, rocklab, racing, weird, jeeb, idioms, platforms, cast, digest, profile, setup
- Share room is routed via URL path match at boot (`/s/{token}`)
- No missing room registrations

### Security Notes
- Firebase API key is client-side (expected for Firebase web apps — these are publishable keys, not secrets)
- Anthropic and Gemini keys are proxied through Firebase Functions (`/api/north`) — correct architecture
- Keys stored in Firestore under `users/{uid}/data/prefs` — authenticated access only
- No hardcoded AI API keys in client code

---

## SUMMARY

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| CRITICAL | 2 | 2 | 0 |
| HIGH | 3 | 3 | 0 |
| MEDIUM | 4 | 0 | 4 |
| LOW | 5 | 0 | 5 |
| **Total** | **14** | **5** | **9** |

All CRITICAL and HIGH issues resolved. All Medium/Low items documented in BACKLOG.md.
