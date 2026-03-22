// rooms/slots.js — Madlib Story Slots
// Spin the reels, lock what you like, forge the scene.

import { CAST_DB } from '../cast-data.js';

// ── SLOT DATA ─────────────────────────────────────────────────────────────────
const REELS = {
  who: [
    { val:'ken',      label:'Ken',       icon:'👨‍🌾' },
    { val:'randy',    label:'Randy',     icon:'🪖'  },
    { val:'salem',    label:'Salem',     icon:'✨'  },
    { val:'eleanor',  label:'Eleanor',   icon:'👵'  },
    { val:'luna',     label:'Luna',      icon:'🐐'  },
    { val:'marguerite',label:'Marguerite',icon:'👩🏽‍🌾'},
    { val:'skully',   label:'Skully',    icon:'🌑'  },
    { val:'tank',     label:'Tank',      icon:'🐕'  },
    { val:'big',      label:'BigTheSqua',icon:'🦍'  },
  ],
  action: [
    { val:'finds something underground',    label:'Finds something underground',  icon:'⛏️'  },
    { val:'escapes the pen at 3am',         label:'Escapes at 3am',               icon:'🌙'  },
    { val:'discovers a Jersey Devil track', label:'Finds JD tracks',              icon:'👣'  },
    { val:'races down Route 539',           label:'Races Route 539',              icon:'🏁'  },
    { val:'films a golden hour shot',       label:'Films golden hour',            icon:'🌅'  },
    { val:'argues with a chicken',          label:'Argues with chicken',          icon:'🐔'  },
    { val:'finds a glowing geode',          label:'Finds glowing geode',          icon:'💎'  },
    { val:'gets lost in the pines',         label:'Lost in the pines',            icon:'🌲'  },
    { val:'sees something in the loft',     label:'Sees something in loft',       icon:'🔭'  },
    { val:'breaks into the garden at dawn', label:'Garden at dawn',               icon:'🌻'  },
  ],
  location: [
    { val:'Big Red Barn',         label:'Big Red Barn',      icon:'🏚️' },
    { val:"Randy's Cave #1",      label:"Randy's Cave",      icon:'⛏️' },
    { val:'Pine Barrens Forest',  label:'Pine Barrens',      icon:'🌲' },
    { val:'Route 539',            label:'Route 539',         icon:'🛣️' },
    { val:'Barn Loft',            label:'Barn Loft',         icon:'🔭' },
    { val:'Chicken Coop',         label:'Chicken Coop',      icon:'🐔' },
    { val:'Farm Garden',          label:'Farm Garden',       icon:'🌻' },
    { val:'Assunpink Creek',      label:'Creek at Dusk',     icon:'💧' },
    { val:'NJ Dirt Track',        label:'Dirt Track',        icon:'🏁' },
    { val:'Back Field',           label:'Back Field',        icon:'🌾' },
  ],
  twist: [
    { val:'Luna shows up uninvited',             label:'Luna crashes it',         icon:'🐐' },
    { val:"it's caught on Randy's trail cam",    label:"Randy's trail cam",       icon:'📹' },
    { val:'North is watching from the loft',     label:'North is watching',       icon:'🧠' },
    { val:'Eleanor wheels out and takes charge', label:'Eleanor takes charge',    icon:'👵' },
    { val:'there is no explanation',             label:'No explanation',          icon:'👻' },
    { val:"the weather turns",                   label:'Weather turns',           icon:'⛈️' },
    { val:'someone is filming someone filming',  label:'Meta moment',             icon:'🎬' },
    { val:"it's 3am and nobody sleeps",          label:'3am on the farm',         icon:'🌙' },
  ],
  platform: [
    { val:'sora2',  label:'Sora 2',      icon:'🌀' },
    { val:'kling',  label:'Kling',        icon:'⚡' },
    { val:'veo3',   label:'VEO 3',        icon:'🎬' },
    { val:'grok',   label:'Grok Aurora',  icon:'✖️' },
  ],
};

// ── STATE ─────────────────────────────────────────────────────────────────────
let current = {
  who:      0,
  action:   0,
  location: 0,
  twist:    0,
  platform: 0,
};
let locked = { who:false, action:false, location:false, twist:false, platform:false };
let spinning = false;

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      Spin the reels. Lock what you like. Forge it into a scene. Every combo is a story waiting to happen on Pine Barron Farms.
    </div>

    <!-- SLOT MACHINE -->
    <div class="slot-machine">

      ${reelHTML('who',      'WHO',      current.who,      locked.who)}
      ${reelHTML('action',   'DOES',     current.action,   locked.action)}
      ${reelHTML('location', 'WHERE',    current.location, locked.location)}
      ${reelHTML('twist',    'TWIST',    current.twist,    locked.twist)}
      ${reelHTML('platform', 'PLATFORM', current.platform, locked.platform)}

    </div>

    <!-- STORY PREMISE -->
    <div class="premise-box">
      <div class="premise-label">📋 YOUR STORY PREMISE</div>
      <div class="premise-text" id="premise-text">
        ${getPremise()}
      </div>
    </div>

    <!-- BUTTONS -->
    <div class="slot-actions">
      <button class="slot-spin-btn" onclick="slotspin()" id="spin-btn">
        🎰 SPIN
      </button>
      <button class="slot-forge-btn" onclick="slotsForge()">
        🎬 FORGE THIS SCENE
      </button>
    </div>

  </div>

  <style>
    .slot-machine { display:flex; gap:10px; margin-bottom:22px;
                    overflow-x:auto; padding-bottom:6px; }
    .reel  { background:rgba(2,6,23,0.95); border:2px solid #334155;
             border-radius:18px; padding:16px 12px; flex:1; min-width:100px;
             display:flex; flex-direction:column; align-items:center; gap:10px;
             transition:all .3s; }
    .reel.locked { border-color:#f59e0b; background:rgba(245,158,11,0.08);
                   box-shadow:0 0 14px rgba(245,158,11,0.2); }
    .reel-label  { font-size:0.52em; font-weight:900; color:#94a3b8;
                   letter-spacing:2px; text-transform:uppercase; }
    .reel-icon   { font-size:2.4em; line-height:1;
                   transition:transform .15s; }
    .reel-val    { font-size:0.64em; font-weight:900; color:#fff;
                   text-align:center; line-height:1.4; min-height:2.8em;
                   display:flex; align-items:center; justify-content:center; }
    .lock-btn    { font-size:0.58em; font-weight:900; padding:6px 14px;
                   border-radius:8px; border:2px solid #334155; cursor:pointer;
                   font-family:Georgia,serif; transition:all .2s;
                   background:rgba(15,23,42,0.8); color:#94a3b8; }
    .lock-btn:hover:not(.on) { border-color:#f59e0b66; color:#fcd34d; }
    .lock-btn.on { background:rgba(245,158,11,0.2); border-color:#f59e0b;
                   color:#fcd34d; box-shadow:0 0 10px rgba(245,158,11,0.3); }
    .premise-box { background:rgba(2,6,23,0.95); border:2px solid #38bdf833;
                   border-radius:18px; padding:22px; margin-bottom:20px; }
    .premise-label { font-size:0.58em; font-weight:900; color:#38bdf8;
                     letter-spacing:2px; margin-bottom:10px; }
    .premise-text  { color:#cbd5e1; font-size:0.92em; line-height:1.7;
                     font-style:italic; }
    .slot-actions  { display:flex; gap:12px; flex-wrap:wrap; }
    .slot-spin-btn { flex:1; background:linear-gradient(135deg,#6d28d9,#9333ea);
                     color:#fff; border:none; border-radius:14px; padding:16px;
                     font-weight:900; font-size:1em; cursor:pointer; letter-spacing:1px;
                     font-family:Georgia,serif; transition:all .25s;
                     box-shadow:0 6px 24px rgba(124,58,237,0.5),0 0 0 1px rgba(147,51,234,0.3); }
    .slot-spin-btn:hover  { transform:scale(1.03); }
    .slot-spin-btn:active { transform:scale(0.97); }
    .slot-forge-btn { flex:1; background:linear-gradient(135deg,#0284c7,#0ea5e9);
                      color:#fff; border:none; border-radius:14px; padding:16px;
                      font-weight:900; font-size:1em; cursor:pointer;
                      font-family:Georgia,serif; transition:all .25s;
                      box-shadow:0 6px 20px rgba(2,132,199,0.35); }
    .slot-forge-btn:hover { transform:scale(1.03); }
    @keyframes reelFlash { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .spinning .reel-icon { animation:reelFlash 0.15s ease-in-out 4; }
  </style>
`;

// ── REEL HTML ─────────────────────────────────────────────────────────────────
const reelHTML = (key, label, idx, isLocked) => {
  const item = REELS[key][idx];
  return `
    <div class="reel ${isLocked?'locked':''}" id="reel-${key}">
      <div class="reel-label">${label}</div>
      <div class="reel-icon">${item.icon}</div>
      <div class="reel-val">${item.label}</div>
      <button class="lock-btn ${isLocked?'on':''}"
              onclick="slotsLock('${key}')">
        ${isLocked ? '🔒 LOCKED' : '🔓 LOCK'}
      </button>
    </div>`;
};

// ── PREMISE TEXT ──────────────────────────────────────────────────────────────
const getPremise = () => {
  const who  = REELS.who[current.who].label;
  const act  = REELS.action[current.action].val;
  const loc  = REELS.location[current.location].val;
  const twist= REELS.twist[current.twist].val;
  const plat = REELS.platform[current.platform].label;
  return `${who} ${act} at ${loc}… and ${twist}. Forge it for <strong style="color:#38bdf8;">${plat}</strong>.`;
};

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.slotsLock = (key) => {
  locked[key] = !locked[key];
  window.goTo('slots');
};

window.slotspin = () => {
  if (spinning) return;
  spinning = true;
  const btn = document.getElementById('spin-btn');
  if (btn) btn.disabled = true;

  // randomize unlocked reels
  Object.keys(REELS).forEach(key => {
    if (!locked[key]) {
      current[key] = Math.floor(Math.random() * REELS[key].length);
    }
  });

  // brief visual flash then re-render
  setTimeout(() => {
    spinning = false;
    if (btn) btn.disabled = false;
    window.goTo('slots');
  }, 400);
};

window.slotsForge = () => {
  const who    = REELS.who[current.who];
  const action = REELS.action[current.action];
  const loc    = REELS.location[current.location];
  const twist  = REELS.twist[current.twist];
  const plat   = REELS.platform[current.platform];

  const charData  = CAST_DB.find(c => c.id === who.val) || { soraId:'', props:[] };
  const soraId    = charData.soraId;
  const charProps = Array.isArray(charData.props) ? charData.props.join(', ') : charData.props;

  const prompt =
    `You are North, AI director of Pine Barron Farms. ` +
    `Generate a FULL PROFESSIONAL CALL SHEET for ${plat.label}.\n\n` +
    `STORY PREMISE: ${who.label} (${soraId}) ${action.val} at ${loc.val}. Twist: ${twist.val}.\n` +
    `CHARACTER PROPS: ${charProps}\n` +
    `PLATFORM: ${plat.label}\n` +
    `FORMAT: 9:16 vertical\n\n` +
    `Use the character's Sora ID (${soraId}) in the scene. ` +
    `Ground the scene with their props — specifically ${charProps.split(',')[0]}. ` +
    `Make it specific to Pine Barron Farms, Piscataway NJ. ` +
    `Output the full call sheet with HOOK, SCENE, CAMERA, AUDIO, DIRECTOR'S NOTE, ` +
    `and a CLEAN PROMPT section at the end with the paste-ready text.`;

  window.showToast('🎬 Forging your scene...');
  window.goTo('chat');
  window.send(prompt);
};

export const mount = () => {};
