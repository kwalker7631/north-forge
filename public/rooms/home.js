// rooms/home.js — The farm landing page. Soul of North Forge.
// Wren's cutouts, real weather sky, stars, North peek, full vibrancy.

import { ROOMS }        from '../data.js';
import { NORTH_VERSION } from '../north.js';

// ── CHARACTER CUTOUTS (Wren's artwork) ───────────────────────────────────────
const LUNA_IMG    = "/images/characters/Luna.png";
const ELEANOR_IMG = "/images/characters/Grand-Ma%20Eleanor.png";
const SALEM_IMG   = "/images/characters/Salem.png";

// ── NORTH PEEK MESSAGES ──────────────────────────────────────────────────────
const NORTH_TIPS = [
  "Luna escaped the coop again. Third time this week. Randy filmed it.",
  "Farmer's Almanac says frost by Thursday. Marguerite's already on it.",
  "The loft light has been on all night. North's been busy up there.",
  "Real talk — Piscataway sunsets hit different when you film them vertical.",
  "Eleanor wants a scene from the 1960s farm. She remembers everything.",
  "Weird NJ tip: the Pine Barrens are 45 mins south. Randy knows a path.",
  "Salem just finished something in the studio. Go look before she hides it.",
  "The Big Red Barn has stories. Ask North to dig one out.",
  "Ken's been in the workbench since 6am. Something's getting over-engineered.",
  "Moon's almost full. Best night this week to film something outdoors.",
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
      <svg width="0" height="0" style="position:absolute;overflow:hidden;">
        <defs>
          <filter id="north-remove-white" color-interpolation-filters="sRGB">
            <feColorMatrix type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                     -4 -4 -4 1 10"/>
          </filter>
        </defs>
      </svg>
      <div class="barn-scene">
        <img class="barn-img" src="${barnPhoto(wx)}" alt="Big Red Barn"/>
        ${seasonalOverlay() ? `<img class="barn-overlay" src="${seasonalOverlay()}" alt=""/>` : ''}

        <!-- WREN'S CHARACTER CUTOUTS -->
        <div class="cutout luna-cutout" title="Luna the Goat">
          <img src="${LUNA_IMG}" alt="Luna"/>
          <div class="cutout-glow luna-glow"></div>
        </div>
        <div class="cutout eleanor-cutout" title="Grand Ma Eleanor" onclick="goTo('cast')">
          <img src="${ELEANOR_IMG}" alt="Grand Ma Eleanor"/>
        </div>
        <div class="cutout salem-cutout" title="Salem" onclick="goTo('cast')">
          <img src="${SALEM_IMG}" alt="Salem"/>
        </div>
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
            Hey — welcome to the farm. The door's always open.
            Ken's tinkering, Marguerite's cooking, Randy's underground,
            Salem's creating, Eleanor's watching everything.
            Pick a room and let's make something worth watching.
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
      .north-tip-close{ background:none; border:none; color:#475569; cursor:pointer;
                         font-size:1.1em; padding:4px 8px; flex-shrink:0; }
      .north-tip-close:hover { color:#fff; }

      /* ── BARN SCENE ─────────────────────────────────────────── */
      .barn-scene { position:relative; width:100%; max-width:700px;
                     margin:0 auto; padding-top:16px; }
      .barn-img    { width:100%; border-radius:18px 18px 0 0; display:block;
                     object-fit:cover; max-height:340px; }
      .barn-overlay{ position:absolute; top:16px; left:0; width:100%; height:calc(100% - 16px);
                     object-fit:cover; border-radius:18px 18px 0 0; pointer-events:none;
                     filter:url(#north-remove-white); opacity:0.9; }

      /* ── CUTOUTS ────────────────────────────────────────────── */
      .cutout { position:absolute; bottom:8%; z-index:10; }
      .cutout img { display:block; height:auto; image-rendering:crisp-edges;
                     filter:drop-shadow(3px 6px 12px rgba(0,0,0,0.7)); }

      .luna-cutout { left:4%; bottom:6%; }
      .luna-cutout img { width:clamp(70px,12vw,140px);
                          animation:lunaHop 4s ease-in-out infinite; }
      @keyframes lunaHop {
        0%,100% { transform:translateY(0) rotate(-2deg); }
        30%     { transform:translateY(-10px) rotate(2deg); }
        60%     { transform:translateY(-4px) rotate(-1deg); } }

      .eleanor-cutout { right:2%; bottom:4%; cursor:pointer; }
      .eleanor-cutout img { width:clamp(60px,10vw,120px);
                             transition:transform .3s; }
      .eleanor-cutout:hover img { transform:scale(1.06) translateY(-4px); }

      .salem-cutout { right:18%; bottom:5%; cursor:pointer; }
      .salem-cutout img { width:clamp(55px,9vw,110px);
                           animation:salemFloat 5s ease-in-out infinite; }
      @keyframes salemFloat {
        0%,100% { transform:translateY(0); filter:drop-shadow(3px 6px 12px rgba(0,0,0,0.7)); }
        50%     { transform:translateY(-7px); filter:drop-shadow(3px 14px 18px rgba(168,85,247,0.5)); } }

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
      .crew-label { font-size:.58em; font-weight:900; color:#334155;
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
                    width:100%; font-family:Georgia,serif; transition:all .25s; }
      .room-card:hover { transform:translateY(-5px); border-color:#38bdf8;
                          box-shadow:0 18px 44px rgba(0,0,0,.55), 0 0 0 1px var(--rc); }
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
const moonHTML = (moon) =>
  `<img class="moon-photo" src="${moonPhoto(moon)}" alt="${moon.name}" title="${moon.name}"/>`;

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
const seasonalOverlay = () => {
  const m = new Date().getMonth() + 1;
  const d = new Date().getDate();
  if (m === 10)                        return '/images/overlays/overlay-halloween.png';
  if (m === 11)                        return '/images/overlays/overlay-thanksgiving.png';
  if (m === 12)                        return '/images/overlays/overlay-christmas.png';
  if (m === 1  && d === 1)             return '/images/overlays/overlay-newyear..png';
  if (m === 7  && d <= 7)              return '/images/overlays/overlay-july4.png';
  if (m === 3  || m === 4 || m === 5)  return '/images/overlays/overlay-spring.png';
  if (m === 1  || m === 2)             return '/images/overlays/overlay-winter.png';
  return null;
};

