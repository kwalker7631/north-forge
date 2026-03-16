// rooms/digest.js — North Digest: weekly content calendar
// Groups all forged call sheets by week. Your creative recap.

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ISO week number helper
const getWeekKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

const weekLabel = (key) => {
  // key = "2026-W11" → "Week of Mar 9"
  const [year, w] = key.split('-W');
  const jan4 = new Date(parseInt(year), 0, 4);
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(w) - 1) * 7);
  return 'Week of ' + weekStart.toLocaleDateString('en-US', { month:'short', day:'numeric' });
};

const scoreColor = (s) =>
  s >= 8 ? '#22c55e' : s >= 5 ? '#d97706' : s != null ? '#ef4444' : '#475569';

const scoreLabel = (s) =>
  s != null ? `🔥 ${s}/10` : '·';

const renderWeeks = (sheets) => {
  if (!sheets.length) return `
    <div class="dg-empty">
      <div style="font-size:2.5em;margin-bottom:16px;">📋</div>
      <div style="font-weight:900;color:#fff;margin-bottom:8px;">Nothing forged yet.</div>
      <div style="font-size:0.8em;color:#475569;margin-bottom:20px;">
        Head to the North tab, build a call sheet, and it'll show up here.
      </div>
      <button onclick="goTo('chat')" class="dg-cta">Open Prompt Engine →</button>
    </div>`;

  // Group by week
  const groups = {};
  sheets.forEach(s => {
    const key = getWeekKey(s.savedAt || new Date().toISOString());
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const best    = items.reduce((m, s) => (s.score > (m?.score ?? -1) ? s : m), null);
      const bestScore = best?.score;
      const providers = [...new Set(items.map(s => s.provider).filter(Boolean))];
      const provBadges = providers.map(p =>
        `<span class="dg-badge">${p === 'anthropic' ? '🤖 Claude' : '✨ Gemini'}</span>`
      ).join('');

      const rows = items.map((s, i) => {
        const preview = esc((s.idea || s.clean || '').slice(0, 70));
        const sc = scoreColor(s.score);
        const sl = scoreLabel(s.score);
        const safeClean = (s.clean || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`');
        return `
          <div class="dg-row">
            <span class="dg-score" style="color:${sc};">${sl}</span>
            <span class="dg-preview">${preview}…</span>
            <button class="dg-copy"
              onclick="digestCopy(${i}, '${key}')">📋 Copy</button>
            <button class="dg-save"
              onclick="digestSaveMD(${i}, '${key}')">💾 MD</button>
          </div>`;
      }).join('');

      return `
        <div class="dg-week" data-key="${key}">
          <div class="dg-week-header">
            <span class="dg-week-label">${weekLabel(key)}</span>
            <div class="dg-week-meta">
              <span>${items.length} forged</span>
              ${bestScore != null ? `<span style="color:#22c55e;font-weight:900;">Best ${bestScore}/10</span>` : ''}
              ${provBadges}
            </div>
          </div>
          ${rows}
        </div>`;
    }).join('');
};

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      Every scene forged at Pine Barron Farms, organized by week.
      Your creative record. Tap any sheet to copy.
    </div>

    ${!state.user ? `
      <div class="dg-gate">
        <div style="font-size:2em;margin-bottom:14px;">🔐</div>
        <div style="font-weight:900;color:#fff;margin-bottom:8px;">Sign in to view your Digest</div>
        <div style="font-size:0.78em;color:#475569;margin-bottom:20px;">
          Your forged scenes are saved to your Google account.
        </div>
        <button onclick="handleSignIn()" class="dg-cta">Sign in with Google</button>
      </div>` : `
      <div id="digest-body" style="color:#64748b;font-size:0.82em;">Loading…</div>
      <button class="dg-refresh" onclick="digestRefresh()">↺ Refresh</button>`}

  </div>

  <style>
    .dg-gate     { background:rgba(15,23,42,.92); border:2px solid #1e293b;
                   border-radius:18px; padding:40px 28px; text-align:center; }
    .dg-cta      { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                   border:none; border-radius:12px; padding:13px 28px; font-weight:900;
                   font-size:0.82em; cursor:pointer; font-family:Georgia,serif; }
    .dg-empty    { background:rgba(15,23,42,.92); border:2px solid #1e293b;
                   border-radius:18px; padding:40px 28px; text-align:center; }
    .dg-refresh  { background:none; border:2px solid #1e293b; border-radius:12px;
                   padding:10px 20px; color:#475569; cursor:pointer; font-size:0.72em;
                   font-weight:900; font-family:Georgia,serif; margin-top:16px;
                   transition:all .2s; }
    .dg-refresh:hover { border-color:#38bdf8; color:#38bdf8; }
    .dg-week     { background:rgba(2,6,23,.95); border:2px solid #1e293b;
                   border-radius:18px; padding:20px 22px; margin-bottom:16px; }
    .dg-week-header { display:flex; align-items:center; justify-content:space-between;
                      flex-wrap:wrap; gap:8px; padding-bottom:12px;
                      border-bottom:1px solid #1e293b; margin-bottom:10px; }
    .dg-week-label  { font-size:0.72em; font-weight:900; color:#38bdf8;
                      letter-spacing:1px; text-transform:uppercase; }
    .dg-week-meta   { display:flex; align-items:center; gap:10px;
                      font-size:0.62em; color:#64748b; font-weight:700; flex-wrap:wrap; }
    .dg-badge    { background:rgba(56,189,248,.1); border:1px solid #38bdf833;
                   border-radius:6px; padding:2px 8px; font-size:0.9em; color:#94a3b8; }
    .dg-row      { display:flex; align-items:center; gap:10px; padding:8px 0;
                   border-bottom:1px solid #0f172a; flex-wrap:wrap; }
    .dg-row:last-child { border-bottom:none; }
    .dg-score    { font-size:0.68em; font-weight:900; flex-shrink:0; min-width:52px; }
    .dg-preview  { flex:1; font-size:0.76em; color:#cbd5e1; line-height:1.5;
                   min-width:0; word-break:break-word; }
    .dg-copy     { background:#0284c7; color:#fff; border:none; border-radius:8px;
                   padding:5px 12px; font-size:0.62em; font-weight:900; cursor:pointer;
                   font-family:Georgia,serif; flex-shrink:0; transition:all .2s; }
    .dg-copy:hover { background:#0369a1; }
    .dg-save     { background:#065f46; color:#fff; border:none; border-radius:8px;
                   padding:5px 12px; font-size:0.62em; font-weight:900; cursor:pointer;
                   font-family:Georgia,serif; flex-shrink:0; transition:all .2s; }
    .dg-save:hover { background:#047857; }
  </style>
`;

// ── MODULE STATE (for copy access) ────────────────────────────────────────────
let _weekData = {};

// ── MOUNT ─────────────────────────────────────────────────────────────────────
export const mount = async (state) => {
  if (!state.user) return;
  await digestLoad();
};

const digestLoad = async () => {
  const el = document.getElementById('digest-body');
  if (!el) return;
  const sheets = await window.loadNorthPrompts?.(50) ?? [];

  // Store by week+index for copy
  _weekData = {};
  sheets.forEach(s => {
    const key = getWeekKey(s.savedAt || new Date().toISOString());
    if (!_weekData[key]) _weekData[key] = [];
    _weekData[key].push(s);
  });

  el.innerHTML = renderWeeks(sheets);
};

window.digestRefresh = () => digestLoad();

window.digestSaveMD = (idx, weekKey) => {
  const items = _weekData[weekKey];
  if (!items) return;
  const s = items[idx];
  if (!s) return;

  const date  = new Date(s.savedAt || Date.now()).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const idea  = s.idea  || 'Pine Barron Farms Scene';
  const clean = s.clean || '';
  const score = s.score != null ? `**Viral Score:** ${s.score}/10` : '';

  const md = [
    '# North Forge Call Sheet',
    `**Generated:** ${date}`,
    '**Pine Barron Farms Production — Piscataway NJ**',
    idea  ? `**Scene Idea:** ${idea}` : '',
    score,
    '',
    '---',
    '',
    '## Clean Prompt (paste-ready into Sora / Kling / VEO 3 / Grok)',
    '',
    clean,
    '',
  ].filter(l => l !== null).join('\n');

  const blob = new Blob([md], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `north-forge-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .md!');
};

window.digestCopy = (idx, weekKey) => {
  const items = _weekData[weekKey];
  if (!items) return;
  const clean = items[idx]?.clean || '';
  if (!clean) { window.showToast('Nothing to copy'); return; }
  navigator.clipboard.writeText(clean)
    .then(() => window.showToast('✓ Call sheet copied!'))
    .catch(() => window.showToast('Copy failed — try manually'));
};
