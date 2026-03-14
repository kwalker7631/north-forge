# NORTH FORGE — FIXES FOR CLAUDE CODE
# Read this alongside CLAUDE.md. These are all known bugs and pending work.

---

## BUG 1 — CSS CLASS MISMATCHES (index.html vs app.js)

Four places where app.js uses class names that don't match what index.html defines.
These cause silent visual failures — things just don't appear or don't animate.

### 1a — Status dot classes
**app.js uses:** `status-dot on` / `status-dot off`
**index.html defines:** `status-dot.online` / `status-dot.offline`
**Fix:** In `index.html` change:
```css
/* FROM */
.status-dot.online  { background:#22c55e; box-shadow:0 0 10px #22c55e; }
.status-dot.offline { background:#ef4444; box-shadow:0 0 10px #ef4444; }
/* TO */
.status-dot.on  { background:#22c55e; box-shadow:0 0 10px #22c55e; }
.status-dot.off { background:#334155; }
```

### 1b — Topbar pill class
**app.js uses:** `class="pill"`
**index.html defines:** `.wx-pill`, `.moon-pill`, `.version-pill` (not `.pill`)
**Fix:** In `index.html` add:
```css
.pill { font-size:0.62em; color:#cbd5e1; font-weight:700;
        background:rgba(15,23,42,0.9); border:1px solid #334155;
        border-radius:20px; padding:4px 12px; }
```

### 1c — North Peek class names
**app.js uses:** `peek-lbl`, `peek-acts`, `peek-ava`
**index.html defines:** `peek-label`, `peek-actions`, `peek-avatar`
**Fix:** In `app.js` peekHTML() function change:
```javascript
// FROM
<div class="peek-lbl">North says</div>
<div class="peek-acts">
<div class="peek-ava">🧠</div>
// TO
<div class="peek-label">North says</div>
<div class="peek-actions">
<div class="peek-avatar">🧠</div>
```

### 1d — Naughty animal class names
**app.js uses:** `nan an-peek` / `nan an-right` / `nan an-run` / `nan an-ufo`
**index.html defines:** `naughty-animal anim-peek` / `anim-peekRight` / `anim-sprintFast` / `anim-ufoHover`
**Fix:** In `app.js` naughty animals interval, change:
```javascript
// FROM
const css = e === '🛸' ? 'an-ufo' : ['an-peek','an-right','an-run'][Math.floor(Math.random()*3)];
el.className = `nan ${css}`;
// TO
const css = e === '🛸' ? 'anim-ufoHover' : ['anim-peek','anim-peekRight','anim-sprintFast'][Math.floor(Math.random()*3)];
el.className = `naughty-animal ${css}`;
```

---

## BUG 2 — chat.js TEXTAREA LOSES INPUT ON BUTTON CLICK

**Problem:** When user types their idea and then clicks a character/tone/platform
button, `peSet()` calls `window.goTo()` which re-renders the room and wipes
the textarea value.

**File:** `public/rooms/chat.js`

**Fix:** `peSet()` must save the textarea value BEFORE re-rendering:
```javascript
window.peSet = (f, v) => {
  const el = document.getElementById('pe-idea');
  if (el) formData.idea = el.value;  // save before re-render
  formData[f] = v;
  window.goTo('chat');
};
```
Also `peForge()` must read the textarea value before using it:
```javascript
window.peForge = async () => {
  const ideaEl = document.getElementById('pe-idea');
  if (ideaEl) formData.idea = ideaEl.value;  // capture latest value
  // ... rest of function
};
```

---

## BUG 3 — chat.js clearChat HAS DEAD appState REFERENCE

**Problem:** `clearChat()` tries `window.appState` which doesn't exist.
The hook `window._northClearMsgs` is the correct way to reach app.js state.

**File:** `public/rooms/chat.js`

**Fix:** Remove the dead reference:
```javascript
// FROM
window.clearChat = () => {
  if (window.appState) {
    window.appState.msgs = [window.appState.msgs[0]];
  }
  window._northClearMsgs?.();
  window.goTo('chat');
};

// TO
window.clearChat = () => {
  window._northClearMsgs?.();
  window.goTo('chat');
};
```

**Also ensure `app.js` has this hook** (add before the BOOT section):
```javascript
window._northClearMsgs = () => {
  state.msgs = [state.msgs[0]];
};
```

---

## BUG 4 — chat.js FORGE SWITCHES TO CHAT TOO LATE

**Problem:** `peForge()` switches `chatMode = 'chat'` AFTER `await window.send()`.
This means the user stays on the form screen during the entire API call and
never sees North's loading indicator or the response arriving.

**File:** `public/rooms/chat.js`

**Fix:** Switch to chat mode BEFORE the send call:
```javascript
// FROM
formStep = 'generating';
window.goTo('chat');
await window.send(prompt);
formStep = 'idle';
chatMode = 'chat';
window.goTo('chat');

// TO
formStep = 'generating';
chatMode = 'chat';      // switch FIRST
window.goTo('chat');
await window.send(prompt);
formStep = 'idle';
window.goTo('chat');
```

---

## BUG 5 — chat.js copyFull READS FROM WRONG INDEX

**Problem:** `copyFull(idx)` uses message index from the full `state.msgs` array
but the DOM only renders assistant messages. Index mismatch means wrong content
gets copied or nothing at all.

**File:** `public/rooms/chat.js`

**Fix:** Read directly from DOM using assistant message index:
```javascript
window.copyFull = (idx) => {
  const rows = document.querySelectorAll('.msg-row:not(.user) .msg-text');
  const el = rows[idx];
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Full call sheet copied!'))
    .catch(() => window.showToast('Copy failed — try manually'));
};
```

---

## PENDING BUILDS (in priority order)

### 1. Failure + Event Log (BUILD NEXT)
**What it is:** Silent background system. Every API error, bad prompt, and crash
gets logged to Firestore. Reviewed weekly to improve North.

**File to create:** `public/rooms/eventlog.js`
**Firestore collection:** `north_events`

**Each log entry:**
```javascript
{
  ts:        Date.now(),
  type:      'error' | 'warning' | 'prompt' | 'crash',
  room:      'chat' | 'platforms' | 'cast' | etc,
  message:   'human readable description',
  detail:    'full error message or prompt text',
  platform:  'sora2' | 'kling' | etc (if applicable),
  character: 'ken' | 'randy' | etc (if applicable),
  uid:       user.uid (if signed in),
}
```

**NorthLog in api.js already captures errors** — pipe those to Firestore.
Add a `logEvent(entry)` function to `api.js` that writes to Firestore.

**The room:** Show a table of recent events with filter by type.
Weekly review view — group by day, show error rate, most failed prompts.
Add a "Clear Log" button.

**Nav tab:** Add to `index.html` bottom nav:
```html
<button class="nav-tab" data-tab="eventlog" onclick="goTo('eventlog')">
  <span class="tab-icon">📋</span>
  <span class="tab-label">Log</span>
</button>
```

---

### 2. home.js — Wren's Cutouts + Weather Animation

**Current state:** home.js has the barn SVG and room grid but is missing
Wren's character cutouts in front of the barn and weather particle effects.

**File:** `public/rooms/home.js`

**Add these elements to the barn hero section:**

```html
<!-- CHARACTER CUTOUTS — in front of barn -->
<div class="cutout-stage">
  <img src="./images/Luna.jpg"
       class="cutout cutout-luna" alt="Luna"/>
  <img src="./images/Salem.png"
       class="cutout cutout-salem" alt="Salem"/>
  <img src="./images/Grand-Ma_Eleanor.png"
       class="cutout cutout-eleanor" alt="Grand Ma Eleanor"/>
</div>
```

**CSS for cutouts:**
```css
.cutout-stage  { position:relative; height:120px; margin:-20px 0 10px; }
.cutout        { position:absolute; bottom:0; height:110px;
                 object-fit:contain; filter:drop-shadow(2px 4px 8px rgba(0,0,0,0.5)); }
.cutout-luna   { left:5%;  height:80px; }
.cutout-salem  { left:30%; height:110px; }
.cutout-eleanor{ right:8%; height:95px; }
```

**Weather particles** — add to render() based on `state.weather.condition`:
```javascript
const getWeatherFX = (wx) => {
  if (!wx) return '';
  if (wx.condition.includes('Snow'))  return snowParticles();
  if (wx.condition.includes('Rain'))  return rainParticles();
  return '';
};
```

---

### 3. Remaining Room Stubs

All of these are currently "North is building this room" placeholders.
Build them in this order after Event Log and home.js:

**a) `rooms/slots.js`** — Madlib story generator
- 5 slot columns: Who + Action + Location + Object + Twist
- Each column has 8–10 Pine Barron-specific options
- "Pull" button randomizes all columns
- "Lock" button per column to keep a value
- Result builds a story premise North can forge into a prompt

**b) `rooms/rocklab.js`** — Randy's geode and cave room
- Geode type cards (quartz, calcite, amethyst, agate — NJ-specific)
- Cave episode log (Randy's documented cave sites with notes)
- "Forge Cave Scene" button per episode

**c) `rooms/racing.js`** — Racing content
- Randy's racing footage cards
- Track cards (NJ Dirt Track, Route 539)
- "Forge Race Scene" button

**d) `rooms/weird.js`** — Weird NJ content
- Jersey Devil lore card
- Ghost road cards
- Pine Barrens mystery cards
- Each card has a "Forge Grok Aurora Scene" button (Grok is best for weird content)

**e) `rooms/jeeb.js`** — Dreamcore / psychedelic
- Abstract visual prompts
- Farm life seen through a surreal lens
- Best paired with Grok Aurora

**f) `rooms/idioms.js`** — Randy's idiom generator
- Random idiom from a large list
- Randy delivers it in character (military cadence)
- "Forge Randy Saying This" button

---

## NORTH_SYSTEM PROMPT ENHANCEMENT

**File:** `public/north.js`

The current NORTH_SYSTEM prompt works but could be stronger. When Claude Code
reads north.js, suggest enhancing the system prompt to include:

1. Explicit instruction to always use Sora IDs when characters are mentioned
2. Instruction to output call sheets in the exact template format from platforms.js
3. Knowledge of all filming locations by name
4. Instruction to ask about platform if not specified before generating

---

## FIREBASE SECURITY RULES

Firestore rules should be set so:
- Users can only read/write their own prefs document
- Event log can be written by any authenticated user
- Event log can only be read by Ken's UID

Ken's UID will be available after first sign-in via `user.uid`.
Add to Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prefs/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /north_events/{docId} {
      allow write: if request.auth != null;
      allow read:  if request.auth.uid == 'KEN_UID_HERE';
    }
  }
}
```

---

## PERFORMANCE NOTES

- `render()` in app.js is async and re-imports the room module every call
  — this is fine for development but consider caching module imports for production
- `platforms.js` is imported by both `rooms/platforms.js` AND `rooms/chat.js`
  — ES modules cache automatically, no duplicate loading
- Images (Luna.jpg, Salem.png, Grand-Ma_Eleanor.png) should be kept under 200KB each
  for fast mobile load

---

*Generated March 2026 · North Forge v1.0.0*
