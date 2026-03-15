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
- **Primary AI** — Anthropic Claude (`claude-sonnet-4-5`)
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
    ├── firebase.js         ← onAuth(), signIn(), signOut_(), savePrefs(), loadPrefs()
    ├── platforms.js        ← PLATFORMS array, CINEMATOGRAPHY object, getPlatformContext()
    └── rooms/
        ├── home.js         ← Barn photos, Wren's cutouts, weather sky, crew strip, room grid
        ├── chat.js         ← Prompt Engine (form mode) + Free Chat mode
        ├── cast.js         ← Character + Props Manager, Locations DB
        ├── platforms.js    ← Platform Lab room (browses platforms.js data)
        ├── setup.js        ← API keys, Google Sign-In, system status
        ├── slots.js        ← Madlib story slots
        ├── rocklab.js      ← Geode types, cave episodes
        ├── racing.js       ← Racing cards
        ├── weird.js        ← Weird NJ cards
        ├── jeeb.js         ← Dreamcore / psychedelic content
        └── idioms.js       ← Random idiom generator
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

**All Layer 1–3 items complete. Next priorities:**
- 🔲 Call Sheet History — save forged sheets to Firestore, viewable in Setup
- 🔲 Idioms upgrade — Randy reactions with full Sora ID context + "Forge This Scene" button
- 🔲 North Digest — weekly summary of what was forged (content calendar view)
- HOLD: Map Agent, web analytics, local news feeds

---

## KNOWN BUGS / ACTIVE ISSUES

No active bugs. If something breaks, check:
- Hard refresh (`Ctrl+Shift+R`) for JS module cache issues
- DevTools Network tab for 404s on image paths
- Setup room event log for API error reason codes

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

*Last updated: March 2026 · North Forge v1.0.0 · All 9 build orders complete*
