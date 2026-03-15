// rooms/home.js — Pine Barron Farms home screen
// Real weather drives real barn image. Wren's cutouts. Crew strip. Room grid.

import { ROOMS }         from '../data.js';
import { NORTH_VERSION } from '../north.js';

// ── WEATHER → BARN IMAGE MAPPING ─────────────────────────────────────────────
const getBarnImage = (weather) => {
  if (!weather) return './images/barn/barn-clear.jpg';
  const c = (weather.condition || '').toLowerCase();
  if (c.includes('snow'))                          return './images/barn/barn-snow.jpg';
  if (c.includes('rain') || c.includes('drizzle')) return './images/barn/barn-rain.jpg';
  if (c.includes('thunder'))                       return './images/barn/barn-rain.jpg';
  if (c.includes('overcast') || c.includes('cloudy')) return './images/barn/barn-cloudy.jpg';
  // time-based fallback for clear conditions
  const hr = new Date().getHours();
  if (hr >= 20 || hr < 6)  return './images/barn/barn-night.jpg';
  if (hr >= 17 && hr < 20) return './images/barn/barn-golden.jpg';
  return './images/barn/barn-clear.jpg';
};

const getWeatherOverlay = (weather) => {
  if (!weather) return '';
  const c = (weather.condition || '').toLowerCase();
  if (c.includes('snow'))   return 'snow';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return 'rain';
  return 'none';
};

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  const wx     = state.weather;
  const hasKey = state.keys.anthropic || state.keys.gemini;
  const user   = state.user;
  const barnImg = getBarnImage(wx);
  const fxType  = getWeatherOverlay(wx);

  return `
    <div class="home-wrap">

      <!-- BARN HERO -->
      <div class="barn-hero-wrap">
        <img src="${barnImg}" class="barn-hero-img" alt="Pine Barron Farms"
             onerror="this.src='./images/barn/barn-clear.jpg'"/>

        <!-- WEATHER PARTICLES -->
        ${fxType === 'snow' ? snowFX() : ''}
        ${fxType === 'rain' ? rainFX() : ''}

        <!-- WREN'S CUTOUTS -->
        <div class="cutout-stage">
          <img src="./images/characters/Luna.jpg"
               class="cutout cutout-luna" alt="Luna"
               onerror="this.style.display='none'"/>
          <img src="./images/characters/Salem.png"
               class="cutout cutout-salem" alt="Salem"
               onerror="this.style.display='none'"/>
          <img src="./images/characters/Grand-Ma_Eleanor.png"
               class="cutout cutout-eleanor" alt="Grand Ma Eleanor"
               onerror="this.style.display='none'"/>
        </div>

        <!-- WEATHER BADGE -->
        <div class="wx-badge">
          ${wx
            ? `${wxIcon(wx.condition)} ${wx.temp} · ${wx.condition} · ${wx.wind}`
            : `📍 Piscataway, NJ`}
        </div>

        <!-- NORTH LOFT PEEK -->
        <div class="loft-peek" onclick="goTo('chat')">
          <div class="loft-eye">🧠</div>
          <div class="loft-msg">${getNorthMsg(wx, hasKey)}</div>
        </div>
      </div>

      <!-- ALMANAC ROW -->
      <div class="almanac-row">
        <span class="almanac-pill">${state.moon.icon} ${state.moon.name}</span>
        <span class="almanac-pill">📍 Piscataway, NJ</span>
        <span class="almanac-pill">v${NORTH_VERSION.current}</span>
        ${user
          ? `<span class="almanac-pill" style="color:#22c55e;">✓ ${user.displayName.split(' ')[0]}</span>`
          : `<span class="almanac-pill signin" onclick="handleSignIn()">Sign in</span>`}
        ${!hasKey
          ? `<span class="almanac-pill warn" onclick="goTo('setup')">⚠ Add API Key</span>`
          : `<span class="almanac-pill" style="color:#22c55e;">● NORTH ONLINE</span>`}
      </div>

      <!-- CREW STRIP -->
      <div class="section-label">THE CREW</div>
      <div class="cast-strip">
        ${castStrip()}
      </div>

      <!-- ROOM GRID -->
      <div class="section-label">ROOMS</div>
      <div class="room-grid">
        ${ROOMS.map(r => `
          <button class="room-card" onclick="goTo('${r.id}')"
                  style="border-color:${r.color}33;">
            <div class="room-emoji">${r.emoji}</div>
            <div class="room-title">${r.title}</div>
            <div class="room-desc">${r.desc}</div>
            <div class="room-enter" style="color:${r.color};">ENTER →</div>
            ${r.id==='setup' && !hasKey
              ? `<div class="room-badge warn">⚠ Setup needed</div>` : ''}
            ${r.id==='setup' && hasKey
              ? `<div class="room-badge ok">✓ Connected</div>` : ''}
          </button>`).join('')}
      </div>

    </div>

    ${homeStyles()}
  `;
};

// ── NORTH MESSAGES ────────────────────────────────────────────────────────────
const getNorthMsg = (wx, hasKey) => {
  if (!hasKey) return "Add your API key in Setup and I'll get to work. 🔑";
  const hr = new Date().getHours();
  const msgs = {
    snow:    "Snow on the farm. Perfect day to stay in the barn and make something.",
    rain:    "Raining out there. Good light for moody scenes.",
    clear:   hr < 12
               ? "Morning on the farm. Good light coming in from the east."
               : hr < 17
                 ? "Afternoon at Pine Barron. What are we making today?"
                 : "Golden hour soon. Best light of the day.",
    night:   "Stars are out over the back field. I can see everything from up here.",
    default: "I'm up in the loft. Tell me what's on your mind.",
  };
  if (!wx) return msgs.default;
  const c = (wx.condition||'').toLowerCase();
  if (c.includes('snow'))  return msgs.snow;
  if (c.includes('rain') || c.includes('thunder')) return msgs.rain;
  const hr2 = new Date().getHours();
  if (hr2 >= 20 || hr2 < 6) return msgs.night;
  return msgs.clear;
};

// ── WEATHER ICON ──────────────────────────────────────────────────────────────
const wxIcon = (condition = '') => {
  const c = condition.toLowerCase();
  if (c.includes('snow'))    return '❄️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('cloudy') || c.includes('overcast')) return '☁️';
  if (c.includes('clear') || c.includes('sunny'))     return '☀️';
  return '🌤️';
};

// ── WEATHER FX ────────────────────────────────────────────────────────────────
const snowFX = () => {
  const flakes = Array.from({length:18}, (_,i) => {
    const left  = Math.random() * 100;
    const delay = Math.random() * 4;
    const dur   = 3 + Math.random() * 3;
    const size  = 0.6 + Math.random() * 0.8;
    return `<div class="flake" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${size}em;">❄️</div>`;
  });
  return `<div class="wx-fx">${flakes.join('')}</div>`;
};

const rainFX = () => {
  const drops = Array.from({length:24}, (_,i) => {
    const left  = Math.random() * 100;
    const delay = Math.random() * 2;
    const dur   = 0.6 + Math.random() * 0.5;
    return `<div class="drop" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;"></div>`;
  });
  return `<div class="wx-fx">${drops.join('')}</div>`;
};

// ── CAST STRIP ────────────────────────────────────────────────────────────────
const castStrip = () => {
  const crew = [
    { icon:'👨‍🌾', name:'Ken',       photo:null },
    { icon:'👩🏽‍🌾', name:'Marguerite',photo:null },
    { icon:'🪖',  name:'Randy',     photo:null },
    { icon:'✨',  name:'Salem',     photo:'./images/characters/Salem.png' },
    { icon:'🌑',  name:'Skully',    photo:null },
    { icon:'🐕',  name:'Tank',      photo:null },
    { icon:'🦍',  name:'BigTheSqua',photo:null },
    { icon:'👵',  name:'Eleanor',   photo:'./images/characters/Grand-Ma_Eleanor.png' },
    { icon:'🐐',  name:'Luna',      photo:'./images/characters/Luna.jpg' },
  ];
  return crew.map(c => `
    <div class="cast-chip" onclick="goTo('cast')">
      ${c.photo
        ? `<img src="${c.photo}" class="chip-photo" alt="${c.name}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
           <div class="chip-icon" style="display:none;">${c.icon}</div>`
        : `<div class="chip-icon">${c.icon}</div>`}
      <div class="cast-name">${c.name}</div>
    </div>`).join('');
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const homeStyles = () => `<style>
  .home-wrap { padding:0 0 36px; }

  /* BARN HERO */
  .barn-hero-wrap { position:relative; width:100%; height:42vh;
                    min-height:240px; max-height:400px; overflow:hidden;
                    margin-bottom:0; }
  .barn-hero-img  { width:100%; height:100%; object-fit:cover;
                    object-position:center 60%;
                    display:block; transition:opacity 1s ease; }

  /* WEATHER FX */
  .wx-fx  { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
  .flake  { position:absolute; top:-10%;
            animation:snowfall linear infinite; opacity:0.85; }
  .drop   { position:absolute; top:-5%; width:1px; height:14px;
            background:rgba(180,210,255,0.6); border-radius:2px;
            animation:rainfall linear infinite; }
  @keyframes snowfall { to { top:110%; transform:translateX(30px) rotate(360deg); } }
  @keyframes rainfall { to { top:110%; } }

  /* CUTOUTS */
  .cutout-stage   { position:absolute; bottom:0; left:0; right:0;
                    height:55%; pointer-events:none; }
  .cutout         { position:absolute; bottom:0; object-fit:contain;
                    filter:drop-shadow(2px 4px 12px rgba(0,0,0,0.6));
                    transition:transform .3s; }
  .cutout-luna    { left:4%;  height:45%; max-height:120px; }
  .cutout-salem   { left:28%; height:70%; max-height:180px; }
  .cutout-eleanor { right:5%; height:60%; max-height:155px; }

  /* WEATHER BADGE */
  .wx-badge { position:absolute; top:12px; left:14px;
              background:rgba(2,6,23,0.82); backdrop-filter:blur(8px);
              border:1px solid #38bdf833; border-radius:20px;
              padding:6px 14px; font-size:0.62em; color:#cbd5e1;
              font-weight:700; }

  /* LOFT PEEK */
  .loft-peek { position:absolute; top:12px; right:14px; cursor:pointer;
               background:rgba(2,6,23,0.88); backdrop-filter:blur(8px);
               border:2px solid #38bdf8; border-radius:16px;
               padding:10px 14px; max-width:200px;
               box-shadow:0 0 20px rgba(56,189,248,0.3);
               transition:all .25s; }
  .loft-peek:hover { transform:scale(1.03);
                     box-shadow:0 0 30px rgba(56,189,248,0.5); }
  .loft-eye { font-size:1.4em; margin-bottom:4px; }
  .loft-msg { font-size:0.62em; color:#bae6fd; line-height:1.5;
              font-weight:700; }

  /* ALMANAC */
  .almanac-row { display:flex; gap:8px; flex-wrap:wrap;
                 padding:12px 20px; background:rgba(2,6,23,0.95);
                 border-bottom:1px solid #1e293b; }
  .almanac-pill { font-size:0.6em; color:#475569; background:rgba(15,23,42,0.8);
                  border:1px solid #1e293b; border-radius:20px; padding:4px 10px;
                  font-weight:700; }
  .almanac-pill.warn   { color:#f59e0b; border-color:#f59e0b44; cursor:pointer; }
  .almanac-pill.signin { color:#38bdf8; border-color:#38bdf844; cursor:pointer; }

  /* SECTIONS */
  .section-label { font-size:0.55em; font-weight:900; color:#334155;
                   letter-spacing:2px; text-transform:uppercase;
                   padding:16px 20px 8px; }

  /* CAST STRIP */
  .cast-strip  { display:flex; gap:10px; overflow-x:auto;
                 padding:0 20px 10px; scrollbar-width:none; }
  .cast-chip   { display:flex; flex-direction:column; align-items:center;
                 gap:5px; background:rgba(15,23,42,0.8);
                 border:1px solid #1e293b; border-radius:14px;
                 padding:10px 12px; cursor:pointer; flex-shrink:0;
                 transition:all .2s; min-width:68px; }
  .cast-chip:hover { border-color:#38bdf8; transform:translateY(-3px); }
  .chip-photo  { width:44px; height:44px; border-radius:10px;
                 object-fit:cover; object-position:top; }
  .chip-icon   { width:44px; height:44px; border-radius:10px;
                 background:rgba(56,189,248,0.08);
                 display:flex; align-items:center; justify-content:center;
                 font-size:1.6em; }
  .cast-name   { font-size:0.52em; font-weight:900; color:#94a3b8;
                 white-space:nowrap; }

  /* ROOM GRID */
  .room-grid { display:grid;
               grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
               gap:12px; padding:0 20px; }
  .room-card { background:rgba(15,23,42,0.8); border:1px solid #1e293b;
               border-radius:18px; padding:20px; cursor:pointer;
               text-align:left; transition:all .25s; width:100%;
               font-family:Georgia,serif; }
  .room-card:hover { transform:translateY(-4px);
                     box-shadow:0 14px 35px rgba(0,0,0,0.5);
                     border-color:#38bdf8; }
  .room-emoji { font-size:2.4em; margin-bottom:8px; }
  .room-title { font-weight:900; font-size:0.95em; color:#fff; margin-bottom:4px; }
  .room-desc  { color:#64748b; font-size:0.7em; line-height:1.55;
                margin-bottom:8px; }
  .room-enter { font-size:0.6em; font-weight:900; letter-spacing:1px; }
  .room-badge { margin-top:8px; border-radius:8px; padding:3px 9px;
                font-size:0.56em; font-weight:900; display:inline-block; }
  .room-badge.warn { background:rgba(245,158,11,0.12);
                     border:1px solid #f59e0b44; color:#f59e0b; }
  .room-badge.ok   { background:rgba(34,197,94,0.1);
                     border:1px solid #22c55e33; color:#22c55e; }
</style>`;

export const mount = () => {};
