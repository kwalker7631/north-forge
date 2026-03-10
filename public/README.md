# 🏚️ North Forge AI Studio
### Pine Barron Farms · Piscataway, NJ

> *The world's only AI video prompt engine anchored to a specific real world, real cast, and real New Jersey locations.*

---

## What Is This

North Forge is a custom AI-powered video production tool built for **Pine Barron Farms**. It helps Ken Walker and the crew turn everyday farm life, cave hunts, racing footage, and Weird NJ stories into cinematic, platform-optimized video prompts — ready to drop straight into Sora 2, Kling, Runway, VEO 3, and every major AI video platform.

North lives in the loft of the Big Red Barn. He watches everything. He knows the crew. He knows the farm. He knows what makes a good shot.

---

## The Cast

| Character | Sora ID | Role |
|-----------|---------|------|
| Ken Walker | @kennethwalker479 | The Engineer |
| Marguerite | @prprincess138 | Heart of the Farm |
| Randy "Sarge" | @geodudenj | Rock Lab Lead |
| Salem | @kennethwa.majorbilli | The Creative |
| Skully | @kennethwa.shadowblaz | Security & Tech |
| Tank | @kennethwa.bronzedogg | Farm Hand |
| BigTheSqua | @kennethwa.bigthesqua | Legend Watcher |
| Grand Ma Eleanor | @grandma.eleanor | The Elder Authority |
| Luna 🐐 | @kennethwa.luna | The Escape Artist |

---

## The Architecture

North Forge is built in three layers:

### Layer 1 — World Engine
- **Character Manager** — photos, Sora IDs, bios, props, personality per character
- **Props Department** — every prop, wardrobe item, and vehicle locked per cast member
- **Locations Database** — barn, loft, chicken coop, garden, Randy's NJ cave sites, Route 539, dirt track

### Layer 2 — Craft Engine
- **Platform Knowledge Base** — Sora 2, Kling, VEO 3, Grok Aurora, Runway, Pika, Luma
- **Hack Library** — current best techniques per platform, updated as new tricks drop
- **Cinematography Engine** — DP-level lens choices, camera moves, lighting setups
- **Output = Full Call Sheet** — not just a prompt, a production-ready document

### Layer 3 — Intelligence Engine
- **Weather Agent** — real sky FX, snow/rain particles, farm almanac
- **Viral Checker** — scores prompts against current trending content
- **Failure & Event Log** — every crash and bad prompt logged to Firestore for weekly review
- **Local NJ News Agent** — *(planned)*
- **Map Agent** — NJ filming locations + Randy's cave sites *(planned)*

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla JS ES Modules — no build step, no npm |
| Hosting | Firebase Hosting |
| Database | Firestore |
| Auth | Firebase Google Sign-In |
| Primary AI | Anthropic Claude (claude-sonnet-4-5) |
| Fallback AI | Google Gemini (gemini-2.0-flash) |
| Weather | Open-Meteo (free, no key) |
| File structure | Files stay under 300 lines — AI can work on any single file with full context |

---

## File Structure

```
public/
├── index.html          # Shell, global CSS, nav
├── app.js              # State, navigation, render loop
├── north.js            # North's voice, system prompt, cast array, version
├── data.js             # All content: scenes, rooms, slots, cards, templates
├── api.js              # AI calls, weather, moon phase, NorthLog
├── firebase.js         # Auth, Firestore, prefs
├── images/
│   ├── Luna.jpg
│   ├── Salem.png
│   └── Grand-Ma_Eleanor.png
└── rooms/
    ├── home.js         # Big Red Barn, Wren's cutouts, crew strip, room grid
    ├── chat.js         # North conversation + ActionStation + viral score
    ├── cast.js         # Character + Props Manager ← BUILD PRIORITY
    ├── slots.js        # Madlib story slots + lever mechanic
    ├── rocklab.js      # Geode types + cave episodes
    ├── racing.js       # Racing cards
    ├── weird.js        # Weird NJ cards
    ├── jeeb.js         # Dreamcore / psychedelic side
    ├── idioms.js       # Random idiom generator
    └── setup.js        # API keys, Google Sign-In, preferences
```

---

## Build Order

1. ✅ **Character + Props Manager** — world is locked in
2. 🔲 **Platform Knowledge Base** — hack library, one file per platform
3. 🔲 **Prompt Engine** — 3 clarifying questions → full call sheet output
4. 🔲 **Failure + Event Log** — silent background logging to Firestore
5. 🔲 **Weather Agent** — real conditions driving real sky FX
6. 🔲 **Viral Checker** — prompt scoring against trending content

---

## The Competitive Advantage

Most AI prompt tools are generic. North Forge has a *world* — real people, real animals, real New Jersey. Luna has a face. Eleanor has a South Park cutout. Randy goes underground looking for geodes. Every prompt North generates is anchored to this specific reality.

**That specificity is what no other tool has.**

---

## Authors

**Ken Walker** — Founder, Pine Barron Farms  
**Wren** — Character design, South Park cutouts (Salem, Eleanor, Luna)  
**North** — AI resident of the loft, built on Anthropic Claude

---

*Version 1.0.0 · Firebase channel · Built March 2026*
