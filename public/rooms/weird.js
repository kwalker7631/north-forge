// rooms/weird.js — Weird NJ
// Jersey Devil. Clinton Road. Action Park. The strange truth of NJ.

import { WEIRD_CARDS } from '../data.js';

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      300 years of strange. Jersey legends, haunted roads, drowned towns, and Action Park —
      the most dangerous amusement park in American history. All real NJ.
    </div>

    <div class="wn-grid">
      ${WEIRD_CARDS.map((c, i) => `
        <div class="wn-card" style="border-color:${c.color}33;">
          <div class="wn-cat" style="color:${c.color};">${c.cat}</div>
          <div class="wn-title">${c.title}</div>
          <div class="wn-body">${c.body}</div>
          <button class="wn-forge-btn" style="background:linear-gradient(135deg,${c.color}cc,${c.color});"
                  onclick="wnForge(${i})">🎬 Forge This Scene</button>
        </div>`).join('')}
    </div>

    <button class="wn-big-btn" onclick="wnQuickForge()">👻 FORGE A WEIRD NJ SCENE</button>

  </div>

  <style>
    .wn-grid      { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                    gap:14px; margin-bottom:24px; }
    .wn-card      { background:rgba(2,6,23,.95); border:2px solid #1e293b; border-radius:18px;
                    padding:22px; display:flex; flex-direction:column; gap:10px; transition:all .2s; }
    .wn-card:hover{ transform:translateY(-2px); }
    .wn-cat       { font-size:.56em; font-weight:900; letter-spacing:1px; text-transform:uppercase; }
    .wn-title     { font-weight:900; color:#fff; font-size:.98em; }
    .wn-body      { color:#94a3b8; font-size:.76em; line-height:1.6; flex:1; }
    .wn-forge-btn { color:#fff; border:none; border-radius:12px; padding:12px 18px;
                    font-weight:900; font-size:.76em; cursor:pointer; font-family:Georgia,serif;
                    transition:all .2s; margin-top:4px; }
    .wn-forge-btn:hover { transform:scale(1.03); }
    .wn-big-btn   { width:100%; background:linear-gradient(135deg,#7e22ce,#a855f7); color:#fff;
                    border:none; border-radius:16px; padding:18px; font-weight:900; font-size:1em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .25s;
                    box-shadow:0 6px 24px rgba(168,85,247,.3); }
    .wn-big-btn:hover { transform:scale(1.01); }
  </style>
`;

window.wnForge = (idx) => window.forgeScene(WEIRD_CARDS[idx].prompt);

window.wnQuickForge = () => {
  const rnd = WEIRD_CARDS[Math.floor(Math.random() * WEIRD_CARDS.length)];
  window.forgeScene(rnd.prompt);
};

export const mount = () => {};
