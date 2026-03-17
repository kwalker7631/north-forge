// rooms/idioms.js — Randy's Idioms (upgraded)
// Location picker → Randy reacts with full cast context → Forge proper call sheet

import { IDIOMS } from '../data.js';

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let idiomIdx  = Math.floor(Math.random() * IDIOMS.length);
let reaction  = null;
let reacting  = false;
let scene     = 'barn';   // current location
let nearby    = [];       // cast members drawn for this reaction

// ── SCENE CONFIGS ─────────────────────────────────────────────────────────────
const SCENES = {
  barn:  { label:'Big Red Barn',    icon:'🏚️', cam:'golden hour medium shot, warm barn light',          night:false },
  cave:  { label:"Randy's Cave",    icon:'⛏️', cam:'tight headlamp shot, breath visible, crystal dark', night:true  },
  track: { label:'Wall Stadium',    icon:'🏁', cam:'wide tracking shot, red NJ clay rooster tail',      night:false },
  pines: { label:'Pine Barrens',    icon:'🌲', cam:'night vision green tint, ancient shadows',           night:true  },
};

// Cast pool for random nearby members (excluding Randy himself)
const CAST_POOL = [
  { name:'Ken Walker',       soraId:'@kennethwalker479',     icon:'👨‍🌾' },
  { name:'Marguerite',       soraId:'@prprincess138',        icon:'👩🏽‍🌾' },
  { name:'Salem',            soraId:'@kennethwa.majorbilli', icon:'✨'   },
  { name:'Skully',           soraId:'@kennethwa.shadowblaz', icon:'🌑'   },
  { name:'BigTheSqua',       soraId:'@kennethwa.bigthesqua', icon:'🦍'   },
  { name:'Grand Ma Eleanor', soraId:'@grandma.eleanor',      icon:'👵'   },
  { name:'Luna',             soraId:'@kennethwa.luna',        icon:'🐐'   },
];

const pickNearby = () => {
  const shuffled = [...CAST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 1 + Math.floor(Math.random() * 2)); // 1 or 2
};

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  const idiom  = IDIOMS[idiomIdx];
  const hasKey = state.keys.anthropic || state.keys.gemini;
  const s      = SCENES[scene];

  return `
  <div class="room-wrap">

    <div class="panel-desc">
      Place Randy somewhere on the farm. Hit <strong>Randy Reacts</strong> and
      watch Sarge process it in real time. Then forge the scene.
    </div>

    <!-- IDIOM CARD -->
    <div class="id-card">
      <div class="id-card-label">💬 IDIOM</div>
      <div class="id-text">"${esc(idiom.text)}"</div>
      <div class="id-src">— ${esc(idiom.src)}</div>
    </div>

    <!-- LOCATION PICKER -->
    <div class="id-scene-row">
      ${Object.entries(SCENES).map(([k, v]) => `
        <button class="id-scene-btn ${scene===k?'active':''}" onclick="idSetScene('${k}')">
          ${v.icon} ${v.label}
        </button>`).join('')}
    </div>

    <!-- ACTION BUTTONS -->
    <div class="id-btn-row">
      <button class="id-btn-next" onclick="idNext()">↺ Next Idiom</button>
      ${hasKey
        ? `<button class="id-btn-react ${reacting?'disabled':''}"
                  onclick="idReact()" ${reacting?'disabled':''}>
             ${reacting
               ? `<span class="id-thinking">🪖 Randy is processing…</span>`
               : '🪖 Randy Reacts'}
           </button>`
        : `<button class="id-btn-react disabled" onclick="goTo('setup')"
                  title="Add an API key in Setup">🔑 Need API key</button>`
      }
    </div>

    <!-- REACTION -->
    ${reaction ? `
      <div class="id-reaction-card">
        <div class="id-react-header">
          <span class="id-react-label">🪖 RANDY'S REACTION</span>
          <span class="id-react-loc">${s.icon} ${s.label}</span>
        </div>
        ${nearby.length ? `
          <div class="id-nearby">
            Nearby: ${nearby.map(c => `${c.icon} ${c.name} <span class="id-soraid">${c.soraId}</span>`).join(' · ')}
          </div>` : ''}
        <div class="id-react-text" id="id-react-text">${esc(reaction)}</div>
        <div style="display:flex;gap:10px;margin-bottom:10px;">
          <button class="id-copy-btn" onclick="idCopyReaction()">📋 Copy Reaction</button>
        </div>
        <button class="id-forge-btn" onclick="idForgeScene()">
          🎬 Forge This Scene → Sora 2
        </button>
      </div>` : ''}

  </div>

  <style>
    .id-card        { background:rgba(2,6,23,.95); border:2px solid #d9770633;
                      border-radius:20px; padding:28px 26px; margin-bottom:18px; }
    .id-card-label  { font-size:.56em; font-weight:900; letter-spacing:2px; color:#d97706;
                      text-transform:uppercase; margin-bottom:14px; }
    .id-text        { font-size:1.05em; color:#fff; font-weight:900; line-height:1.7;
                      margin-bottom:12px; }
    .id-src         { font-size:.7em; color:#64748b; font-style:italic; }
    .id-scene-row   { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
    .id-scene-btn   { flex:1; min-width:120px; background:rgba(15,23,42,.9);
                      border:2px solid #334155; border-radius:12px; padding:10px 8px;
                      font-weight:900; font-size:.72em; color:#cbd5e1; cursor:pointer;
                      font-family:Georgia,serif; transition:all .2s; white-space:nowrap; }
    .id-scene-btn:hover  { border-color:#d97706; color:#d97706; }
    .id-scene-btn.active { border-color:#d97706; color:#d97706;
                           background:rgba(217,119,6,.12); }
    .id-btn-row     { display:flex; gap:12px; margin-bottom:22px; }
    .id-btn-next    { flex:1; background:rgba(15,23,42,0.8); border:2px solid #334155;
                      border-radius:14px; padding:14px; font-weight:900;
                      font-size:.86em; color:#cbd5e1; cursor:pointer;
                      font-family:Georgia,serif; transition:all .2s; }
    .id-btn-next:hover { border-color:#38bdf8; color:#38bdf8; background:rgba(56,189,248,0.06); }
    .id-btn-react   { flex:2; background:linear-gradient(135deg,#78350f,#d97706);
                      color:#fff; border:none; border-radius:14px; padding:14px 20px;
                      font-weight:900; font-size:.86em; cursor:pointer; letter-spacing:0.5px;
                      font-family:Georgia,serif; transition:all .2s;
                      box-shadow:0 4px 20px rgba(217,119,6,.45),0 0 0 1px rgba(245,158,11,0.2); }
    .id-btn-react:hover:not(.disabled) { transform:scale(1.02); }
    .id-btn-react.disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .id-thinking    { color:#fcd34d; }
    .id-reaction-card { background:rgba(146,64,14,.1); border:2px solid #d9770644;
                        border-radius:18px; padding:24px 26px; }
    .id-react-header{ display:flex; align-items:center; justify-content:space-between;
                      margin-bottom:10px; flex-wrap:wrap; gap:8px; }
    .id-react-label { font-size:.56em; font-weight:900; letter-spacing:2px; color:#d97706;
                      text-transform:uppercase; }
    .id-react-loc   { font-size:.62em; font-weight:900; color:#94a3b8; }
    .id-nearby      { font-size:.62em; color:#64748b; margin-bottom:12px;
                      padding:8px 12px; background:rgba(15,23,42,.6);
                      border-radius:8px; line-height:1.8; }
    .id-soraid      { color:#38bdf8; font-family:monospace; }
    .id-react-text  { color:#fef3c7; font-size:.9em; line-height:1.8;
                      font-weight:700; margin-bottom:16px; }
    .id-copy-btn    { flex:1; background:rgba(15,23,42,.9); border:2px solid #334155;
                      border-radius:10px; padding:10px 16px; font-weight:900;
                      font-size:0.72em; color:#cbd5e1; cursor:pointer;
                      font-family:Georgia,serif; transition:all .2s; }
    .id-copy-btn:hover { border-color:#38bdf8; color:#38bdf8; background:rgba(56,189,248,0.06); }
    .id-forge-btn   { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                      border:none; border-radius:10px; padding:12px 20px; font-weight:900;
                      font-size:0.76em; cursor:pointer; font-family:Georgia,serif;
                      transition:all .2s; width:100%; }
    .id-forge-btn:hover { transform:scale(1.02); }
  </style>
  `;
};

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.idSetScene = (key) => {
  scene    = key;
  reaction = null;
  nearby   = [];
  window.goTo('idioms');
};

window.idNext = () => {
  idiomIdx = (idiomIdx + 1) % IDIOMS.length;
  reaction = null;
  reacting = false;
  nearby   = [];
  scene    = 'barn';
  window.goTo('idioms');
};

window.idReact = async () => {
  if (reacting) return;
  reacting = true;
  reaction = null;
  nearby   = pickNearby();
  window.goTo('idioms');

  const idiom     = IDIOMS[idiomIdx];
  const s         = SCENES[scene];
  const nearbyStr = nearby.map(c => `${c.name} (${c.soraId})`).join(' and ');
  const text = await window.callNorthDirect([{
    role: 'user',
    content:
      `Randy "Sarge" (@geodudenj) — ex-military, NJ dirt track racer, cave hunter, Piscataway born — ` +
      `is at ${s.label} on Pine Barron Farms. ${nearbyStr} ${nearby.length > 1 ? 'are' : 'is'} nearby.\n\n` +
      `He just heard: "${idiom.text}" (— ${idiom.src})\n\n` +
      `Write his raw in-character reaction. 3 sentences max. First person. No labels. Pure Randy. ` +
      `Reference ${s.label} or something specific about this spot if it fits naturally.`,
  }]);

  reaction = text || '...Randy stares at you. Reaches into his vest pocket. Pulls out a zeolite chip and says nothing.';
  reacting = false;
  window.goTo('idioms');
};

window.idCopyReaction = () => {
  const el = document.getElementById('id-react-text');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Randy copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.idForgeScene = () => {
  if (!reaction) return;
  const idiom     = IDIOMS[idiomIdx];
  const s         = SCENES[scene];
  const nearbyStr = nearby.map(c => `${c.name} (${c.soraId})`).join(', ');

  window.forgeScene(
    `SORA 2 · 9:16 · 20s max\n` +
    `LOCATION: ${s.label} — Pine Barron Farms, Piscataway NJ\n` +
    `CAMERA: ${s.cam}\n` +
    `SUBJECT: Randy "Sarge" (@geodudenj)\n` +
    `${nearby.length ? `ALSO PRESENT: ${nearbyStr}\n` : ''}` +
    `EMOTIONAL ANCHOR: Randy just said — "${reaction}"\n` +
    `TRIGGERED BY: Hearing the phrase — "${idiom.text}"\n\n` +
    `Build a tight cinematic call sheet. Lock to the emotional beat in Randy's reaction. ` +
    `First 1.5 seconds must earn the scroll-stop.`
  );
};

export const mount = () => {};
