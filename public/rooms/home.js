					 // rooms/home.js — The farm landing page. The soul of North Forge.
// The Big Red Barn lives here. North's welcome lives here.
// Animals live here. This is the first thing Ken and Wren see.

import { ROOMS }        from '../data.js';
import { NORTH_VERSION } from '../north.js';

export const render = (state) => {
  const wx      = state.weather;
  const hasKey  = state.keys.anthropic || state.keys.gemini;
  const user    = state.user;

  return `
    <div class="room-wrap">

      <!-- BIG RED BARN HERO -->
      <div class="barn-hero">
        ${barnSVG()}
      </div>

      <!-- NORTH WELCOME CARD -->
      <div class="welcome-card">
        <div class="welcome-avatar">🧠</div>
        <div class="welcome-body">
          <div class="welcome-label">North · From the Loft</div>
          <div class="welcome-msg">
            Hey — welcome to the farm. Everything's running.
            Pick a room below and let's make something.
            ${!hasKey
              ? `<span class="warn-inline"> Start with 🔑 <strong>Setup</strong> so I can actually respond.</span>`
              : ''}
          </div>
          <div class="almanac-row">
            ${wx ? `<span class="almanac-pill">🌡️ ${wx.temp} · ${wx.condition}</span>` : ''}
            <span class="almanac-pill">${state.moon.icon} ${state.moon.name}</span>
            <span class="almanac-pill">📍 Piscataway, NJ</span>
            <span class="almanac-pill">v${NORTH_VERSION.current}</span>
            ${user
              ? `<span class="almanac-pill">👤 ${user.displayName.split(' ')[0]}</span>`
              : `<span class="almanac-pill signin-pill" onclick="handleSignIn()">Sign in with Google</span>`}
          </div>
        </div>
      </div>

      <!-- CAST ROW -->
      <div class="cast-strip-label">THE CREW</div>
      <div class="cast-strip">
        ${castStrip()}
      </div>

      <!-- ROOM GRID -->
      <div class="room-grid">
        ${ROOMS.map(r => `
          <button class="room-card" onclick="goTo('${r.id}')"
                  style="border-color:${r.color}33;">
            <div class="room-emoji">${r.emoji}</div>
            <div class="room-title">${r.title}</div>
            <div class="room-desc">${r.desc}</div>
            <div class="room-enter" style="color:${r.color};">TAP TO ENTER →</div>
            ${r.id === 'setup' && !hasKey
              ? `<div class="room-badge warn">⚠ Setup needed</div>`  : ''}
            ${r.id === 'setup' && hasKey
              ? `<div class="room-badge ok">✓ Connected</div>` : ''}
          </button>
        `).join('')}
      </div>

    </div>

    <style>
      /* ── BARN HERO ──────────────────────────────────────────────── */
      .barn-hero { width:100%; max-width:520px; margin:0 auto 24px;
                   filter:drop-shadow(0 4px 30px rgba(239,68,68,0.2)); }

      /* ── WELCOME CARD ───────────────────────────────────────────── */
      .welcome-card { display:flex; gap:14px; align-items:flex-start;
                      margin-bottom:22px; background:rgba(14,165,233,0.06);
                      border:1px solid #38bdf822; border-radius:18px;
                      padding:18px 20px; }
      .welcome-avatar { width:48px; height:48px; border-radius:50% 50% 50% 8px;
                        background:linear-gradient(135deg,#0ea5e9,#0284c7);
                        display:flex; align-items:center; justify-content:center;
                        font-size:1.4em; flex-shrink:0;
                        box-shadow:0 0 20px rgba(56,189,248,0.4); }
      .welcome-label { color:#38bdf8; font-size:0.6em; font-weight:900;
                       letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
      .welcome-msg   { color:#cbd5e1; font-size:0.86em; line-height:1.65; }
      .warn-inline   { color:#f59e0b; }
      .almanac-row   { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .almanac-pill  { font-size:0.6em; color:#475569; background:rgba(15,23,42,0.8);
                       border:1px solid #1e293b; border-radius:20px; padding:3px 9px; }
      .signin-pill   { color:#38bdf8 !important; border-color:#38bdf844 !important;
                       cursor:pointer; }
      .signin-pill:hover { background:rgba(56,189,248,0.1) !important; }

      /* ── CAST STRIP ─────────────────────────────────────────────── */
      .cast-strip-label { font-size:0.55em; font-weight:900; color:#334155;
                          letter-spacing:2px; text-transform:uppercase;
                          margin-bottom:8px; }
      .cast-strip  { display:flex; gap:10px; overflow-x:auto;
                     padding-bottom:8px; margin-bottom:22px;
                     scrollbar-width:none; }
      .cast-chip   { display:flex; flex-direction:column; align-items:center;
                     gap:4px; background:rgba(15,23,42,0.8);
                     border:1px solid #1e293b; border-radius:12px;
                     padding:10px 14px; cursor:pointer; flex-shrink:0;
                     transition:all 0.2s; min-width:72px; }
      .cast-chip:hover { border-color:#38bdf8; transform:translateY(-3px); }
      .cast-icon   { font-size:1.6em; }
      .cast-name   { font-size:0.52em; font-weight:900; color:#94a3b8;
                     white-space:nowrap; }

      /* ── ROOM GRID ──────────────────────────────────────────────── */
      .room-grid   { display:grid;
                     grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
                     gap:14px; }
      .room-card   { background:rgba(15,23,42,0.8); border:1px solid #1e293b;
                     border-radius:18px; padding:22px; cursor:pointer;
                     text-align:left; transition:all 0.25s; width:100%;
                     font-family:Georgia,serif; }
      .room-card:hover { transform:translateY(-5px);
                         box-shadow:0 16px 40px rgba(0,0,0,0.5);
                         border-color:#38bdf8; }
      .room-emoji  { font-size:2.6em; margin-bottom:10px;
                     filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
      .room-title  { font-weight:900; font-size:1em; color:#fff; margin-bottom:5px; }
      .room-desc   { color:#64748b; font-size:0.73em; line-height:1.55;
                     margin-bottom:10px; }
      .room-enter  { font-size:0.62em; font-weight:900; letter-spacing:1px; }
      .room-badge  { margin-top:8px; border-radius:8px; padding:4px 10px;
                     font-size:0.58em; font-weight:900; display:inline-block; }
      .room-badge.warn { background:rgba(245,158,11,0.12);
                         border:1px solid #f59e0b44; color:#f59e0b; }
      .room-badge.ok   { background:rgba(34,197,94,0.1);
                         border:1px solid #22c55e33; color:#22c55e; }
    </style>
  `;
};

// ── CAST STRIP ────────────────────────────────────────────────────────────────
const castStrip = () => {
  const crew = [
    { icon:"👨‍🌾", name:"Ken",      tab:"cast" },
    { icon:"👩🏽‍🌾", name:"Marguerite",tab:"cast" },
    { icon:"🪖",  name:"Randy",    tab:"cast" },
    { icon:"✨",  name:"Salem",    tab:"cast" },
    { icon:"🌑",  name:"Shadowblaz",tab:"cast"},
    { icon:"🐕",  name:"Bronzedogg",tab:"cast"},
    { icon:"🦍",  name:"BigTheSqua",tab:"cast"},
    { icon:"👵",  name:"Eleanor",  tab:"cast" },
  ];
  return crew.map(c => `
    <div class="cast-chip" onclick="goTo('${c.tab}')">
      <div class="cast-icon">${c.icon}</div>
      <div class="cast-name">${c.name}</div>
    </div>
  `).join('');
};

// ── BIG RED BARN SVG ──────────────────────────────────────────────────────────
const barnSVG = () => `
  <svg viewBox="-2 -25 434 262" fill="none" style="width:100%;height:auto;">
    <defs><style>
      @keyframes barnWheelSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes vaneSway { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(14deg)} }
      @keyframes northScan { 0%,100%{fill:#38bdf8} 40%{fill:#7dd3fc} 70%{fill:#0ea5e9} }
      .barn-wheel { transform-box:fill-box; transform-origin:center;
                    animation:barnWheelSpin 5s linear infinite; }
      .barn-vane  { transform-box:fill-box; transform-origin:2px 0px;
                    animation:vaneSway 3.5s ease-in-out infinite; }
      .north-iris { animation:northScan 4s ease-in-out infinite; }
    </style></defs>

    <!-- WINDMILL TOWER -->
    <line x1="5"  y1="226" x2="19" y2="108" stroke="#7a6040" stroke-width="2.2" opacity="0.85"/>
    <line x1="39" y1="226" x2="25" y2="108" stroke="#7a6040" stroke-width="2.2" opacity="0.85"/>
    <line x1="8"  y1="215" x2="36" y2="200" stroke="#6a5030" stroke-width="1.1" opacity="0.7"/>
    <line x1="36" y1="215" x2="8"  y2="200" stroke="#6a5030" stroke-width="1.1" opacity="0.7"/>
    <line x1="10" y1="190" x2="34" y2="175" stroke="#6a5030" stroke-width="1"   opacity="0.7"/>
    <line x1="34" y1="190" x2="10" y2="175" stroke="#6a5030" stroke-width="1"   opacity="0.7"/>
    <ellipse cx="22" cy="226" rx="17" ry="5" fill="#1a3a5c" stroke="#2a5a80" stroke-width="1.2" opacity="0.8"/>
    <circle cx="22" cy="108" r="5" fill="#9a8060" opacity="0.95"/>

    <!-- SPINNING WHEEL -->
    <g transform="translate(22,108)">
      <g class="barn-wheel">
        <path d="M0 0 L-3-32 L3-32 Z"    fill="#a08860" opacity="0.9"/>
        <path d="M0 0 L32-3  L32 3   Z"  fill="#a08860" opacity="0.9"/>
        <path d="M0 0 L-3 32 L3 32   Z"  fill="#a08860" opacity="0.9"/>
        <path d="M0 0 L-32 3  L-32-3 Z"  fill="#a08860" opacity="0.9"/>
        <path d="M0 0 L18-26 L22-22 Z"   fill="#a08860" opacity="0.75"/>
        <path d="M0 0 L26 18 L22 22  Z"  fill="#a08860" opacity="0.75"/>
        <path d="M0 0 L-18 26 L-22 22 Z" fill="#a08860" opacity="0.75"/>
        <path d="M0 0 L-26-18 L-22-22 Z" fill="#a08860" opacity="0.75"/>
        <circle cx="0" cy="0" r="32" fill="none" stroke="#8a7050" stroke-width="1.5" opacity="0.5"/>
        <circle cx="0" cy="0" r="4"  fill="#7a6040"/>
      </g>
    </g>
    <path d="M 26 108 L 60 95 L 60 122 Z" fill="#6a5030" opacity="0.7"/>

    <!-- PINE TREES -->
    <path d="M 5 225 L 30 140 L 55 225 Z"    fill="#061608" opacity="0.75"/>
    <path d="M 345 225 L 375 135 L 405 225 Z" fill="#061608" opacity="0.75"/>

    <!-- SILO -->
    <ellipse cx="392" cy="227" rx="28" ry="5.5" fill="#000" opacity="0.22"/>
    <rect x="366" y="32" width="54" height="195" fill="#c0b8a8" stroke="#9a9288" stroke-width="2"/>
    <path d="M 366 32 Q 354 130 366 227" fill="#a0988a"/>
    <path d="M 420 32 Q 432 130 420 227" fill="#dcd4c4"/>
    <path d="M 361 34 Q 393 -10 425 34 Z" fill="#888078" stroke="#787068" stroke-width="2"/>
    <ellipse cx="393" cy="34" rx="30" ry="7" fill="#989088" stroke="#787068" stroke-width="1.5"/>
    <rect x="389" y="-14" width="8" height="16" rx="2" fill="#686058"/>
    <line x1="415" y1="48"  x2="415" y2="222" stroke="#787068" stroke-width="1.6" opacity="0.8"/>
    <line x1="420" y1="48"  x2="420" y2="222" stroke="#787068" stroke-width="1.6" opacity="0.8"/>

    <!-- MAIN BARN -->
    <rect x="55" y="95" width="230" height="125" fill="#991b1b" stroke="#450a0a" stroke-width="2.5"/>
    <polygon points="45,97 170,22 295,97" fill="#7f1d1d" stroke="#450a0a" stroke-width="3"/>

    <!-- WIND VANE -->
    <line x1="170" y1="22" x2="170" y2="4" stroke="#c4901a" stroke-width="2"/>
    <circle cx="170" cy="4" r="2.5" fill="#d4a017"/>
    <g transform="translate(170,11)">
      <g class="barn-vane">
        <polygon points="0,-6 3,0 0,-2 -3,0" fill="#d4a017"/>
        <path d="M0-2 L-6 5 L-3 3 L-6 8 L0 4 L6 8 L3 3 L6 5 Z" fill="#c4901a"/>
      </g>
    </g>

    <!-- NORTH'S LOFT WINDOW -->
    <rect x="143" y="57" width="54" height="37" rx="4" fill="#020617" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="170" cy="75" r="12" fill="#061228" opacity="0.9"/>
    <circle cx="170" cy="75" r="6"  fill="#38bdf8" class="north-iris"/>
    <circle cx="170" cy="75" r="2.5" fill="#010a18"/>
    <circle cx="172" cy="72" r="1.2" fill="#fff" opacity="0.75"/>
    <rect x="145" y="46" width="50" height="13" rx="3" fill="#010c1e" stroke="#38bdf833" stroke-width="1"/>
    <text x="170" y="56.5" text-anchor="middle" font-size="7" font-weight="900"
          font-family="Georgia,serif" fill="#38bdf8" letter-spacing="2">NORTH</text>

    <!-- BARN DOORS -->
    <rect x="132" y="152" width="76" height="68" fill="#450a0a"/>
    <line x1="132" y1="152" x2="208" y2="220" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="208" y1="152" x2="132" y2="220" stroke="#7f1d1d" stroke-width="1.5"/>

    <!-- BARN SIGN -->
    <rect x="112" y="134" width="116" height="17" rx="3" fill="#2a0606" stroke="#7a1a1a" stroke-width="1.5"/>
    <text x="170" y="146" text-anchor="middle" font-size="8.5" font-weight="900"
          font-family="Georgia,serif" fill="#fca5a5" letter-spacing="1.2">BIG RED BARN</text>

    <!-- SHED -->
    <rect x="305" y="158" width="95" height="62" fill="#78350f" stroke="#451a03" stroke-width="2"/>
    <polygon points="300,158 352,127 404,158" fill="#451a03"/>

    <!-- LUNA THE GOAT -->
    <ellipse cx="90" cy="213" rx="19" ry="10" fill="#e8ddc8" stroke="#b8a880" stroke-width="1"/>
    <path d="M 106 209 Q 110 205 111 200" stroke="#e8ddc8" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="113" cy="198" rx="9" ry="7" fill="#e8ddc8" stroke="#b8a880" stroke-width="1"/>
    <circle cx="115" cy="197" r="2" fill="#2d1a08"/>
    <circle cx="115" cy="197" r="0.8" fill="#fff" opacity="0.6"/>
    <ellipse cx="121" cy="203" rx="3" ry="2" fill="#d4a098"/>
    <line x1="78"  y1="222" x2="76"  y2="231" stroke="#b8a880" stroke-width="2.8" stroke-linecap="round"/>
    <line x1="87"  y1="223" x2="86"  y2="231" stroke="#b8a880" stroke-width="2.8" stroke-linecap="round"/>
    <line x1="97"  y1="223" x2="97"  y2="231" stroke="#b8a880" stroke-width="2.8" stroke-linecap="round"/>
    <line x1="106" y1="221" x2="107" y2="231" stroke="#b8a880" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M 107 204 Q 114 209 119 205" stroke="#d97706" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <rect x="104" y="215" width="18" height="10" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
    <text x="113" y="222.5" text-anchor="middle" font-size="5.5" font-weight="900"
          font-family="Georgia,serif" fill="#92400e" letter-spacing="0.5">LUNA</text>

    <!-- GROUND -->
    <rect x="0" y="225" width="420" height="12" fill="#2d6a4f" opacity="0.7" rx="2"/>
  </svg>
`;