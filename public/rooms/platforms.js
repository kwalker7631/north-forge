// rooms/platforms.js — Platform Lab
// Browse platform knowledge, hacks, cinematography. North uses this silently in chat.

import { PLATFORMS, CINEMATOGRAPHY } from '../platforms.js';

let activeTab     = 'platforms';  // 'platforms' | 'cinema' | 'hacks'
let activePlatId  = 'sora2';
let scoutResult   = null;
let scoutLoading  = false;

export const render = (state) => `
  <div class="room-wrap">

    <!-- SORA SCOUT ---------------------------------------------------------->
    <div class="scout-card">
      <div class="scout-header">
        <div>
          <div class="scout-label">🛰️ SORA SCOUT</div>
          <div class="scout-sub">Ask North for the latest Sora 2 tips, tricks, and techniques</div>
        </div>
        <div class="scout-btns">
          <button class="scout-btn ${scoutLoading?'disabled':''}"
                  onclick="scoutSora('latest')" ${scoutLoading?'disabled':''}>
            ${scoutLoading ? '⏳ Scouting…' : '🔭 Scout Sora 2 Now'}
          </button>
          <button class="scout-btn-alt ${scoutLoading?'disabled':''}"
                  onclick="scoutSora('week')" ${scoutLoading?'disabled':''}>
            📆 What's new this week?
          </button>
        </div>
      </div>
      ${scoutResult ? `
        <div class="scout-result">${scoutResult}</div>
        <button class="scout-clear" onclick="scoutClear()">✕ Clear</button>` : ''}
    </div>

    <div class="pl-tabs">
      <button class="pl-tab ${activeTab==='platforms'?'active':''}"
              onclick="plTab('platforms')">🎬 Platforms</button>
      <button class="pl-tab ${activeTab==='hacks'?'active':''}"
              onclick="plTab('hacks')">🔥 Hack Library</button>
      <button class="pl-tab ${activeTab==='cinema'?'active':''}"
              onclick="plTab('cinema')">📷 Cinematography</button>
    </div>

    ${activeTab === 'platforms' ? platformsView() : ''}
    ${activeTab === 'hacks'     ? hacksView()     : ''}
    ${activeTab === 'cinema'    ? cinemaView()    : ''}

  </div>

  <style>
    .pl-tabs { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
    .pl-tab  { background:rgba(15,23,42,0.9); border:2px solid #1e293b;
               border-radius:12px; padding:11px 22px; color:#64748b;
               cursor:pointer; font-weight:900; font-size:0.82em;
               font-family:Georgia,serif; transition:all .2s; }
    .pl-tab.active { color:#fff; border-color:#38bdf8;
                     background:rgba(56,189,248,0.12); }

    /* PLATFORM SELECTOR */
    .plat-selector { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .plat-btn { display:flex; align-items:center; gap:8px;
                background:rgba(2,6,23,0.9); border:2px solid #1e293b;
                border-radius:14px; padding:12px 20px; cursor:pointer;
                font-weight:900; font-size:0.82em; font-family:Georgia,serif;
                color:#64748b; transition:all .2s; }
    .plat-btn.active { color:#fff; }
    .plat-btn:hover  { color:#94a3b8; }

    /* PLATFORM DETAIL */
    .plat-detail { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    @media(max-width:700px){ .plat-detail { grid-template-columns:1fr; } }
    .plat-card { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
                 border-radius:18px; padding:22px; }
    .plat-card-title { font-size:0.6em; font-weight:900; letter-spacing:2px;
                       text-transform:uppercase; margin-bottom:14px; }
    .technique-item { display:flex; gap:10px; margin-bottom:10px;
                      align-items:flex-start; }
    .technique-dot  { width:8px; height:8px; border-radius:50%;
                      background:#38bdf8; flex-shrink:0; margin-top:6px; }
    .technique-text { color:#cbd5e1; font-size:0.8em; line-height:1.6; }
    .avoid-item { color:#ef444499; font-size:0.78em; margin-bottom:7px;
                  padding-left:14px; border-left:3px solid #ef444433; }
    .struct-item{ color:#94a3b8; font-size:0.78em; margin-bottom:7px;
                  font-family:monospace; background:rgba(15,23,42,0.8);
                  padding:8px 12px; border-radius:8px; }

    /* HACKS */
    .hack-grid { display:grid;
                 grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
                 gap:14px; }
    .hack-card { background:rgba(2,6,23,0.92); border:2px solid #f59e0b33;
                 border-radius:16px; padding:20px; }
    .hack-plat { font-size:0.56em; font-weight:900; letter-spacing:1px;
                 text-transform:uppercase; margin-bottom:8px; }
    .hack-text { color:#fcd34d; font-weight:900; font-size:0.84em;
                 line-height:1.6; margin-bottom:10px; }
    .hack-copy { background:rgba(245,158,11,0.15); border:1px solid #f59e0b44;
                 color:#f59e0b; border-radius:8px; padding:6px 14px;
                 font-size:0.66em; font-weight:900; cursor:pointer;
                 font-family:Georgia,serif; transition:all .2s; }
    .hack-copy:hover { background:rgba(245,158,11,0.25); }

    /* CINEMATOGRAPHY */
    .cinema-section { margin-bottom:28px; }
    .cinema-title   { font-weight:900; font-size:0.88em; color:#38bdf8;
                      margin-bottom:14px; padding-bottom:8px;
                      border-bottom:2px solid #38bdf822; }
    .cinema-grid    { display:grid;
                      grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                      gap:10px; }
    .cinema-card    { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
                      border-radius:14px; padding:16px; cursor:pointer;
                      transition:all .2s; }
    .cinema-card:hover { border-color:#38bdf8; transform:translateY(-2px); }
    .cinema-name    { font-weight:900; color:#fff; font-size:0.82em;
                      margin-bottom:5px; }
    .cinema-use     { color:#64748b; font-size:0.72em; line-height:1.55; }

    .forge-plat-btn { background:linear-gradient(135deg,#0284c7,#0ea5e9);
                      color:#fff; border:none; border-radius:12px;
                      padding:12px 24px; font-weight:900; cursor:pointer;
                      font-size:0.82em; font-family:Georgia,serif;
                      transition:all .2s; margin-top:14px; width:100%; }
    .forge-plat-btn:hover { transform:scale(1.02); }
  </style>
`;

// ── PLATFORMS VIEW ────────────────────────────────────────────────────────────
const platformsView = () => {
  const p = PLATFORMS.find(x => x.id === activePlatId) || PLATFORMS[0];
  return `
    <div class="panel-desc">
      North reads this before generating every prompt. Tap a platform, then forge a scene with its optimal techniques baked in.
    </div>

    <div class="plat-selector">
      ${PLATFORMS.map(pl => `
        <button class="plat-btn ${pl.id===activePlatId?'active':''}"
                style="border-color:${pl.id===activePlatId?pl.color+'88':'#1e293b'};
                       color:${pl.id===activePlatId?pl.color:'#64748b'};"
                onclick="plSelect('${pl.id}')">
          ${pl.icon} ${pl.name}
        </button>`).join('')}
    </div>

    <div style="background:rgba(2,6,23,0.95);border:2px solid ${p.color}44;
                border-radius:20px;padding:22px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
        <div>
          <div style="font-size:2em;margin-bottom:6px;">${p.icon}</div>
          <div style="font-weight:900;font-size:1.2em;color:#fff;">${p.name}</div>
          <div style="font-size:0.66em;color:${p.color};font-weight:900;margin-top:3px;">${p.maker} · ${p.format}</div>
        </div>
        <div style="background:${p.color}18;border:2px solid ${p.color}44;border-radius:14px;
                    padding:12px 18px;max-width:240px;font-size:0.74em;color:#94a3b8;line-height:1.5;">
          <strong style="color:#fff;">Best for:</strong><br/>${p.best_for}
        </div>
      </div>
      <button class="forge-plat-btn" style="background:linear-gradient(135deg,${p.color},${p.color}bb);"
        onclick="forgePlatform('${p.id}')">
        🎬 Forge a Pine Barron Scene for ${p.name}
      </button>
    </div>

    <div class="plat-detail">

      <div class="plat-card">
        <div class="plat-card-title" style="color:${p.color};">✓ Prompt Structure</div>
        ${p.prompt_structure.map(s => `<div class="struct-item">${s}</div>`).join('')}
      </div>

      <div class="plat-card">
        <div class="plat-card-title" style="color:#22c55e;">⭐ Key Techniques</div>
        ${p.techniques.map(t => `
          <div class="technique-item">
            <div class="technique-dot" style="background:${p.color};"></div>
            <div class="technique-text">${t}</div>
          </div>`).join('')}
      </div>

      <div class="plat-card">
        <div class="plat-card-title" style="color:#f59e0b;">🔥 Active Hacks</div>
        ${p.hacks.map(h => `
          <div style="background:rgba(245,158,11,0.08);border:1px solid #f59e0b22;
                      border-radius:10px;padding:10px 14px;margin-bottom:9px;">
            <div style="color:#fcd34d;font-size:0.8em;font-weight:900;line-height:1.55;">${h}</div>
          </div>`).join('')}
      </div>

      <div class="plat-card">
        <div class="plat-card-title" style="color:#ef4444;">✗ Avoid</div>
        ${p.avoid.map(a => `<div class="avoid-item">${a}</div>`).join('')}
      </div>

    </div>
  `;
};

// ── HACKS VIEW ────────────────────────────────────────────────────────────────
const hacksView = () => `
  <div class="panel-desc">
    Every discovered hack, trick, and technique across all platforms. Copy any hack to use it directly.
  </div>
  <div class="hack-grid">
    ${PLATFORMS.flatMap(p =>
      p.hacks.map(h => `
        <div class="hack-card">
          <div class="hack-plat" style="color:${p.color};">${p.icon} ${p.name}</div>
          <div class="hack-text">${h.replace('🔥 ','')}</div>
          <button class="hack-copy"
            onclick="navigator.clipboard.writeText(${JSON.stringify(h.replace('🔥 ',''))}).then(()=>showToast('✓ Hack copied!'))">
            📋 Copy Hack
          </button>
        </div>`)
    ).join('')}
  </div>
`;

// ── CINEMATOGRAPHY VIEW ───────────────────────────────────────────────────────
const sq = (s) => s.replace(/'/g, "\\'");
const cinemaView = () => `
  <div class="panel-desc">
    DP-level craft knowledge. Tap any lens, move, or light to forge a scene using that technique.
  </div>

  <div class="cinema-section">
    <div class="cinema-title">🔭 Lenses</div>
    <div class="cinema-grid">
      ${CINEMATOGRAPHY.lenses.map(l => `
        <div class="cinema-card"
          onclick="forgeScene('CINEMATOGRAPHY TEST — Pine Barron Farms scene shot on ${sq(l.name)}. Use case: ${sq(l.use)}. Character: Ken (@kennethwalker479) or Luna the goat. Full SORA 9:16 format.')">
          <div class="cinema-name">📷 ${l.name}</div>
          <div class="cinema-use">${l.use}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="cinema-section">
    <div class="cinema-title">🎥 Camera Moves</div>
    <div class="cinema-grid">
      ${CINEMATOGRAPHY.moves.map(m => `
        <div class="cinema-card"
          onclick="forgeScene('CINEMATOGRAPHY TEST — Pine Barron Farms scene using ${sq(m.name)} camera move. Use case: ${sq(m.use)}. Full SORA 9:16 format.')">
          <div class="cinema-name">🎥 ${m.name}</div>
          <div class="cinema-use">${m.use}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="cinema-section">
    <div class="cinema-title">💡 Lighting</div>
    <div class="cinema-grid">
      ${CINEMATOGRAPHY.lighting.map(l => `
        <div class="cinema-card"
          onclick="forgeScene('CINEMATOGRAPHY TEST — Pine Barron Farms scene lit with ${sq(l.name)}. Use case: ${sq(l.use)}. Full SORA 9:16 format.')">
          <div class="cinema-name">💡 ${l.name}</div>
          <div class="cinema-use">${l.use}</div>
        </div>`).join('')}
    </div>
  </div>
`;

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.plTab    = (t)  => { activeTab = t; window.goTo('platforms'); };
window.plSelect = (id) => { activePlatId = id; window.goTo('platforms'); };

window.forgePlatform = (platId) => {
  const p = PLATFORMS.find(x => x.id === platId);
  if (!p) return;
  window.forgeScene(
    `Generate a cinematic Pine Barron Farms scene optimized for ${p.name}. ` +
    `Platform strengths: ${p.best_for}. ` +
    `Format: ${p.format}. ` +
    `Apply these techniques: ${p.techniques.slice(0,3).join('; ')}. ` +
    `Active hacks to use: ${p.hacks.slice(0,2).map(h=>h.replace('🔥 ','')).join('; ')}. ` +
    `Feature one of: Ken (@kennethwalker479), Randy (@geodudenj), Luna the goat, or Salem (@kennethwa.majorbilli). ` +
    `Output: full call sheet + clean prompt separately.`
  );
};

export const mount = () => {};
