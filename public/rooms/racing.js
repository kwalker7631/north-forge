// rooms/racing.js — Racing Garage
// Randy's need for speed. F1, Wall Stadium, Pine Barrens go-karts.

import { RACING_CARDS } from '../data.js';

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      Sarge's need for speed. F1 dreams, NJ dirt track reality, backyard go-karts.
      Tap any card to forge the scene with Randy behind the wheel.
    </div>

    <div class="rc-grid">
      ${RACING_CARDS.map((c, i) => `
        <div class="rc-card">
          <div class="rc-top">
            <div class="rc-number">${String(i + 1).padStart(2,'0')}</div>
            <div class="rc-flag">🏁</div>
          </div>
          <div class="rc-title">${c.title}</div>
          <div class="rc-desc">${c.desc}</div>
          <button class="rc-forge-btn" onclick="rcForge(${i})">🎬 Forge This Scene</button>
        </div>`).join('')}
    </div>

    <button class="rc-big-btn" onclick="rcQuickForge()">🏎️ FORGE A RANDOM RACE SCENE</button>

  </div>

  <style>
    .rc-grid      { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                    gap:14px; margin-bottom:24px; }
    .rc-card      { background:rgba(2,6,23,.95); border:2px solid #1e293b; border-radius:18px;
                    padding:22px; display:flex; flex-direction:column; gap:10px;
                    transition:all .2s; }
    .rc-card:hover{ border-color:#ef444466; transform:translateY(-2px); }
    .rc-top       { display:flex; justify-content:space-between; align-items:center; }
    .rc-number    { font-size:.6em; font-weight:900; color:#ef4444; letter-spacing:2px; font-family:monospace; }
    .rc-flag      { font-size:1.4em; }
    .rc-title     { font-weight:900; color:#fff; font-size:.95em; line-height:1.3; }
    .rc-desc      { color:#94a3b8; font-size:.76em; line-height:1.6; flex:1; }
    .rc-forge-btn { background:linear-gradient(135deg,#b91c1c,#ef4444); color:#fff; border:none;
                    border-radius:12px; padding:12px 18px; font-weight:900; font-size:.76em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .2s; margin-top:4px; }
    .rc-forge-btn:hover { transform:scale(1.03); }
    .rc-big-btn   { width:100%; background:linear-gradient(135deg,#991b1b,#ef4444); color:#fff;
                    border:none; border-radius:16px; padding:18px; font-weight:900; font-size:1em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .25s; letter-spacing:0.5px;
                    box-shadow:0 6px 28px rgba(239,68,68,.5),0 0 0 1px rgba(239,68,68,0.25); }
    .rc-big-btn:hover { transform:scale(1.02); filter:brightness(1.1); }
  </style>
`;

window.rcForge = (idx) => window.forgeScene(RACING_CARDS[idx].prompt);

window.rcQuickForge = () => {
  const rnd = RACING_CARDS[Math.floor(Math.random() * RACING_CARDS.length)];
  window.forgeScene(rnd.prompt);
};

export const mount = () => {};
