// rooms/slots.js — Story Slots
// Pick your star. Pull the lever. North builds the cinematic scene.

import { SLOT_LOCATIONS, SLOT_RIDES, SLOT_AUDIO, TWISTS, SLOT_TEMPLATES } from '../data.js';

const CAST = [
  { id:'ken',       name:'Ken',      icon:'👨‍🌾', soraId:'@kennethwalker479'     },
  { id:'marguerite',name:'Marguerite',icon:'👩🏽‍🌾',soraId:'@prprincess138'        },
  { id:'randy',     name:'Randy',    icon:'🪖',  soraId:'@geodudenj'            },
  { id:'salem',     name:'Salem',    icon:'✨',  soraId:'@kennethwa.majorbilli' },
  { id:'skully',    name:'Skully',   icon:'🌑',  soraId:'@kennethwa.shadowblaz' },
  { id:'luna',      name:'Luna',     icon:'🐐',  soraId:'@kennethwa.luna'       },
  { id:'big',       name:'BigTheSqua',icon:'🦍', soraId:'@kennethwa.bigthesqua' },
  { id:'eleanor',   name:'Eleanor',  icon:'👵',  soraId:'@grandma.eleanor'      },
];

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

let slotChar  = null;
let slotResult = null;

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      Pick your star. Pull the lever. North rolls a random location, ride, soundtrack,
      and a plot twist — then forges the full cinematic scene.
    </div>

    <div style="margin-bottom:22px;">
      <div class="sl-label">1 · Who's the star?</div>
      <div class="sl-cast-grid">
        ${CAST.map(c => `
          <div class="sl-cast-opt ${slotChar===c.id?'sel':''}" onclick="slPickChar('${c.id}')">
            <div class="sl-cast-icon">${c.icon}</div>
            <div class="sl-cast-name">${c.name}</div>
          </div>`).join('')}
      </div>
    </div>

    <button class="sl-pull-btn" onclick="slPull()">🎰 PULL THE LEVER</button>

    ${slotResult ? `
      <div style="margin-top:26px;">
        <div class="sl-label" style="margin-bottom:14px;">2 · North rolled...</div>
        <div class="sl-result-grid">
          <div class="sl-result-card" style="border-color:#38bdf844;">
            <div class="sl-result-icon">${slotResult.loc.icon}</div>
            <div class="sl-result-type">LOCATION</div>
            <div class="sl-result-val">${slotResult.loc.label}</div>
            <div class="sl-result-sub">${slotResult.loc.desc}</div>
          </div>
          <div class="sl-result-card" style="border-color:#22c55e44;">
            <div class="sl-result-icon">${slotResult.ride.icon}</div>
            <div class="sl-result-type">RIDE</div>
            <div class="sl-result-val">${slotResult.ride.label}</div>
            <div class="sl-result-sub">${slotResult.ride.desc}</div>
          </div>
          <div class="sl-result-card" style="border-color:#f59e0b44;">
            <div class="sl-result-icon">${slotResult.audio.icon}</div>
            <div class="sl-result-type">AUDIO</div>
            <div class="sl-result-val">${slotResult.audio.label}</div>
            <div class="sl-result-sub">${slotResult.audio.desc}</div>
          </div>
        </div>
        <div class="sl-twist-card">
          <div class="sl-twist-label">⚡ PLOT TWIST</div>
          <div class="sl-twist-text">${slotResult.twist}</div>
        </div>
        <button class="sl-forge-btn" onclick="slForge()">🎬 FORGE THIS SCENE</button>
        <button class="sl-reroll-btn" onclick="slPull()">↺ Re-roll</button>
      </div>` : ''}

  </div>

  <style>
    .sl-label { font-size:.62em; font-weight:900; color:#38bdf8; letter-spacing:2px;
                text-transform:uppercase; margin-bottom:12px; display:block; }
    .sl-cast-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:8px; }
    .sl-cast-opt  { background:rgba(2,6,23,.9); border:2px solid #1e293b; border-radius:14px;
                    padding:14px 8px; cursor:pointer; text-align:center; transition:all .2s; }
    .sl-cast-opt:hover { border-color:#38bdf833; }
    .sl-cast-opt.sel   { border-color:#38bdf8; background:rgba(56,189,248,.12); }
    .sl-cast-icon { font-size:1.8em; margin-bottom:5px; }
    .sl-cast-name { font-size:.65em; font-weight:900; color:#fff; }
    .sl-pull-btn  { width:100%; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff;
                    border:none; border-radius:18px; padding:20px; font-weight:900; font-size:1.1em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .25s; margin-top:6px;
                    box-shadow:0 6px 28px rgba(245,158,11,.35); letter-spacing:1px; }
    .sl-pull-btn:hover { transform:scale(1.02); }
    .sl-result-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
    @media(max-width:600px){ .sl-result-grid { grid-template-columns:1fr; } }
    .sl-result-card { background:rgba(2,6,23,.95); border:2px solid #1e293b; border-radius:16px;
                      padding:16px; text-align:center; }
    .sl-result-icon { font-size:2em; margin-bottom:6px; }
    .sl-result-type { font-size:.54em; font-weight:900; letter-spacing:2px; color:#64748b;
                      text-transform:uppercase; margin-bottom:4px; }
    .sl-result-val  { font-weight:900; color:#fff; font-size:.84em; margin-bottom:3px; }
    .sl-result-sub  { font-size:.66em; color:#64748b; line-height:1.4; }
    .sl-twist-card  { background:rgba(245,158,11,.08); border:2px solid #f59e0b44; border-radius:16px;
                      padding:18px 22px; margin-bottom:16px; }
    .sl-twist-label { font-size:.56em; font-weight:900; letter-spacing:2px; color:#f59e0b;
                      text-transform:uppercase; margin-bottom:8px; }
    .sl-twist-text  { color:#fcd34d; font-weight:900; font-size:.9em; line-height:1.6; }
    .sl-forge-btn   { width:100%; background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                      border:none; border-radius:16px; padding:16px; font-weight:900; font-size:1em;
                      cursor:pointer; font-family:Georgia,serif; transition:all .25s; margin-bottom:10px; }
    .sl-forge-btn:hover { transform:scale(1.01); }
    .sl-reroll-btn  { width:100%; background:none; border:2px solid #1e293b; border-radius:14px;
                      padding:12px; font-weight:900; font-size:.82em; color:#64748b;
                      cursor:pointer; font-family:Georgia,serif; transition:all .2s; }
    .sl-reroll-btn:hover { border-color:#38bdf8; color:#38bdf8; }
  </style>
`;

window.slPickChar = (id) => { slotChar = id; window.goTo('slots'); };

window.slPull = () => {
  if (!slotChar) { window.showToast('Pick your star first!'); return; }
  slotResult = {
    loc:   rnd(SLOT_LOCATIONS),
    ride:  rnd(SLOT_RIDES),
    audio: rnd(SLOT_AUDIO),
    twist: rnd(TWISTS),
  };
  window.goTo('slots');
};

window.slForge = () => {
  if (!slotResult || !slotChar) return;
  const char = CAST.find(c => c.id === slotChar);
  const tpl  = rnd(SLOT_TEMPLATES);
  const prompt = tpl(
    `${char.name} (${char.soraId})`,
    slotResult.loc.label,
    slotResult.ride.label,
    slotResult.audio.label,
    slotResult.twist
  );
  window.forgeScene(prompt);
};

export const mount = () => {};
