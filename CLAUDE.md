# CLAUDE.md — North Forge AI Studio
# Claude Code reads this first. Everything you need to know is here.

---

## WHO YOU ARE WORKING WITH

**Ken Walker** — Founder of Pine Barron Farms, Piscataway NJ.
Sole developer and creative director of North Forge AI Studio.
Ken's daughter **Wren** creates the character artwork (South Park-style cutouts).

---

## WHAT THIS APP IS

North Forge is a custom AI-powered video production tool built exclusively for
Pine Barron Farms. It helps Ken and his crew turn everyday farm life, cave hunts,
racing footage, and Weird NJ stories into cinematic, platform-optimized video
prompts — ready to drop into Sora 2, Kling, VEO 3, and Grok Aurora.

**North** is the AI character who lives in the loft of the Big Red Barn.
He knows the world (Pine Barron Farms), the craft (cinematography + AI platform
techniques), and the people (real cast with locked Sora IDs).
That specificity is the competitive advantage no other tool has.

---

## TECH STACK — NEVER VIOLATE THESE RULES

- **Vanilla JS ES Modules** — NO React, NO Vue, NO build step, NO npm packages
- **Firebase Hosting** — project: `north-forge-ai`
- **Firestore** — user prefs, event logs
- **Firebase Auth** — Google Sign-In only
- **Primary AI** — Anthropic Claude (`claude-sonnet-4-6`)
- **Fallback AI** — Google Gemini (`gemini-2.0-flash`)
- **Weather** — Open-Meteo (free, no key needed)
- **Files stay under 300 lines** — if a file grows past 300 lines, split it
- **No build step** — `firebase serve` and `firebase deploy` only
- **Local path** — `C:\Users\kwalk\OneDrive\Desktop\northforge\`
- **GitHub repo** — `https://github.com/kwalker7631/north-forge`

---

## FILE STRUCTURE

```
northforge/
├── CLAUDE.md               ← you are here
├── README.md
├── firebase.json
├── .firebaserc
├── .gitignore
└── public/
    ├── index.html          ← shell, global CSS, bottom nav (10 tabs)
    ├── app.js              ← state, navigation, render loop, send(), forgeScene()
    ├── north.js            ← North's voice, NORTH_SYSTEM prompt, CAST array, NORTH_VERSION
    ├── data.js             ← ROOMS array, SCENES array, all static content
    ├── api.js              ← callNorth(), callAnthropic(), callGemini(), fetchWeather(), getMoonPhase(), NorthLog
    ├── firebase.js         ← onAuth(), signIn(), signOut_(), savePrefs(), loadPrefs(), saveProfile(), loadProfile(), saveChatHistory(), loadChatHistory()
    ├── platforms.js        ← PLATFORMS array, CINEMATOGRAPHY object, getPlatformContext()
    ├── render-guard.mjs    ← createRenderGuard() — prevents stale async renders
    ├── logs/
    │   └── logger.js       ← NorthLog, logDiag, installDiagListeners (single logging source)
    └── rooms/
        ├── home.js         ← Barn photos, Wren's cutouts, weather sky, crew strip, room grid
        ├── chat.js         ← Prompt Engine (form mode) + Free Chat mode
        ├── cast.js         ← Character + Props Manager, Locations DB
        ├── platforms.js    ← Platform Lab room + Sora Scout card
        ├── setup.js        ← API keys, Google Sign-In, system status, event log
        ├── slots.js        ← Madlib story slots
        ├── rocklab.js      ← Geode types, cave episodes
        ├── racing.js       ← Racing cards
        ├── weird.js        ← Weird NJ cards
        ├── jeeb.js         ← Dreamcore / psychedelic content
        ├── idioms.js       ← Randy's Idioms + location picker + Forge This Scene
        ├── digest.js       ← North Digest: weekly content calendar of forged call sheets
        └── profile.js      ← User Character Profile: Sora appearance + IDs
```

---

## ROOM PATTERN — ALL ROOMS FOLLOW THIS

```javascript
// Every room exports render and optionally mount
export const render = (state) => `<div class="room-wrap">...HTML...</div>`;
export const mount  = (state) => { /* DOM ready, set up listeners */ };

// Window functions for onclick handlers
window.myFunction = () => { ... window.goTo('roomname'); };
```

**State object** (from app.js):
```javascript
state = {
  tab:       'home',        // current room id
  user:      null,          // Firebase user object or null
  keys:      { anthropic:'', gemini:'' },
  msgs:      [],            // chat message array [{role, content}]
  loading:   false,
  weather:   null,          // { temp, condition, wind, location, sunrise, sunset }
  moon:      {},            // { name, icon }
  sceneIdx:  0,
  toast:     null,
  northPeek: null,
  fontSize:  28,
  profile:   null,          // user character profile { age, build, hair, eyes, style, soraIds[], preferredDuration, profileComplete }
}
```

**Global functions available in all rooms:**
- `window.goTo(tabId)` — navigate to a room
- `window.send(text)` — send message to North (AI)
- `window.forgeScene(prompt)` — send a forge prompt to North
- `window.showToast(msg)` — show a toast notification
- `window.saveKey(type, val)` — save API key ('anthropic' or 'gemini')
- `window.handleSignIn()` — trigger Google sign-in
- `window.handleSignOut()` — sign out
- `window._northClearMsgs()` — clear chat messages keeping first welcome msg
- `window.getFilmingCondition(wx)` — returns `{ label, icon, color }` for weather
- `window.callNorthDirect(messages)` — raw AI call, returns text or null
- `window.saveUserProfile(data)` — save user character profile to state + Firestore
- `window.loadNorthPrompts(count)` — load forged call sheets from Firestore
- `window.loadNorthEvents(count)` — load event log from Firestore
- `window.logDiag(type, data)` — write diagnostic entry to localStorage

---

## THE CAST — NEVER CHANGE SORA IDs

| Character | Sora ID | Role | Icon | Color |
|-----------|---------|------|------|-------|
| Ken Walker | @kennethwalker479 | The Engineer | 👨‍🌾 | #22c55e |
| Marguerite | @prprincess138 | Heart of the Farm | 👩🏽‍🌾 | #ef4444 |
| Randy "Sarge" | @geodudenj | Rock Lab Lead | 🪖 | #3b82f6 |
| Salem | @kennethwa.majorbilli | The Creative | ✨ | #c084fc |
| Skully | @kennethwa.shadowblaz | Security & Tech | 🌑 | #94a3b8 |
| Tank | @kennethwa.bronzedogg | Farm Hand | 🐕 | #d97706 |
| BigTheSqua | @kennethwa.bigthesqua | Legend Watcher | 🦍 | #4ade80 |
| Grand Ma Eleanor | @grandma.eleanor | The Elder Authority | 👵 | #fb7185 |
| Luna | @kennethwa.luna | The Escape Artist | 🐐 | #fbbf24 |

**Wren's photo cutouts** (South Park style, live in `public/images/characters/`):
- `Salem.png`
- `Grand-Ma Eleanor.png`
- `Luna.png`

**Other image assets** (live in `public/images/`):
- `barn/` — barn-clear, barn-cloudy, barn-golden, barn-night, barn-rain, barn-snow (weather-matched)
- `moon/` — all 8 moon phase photos (matched to `state.moon.name`)
- `cameos/` — bigfoot, bigfoot-run, jersey-devil, ufo, ufo-hover (random home tab appearances)
- `overlays/` — seasonal overlays (halloween, christmas, thanksgiving, july4, spring, winter, newyear)

---

## FILMING LOCATIONS

- Big Red Barn, Barn Loft, Chicken Coop, Farm Garden
- Assunpink Creek, Randy's Cave #1, Pine Barrens Shaft
- Route 539, NJ Dirt Track, Back Field, Pine Barrens Forest

---

## AI PLATFORMS NORTH KNOWS

All data lives in `public/platforms.js`:

| Platform | Strength | Format |
|----------|----------|--------|
| Sora 2 | Cinematic realism, character consistency | 9:16, up to 20s |
| Kling AI | Physics, fluid motion, material texture | 9:16, 5s or 10s |
| VEO 3 | Native audio generation, dialogue | 9:16, up to 8s |
| Grok Aurora | Stylized, surreal, Weird NJ content | 9:16, various |

---

## THREE LAYERS OF NORTH FORGE

### Layer 1 — World Engine ✅ BUILT
- Character + Props Manager (`rooms/cast.js`)
- Locations Database (inside cast.js)
- Props Master view (inside cast.js)

### Layer 2 — Craft Engine ✅ BUILT
- Platform knowledge base (`platforms.js`)
- Hack library (inside platforms.js)
- Cinematography knowledge (inside platforms.js)
- Platform Lab room (`rooms/platforms.js`)
- Prompt Engine (`rooms/chat.js`) — form mode → full call sheet output

### Layer 3 — Intelligence Engine ✅ BUILT
- Failure + Event Log (Firestore logging, event log in Setup room)
- Weather Agent (real sky FX, farm almanac, filming condition, golden hour countdown)
- Viral Video Checker (score badge on every call sheet)
- Chat History Persistence (Firestore, survives refresh — last 50 msgs)
- North Digest (`rooms/digest.js`) — weekly content calendar of all forged call sheets
- User Character Profile (`rooms/profile.js`) — age/build/hair/eyes/style + up to 3 Sora IDs + preferred duration; auto-injected into every North prompt
- Sora Scout (card in Platforms room) — North surfaces live Sora 2 tips on demand
- Render Guard (`render-guard.mjs`) — prevents stale async renders on fast navigation
- Unified Logging (`logs/logger.js`) — NorthLog + localStorage diagnostics
- HOLD: Map Agent, web analytics, local news feeds

---

## BUILD ORDER (current priority)

1. ✅ Character + Props Manager
2. ✅ Platform Knowledge Base
3. ✅ Prompt Engine
4. ✅ Setup room
5. ✅ Failure + Event Log
6. ✅ Weather Agent
7. ✅ Viral Checker
8. ✅ home.js polish (barn photos, Wren's cutouts, weather sky, cameos, seasonal overlays)
9. ✅ Room content (slots, rocklab, racing, weird, jeeb, idioms — all fully built)
10. ✅ Call Sheet History — saved to Firestore, viewable in Digest + Setup
11. ✅ Idioms upgrade — Randy reactions with location picker + Forge This Scene
12. ✅ North Digest — weekly content calendar of all forged call sheets
13. ✅ User Character Profile — Sora appearance + IDs auto-injected into prompts
14. ✅ Sora Scout — North surfaces Sora 2 tips on demand (Platforms room)
15. ✅ Chat history persistence — survives refresh via Firestore
16. ✅ Render Guard — prevents stale renders on fast tab switching
17. ✅ Unified logging — logs/logger.js replaces scattered console calls

**All layers complete. HOLD items:**
- HOLD: Map Agent, web analytics, local news feeds

---

## OUTPUT & EXPORT — added 2026-03-15

Every call sheet output now has three actions:
- `📋 Copy Prompt` — copies only the CLEAN PROMPT section to clipboard
- `📄 Copy Full Sheet` — copies the entire North response to clipboard
- `💾 Save MD` — downloads a structured `.md` file with proper headers (HOOK, SCENE, CAMERA, AUDIO, DIRECTOR'S NOTE, Clean Prompt)

These buttons appear on every assistant message in the Chat room that contains a call sheet.

**Digest** — each row has `⬇ Read` (inline expand), `📋 Copy`, and `💾 MD`.
**Idioms** — Randy's reaction card has `📋 Copy Reaction`.
**Prompt Engine** — `↺ New` button resets all form fields for a fresh scene.

### `copyFull()` fix
Previously used a fragile DOM index scan. Now uses `id="msg-text-{idx}"` directly — always grabs the correct message bubble.

### `seasonalOverlay()` fix
Was hardcoded to return `null` — overlays never loaded. Fixed to return correct overlay image by month/date:
- Oct → halloween, Nov → thanksgiving, Dec → christmas, Jan 1 → newyear
- Jul 1–7 → july4, Mar–May → spring, Jan–Feb → winter

---

## KNOWN BUGS / ACTIVE ISSUES

No active bugs. If something breaks, check:
- Hard refresh (`Ctrl+Shift+R`) for JS module cache issues — firebase.json now sets `no-cache` on all JS files to prevent this
- DevTools Network tab for 404s on image paths
- Setup room event log for API error reason codes
- NorthLog entries via browser console: `[North ✓]` info, `[North ⚠]` warn, `[North ✗]` error

---

## STYLING CONVENTIONS

```css
/* Dark theme — always */
background: #020617;        /* page background */
rgba(2,6,23,0.95)           /* card backgrounds */
rgba(15,23,42,0.92)         /* secondary cards */
#1e293b                     /* borders */
#38bdf8                     /* North blue — primary accent */
#fff                        /* headings */
#cbd5e1                     /* body text */
#64748b                     /* muted text */
font-family: Georgia,'Times New Roman',serif;  /* ALL text */
```

**Standard room wrapper:**
```html
<div class="room-wrap">   <!-- padding:24px 28px 36px -->
  <div class="panel-desc">  <!-- left border blue, description text -->
```

---

## FIREBASE CONFIG

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyBFdGNW8sEKxOvEpaWbq0r4FB4aBQ7Xz-I",
  authDomain:        "north-forge-ai.firebaseapp.com",
  projectId:         "north-forge-ai",
  storageBucket:     "north-forge-ai.firebasestorage.app",
  messagingSenderId: "943672322270",
  appId:             "1:943672322270:web:0d946347d7e9df192cba4f",
  measurementId:     "G-ZGFKZ4QV21"
};
```

---

## NORTH'S VOICE & PERSONALITY

North is calm, direct, cinematic. He speaks like a director who has seen
everything on the farm. He gives short, useful observations. He doesn't
waste words. He loves this crew and this land. When he generates prompts
they are specific, locked to real people, real places, real props.

North never says "I cannot" — he finds a way.
North never generates generic content — everything is anchored to Pine Barron Farms.

---

## GIT WORKFLOW

```bash
git add .
git commit -m "describe what changed"
git push
```

After confirming it works locally:
```bash
firebase deploy
```

Live URL: `https://north-forge-ai.firebaseapp.com`

---

*Last updated: 2026-03-15 · North Forge v1.0.1 · All 17 build orders complete · All 3 layers shipped · Output/Export system complete*
