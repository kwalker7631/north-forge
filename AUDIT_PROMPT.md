# NORTH FORGE — FULL APP AUDIT & OPTIMIZATION
# Paste this entire prompt into Claude Code

---

You are doing a complete professional audit of North Forge AI Studio.
Read FOR_CLAUDE_CODE.md first for full context. Then do everything below.

---

## PHASE 1 — READ EVERYTHING FIRST

Read every file in this order before touching anything:
1. public/index.html
2. public/app.js
3. public/north.js
4. public/data.js
5. public/api.js
6. public/firebase.js
7. public/platforms.js
8. public/rooms/home.js
9. public/rooms/chat.js
10. public/rooms/cast.js
11. public/rooms/platforms.js
12. public/rooms/setup.js
13. public/rooms/slots.js
14. public/rooms/rocklab.js
15. public/rooms/racing.js
16. public/rooms/weird.js
17. public/rooms/jeeb.js
18. public/rooms/idioms.js

Do not change anything yet. Just read.

---

## PHASE 2 — SYNTAX & ERROR CHECK

Check every file for:
- JavaScript syntax errors
- Unclosed template literals or brackets
- Missing semicolons that would cause parse failures
- Import statements referencing files that don't exist
- Export statements that don't match what's imported elsewhere
- Any file over 300 lines (split if found)

Cross-check these specific imports:
- rooms/chat.js imports { PLATFORMS, getPlatformContext } from '../platforms.js'
- rooms/platforms.js imports { PLATFORMS, CINEMATOGRAPHY } from '../platforms.js'
- rooms/idioms.js imports { IDIOMS } from '../data.js'
- rooms/jeeb.js imports { JEEB_CARDS } from '../data.js'
- rooms/racing.js imports { RACING_CARDS } from '../data.js'
- rooms/rocklab.js imports { GEODE_TYPES, CAVE_EPISODES } from '../data.js'
- rooms/weird.js imports { WEIRD_CARDS } from '../data.js'
- rooms/home.js imports { ROOMS } from '../data.js'
- rooms/home.js imports { NORTH_VERSION } from '../north.js'

Verify data.js exports ALL of these:
SCENES, ROOMS, IDIOMS, JEEB_CARDS, RACING_CARDS,
GEODE_TYPES, CAVE_EPISODES, WEIRD_CARDS

---

## PHASE 3 — CSS CLASS AUDIT

These mismatches MUST be fixed. Check index.html CSS vs app.js HTML:

FIX 1 — Status dot classes:
- app.js uses: class="status-dot on" and class="status-dot off"
- index.html must define: .status-dot.on and .status-dot.off
- Currently index.html has .status-dot.online and .status-dot.offline — WRONG

FIX 2 — Topbar pill class:
- app.js uses: class="pill"
- index.html must have .pill defined
- Currently only .wx-pill .moon-pill .version-pill exist — WRONG

FIX 3 — North Peek classes:
- app.js peekHTML() uses: peek-lbl, peek-acts, peek-ava
- index.html must define those exact classes
- Currently defines: peek-label, peek-actions, peek-avatar — WRONG
- Either fix app.js to use the longer names OR fix index.html CSS

FIX 4 — Naughty animal classes:
- app.js uses: el.className = 'nan an-peek' / 'nan an-right' / 'nan an-run' / 'nan an-ufo'
- index.html must define those exact classes
- Currently defines: naughty-animal anim-peek anim-peekRight anim-sprintFast anim-ufoHover — WRONG
- Fix app.js to use: 'naughty-animal anim-peek' / 'naughty-animal anim-peekRight' /
  'naughty-animal anim-sprintFast' / 'naughty-animal anim-ufoHover'

---

## PHASE 4 — API VERIFICATION

Open public/api.js and verify:

1. It calls OpenAI NOT Anthropic
   Endpoint must be: https://api.openai.com/v1/chat/completions
   Model must be: gpt-4o-mini
   Auth header: Authorization: Bearer ${apiKey}

2. sanitizeMessages() exists and strips leading assistant messages

3. The key lookup uses: keys.anthropic || keys.gemini || keys.openai
   (user enters OpenAI key in the Anthropic field in Setup)

4. Error messages are clear and logged via NorthLog

If api.js still calls Anthropic, replace it entirely with OpenAI version.

---

## PHASE 5 — NAVIGATION AUDIT

Every tab in the bottom nav must have a matching room file.
Nav tabs: home, chat, slots, rocklab, racing, weird, jeeb, idioms, cast, platforms, setup

For each room verify:
- File exists at public/rooms/{name}.js
- File exports const render = (state) => ...
- File exports const mount = (state) => ... (even if empty)
- All window.* functions called in onclick handlers are defined in that file
  OR are global functions from app.js

Check these specific window functions exist where called:
- window.slotspin, window.slotsLock, window.slotsForge (in slots.js)
- window.castView, window.castOpen (in cast.js)
- window.peSet, window.peToggleChar, window.peForge, window.sendFreeChat (in chat.js)
- window.plTab, window.plSelect, window.forgePlatform (in rooms/platforms.js)
- window.saveAnthropicKey, window.saveGeminiKey, window.setupRefreshLog (in setup.js)
- window.idNext, window.idReact (in idioms.js)
- window.rlForgeGeo, window.rlForgeEp, window.rlQuickForge (in rocklab.js)
- window.rcForge, window.rcQuickForge (in racing.js)
- window.wnForge, window.wnQuickForge (in weird.js)
- window.jeebForge, window.jeebQuickForge (in jeeb.js)

---

## PHASE 6 — app.js VERIFICATION

Verify app.js has ALL of these:

1. window._northClearMsgs = () => { state.msgs = [state.msgs[0]]; };
   Must exist BEFORE the BOOT section

2. window.send() checks for API key before calling
   If no key: showToast and goTo('setup')

3. state.loading is set to true before API call
   and false after — prevents double submissions

4. render() is async and uses try/catch for room imports
   Error state shows room name and back button

5. onAuth() loads saved prefs including API keys from Firestore

---

## PHASE 7 — BUTTON & INTERACTION AUDIT

Test every interactive element mentally:

HOME: North loft peek clickable → goTo('chat') ✓
      Cast strip chips → goTo('cast') ✓
      Room grid cards → goTo(room.id) ✓
      Sign in pill → handleSignIn() ✓

CHAT: Mode toggle buttons work ✓
      Character multi-select (up to 3) with visual checkmark ✓
      Location dropdown saves correctly ✓
      Forge button disabled during generation ✓
      Forge uses try/finally so button ALWAYS resets ✓
      chatMode switches to 'chat' BEFORE await send() ✓
      Free chat Enter key sends message ✓
      Clear button uses window._northClearMsgs() ✓
      Copy prompt button works ✓

SLOTS: Spin button randomizes unlocked reels ✓
       Lock button toggles per reel ✓
       Forge button sends to chat room with full prompt ✓

CAST: Grid shows all 9 characters ✓
      Tap character → detail page ✓
      Detail page → Quick Forge buttons work ✓
      Back button returns to grid ✓

SETUP: Google sign-in button works ✓
       API key input saves on button click ✓
       Status dots show correct state ✓

---

## PHASE 8 — OPTIMIZATION (DO NOT BREAK ANYTHING)

Only optimize if safe. Suggestions:

1. Consolidate duplicate CAST arrays — cast.js and chat.js both define
   the full cast. Consider importing from a shared source or north.js

2. CSS in room files — each room defines its own <style> block
   which gets re-injected on every render. This is fine for now,
   keep as-is unless it causes visual flicker

3. Check for any console.log statements that should be NorthLog calls

4. Verify all image paths use ./images/characters/ for Wren's cutouts
   NOT ./images/ (they were moved to characters subfolder)

5. Check diagnostics.mjs and render-guard.mjs added by Claude Code —
   if they are not essential, remove them to keep codebase clean

---

## PHASE 9 — ASSESSMENT REPORT

After completing all phases, write a clear report with:

### ERRORS FIXED
List every file changed and exactly what was fixed

### NAVIGATION STATUS
List all 11 rooms: WORKING or BROKEN and why

### API STATUS
Confirm OpenAI is wired correctly

### BUTTONS
List any buttons that don't work and why

### OPTIMIZATIONS MADE
What was improved without breaking anything

### RECOMMENDATIONS
Expert suggestions to improve the app — keep the soul intact.
This is a memory machine for seniors. Simplicity and emotional
resonance matter more than technical complexity.

### WHAT'S NEXT
Top 3 things to build after this audit

---

## PHASE 10 — DEPLOY IF EVERYTHING PASSES

If zero critical errors remain:

1. firebase deploy
2. Test at https://north-forge-ai.web.app
3. Enter OpenAI key in Setup
4. Send one test message in Free Chat
5. Confirm North responds
6. If working:
   git add .
   git commit -m "Full audit complete — all rooms verified, OpenAI integrated"
   git push

If errors remain, fix them first. Do not deploy broken code.

---

## CRITICAL REMINDERS

- NEVER add React, npm packages, or build steps
- NEVER break the Vanilla JS ES Modules pattern
- NEVER change Sora IDs — they are locked
- Files stay under 300 lines — split if needed
- The app is a memory machine for seniors — keep it warm and simple
- North lives in the loft — his voice is calm, direct, cinematic
- Pine Barron Farms is the real world anchor — never go generic

---

Start with Phase 1. Read everything before changing anything.
Report back with the full assessment when done.
EOF
echo "done"