// rooms/home.js — The farm landing page. Soul of North Forge.
// Wren's cutouts, real weather sky, stars, North peek, full vibrancy.

import { ROOMS }           from '../data.js';
import { NORTH_VERSION }   from '../north.js';
import { fetchForecast }   from '../api.js';

// ── CHARACTER CUTOUTS — only the 3 characters with actual photos ───────────────
const CUTOUT_CHARS = [
  { id:'luna',    name:'Luna',              photo:'/images/characters/Luna.png',              anim:'hop',   pos:'left:4%;bottom:6%',   size:'clamp(40px,5.8vw,79px)'  },
  { id:'eleanor', name:'Grand Ma Eleanor',  photo:'/images/characters/Grand-Ma%20Eleanor.png',anim:'still', pos:'right:19%;bottom:5%'  },
  { id:'salem',   name:'Salem',             photo:'/images/characters/Salem.png',             anim:'float', pos:'right:2%;bottom:4%'   },
];

const ANIM_MAP = {
  hop:   'lunaHop 4s ease-in-out infinite',
  float: 'salemFloat 5s ease-in-out infinite',
  still: 'none',
};

const cutoutHTML = (c) => `
  <div class="cutout" style="${c.pos};cursor:pointer;" onclick="goTo('cast')" title="${c.name}">
    <img src="${c.photo}" alt="${c.name}"
         style="width:${c.size||'clamp(55px,8vw,110px)'};height:auto;display:block;
                image-rendering:crisp-edges;
                filter:drop-shadow(3px 8px 14px rgba(0,0,0,0.85));
                animation:${ANIM_MAP[c.anim]};"/>
  </div>`;

// ── TODAY'S SHOT CALL ─────────────────────────────────────────────────────────
const SHOT_CALLS = [
  { t:[5,8],   icon:'🌅', plat:'Sora 2',   shot:"Ken Walker (@kennethwalker479) steps out of the Big Red Barn into early golden light. Tool belt on, coffee in hand. The farm breathes awake behind him. 9:16 Sora 2." },
  { t:[8,11],  icon:'☀️', plat:'Sora 2',   shot:"Randy \"Sarge\" (@geodudenj) loads gear into the truck outside the barn. Camo helmet, geode bag over shoulder, headlamp in hand. Morning prep before the caves. 9:16 Sora 2." },
  { t:[11,14], icon:'☀️', plat:'Kling AI', shot:"Marguerite (@prprincess138) working the farm garden mid-morning. Garden gloves, cast iron skillet on the porch behind her. Real hands doing real work. 9:16 Kling AI." },
  { t:[14,17], icon:'🌤️', plat:'Sora 2',   shot:"Salem (@kennethwa.majorbilli) in the barn loft, black notebook open, pearl necklace catching diffused afternoon light. The creative at work. 9:16 Sora 2." },
  { t:[17,20], icon:'🌇', plat:'Sora 2',   shot:"Golden hour over the back field. Luna (@kennethwa.luna) squeezes under a fence gap, gold bell collar catching the last sun. Ken Walker (@kennethwalker479) spots her from 20 feet back. 9:16 Sora 2." },
  { t:[20,24], icon:'🌙', plat:'Kling AI', shot:"Skully (@kennethwa.shadowblaz) at the edge of the Pine Barrens forest, night vision monocle raised. Something moves in the tree line. Trail cam catches it. 9:16 Kling AI." },
  { t:[0,5],   icon:'🌌', plat:'Grok Aurora', shot:"The Big Red Barn under a full sky. Stars over Pine Barron Farms, Piscataway NJ. BigTheSqua (@kennethwa.bigthesqua) watching the back field with binoculars. Trail camera nearby. 9:16 Aurora." },
];
let _activeShotIdx = 0;
const shotCallCard = (state) => {
  const h = new Date().getHours();
  const wx = (state.weather?.condition || '').toLowerCase();
  let idx = SHOT_CALLS.findIndex(s => h >= s.t[0] && h < s.t[1]);
  if (idx === -1) idx = 6;
  if (wx.includes('rain')) idx = 3; // rain → indoor/barn shot
  _activeShotIdx = idx;
  const s = SHOT_CALLS[idx];
  return `
    <div class="shot-card">
      <div class="shot-card-header">
        <span class="shot-card-icon">${s.icon}</span>
        <span class="shot-card-label">NORTH'S SHOT CALL</span>
        <span class="shot-card-plat">${s.plat}</span>
      </div>
      <div class="shot-card-text">${s.shot}</div>
      <button class="shot-card-btn" onclick="homeForgeShot()">→ Forge This Shot</button>
    </div>`;
};

// ── NORTH PEEK MESSAGES ──────────────────────────────────────────────────────
const NORTH_TIPS = [
  "Luna got out again. Third fence this week. I've stopped being surprised.",
  "Frost by Thursday — Marguerite already moved the seedlings. She always knows first.",
  "The loft light's been on since 2am. Some nights the work just doesn't stop.",
  "Piscataway sunsets hit different on a clear evening. You should have the camera ready.",
  "Eleanor remembers every inch of this farm back to the sixties. That's a scene waiting to happen.",
  "Randy found something in Cave #1 yesterday. He hasn't said what yet.",
  "Salem finished something new. She'll bury it if no one asks soon.",
  "This barn has more stories than we've filmed. Good problem to have.",
  "Ken's been at the workbench since before sunrise. Whatever it is, it's getting over-engineered.",
  "Full moon in two nights. The back field will look like something else entirely.",
  "I've been watching the light change over the Big Red Barn all week. Tuesday morning was the one.",
  "Tank found something buried near the chicken coop. Classic Tank.",
  "The Pine Barrens are 45 minutes south and Randy knows a path most people have never walked.",
  "BigTheSqua's been watching the east tree line every night this week. I don't ask anymore.",
  "There's a scene with Eleanor and a mason jar of sweet tea that I keep thinking about.",
];

let northTipTimer = null;
let cameoTimer    = null;
let currentTip = null;
let tipDismissed = false;

const getWeatherTip = (state) => {
  const wx = state.weather;
  if (!wx) return NORTH_TIPS[Math.floor(Math.random() * NORTH_TIPS.length)];
  const h    = new Date().getHours();
  const cond = wx.condition.toLowerCase();
  const temp = parseInt(wx.temp) || 50;
  const wind = parseInt(wx.wind) || 0;
  if (cond.includes('thunder'))  return "Thunder over the Barrens. Stay inside. North's already scripting it.";
  if (cond.includes('snow'))     return "Snow on the farm. Salem's already outside with the camera.";
  if (cond.includes('rain'))     return "Good rain on the barn roof. That's a KLING shot right there.";
  if (temp < 35)                 return `Frost warning — ${wx.temp} at Pine Barron. Protect the equipment.`;
  if (wind > 20)                 return `Wind at ${wx.wind}. Audio's gone. Go visual-only today.`;
  if (h >= 5  && h < 8)         return "Golden light soon. Ken better have the camera ready.";
  if (h >= 20 || h < 5)         return "Stars are out over the back field. Full moon means trail cam gold.";
  if (cond.includes('clear'))    return `Clear sky, ${wx.temp}. Perfect day to film the Big Red Barn exterior.`;
  if (cond.includes('overcast')) return "Overcast means diffused light — no harsh shadows. Great for cast shots.";
  return NORTH_TIPS[Math.floor(Math.random() * NORTH_TIPS.length)];
};

const goldenHour = (wx) => {
  if (!wx?.sunrise && !wx?.sunset) return null;
  const now     = Date.now();
  const rise    = wx.sunrise ? new Date(wx.sunrise).getTime() : null;
  const set     = wx.sunset  ? new Date(wx.sunset).getTime()  : null;
  const targets = [rise, set].filter(t => t && t > now - 30 * 60 * 1000);
  if (!targets.length) return null;
  const diff = Math.round((Math.min(...targets) - now) / 60000);
  if (diff < 0)  return { label:'Golden Hour NOW', urgent: true };
  if (diff < 60) return { label:`Golden Hour in ${diff}m`, urgent: true };
  const h = Math.floor(diff / 60), m = diff % 60;
  return { label:`Golden Hour in ${h}h ${m}m`, urgent: false };
};

export const render = (state) => {
  const wx      = state.weather;
  const hasKey  = state.keys.anthropic || state.keys.gemini;
  const user   = state.user;
  const isRain  = wx?.condition?.toLowerCase().includes('rain');
  const isSnow  = wx?.condition?.toLowerCase().includes('snow');
  const fc      = wx ? (window.getFilmingCondition?.(wx) ?? null) : null;
  const gh      = goldenHour(wx);
  const windNum = parseInt(wx?.wind) || 0;
  const tempNum = parseInt(wx?.temp) || 50;

  return `
    <div class="farm-wrap">

      <!-- ANIMATED SKY -->
      <div class="sky-scene">
        ${starField()}
        ${isRain  ? rainHTML()  : ''}
        ${isSnow  ? snowHTML()  : ''}
        ${seasonalParticles()}
      </div>

      <!-- NORTH PEEK TIP -->
      ${currentTip && !tipDismissed ? `
        <div class="north-tip-bar">
          <span class="north-tip-eye">🧠</span>
          <span class="north-tip-text">${currentTip}</span>
          <button class="north-tip-close" onclick="dismissFarmTip()">✕</button>
        </div>` : ''}

      <!-- BIG RED BARN SCENE -->
      <div class="barn-scene">
        <img class="barn-img" src="${barnPhoto(wx)}" alt="Big Red Barn"/>
        ${seasonalTint() ? `<div class="barn-tint" style="background:${seasonalTint()}"></div>` : ''}

        <!-- CHARACTER CUTOUTS — Luna, Eleanor, Salem -->
        ${CUTOUT_CHARS.map(c => cutoutHTML(c)).join('')}
      </div>

      <!-- FARM ALMANAC STRIP -->
      <div class="almanac-strip">
        ${wx ? `<span class="alm wx-pill">🌡️ ${wx.temp} · ${wx.condition}</span>` : ''}
        ${fc ? `<span class="alm" style="color:${fc.color};border-color:${fc.color}44">${fc.icon} ${fc.label}</span>` : ''}
        ${gh ? `<span class="alm" style="color:${gh.urgent?'#fbbf24':'#94a3b8'};border-color:${gh.urgent?'#f59e0b44':'#1e293b'}">${gh.label}</span>` : ''}
        ${windNum > 15 ? `<span class="alm" style="color:#f59e0b;border-color:#f59e0b44">💨 Wind ${wx.wind}</span>` : ''}
        ${tempNum < 35 ? `<span class="alm" style="color:#38bdf8;border-color:#38bdf844">❄ Frost Alert</span>` : ''}
        <span class="alm moon-pill">${state.moon.icon} ${state.moon.name}</span>
        <span class="alm loc-pill">📍 Piscataway NJ</span>
        <span class="alm">v${NORTH_VERSION.current}</span>
        ${user
          ? `<span class="alm user-pill">👤 ${user.displayName.split(' ')[0]}</span>`
          : `<span class="alm signin-pill" onclick="handleSignIn()">🔐 Sign In</span>`}
        ${!hasKey ? `<span class="alm warn-pill" onclick="goTo('setup')">⚠ Add API Key</span>` : ''}
      </div>

      <!-- TODAY'S SHOT CALL -->
      ${shotCallCard(state)}

      <!-- FILMING ALMANAC — 7-DAY FORECAST -->
      <div id="forecast-strip" class="fc-strip"></div>

      <!-- MOON PHASE -->
      <div class="moon-center">
        ${moonHTML(state.moon)}
        <div class="moon-label">${state.moon.icon} ${state.moon.name}</div>
      </div>

      <!-- NORTH WELCOME -->
      <div class="welcome-card">
        <div class="wel-avatar">🧠</div>
        <div class="wel-body">
          <div class="wel-label">North · From the Loft</div>
          <div class="wel-msg">
            The farm's all here. Ken's in the workshop, Marguerite's got something
            on the stove, Randy's underground, Salem's creating, Eleanor's watching
            everything from the porch. I've been up here thinking about the next shot.
            Pick a room — let's make something worth watching.
          </div>
        </div>
      </div>

      <!-- CREW STRIP -->
      <div class="crew-label">THE CREW</div>
      <div class="crew-strip">${crewStrip()}</div>

      <!-- ROOM GRID -->
      <div class="room-grid">
        ${ROOMS.map(r => `
          <button class="room-card" onclick="goTo('${r.id}')"
                  style="--rc:${r.color || '#38bdf8'};border-color:${r.color}44;">
            <div class="rc-emoji">${r.emoji}</div>
            <div class="rc-title">${r.title}</div>
            <div class="rc-desc">${r.desc}</div>
            <div class="rc-enter" style="color:${r.color};">ENTER →</div>
          </button>`).join('')}
      </div>

    </div>

    <style>
      /* ── FARM WRAP ──────────────────────────────────────────── */
      .farm-wrap { padding:0 0 36px; overflow-x:hidden; }

      /* ── SKY ────────────────────────────────────────────────── */
      .sky-scene { position:relative; height:0; overflow:visible; pointer-events:none; }
      .star { position:fixed; border-radius:50%; background:#fff;
                animation:twinkle var(--td,3s) var(--td2,0s) ease-in-out infinite; z-index:1; }
      @keyframes twinkle {
        0%,100% { opacity:var(--op,.3); transform:scale(1); }
        50%      { opacity:1;           transform:scale(1.4); } }

      .moon-center { text-align:center; padding:16px 0 18px;
                     border-bottom:1px solid #1e293b; margin-bottom:4px; }
      .moon-photo  { display:block; width:100px; height:100px; border-radius:50%;
                     object-fit:cover; margin:0 auto;
                     box-shadow:0 0 32px rgba(249,168,37,.6);
                     animation:moonPulse 6s ease-in-out infinite; }
      .moon-label  { font-size:.65em; font-weight:800; color:#fcd34d;
                     letter-spacing:2px; text-transform:uppercase; margin-top:9px; }
      @keyframes moonPulse {
        0%,100% { box-shadow:0 0 20px rgba(249,168,37,.4); }
        50%      { box-shadow:0 0 44px rgba(249,168,37,.75); } }
      @keyframes moonPulseFull {
        0%,100% { box-shadow:0 0 60px rgba(249,168,37,.9),0 0 110px rgba(249,168,37,.35); }
        50%      { box-shadow:0 0 90px rgba(249,168,37,1), 0 0 160px rgba(249,168,37,.55); } }

      /* ── RAIN / SNOW ────────────────────────────────────────── */
      .rain-drop { position:fixed; top:-20px; width:2px; border-radius:2px;
                    background:linear-gradient(#38bdf888,transparent);
                    animation:rainFall var(--rd,.7s) var(--rd2,0s) linear infinite; z-index:3; pointer-events:none; }
      @keyframes rainFall { to { transform:translateY(110vh); } }
      .snow-flake { position:fixed; top:-20px; color:#fff; font-size:.9em;
                     animation:snowFall var(--sd,4s) var(--sd2,0s) linear infinite; z-index:3; pointer-events:none; opacity:.7; }
      @keyframes snowFall { to { transform:translateY(110vh) rotate(360deg); } }
      .season-particle { position:fixed; top:-30px; pointer-events:none; z-index:3; opacity:0.85;
                          animation:seasonFall var(--sd,6s) var(--sd2,0s) linear infinite; }
      @keyframes seasonFall { to { transform:translateY(110vh) rotate(540deg); } }

      /* ── NORTH TIP ──────────────────────────────────────────── */
      .north-tip-bar { display:flex; align-items:center; gap:14px;
                        background:linear-gradient(135deg,rgba(2,132,199,0.18),rgba(14,165,233,0.08));
                        border-bottom:2px solid #38bdf844; border-top:2px solid #38bdf822;
                        padding:13px 22px; animation:tipSlide .4s ease-out; }
      @keyframes tipSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
      .north-tip-eye  { font-size:1.6em; flex-shrink:0;
                         animation:eyePulse 3s ease-in-out infinite; }
      @keyframes eyePulse { 0%,100%{filter:drop-shadow(0 0 4px #38bdf8)} 50%{filter:drop-shadow(0 0 14px #38bdf8)} }
      .north-tip-text { flex:1; color:#e0f2fe; font-size:.84em; font-weight:600; line-height:1.5; }
      .north-tip-close{ background:rgba(255,255,255,0.06); border:1px solid #334155;
                         border-radius:6px; color:#94a3b8; cursor:pointer;
                         font-size:1em; padding:4px 9px; flex-shrink:0; transition:all .2s; }
      .north-tip-close:hover { color:#fff; background:rgba(255,255,255,0.12); border-color:#475569; }

      /* ── BARN SCENE ─────────────────────────────────────────── */
      .barn-scene { position:relative; width:100%; max-width:700px;
                     margin:0 auto; padding-top:16px; }
      .barn-img    { width:100%; border-radius:18px 18px 0 0; display:block;
                     object-fit:cover; max-height:340px;
                     transition:opacity .8s ease; animation:barnFade .9s ease; }
      @keyframes barnFade { from{opacity:0} to{opacity:1} }
      .barn-tint   { position:absolute; top:16px; left:0; width:100%; height:calc(100% - 16px);
                     border-radius:18px 18px 0 0; pointer-events:none; opacity:0.22; }

      /* ── CUTOUTS ────────────────────────────────────────────── */
      .cutout { position:absolute; z-index:10; transition:transform .25s; }
      .cutout:hover { transform:scale(1.08) translateY(-3px); }

      @keyframes lunaHop {
        0%,100% { transform:translateY(0) rotate(-2deg); }
        30%     { transform:translateY(-8px) rotate(2deg); }
        60%     { transform:translateY(-3px) rotate(-1deg); } }

      @keyframes salemFloat {
        0%,100% { transform:translateY(0); }
        50%     { transform:translateY(-6px); } }


      /* ── SHOT CALL CARD ─────────────────────────────────────── */
      .shot-card { margin:12px 22px 4px; background:rgba(2,6,23,0.95);
                   border:2px solid #38bdf844; border-radius:16px; padding:16px 20px; }
      .shot-card-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
      .shot-card-icon   { font-size:1.4em; }
      .shot-card-label  { font-size:.56em; font-weight:900; color:#38bdf8;
                          letter-spacing:2px; text-transform:uppercase; flex:1; }
      .shot-card-plat   { font-size:.58em; font-weight:900; color:#64748b;
                          background:rgba(15,23,42,.9); border:1px solid #1e293b;
                          border-radius:8px; padding:3px 10px; }
      .shot-card-text   { font-size:.8em; color:#cbd5e1; line-height:1.65; margin-bottom:14px; }
      .shot-card-btn    { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                          border:none; border-radius:10px; padding:10px 20px; font-weight:900;
                          font-size:.74em; cursor:pointer; font-family:Georgia,serif;
                          transition:all .2s; box-shadow:0 4px 14px rgba(2,132,199,0.35); }
      .shot-card-btn:hover { transform:scale(1.03); box-shadow:0 6px 20px rgba(2,132,199,0.5); }

      /* ── ALMANAC ────────────────────────────────────────────── */
      .almanac-strip { display:flex; gap:8px; flex-wrap:wrap; padding:14px 22px 10px;
                        align-items:center; }
      .alm { font-size:.66em; font-weight:800; color:#94a3b8;
               background:rgba(15,23,42,0.85); border:1px solid #1e293b;
               border-radius:20px; padding:7px 15px; white-space:nowrap; }
      .wx-pill   { color:#7dd3fc; border-color:#0284c733; }
      .moon-pill { color:#fcd34d; border-color:#f59e0b33; }
      .loc-pill  { color:#86efac; border-color:#22c55e33; }
      .user-pill { color:#c4b5fd; border-color:#7c3aed33; }
      .warn-pill { color:#fbbf24; border-color:#f59e0b55; cursor:pointer; }
      .signin-pill{ color:#38bdf8; border-color:#38bdf844; cursor:pointer; font-weight:900; }

      /* ── FORECAST ───────────────────────────────────────────── */
      .fc-strip   { display:flex; gap:8px; overflow-x:auto; padding:10px 22px 0;
                     scrollbar-width:none; }
      .fc-strip::-webkit-scrollbar { display:none; }
      .fc-day     { display:flex; flex-direction:column; align-items:center; gap:3px;
                     background:rgba(15,23,42,0.85); border:1px solid #1e293b;
                     border-radius:14px; padding:10px 14px; flex-shrink:0; min-width:60px; }
      .fc-day-name{ font-size:.56em; font-weight:900; color:#64748b;
                     text-transform:uppercase; letter-spacing:1px; }
      .fc-icon    { font-size:1.3em; }
      .fc-high    { font-size:.66em; font-weight:900; color:#fff; }
      .fc-low     { font-size:.58em; color:#64748b; }

      /* ── WELCOME ────────────────────────────────────────────── */
      .welcome-card { display:flex; gap:16px; align-items:flex-start;
                       margin:10px 22px 22px;
                       background:rgba(14,165,233,0.07);
                       border:2px solid #38bdf833; border-radius:20px;
                       padding:20px 22px; }
      .wel-avatar { width:52px; height:52px; border-radius:50% 50% 50% 8px; flex-shrink:0;
                     background:linear-gradient(135deg,#0ea5e9,#0284c7);
                     display:flex; align-items:center; justify-content:center;
                     font-size:1.5em; box-shadow:0 0 24px rgba(56,189,248,0.45);
                     animation:northGlow 4s ease-in-out infinite; }
      @keyframes northGlow {
        0%,100% { box-shadow:0 0 18px rgba(56,189,248,.4); }
        50%      { box-shadow:0 0 44px rgba(56,189,248,.8); } }
      .wel-label { color:#38bdf8; font-size:.6em; font-weight:900;
                    letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }
      .wel-msg   { color:#cbd5e1; font-size:.88em; line-height:1.7; }

      /* ── CREW ───────────────────────────────────────────────── */
      .crew-label { font-size:.58em; font-weight:900; color:#64748b;
                     letter-spacing:2px; text-transform:uppercase;
                     padding:0 22px; margin-bottom:10px; }
      .crew-strip { display:flex; gap:12px; overflow-x:auto; padding:0 22px 10px;
                     margin-bottom:24px; scrollbar-width:none; }
      .crew-strip::-webkit-scrollbar { display:none; }
      .crew-chip  { display:flex; flex-direction:column; align-items:center; gap:5px;
                     background:rgba(15,23,42,0.85); border:2px solid #1e293b;
                     border-radius:14px; padding:12px 16px; cursor:pointer; flex-shrink:0;
                     min-width:80px; transition:all .2s; }
      .crew-chip:hover { border-color:#38bdf8; transform:translateY(-4px);
                          background:rgba(56,189,248,.08); }
      .crew-icon  { font-size:1.8em; }
      .crew-name  { font-size:.54em; font-weight:900; color:#94a3b8; white-space:nowrap; }

      /* ── ROOM GRID ──────────────────────────────────────────── */
      .room-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
                    gap:16px; padding:0 22px; }
      .room-card { background:rgba(15,23,42,0.9); border:2px solid #1e293b;
                    border-radius:20px; padding:22px; cursor:pointer; text-align:left;
                    width:100%; font-family:Georgia,serif; transition:all .25s;
                    border-color:var(--rc,#1e293b)22; }
      .room-card:hover { transform:translateY(-6px); border-color:var(--rc,#38bdf8);
                          box-shadow:0 20px 50px rgba(0,0,0,.6),
                          0 0 0 1px var(--rc,#38bdf8),
                          0 0 24px color-mix(in srgb,var(--rc,#38bdf8) 30%,transparent); }
      .rc-enter { font-size:.64em; font-weight:900; letter-spacing:2px;
                   transition:letter-spacing .2s; }
      .room-card:hover .rc-enter { letter-spacing:3px; }
      .rc-emoji { font-size:2.8em; margin-bottom:11px; }
      .rc-title { font-weight:900; font-size:1.05em; color:#fff; margin-bottom:6px; }
      .rc-desc  { color:#64748b; font-size:.76em; line-height:1.6; margin-bottom:12px; }
      .rc-enter { font-size:.64em; font-weight:900; letter-spacing:1px; }
    </style>
  `;
};

export const mount = (state) => {
  // Start North tip cycle
  if (northTipTimer) clearInterval(northTipTimer);
  tipDismissed = false;
  // First tip after 2 minutes of idle
  setTimeout(() => {
    if (state.tab === 'home') {
      currentTip = getWeatherTip(state);
      tipDismissed = false;
      if (typeof window.render === 'function') window.render();
    }
  }, 120000);
  // Then every 5 minutes
  northTipTimer = setInterval(() => {
    if (state.tab === 'home') {
      currentTip = getWeatherTip(state);
      tipDismissed = false;
      if (typeof window.render === 'function') window.render();
    }
  }, 300000);

  // 7-day forecast strip
  fetchForecast('Piscataway').then(days => {
    const strip = document.getElementById('forecast-strip');
    if (!strip || !days.length) return;
    strip.innerHTML = days.map(d => {
      const day = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short' });
      return `
        <div class="fc-day">
          <div class="fc-day-name">${day}</div>
          <div class="fc-icon">${d.icon}</div>
          <div class="fc-high">${d.high}°</div>
          <div class="fc-low">${d.low}°</div>
        </div>`;
    }).join('');
  });

  // Cameo appearances — bigfoot, UFO, jersey devil via naughty-layer
  const CAMEOS = [
    { src:'/images/cameos/ufo-hover.png',    cls:'anim-ufoHover',  w:80 },
    { src:'/images/cameos/bigfoot-run.png',  cls:'anim-sprintFast',w:60 },
    { src:'/images/cameos/jersey-devil.png', cls:'anim-peek',      w:55 },
  ];
  if (cameoTimer) clearInterval(cameoTimer);
  cameoTimer = setInterval(() => {
    if (state.tab !== 'home' || Math.random() > 0.45) return;
    const c  = CAMEOS[Math.floor(Math.random() * CAMEOS.length)];
    const el = document.createElement('img');
    el.src = c.src;
    el.className = `naughty-animal ${c.cls}`;
    el.style.cssText = `width:${c.w}px;height:auto;font-size:unset;`;
    document.getElementById('naughty-layer')?.appendChild(el);
    setTimeout(() => el.remove(), 5500);
  }, 28000);
};

window.homeForgeShot = () => {
  window.forgeScene(SHOT_CALLS[_activeShotIdx].shot);
};

window.dismissFarmTip = () => {
  tipDismissed = true;
  if (typeof window.render === 'function') window.render();
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const crewStrip = () => [
  {i:"👨\u200d🌾",n:"Ken"},
  {i:"👩🏽\u200d🌾",n:"Marguerite"},
  {i:"🪖", n:"Randy"},
  {i:"✨", n:"Salem"},
  {i:"🌑", n:"Shadowblaz"},
  {i:"🐕", n:"Bronzedogg"},
  {i:"🦍", n:"BigTheSqua"},
  {i:"👵", n:"Eleanor"},
].map(c=>`
  <div class="crew-chip" onclick="goTo('cast')">
    <div class="crew-icon">${c.i}</div>
    <div class="crew-name">${c.n}</div>
  </div>`).join('');

const starField = () => {
  const stars = [];
  for (let i=0; i<60; i++) {
    const x   = Math.random()*100;
    const y   = Math.random()*35;
    const sz  = (Math.random()*2+1).toFixed(1);
    const td  = (Math.random()*4+2).toFixed(1);
    const td2 = (Math.random()*5).toFixed(1);
    const op  = (Math.random()*.5+.2).toFixed(2);
    stars.push(`<div class="star" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;--td:${td}s;--td2:${td2}s;--op:${op};"></div>`);
  }
  return stars.join('');
};

const moonPhoto = (moon) => {
  const map = {
    'New Moon':'moon-new','Waxing Crescent':'moon-waxing-crescent',
    'First Quarter':'moon-first-quarter','Waxing Gibbous':'moon-waxing-gibbous',
    'Full Moon':'moon-full','Waning Gibbous':'moon-waning-gibbous',
    'Last Quarter':'moon-last-quarter','Waning Crescent':'moon-waning-crescent',
  };
  return `/images/moon/${map[moon.name] ?? 'moon-full'}.jpg`;
};
const moonHTML = (moon) => {
  const isFull = moon.name === 'Full Moon';
  const glowStyle = isFull
    ? 'box-shadow:0 0 60px rgba(249,168,37,0.95),0 0 120px rgba(249,168,37,0.4);animation:moonPulseFull 3s ease-in-out infinite;'
    : '';
  return `<img class="moon-photo" src="${moonPhoto(moon)}" alt="${moon.name}" title="${moon.name}" style="${glowStyle}"/>
    ${isFull ? `<div style="font-size:.58em;font-weight:900;color:#fbbf24;letter-spacing:2px;text-transform:uppercase;text-align:center;margin-top:6px;animation:eyePulse 2s ease-in-out infinite;">◉ FULL MOON TONIGHT</div>` : ''}`;
};

const rainHTML = () => {
  let drops = '';
  for (let i=0; i<40; i++) {
    const x  = Math.random()*100;
    const h  = Math.random()*18+8;
    const rd = (Math.random()*.5+.5).toFixed(2);
    const rd2= (Math.random()*1).toFixed(2);
    drops += `<div class="rain-drop" style="left:${x}%;height:${h}px;--rd:${rd}s;--rd2:${rd2}s;"></div>`;
  }
  return drops;
};

const snowHTML = () => {
  let flakes = '';
  for (let i=0; i<30; i++) {
    const x  = Math.random()*100;
    const sd = (Math.random()*4+3).toFixed(1);
    const sd2= (Math.random()*5).toFixed(1);
    flakes += `<div class="snow-flake" style="left:${x}%;--sd:${sd}s;--sd2:${sd2}s;">❄</div>`;
  }
  return flakes;
};

const barnPhoto = (wx) => {
  const h = new Date().getHours();
  const c = (wx?.condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('thunder') || c.includes('drizzle')) return '/images/barn/barn-rain.jpg';
  if (c.includes('snow'))                                                    return '/images/barn/barn-snow.jpg';
  if (h >= 21 || h < 6)                                                     return '/images/barn/barn-night.jpg';
  if ((h >= 5 && h < 9) || (h >= 17 && h < 21))                            return '/images/barn/barn-golden.jpg';
  if (c.includes('overcast') || c.includes('cloudy'))                       return '/images/barn/barn-cloudy.jpg';
  return '/images/barn/barn-clear.jpg';
};

// SEASONAL PARTICLES — emoji-based, no image files needed
const seasonalParticles = () => {
  const m = new Date().getMonth() + 1, d = new Date().getDate();
  let emojis = [];
  if (m === 3 || m === 4 || m === 5)            emojis = ['🌸','🌸','🌸','🌿','🦋','🌼'];
  else if (m === 10)                             emojis = ['🎃','🎃','🍂','🕷️','🦇','🍁'];
  else if (m === 11)                             emojis = ['🍂','🍁','🌽','🍂','🌾','🍁'];
  else if (m === 12)                             emojis = ['❄️','❄️','⭐','🎄','❄️','✨'];
  else if (m === 1 && d === 1)                   emojis = ['🎉','✨','🎊','⭐','🎆','🥂'];
  else if (m === 7 && d <= 7)                    emojis = ['🎆','🎇','🇺🇸','✨','🎆','⭐'];
  else if (m === 1 || m === 2)                   emojis = ['❄️','❄️','🌨️','❄️','🌨️','❄️'];
  if (!emojis.length) return '';
  let html = '';
  for (let i = 0; i < 18; i++) {
    const x   = Math.random() * 100;
    const sd  = (Math.random() * 5 + 4).toFixed(1);
    const sd2 = (Math.random() * 6).toFixed(1);
    const sz  = (Math.random() * 0.6 + 0.7).toFixed(2);
    const e   = emojis[Math.floor(Math.random() * emojis.length)];
    html += `<div class="season-particle" style="left:${x}%;--sd:${sd}s;--sd2:${sd2}s;font-size:${sz}em;">${e}</div>`;
  }
  return html;
};
const seasonalTint = () => {
  const m = new Date().getMonth() + 1;
  const d = new Date().getDate();
  if (m === 10)               return 'linear-gradient(135deg,#f97316,#7c3aed)'; // Halloween orange/purple
  if (m === 11)               return 'linear-gradient(135deg,#b45309,#d97706)'; // Thanksgiving amber
  if (m === 12)               return 'linear-gradient(135deg,#dc2626,#16a34a)'; // Christmas red/green
  if (m === 1  && d === 1)    return 'linear-gradient(135deg,#6366f1,#f59e0b)'; // New Year gold/indigo
  if (m === 7  && d <= 7)     return 'linear-gradient(135deg,#dc2626,#1d4ed8)'; // July 4 red/blue
  if (m === 3  || m === 4 || m === 5) return 'linear-gradient(135deg,#ec4899,#84cc16)'; // Spring pink/green
  if (m === 1  || m === 2)    return 'linear-gradient(135deg,#38bdf8,#e2e8f0)'; // Winter ice blue
  return null;
};

