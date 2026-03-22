// rooms/cast.js — Character + Props Manager
// The world engine. Every prompt North generates pulls from here.

import { CAST_DB, CAST_LOCATIONS } from '../cast-data.js';

// ── STATE ─────────────────────────────────────────────────────────────────────
let view       = 'grid';    // 'grid' | 'character' | 'locations' | 'props'
let activeId   = null;
let editMode   = false;

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => `
  <div class="room-wrap">

    <!-- TAB BAR -->
    <div class="cm-tabs">
      <button class="cm-tab ${view==='grid'     ?'active':''}" onclick="castView('grid')">👥 Cast</button>
      <button class="cm-tab ${view==='locations'?'active':''}" onclick="castView('locations')">📍 Locations</button>
      <button class="cm-tab ${view==='props'    ?'active':''}" onclick="castView('props')">🎒 Props Master</button>
    </div>

    ${view === 'grid'      ? gridHTML()      : ''}
    ${view === 'character' ? charHTML()      : ''}
    ${view === 'locations' ? locationsHTML() : ''}
    ${view === 'props'     ? propsHTML()     : ''}

  </div>

  <style>
    /* TABS */
    .cm-tabs { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
    .cm-tab  { background:rgba(15,23,42,0.9); border:2px solid #1e293b;
               border-radius:12px; padding:11px 22px; color:#94a3b8;
               cursor:pointer; font-weight:900; font-size:0.82em;
               font-family:Georgia,serif; transition:all .2s; }
    .cm-tab.active { color:#fff; border-color:#38bdf8;
                     background:rgba(56,189,248,0.12); }
    .cm-tab:hover:not(.active) { color:#94a3b8; border-color:#334155; }

    /* CAST GRID */
    .cast-grid { display:grid;
                 grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
                 gap:16px; }
    .cast-card { background:rgba(2,6,23,0.95); border:2px solid #1e293b;
                 border-radius:20px; overflow:hidden; cursor:pointer;
                 transition:all .25s; position:relative; }
    .cast-card:hover { transform:translateY(-6px);
                       box-shadow:0 20px 50px rgba(0,0,0,.7); }
    .cast-photo { width:100%; height:200px; object-fit:cover;
                  object-position:top; display:block; }
    .cast-icon-wrap { width:100%; height:200px;
                      display:flex; align-items:center; justify-content:center;
                      font-size:5em; }
    .cast-info  { padding:16px 18px; }
    .cast-sora  { font-size:0.56em; font-weight:900; color:#38bdf8;
                  letter-spacing:1px; margin-bottom:5px; }
    .cast-name  { font-weight:900; font-size:1em; color:#fff; margin-bottom:3px; }
    .cast-role  { font-size:0.62em; color:#94a3b8; font-weight:700;
                  text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
    .cast-vibe  { font-size:0.74em; color:#94a3b8; line-height:1.55;
                  margin-bottom:12px; font-style:italic; }
    .cast-props-row { display:flex; gap:6px; flex-wrap:wrap; }
    .prop-tag   { font-size:0.56em; background:rgba(56,189,248,0.1);
                  border:1px solid #38bdf822; color:#94a3b8;
                  border-radius:8px; padding:3px 9px; font-weight:700; }
    .cast-enter { position:absolute; bottom:0; left:0; right:0;
                  background:linear-gradient(0deg,rgba(2,6,23,0.98),transparent);
                  padding:20px 18px 14px; opacity:0; transition:opacity .25s; }
    .cast-card:hover .cast-enter { opacity:1; }
    .cast-enter-btn { width:100%; background:#38bdf8; color:#020617; border:none;
                      border-radius:10px; padding:10px; font-weight:900;
                      cursor:pointer; font-family:Georgia,serif; font-size:0.8em; }

    /* CHARACTER DETAIL */
    .char-back  { background:rgba(15,23,42,0.8); border:2px solid #334155; border-radius:10px;
                  color:#cbd5e1; padding:9px 18px; font-weight:900; cursor:pointer;
                  font-family:Georgia,serif; font-size:0.8em; margin-bottom:20px;
                  transition:all .2s; }
    .char-back:hover { border-color:#38bdf8; color:#fff; background:rgba(56,189,248,0.08); }
    .char-detail{ display:grid; grid-template-columns:280px 1fr; gap:24px; }
    @media(max-width:700px) { .char-detail { grid-template-columns:1fr; } }
    .char-photo-wrap { border-radius:20px; overflow:hidden;
                       border:3px solid var(--cc,#38bdf8);
                       background:rgba(15,23,42,0.9); }
    .char-photo { width:100%; display:block; }
    .char-icon-big { width:100%; height:280px; display:flex;
                     align-items:center; justify-content:center; font-size:7em; }
    .char-right { display:flex; flex-direction:column; gap:16px; }
    .char-section { background:rgba(15,23,42,0.92); border:2px solid #1e293b;
                    border-radius:16px; padding:20px; }
    .char-section-title { font-size:0.6em; font-weight:900; color:#38bdf8;
                          letter-spacing:2px; text-transform:uppercase;
                          margin-bottom:10px; }
    .char-bio   { color:#cbd5e1; font-size:0.86em; line-height:1.7; }
    .char-looks { color:#cbd5e1; font-size:0.86em; line-height:1.7; }
    .char-voice { color:#cbd5e1; font-size:0.86em; line-height:1.7;
                  font-style:italic; }
    .props-list { display:flex; flex-wrap:wrap; gap:8px; }
    .prop-pill  { background:rgba(56,189,248,0.1); border:2px solid #38bdf822;
                  color:#e2e8f0; border-radius:10px; padding:7px 14px;
                  font-size:0.76em; font-weight:900; }
    .forge-btn  { background:linear-gradient(135deg,#0284c7,#0ea5e9);
                  color:#fff; border:none; border-radius:14px; padding:14px 28px;
                  font-weight:900; cursor:pointer; font-size:0.9em; letter-spacing:0.3px;
                  font-family:Georgia,serif; transition:all .2s; margin-top:4px;
                  box-shadow:0 4px 18px rgba(2,132,199,0.4); }
    .forge-btn:hover { transform:scale(1.03); filter:brightness(1.1); }

    /* LOCATIONS */
    .loc-grid { display:grid;
                grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                gap:14px; }
    .loc-card { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
                border-radius:16px; padding:20px; transition:all .25s;
                cursor:pointer; }
    .loc-card:hover { border-color:#38bdf8; transform:translateY(-3px);
                      box-shadow:0 12px 30px rgba(0,0,0,.5); }
    .loc-icon { font-size:2.2em; margin-bottom:10px; }
    .loc-name { font-weight:900; font-size:0.95em; color:#fff; margin-bottom:6px; }
    .loc-desc { color:#64748b; font-size:0.76em; line-height:1.6; margin-bottom:12px; }
    .loc-forge{ color:#38bdf8; font-size:0.66em; font-weight:900; letter-spacing:1px; }

    /* PROPS MASTER */
    .props-master { display:flex; flex-direction:column; gap:14px; }
    .pm-row  { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
               border-radius:16px; padding:18px 20px;
               display:flex; gap:16px; align-items:flex-start; }
    .pm-ava  { width:52px; height:52px; border-radius:50% 50% 50% 8px;
               display:flex; align-items:center; justify-content:center;
               font-size:1.6em; flex-shrink:0; }
    .pm-name { font-weight:900; color:#fff; font-size:0.9em; margin-bottom:4px; }
    .pm-sora { font-size:0.58em; color:#38bdf8; font-weight:900;
               letter-spacing:1px; margin-bottom:10px; }
    .pm-props{ display:flex; flex-wrap:wrap; gap:7px; }
  </style>
`;

// ── GRID VIEW ─────────────────────────────────────────────────────────────────
const gridHTML = () => `
  <div class="panel-desc">
    Every crew member. Sora IDs locked. Tap any character to see their full profile and forge a scene.
  </div>
  <div class="cast-grid">
    ${CAST_DB.map(c => `
      <div class="cast-card" style="border-color:${c.color}44;"
           onclick="castOpen('${c.id}')">
        ${c.photo
          ? `<img src="${c.photo}" class="cast-photo" alt="${c.name}"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
             <div class="cast-icon-wrap" style="display:none;">${c.icon}</div>`
          : `<div class="cast-icon-wrap" style="background:${c.color}12;">${c.icon}</div>`}
        <div class="cast-info">
          <div class="cast-sora" onclick="castCopySora('${c.soraId}',event)" title="Click to copy Sora ID" style="cursor:pointer;">${c.soraId} 📋</div>
          <div class="cast-name">${c.name}</div>
          <div class="cast-role" style="color:${c.color};">${c.role}</div>
          <div class="cast-vibe">${c.vibe}</div>
          <div class="cast-props-row">
            ${c.props.slice(0,3).map(p => `<span class="prop-tag">${p}</span>`).join('')}
            ${c.props.length > 3 ? `<span class="prop-tag">+${c.props.length-3}</span>` : ''}
          </div>
        </div>
        <div class="cast-enter">
          <button class="cast-enter-btn">▶ Open Profile</button>
        </div>
      </div>`).join('')}
  </div>
`;

// ── CHARACTER DETAIL ──────────────────────────────────────────────────────────
const charHTML = () => {
  const c = CAST_DB.find(x => x.id === activeId);
  if (!c) return gridHTML();
  return `
    <button class="char-back" onclick="castView('grid')">← Back to Cast</button>
    <div class="char-detail" style="--cc:${c.color};">

      <div>
        <div class="char-photo-wrap">
          ${c.photo
            ? `<img src="${c.photo}" class="char-photo" alt="${c.name}"
                    onerror="this.outerHTML='<div class=char-icon-big>${c.icon}</div>'"/>`
            : `<div class="char-icon-big" style="background:${c.color}10;">${c.icon}</div>`}
        </div>
        <div style="margin-top:14px;">
          <button class="forge-btn" style="width:100%;"
            onclick="forgeScene('Generate a cinematic scene featuring ${c.name} (${c.soraId}) at Pine Barron Farms. Role: ${c.role}. Props: ${c.props.slice(0,3).join(', ')}. Full 9:16 SORA call sheet format.')">
            🎬 Forge ${c.name.split(' ')[0]}'s Scene
          </button>
        </div>
      </div>

      <div class="char-right">
        <div class="char-section">
          <div class="char-section-title">Identity</div>
          <div style="font-weight:900;font-size:1.2em;color:#fff;margin-bottom:4px;">${c.name}</div>
          <div style="font-size:0.66em;font-weight:900;letter-spacing:1px;margin-bottom:6px;">
            <span style="color:${c.color};cursor:pointer;" onclick="castCopySora('${c.soraId}',event)" title="Click to copy">${c.soraId} 📋</span>
            <span style="color:#475569;"> · ${c.role}</span>
          </div>
          <div class="char-bio">${c.bio}</div>
        </div>

        <div class="char-section">
          <div class="char-section-title">On Screen</div>
          <div class="char-looks" style="margin-bottom:10px;"><strong style="color:#fff;">Looks:</strong> ${c.looks}</div>
          <div class="char-voice"><strong style="color:#fff;">Voice:</strong> ${c.voice}</div>
        </div>

        <div class="char-section">
          <div class="char-section-title">Props & Wardrobe</div>
          <div class="props-list">
            ${c.props.map(p => `<div class="prop-pill">🎒 ${p}</div>`).join('')}
          </div>
        </div>

        <div class="char-section">
          <div class="char-section-title">Quick Forge</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="forge-btn"
              onclick="forgeScene('EVERYDAY FARM SCENE — ${c.name} (${c.soraId}) doing something ordinary at Pine Barron Farms that reveals their personality. Cinematic. 9:16 vertical. SORA format.')">
              🌾 Daily Life Scene
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7);"
              onclick="forgeScene('CHARACTER INTRO — Cinematic introduction of ${c.name} (${c.soraId}). Props: ${c.props.slice(0,2).join(', ')}. Energy: ${c.vibe}. Make it scroll-stopping. 9:16 SORA format.')">
              🎬 Character Intro
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#d97706,#f59e0b);"
              onclick="forgeScene('WEIRD NJ MOMENT — ${c.name} (${c.soraId}) encounters something unexplained in the Pine Barrens. Lean into their personality: ${c.vibe}. 9:16 SORA format.')">
              👻 Weird NJ Moment
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#0ea5e9,#38bdf8);margin-top:4px;"
              onclick="window.castSoraSheet('${c.id}')">
              🪪 Build Sora Character Sheet
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#be185d,#f43f5e);margin-top:4px;"
              onclick="window.castChemistry('${c.id}')">
              ⚡ Chemistry Scene
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

// ── LOCATIONS VIEW ────────────────────────────────────────────────────────────
const locationsHTML = () => `
  <div class="panel-desc">
    Every filming location on the farm and in New Jersey. Tap any location to forge a scene there.
  </div>
  <div class="loc-grid">
    ${CAST_LOCATIONS.map(l => `
      <div class="loc-card"
           onclick="forgeScene('LOCATION SCOUT — Cinematic establishing shot of ${l.name} at Pine Barron Farms NJ. ${l.desc} 9:16 vertical SORA format.')">
        <div class="loc-icon">${l.icon}</div>
        <div class="loc-name">${l.name}</div>
        <div class="loc-desc">${l.desc}</div>
        <div class="loc-forge">▶ FORGE ESTABLISHING SHOT</div>
      </div>`).join('')}
  </div>
`;

// ── PROPS MASTER VIEW ─────────────────────────────────────────────────────────
const propsHTML = () => `
  <div class="panel-desc">
    Every prop, every character. This is what North reads before generating any prompt.
    These details lock the scene to your real world.
  </div>
  <div class="props-master">
    ${CAST_DB.map(c => `
      <div class="pm-row" style="border-color:${c.color}33;">
        <div class="pm-ava" style="background:${c.color}15;">${c.icon}</div>
        <div style="flex:1;">
          <div class="pm-name">${c.name}</div>
          <div class="pm-sora" onclick="castCopySora('${c.soraId}',event)" style="cursor:pointer;" title="Click to copy Sora ID">${c.soraId} 📋</div>
          <div class="pm-props">
            ${c.props.map(p => `<div class="prop-pill">🎒 ${p}</div>`).join('')}
          </div>
        </div>
        <button onclick="castOpen('${c.id}')"
          style="background:none;border:2px solid ${c.color}44;color:${c.color};
                 border-radius:10px;padding:8px 16px;cursor:pointer;font-weight:900;
                 font-size:0.72em;font-family:Georgia,serif;white-space:nowrap;
                 flex-shrink:0;transition:all .2s;">
          Full Profile →
        </button>
      </div>`).join('')}
  </div>
`;

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.castView = (v) => { view = v; activeId = null; window.goTo('cast'); };
window.castOpen = (id) => { activeId = id; view = 'character'; window.goTo('cast'); };
window.castCopySora = (soraId, event) => {
  event?.stopPropagation();
  navigator.clipboard.writeText(soraId)
    .then(() => window.showToast(`✓ ${soraId} copied!`))
    .catch(() => window.showToast('Copy failed'));
};

window.castSoraSheet = (id) => {
  const c = CAST_DB.find(x => x.id === id);
  if (!c) return;
  const prompt = `BUILD SORA 2 CHARACTER CONSISTENCY SHEET for ${c.name}

Sora ID: ${c.soraId}
Role: ${c.role}
Looks: ${c.looks}
Voice / Energy: ${c.voice} · ${c.vibe}
Props: ${c.props.join(', ')}

Generate a structured reference I can paste into Sora's character field:
1. APPEARANCE ANCHOR — 2-sentence physical description Sora should lock to every time
2. SIGNATURE PROPS — which 1-2 props must appear in every shot
3. MOVEMENT PROFILE — how this character moves, walks, gestures
4. EXAMPLE PROMPTS (3) — ready-to-use Sora 2 prompts, each grounded with the Sora ID and at least one prop
5. AVOID LIST — what Sora tends to hallucinate for this character that breaks consistency

Keep it tight. This is a production reference card.`;
  window.goTo('chat');
  setTimeout(() => window.send(prompt), 120);
};

window.castChemistry = (id) => {
  const c = CAST_DB.find(x => x.id === id);
  if (!c) return;
  const others = CAST_DB.filter(x => x.id !== id);
  const partner = others[Math.floor(Math.random() * others.length)];
  const prompt =
`CHEMISTRY SCENE — ${c.name} + ${partner.name} · Pine Barron Farms

${c.name} (${c.soraId}) · ${c.role} · Props: ${c.props.slice(0,3).join(', ')}
${partner.name} (${partner.soraId}) · ${partner.role} · Props: ${partner.props.slice(0,3).join(', ')}

Write a scene that puts these two characters together and lets their dynamic do the work. Don't explain their relationship — show it. One of them does something, the other reacts. That reaction IS the scene.

Give me:
- HOOK (the moment that makes you stop scrolling)
- SCENE (2-3 sentences, both Sora IDs embedded, at least one prop each)
- CAMERA angle
- CLEAN PROMPT (paste-ready Sora 2)
- One line: why THIS pairing works on camera`;
  window.goTo('chat');
  setTimeout(() => window.send(prompt), 120);
};

export const mount = () => {};
