// rooms/rocklab.js — Randy's Rock Lab
// NJ caves, crystal geodes, underground drama. Full Sora call sheets.

import { GEODE_TYPES, CAVE_EPISODES } from '../data.js';

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      Randy "Sarge" (@geodudenj) goes underground. NJ mine shafts, crystal caves,
      geode hunts in the Pine Barrens. Tap any card to forge the scene.
    </div>

    <div class="rl-section-title">⛏️ Geode Types</div>
    <div class="rl-geo-grid">
      ${GEODE_TYPES.map((g, i) => `
        <div class="rl-geo-card" onclick="rlForgeGeo(${i})">
          <div class="rl-geo-icon">${g.icon}</div>
          <div class="rl-geo-name">${g.name}</div>
          <div class="rl-geo-desc">${g.desc}</div>
          <div class="rl-forge-hint">🎬 Forge Scene ↗</div>
        </div>`).join('')}
    </div>

    <div class="rl-section-title" style="margin-top:30px;">📺 Cave Episodes</div>
    <div class="rl-ep-list">
      ${CAVE_EPISODES.map((ep, i) => `
        <div class="rl-ep-card">
          <div class="rl-ep-badge">${ep.ep}</div>
          <div class="rl-ep-info">
            <div class="rl-ep-title">${ep.title}</div>
          </div>
          <button class="rl-ep-btn" onclick="rlForgeEp(${i})">🎬 Forge</button>
        </div>`).join('')}
    </div>

    <button class="rl-big-btn" onclick="rlQuickForge()">⛏️ FORGE A RANDY CAVE SCENE</button>

  </div>

  <style>
    .rl-section-title { font-size:.62em; font-weight:900; color:#3b82f6; letter-spacing:2px;
                        text-transform:uppercase; margin-bottom:14px; }
    .rl-geo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; }
    .rl-geo-card { background:rgba(2,6,23,.95); border:2px solid #1e293b; border-radius:16px;
                   padding:18px 14px; text-align:center; cursor:pointer; transition:all .2s; }
    .rl-geo-card:hover { border-color:#3b82f6; transform:translateY(-2px); }
    .rl-geo-icon  { font-size:2.2em; margin-bottom:8px; }
    .rl-geo-name  { font-weight:900; color:#fff; font-size:.78em; margin-bottom:4px; }
    .rl-geo-desc  { color:#64748b; font-size:.66em; line-height:1.4; margin-bottom:10px; }
    .rl-forge-hint{ font-size:.6em; color:#3b82f6; font-weight:900; }
    .rl-ep-list   { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
    .rl-ep-card   { background:rgba(2,6,23,.95); border:2px solid #1e293b; border-radius:14px;
                    padding:16px 20px; display:flex; align-items:center; gap:16px; }
    .rl-ep-badge  { background:rgba(59,130,246,.15); border:2px solid #3b82f644; border-radius:10px;
                    padding:6px 12px; font-size:.66em; font-weight:900; color:#3b82f6;
                    white-space:nowrap; flex-shrink:0; }
    .rl-ep-info   { flex:1; }
    .rl-ep-title  { font-weight:900; color:#fff; font-size:.86em; }
    .rl-ep-btn    { background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:#fff; border:none;
                    border-radius:10px; padding:10px 16px; font-weight:900; font-size:.72em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .2s; white-space:nowrap; }
    .rl-ep-btn:hover { transform:scale(1.04); }
    .rl-big-btn   { width:100%; background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:#fff;
                    border:none; border-radius:16px; padding:18px; font-weight:900; font-size:1em;
                    cursor:pointer; font-family:Georgia,serif; transition:all .25s;
                    box-shadow:0 6px 24px rgba(59,130,246,.3); }
    .rl-big-btn:hover { transform:scale(1.01); }
  </style>
`;

window.rlForgeGeo = (idx) => {
  const g = GEODE_TYPES[idx];
  window.forgeScene(
    `FORGE: @geodudenj discovers a ${g.name} — ${g.desc} — deep in a NJ mine shaft. ` +
    `Headlamp, cramped cave walls, dramatic crystal reveal. Full SORA 9:16 vertical, cinematic.`
  );
};

window.rlForgeEp = (idx) => window.forgeScene(CAVE_EPISODES[idx].prompt);

window.rlQuickForge = () =>
  window.forgeScene(
    `FORGE: @geodudenj on a solo NJ geode hunt. Underground, headlamp, tight passage, ` +
    `finds something extraordinary in the clay. Full SORA 9:16 call sheet — hook, scene, camera, audio, clean prompt.`
  );

export const mount = () => {};
