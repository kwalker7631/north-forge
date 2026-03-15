# North Forge AI Studio

**AI-powered video production tool built exclusively for Pine Barron Farms.**

North Forge turns everyday farm life, cave hunts, racing footage, and Weird NJ stories into cinematic, platform-optimized video prompts — ready to drop into Sora 2, Kling AI, VEO 3, and Grok Aurora.

Live: [north-forge-ai.firebaseapp.com](https://north-forge-ai.firebaseapp.com)

---

## What It Does

North Forge is not a generic AI tool. It is anchored to **Pine Barron Farms** — real people, real places, real props. The AI character **North** lives in the loft of the Big Red Barn. He knows the crew, knows the land, and knows exactly how to generate prompts that lock Sora character IDs to specific cast members and frame shots for each platform's strengths.

Every prompt output is a full call sheet: cast, location, camera direction, platform target, duration, and mood — not a vague description.

---

## The Cast

| Character | Role | Sora ID |
|-----------|------|---------|
| Ken Walker | The Engineer | `@kennethwalker479` |
| Marguerite | Heart of the Farm | `@prprincess138` |
| Randy "Sarge" | Rock Lab Lead | `@geodudenj` |
| Salem | The Creative | `@kennethwa.majorbilli` |
| Skully | Security & Tech | `@kennethwa.shadowblaz` |
| Tank | Farm Hand | `@kennethwa.bronzedogg` |
| BigTheSqua | Legend Watcher | `@kennethwa.bigthesqua` |
| Grand Ma Eleanor | The Elder Authority | `@grandma.eleanor` |
| Luna | The Escape Artist | `@kennethwa.luna` |

Character artwork by **Wren Walker** — South Park-style photo cutouts.

---

## Filming Locations

- Big Red Barn · Barn Loft · Chicken Coop · Farm Garden
- Assunpink Creek · Randy's Cave #1 · Pine Barrens Shaft
- Route 539 · NJ Dirt Track · Back Field · Pine Barrens Forest

---

## AI Platforms Supported

| Platform | Strength | Format |
|----------|----------|--------|
| Sora 2 | Cinematic realism, character consistency | 9:16, up to 20s |
| Kling AI | Physics, fluid motion, material texture | 9:16, 5s or 10s |
| VEO 3 | Native audio generation, dialogue | 9:16, up to 8s |
| Grok Aurora | Stylized, surreal, Weird NJ content | 9:16, various |

---

## Tech Stack

- **Vanilla JS ES Modules** — no React, no Vue, no build step, no npm packages
- **Firebase Hosting** — project: `north-forge-ai`
- **Firestore** — user prefs, event logs
- **Firebase Auth** — Google Sign-In only
- **Primary AI** — Anthropic Claude (`claude-sonnet-4-5`)
- **Fallback AI** — Google Gemini (`gemini-2.0-flash`)
- **Weather** — Open-Meteo (free, no API key required)

---

## File Structure

```
northforge/
├── CLAUDE.md               ← AI assistant instructions
├── README.md               ← this file
├── firebase.json
├── .firebaserc
├── .gitignore
└── public/
    ├── index.html          ← shell, global CSS, bottom nav (10 tabs)
    ├── app.js              ← state, navigation, render loop, send(), forgeScene()
    ├── north.js            ← North's voice, system prompt, cast array, version
    ├── data.js             ← rooms, scenes, all static content
    ├── api.js              ← callNorth(), callAnthropic(), callGemini(), fetchWeather(), NorthLog
    ├── firebase.js         ← auth, Firestore prefs, chat history, prompts, events, profile
    ├── platforms.js        ← platform data, cinematography knowledge, hacks
    ├── logs/
    │   └── logger.js       ← NorthLog, logDiag, installDiagListeners (single logging source)
    └── rooms/
        ├── home.js         ← Big Red Barn SVG, Wren's cutouts, crew strip
        ├── chat.js         ← Prompt Engine (form mode) + Free Chat mode
        ├── cast.js         ← Character + Props Manager, Locations DB
        ├── platforms.js    ← Platform Lab (browse platform data) + Sora Scout
        ├── setup.js        ← API keys, Google Sign-In, system status
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

## Three Layers of North Forge

### Layer 1 — World Engine
Character + Props Manager, Locations Database, full cast with locked Sora IDs.

### Layer 2 — Craft Engine
Platform knowledge base, hack library, cinematography guide, Platform Lab room, and the Prompt Engine — a structured form that outputs a complete call sheet.

### Layer 3 — Intelligence Engine ✅ Complete
- Failure + Event Log (Firestore logging, real-time event stream)
- Weather Agent (real sky FX, farm almanac, golden hour detection)
- Viral Video Checker (scores prompts vs. trending formats)
- Chat History Persistence (Firestore, survives refresh)
- North Digest (weekly content calendar — all forged call sheets)
- User Character Profile (Sora appearance + IDs auto-injected into every prompt)
- Sora Scout (North surfaces live Sora 2 tips, tricks, and techniques on demand)

---

## Running Locally

Requires [Firebase CLI](https://firebase.google.com/docs/cli).

```bash
firebase serve
```

Then open `http://localhost:5000`.

No build step. No npm install. Just serve and go.

---

## Deploying

```bash
firebase deploy
```

That's it. Deploys to `https://north-forge-ai.firebaseapp.com`.

---

## API Keys

Add your keys in the **Setup** tab inside the app. They are stored in Firestore under your Google account — never committed to git.

- **Anthropic** — powers North (primary AI)
- **Gemini** — fallback when Anthropic is unavailable

---

## Development Rules

- Files stay under 300 lines — split when they grow past that
- No build step, no npm packages, no frameworks
- All rooms export `render(state)` and optionally `mount(state)`
- Window functions (`window.myFunction`) handle all onclick events
- Dark theme only — `#020617` background, `#38bdf8` accent, Georgia serif

---

## About

**Ken Walker** — Founder, Pine Barron Farms, Piscataway NJ. Sole developer and creative director.

**Wren Walker** — Character artwork (South Park-style cutouts).

**North** — the AI who lives in the loft and knows the whole story.

---

*North Forge v1.0.0 · March 2026*