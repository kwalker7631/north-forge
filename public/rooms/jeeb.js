// rooms/jeeb.js — The Jeeb
// The psychedelic, dreamlike side of Pine Barron Farms.

import { JEEB_CARDS } from '../data.js';

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      The Jeeb. The dreamcore frequency that lives in the Pine Barrens at night.
      Everything is slightly wrong in the best way. Tap a card to go there.
    </div>

    <div class="jb-grid">
      ${JEEB_CARDS.map((c, i) => `
        <div class="jb-card" onclick="jeebForge(${i})">
          <div class="jb-glow"></div>
          <div class="jb-title">${c.title}</div>
          <div class="jb-desc">${c.desc}</div>
          <div class="jb-hint">🍄 Enter The Jeeb ↗</div>
        </div>`).join('')}
    </div>

    <button class="jb-big-btn" onclick="jeebQuickForge()">🍄 FORGE A JEEB SCENE</button>

  </div>

  <style>
    .jb-grid      { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
                    gap:14px; margin-bottom:24px; }
    .jb-card      { background:rgba(2,6,23,.95); border:2px solid #7c3aed44; border-radius:20px;
                    padding:24px 20px; cursor:pointer; transition:all .25s; position:relative;
                    overflow:hidden; }
    .jb-card:hover{ border-color:#c084fc88; transform:translateY(-3px);
                    box-shadow:0 8px 32px rgba(192,132,252,.15); }
    .jb-glow      { position:absolute; top:-20px; right:-20px; width:80px; height:80px;
                    background:radial-gradient(circle,rgba(192,132,252,.15),transparent 70%);
                    border-radius:50%; pointer-events:none; }
    .jb-title     { font-weight:900; color:#e9d5ff; font-size:.95em; margin-bottom:8px;
                    position:relative; }
    .jb-desc      { color:#94a3b8; font-size:.76em; line-height:1.6; margin-bottom:14px;
                    position:relative; }
    .jb-hint      { font-size:.62em; color:#c084fc; font-weight:900; position:relative; }
    .jb-big-btn   { width:100%; background:linear-gradient(135deg,#6d28d9,#c084fc); color:#fff;
                    border:none; border-radius:16px; padding:18px; font-weight:900; font-size:1em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .25s;
                    box-shadow:0 6px 24px rgba(192,132,252,.3); }
    .jb-big-btn:hover { transform:scale(1.01); }
  </style>
`;

window.jeebForge = (idx) => window.forgeScene(JEEB_CARDS[idx].prompt);

window.jeebQuickForge = () => {
  const rnd = JEEB_CARDS[Math.floor(Math.random() * JEEB_CARDS.length)];
  window.forgeScene(rnd.prompt);
};

export const mount = () => {};
