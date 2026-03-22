# North Forge AI Studio — Engineering Backlog
**Last Updated:** 2026-03-22
**Audit Version:** 1.4.0

Items deferred from the v1.4.0 audit. All CRITICAL and HIGH issues were fixed. The items below are MEDIUM and LOW severity — each is documented here with the root cause, recommendation, and rationale for deferral.

---

## MEDIUM Priority

### M-01 — Luna missing from crew strip on Home tab
**File:** `public/rooms/home.js`, `crewStrip()` function
**Found:** 2026-03-22

**Problem:** The crew strip lists 8 crew chips (Ken, Marguerite, Randy, Salem, Shadowblaz, Bronzedogg, BigTheSqua, Eleanor) but omits Luna the goat. Luna is a full cast member with a locked Sora ID (`@kennethwa.luna`), appears in `CAST_DB`, appears in north.js `CAST`, and is prominently featured in the character cutouts on the same Home page.

**Fix:** Add Luna to the `crewStrip()` array in `home.js`. One-line change. Low risk.

**Deferred because:** Cosmetic gap with no functional impact. Luna is still accessible in Cast, Chat, and all AI prompts. Deferred to keep v1.4.0 focused on bug fixes only.

---

### M-02 — Cast data duplicated across 6 files
**Files:** `north.js`, `api.js`, `cast.js`, `chat-form.js`, `rooms/slots.js`, `rooms/idioms.js`
**Found:** 2026-03-22

**Problem:** The cast Sora IDs and props appear in six different places, each with slightly different fields:
- `north.js` — `CAST` array (basic: id, name, soraId, icon, color, role)
- `api.js` — `CAST_PROPS_CONTEXT` (props only, inline string)
- `cast.js` — `CAST_DB` (richest: adds looks, vibe, voice, props, locations)
- `chat-form.js` — local `CAST` (basic, same as north.js)
- `rooms/slots.js` — `CAST_DATA` (names + icons only)
- `rooms/idioms.js` — `CAST_POOL` (names + icons only)

If a Sora ID changes, it must be updated in up to 6 places. Divergence has already started — `api.js` calls Shadowblaz "Skully" while `north.js` calls him "Shadowblaz."

**Fix:** Make `CAST_DB` in `cast.js` the canonical source. Export it. Replace the other 5 locations with imports from `cast.js`. `CAST_PROPS_CONTEXT` in `api.js` can be generated dynamically from `CAST_DB.props`.

**Deferred because:** Medium-effort refactor touching 6 files. Risk of breaking import chains if done carelessly. Requires careful testing of all rooms. Worth doing — just not during an audit patch.

---

### M-03 — `app.js` fontSize guard hard-resets instead of clamping
**File:** `public/app.js`, line 151
**Found:** 2026-03-22

**Problem:** `if (state.fontSize > 22) state.fontSize = 16;` silently resets fontSize to 16 if a saved value is above 22. CLAUDE.md mentions `fontSize: 28` as a default in the state spec. A user who saved a value of 28 from an older session would have their preference silently wiped to 16 on next load.

**Fix:**
```javascript
// Current (hard reset):
if (state.fontSize > 22) state.fontSize = 16;

// Better (clamp):
state.fontSize = Math.min(22, Math.max(12, state.fontSize));
```

**Deferred because:** Low user impact — fontSize of 28 has not been default since at least v1.3.0. The silent reset only triggers for values above 22. Acceptable for now.

---

### M-04 — `app.js` / `chat.js` use a mutation side-channel for `chatMode`
**Files:** `public/app.js` line 62, `public/rooms/chat.js` line 23
**Found:** 2026-03-22

**Problem:** `window.send()` sets `state.chatMode = 'chat'` before calling `window.goTo('chat')`. `chat.js` render() consumes and clears this: `if (state.chatMode) { chatMode = state.chatMode; state.chatMode = null; }`. This one-shot side-channel works but is invisible to anyone reading chat.js in isolation and fragile if a re-render occurs between set and consume.

**Fix:** Pass desired mode as a URL hash parameter or explicit named state field rather than a cleared mutation.

**Deferred because:** The pattern currently works correctly. Refactoring would require coordinated changes in app.js and chat.js. Risk outweighs benefit until another reason to touch those files arises.

---

## LOW Priority

### L-01 — Multiple independent `esc()` declarations across rooms
**Files:** `chat.js`, `digest.js`, `idioms.js`, `profile.js`, `share.js`
**Found:** 2026-03-22

**Problem:** Each of these files defines its own `esc()` HTML-escaping helper with slightly different implementations. No shared utility module exists.

**Fix:** Create `public/utils.js` exporting a single canonical `esc()`. Update all rooms to import from it.

```javascript
// Canonical implementation:
export const esc = (s) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
```

**Deferred because:** Divergence is minor — the most complete version (in `profile.js`) handles all four escapes. No security risk since data comes from user's own stored content. A `utils.js` extraction is the right long-term move but touches 5 files and is stylistic cleanup, not a bug fix.

---

### L-02 — `share.js` HTML escaping misses `&` and `"`
**File:** `public/rooms/share.js`, line 26
**Found:** 2026-03-22

**Problem:** `const cleanText = (d.clean || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')` escapes angle brackets but not `&` or `"`. The `&` omission means ampersands in prompt text render as broken HTML entities. The `"` omission is a minor XSS concern (though data is user's own previously-generated content from Firestore).

**Fix:** Use the full `esc()` pattern:
```javascript
const cleanText = esc(d.clean || '');
```
Where `esc` handles `&`, `<`, `>`, and `"`.

**Deferred because:** `share.js` is a read-only viewer for the user's own content. True XSS risk is low. Visible rendering artifact (broken `&amp;`) only occurs if prompts contain `&` — unusual but possible. Fix is trivial once `utils.js` (L-01) is created; do both together.

---

### L-03 — Golden hour countdown silently never displays
**Files:** `public/rooms/home.js` line 104, `public/api.js` `fetchWeather()`
**Found:** 2026-03-22

**Problem:** `goldenHour(wx)` checks `if (!wx?.sunrise && !wx?.sunset) return null`. The `fetchWeather()` function returns `{ temp, condition, wind, location }` — it never includes `sunrise` or `sunset`. So golden hour always returns `null` and the countdown never appears. The feature is silently disabled with no error.

**Fix:** Add `daily=sunrise,sunset` to the Open-Meteo `fetchWeather()` request and parse the returned values into the weather object:
```javascript
return {
  temp, condition, wind, location,
  sunrise: daily?.sunrise?.[0] || null,
  sunset:  daily?.sunset?.[0]  || null,
};
```
Requires changing the API URL from `current_weather=true` endpoint to include `&daily=sunrise,sunset&timezone=America%2FNew_York`.

**Deferred because:** The feature gracefully degrades to hidden. No crash, no visible error. Enabling it requires a modest change to the API call and CLAUDE.md state spec (`state.weather` object).

---

### L-04 — `digest.js` filter passes `undefined` and empty strings into MD export
**File:** `public/rooms/digest.js`, line 438
**Found:** 2026-03-22

**Problem:** `digestSaveMD` uses `.filter(l => l !== null)` to clean up the lines array before joining. The array is built with conditionals like `s.idea ? ... : ''` which produce empty strings `''`, not `null`. The filter only removes explicit `null`, so empty strings end up as blank lines in the exported markdown.

**Fix:** Change to `.filter(Boolean)` to remove all falsy values (null, undefined, '').

**Deferred because:** The exported markdown is still valid and usable. Extra blank lines are a cosmetic issue. One-character fix when touching `digest.js` for any other reason.

---

## Completed Items (for reference)

| ID | Description | Fixed In |
|----|-------------|----------|
| C-01 | cast.js CAST reference crash | v1.4.0 |
| C-02 | profile.js TDZ crash on _hydrated | v1.4.0 |
| H-01 | api.js Gemini model version mismatch | v1.4.0 |
| H-02 | setup.js window._state never assigned | v1.4.0 |
| H-03 | setup.js inline clipboard unsafe pattern | v1.4.0 |
| M-01 | Luna missing from crew strip on Home | v1.4.1 |
| M-03 | fontSize clamp instead of hard-reset | v1.4.1 |
| L-02 | share.js HTML escaping missing & and " | v1.4.1 |
| L-03 | Golden hour silently disabled (no sunrise/sunset in fetchWeather) | v1.4.1 |
| L-04 | digest.js MD export filter passes empty strings | v1.4.1 |
| L-01 | Shared utils.js with canonical esc() | v1.5.0 |
| M-02 | Cast data duplicated across 6 files → single source cast-data.js | v1.5.0 |
