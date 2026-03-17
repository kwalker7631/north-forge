// rooms/digest.js — North Digest: weekly content calendar + Notes
// Tab 1: Call Sheets grouped by week with North's Pick
// Tab 2: Pinned Notes from chat

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let digestTab  = 'sheets';  // 'sheets' | 'notes'
let _state     = null;
const _pickCache = {};      // weekKey → North's one-liner

// ── WEEK HELPERS ──────────────────────────────────────────────────────────────
const getWeekKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

const weekLabel = (key) => {
  const [year, w] = key.split('-W');
  const jan4 = new Date(parseInt(year), 0, 4);
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(w) - 1) * 7);
  return 'Week of ' + weekStart.toLocaleDateString('en-US', { month:'short', day:'numeric' });
};

const scoreColor = (s) =>
  s >= 8 ? '#22c55e' : s >= 5 ? '#d97706' : s != null ? '#ef4444' : '#475569';

// ── SHEETS VIEW ───────────────────────────────────────────────────────────────
let _weekData = {};

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

  const groups = {};
  sheets.forEach(s => {
    const key = getWeekKey(s.savedAt || new Date().toISOString());
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const best      = items.reduce((m, s) => ((s.score ?? -1) > (m?.score ?? -1) ? s : m), null);
      const bestScore = best?.score;
      const providers = [...new Set(items.map(s => s.provider).filter(Boolean))];
      const provBadges = providers.map(p =>
        `<span class="dg-badge">${p === 'anthropic' ? '🤖 Claude' : '✨ Gemini'}</span>`
      ).join('');

      const pick = _pickCache[key];
      const pickCard = bestScore != null ? `
        <div class="dg-pick" id="pick-slot-${key}">
          <span class="dg-pick-label">🏆 NORTH'S PICK</span>
          <span class="dg-pick-score" style="color:${scoreColor(bestScore)};">🔥 ${bestScore}/10</span>
          <div class="dg-pick-idea">${esc((best?.idea || best?.clean || '').slice(0,80))}…</div>
          ${pick
            ? `<div class="dg-pick-note">"${esc(pick)}"</div>`
            : `<div class="dg-pick-thinking">North is reviewing…</div>`}
        </div>` : '';

      const rows = items.map((s, i) => {
        const preview  = esc((s.idea || s.clean || '').slice(0, 70));
        const fullText = esc(s.clean || '');
        const sc = scoreColor(s.score);
        return `
          <div class="dg-row">
            <span class="dg-score" style="color:${sc};">${s.score != null ? `🔥 ${s.score}/10` : '·'}</span>
            <span class="dg-preview">${preview}…</span>
            <button class="dg-expand" onclick="digestExpand(this)">⬇ Read</button>
            <button class="dg-copy"   onclick="digestCopy(${i},'${key}')">📋 Copy</button>
            <button class="dg-save"   onclick="digestSaveMD(${i},'${key}')">💾 MD</button>
            <button class="dg-remix"  onclick="digestRemix(${i},'${key}')">↺ Remix</button>
          </div>
          <div class="dg-expand-body">${fullText}</div>`;
      }).join('');

      return `
        <div class="dg-week" data-key="${key}">
          <div class="dg-week-header">
            <span class="dg-week-label">${weekLabel(key)}</span>
            <div class="dg-week-meta">
              <span>${items.length} forged</span>
              ${bestScore != null ? `<span style="color:#22c55e;font-weight:900;">Best ${bestScore}/10</span>` : ''}
              ${provBadges}
              <button class="dg-export" onclick="digestExportWeek('${key}')">⬇ Export Week</button>
            </div>
          </div>
          ${pickCard}
          ${rows}
        </div>`;
    }).join('');
};

// ── NOTES VIEW ────────────────────────────────────────────────────────────────
const renderNotes = (notes) => {
  if (!notes.length) return `
    <div class="dg-empty">
      <div style="font-size:2.5em;margin-bottom:16px;">⭐</div>
      <div style="font-weight:900;color:#fff;margin-bottom:8px;">No pinned scenes yet.</div>
      <div style="font-size:0.8em;color:#475569;margin-bottom:20px;">
        Hit ⭐ Pin on any North response in the Chat room to save it here.
      </div>
      <button onclick="goTo('chat')" class="dg-cta">Go to Chat →</button>
    </div>`;

  return notes.map(n => {
    const date    = n.savedAt ? new Date(n.savedAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' }) : '';
    const preview = esc((n.text || '').slice(0, 120));
    return `
      <div class="dg-note">
        <div class="dg-note-date">${date}</div>
        <div class="dg-note-text">${preview}…</div>
        <div class="dg-note-actions">
          <button class="dg-copy" onclick="digestCopyNote('${n.id}')">📋 Copy</button>
          <button class="dg-note-del" onclick="digestDeleteNote('${n.id}')">🗑 Delete</button>
        </div>
      </div>`;
  }).join('');
};

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  _state = state;
  return `
  <div class="room-wrap">

    <div class="dg-tabbar">
      <button class="dg-tab ${digestTab==='sheets'?'active':''}" onclick="digestSetTab('sheets')">📅 Call Sheets</button>
      <button class="dg-tab ${digestTab==='notes' ?'active':''}" onclick="digestSetTab('notes')">⭐ Notes</button>
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
    .dg-tabbar   { display:flex; gap:10px; margin-bottom:22px; }
    .dg-tab      { background:rgba(15,23,42,.9); border:2px solid #1e293b;
                   border-radius:12px; padding:11px 22px; color:#64748b;
                   cursor:pointer; font-weight:900; font-size:.82em;
                   font-family:Georgia,serif; transition:all .2s; }
    .dg-tab.active { color:#fff; border-color:#38bdf8; background:rgba(56,189,248,.12); }
    .dg-gate     { background:rgba(15,23,42,.92); border:2px solid #1e293b;
                   border-radius:18px; padding:40px 28px; text-align:center; }
    .dg-cta      { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                   border:none; border-radius:12px; padding:13px 28px; font-weight:900;
                   font-size:0.82em; cursor:pointer; font-family:Georgia,serif; }
    .dg-empty    { background:rgba(15,23,42,.92); border:2px solid #1e293b;
                   border-radius:18px; padding:40px 28px; text-align:center; }
    .dg-refresh  { background:rgba(15,23,42,0.7); border:2px solid #334155; border-radius:12px;
                   padding:10px 20px; color:#94a3b8; cursor:pointer; font-size:.72em;
                   font-weight:900; font-family:Georgia,serif; margin-top:16px;
                   transition:all .2s; }
    .dg-refresh:hover { border-color:#38bdf8; color:#38bdf8; }
    .dg-week     { background:rgba(2,6,23,.95); border:2px solid #1e293b;
                   border-radius:18px; padding:20px 22px; margin-bottom:16px; }
    .dg-week-header { display:flex; align-items:center; justify-content:space-between;
                      flex-wrap:wrap; gap:8px; padding-bottom:12px;
                      border-bottom:1px solid #1e293b; margin-bottom:10px; }
    .dg-week-label  { font-size:.72em; font-weight:900; color:#38bdf8;
                      letter-spacing:1px; text-transform:uppercase; }
    .dg-week-meta   { display:flex; align-items:center; gap:10px;
                      font-size:.62em; color:#64748b; font-weight:700; flex-wrap:wrap; }
    .dg-badge    { background:rgba(56,189,248,.1); border:1px solid #38bdf833;
                   border-radius:6px; padding:2px 8px; color:#94a3b8; }
    .dg-pick     { background:rgba(14,165,233,.07); border:1px solid #38bdf822;
                   border-radius:12px; padding:14px 16px; margin-bottom:12px; }
    .dg-pick-label { font-size:.54em; font-weight:900; color:#38bdf8;
                     letter-spacing:2px; text-transform:uppercase; margin-right:10px; }
    .dg-pick-score { font-size:.62em; font-weight:900; }
    .dg-pick-idea  { font-size:.74em; color:#cbd5e1; margin:8px 0 6px; line-height:1.5; }
    .dg-pick-note  { font-size:.74em; color:#7dd3fc; font-style:italic; line-height:1.55; }
    .dg-pick-thinking { font-size:.68em; color:#475569; font-style:italic; }
    .dg-row      { display:flex; align-items:center; gap:10px; padding:8px 0;
                   border-bottom:1px solid #0f172a; flex-wrap:wrap; }
    .dg-row:last-of-type { border-bottom:none; }
    .dg-score    { font-size:.68em; font-weight:900; flex-shrink:0; min-width:52px; }
    .dg-preview  { flex:1; font-size:.76em; color:#cbd5e1; line-height:1.5;
                   min-width:0; word-break:break-word; }
    .dg-copy     { background:#0284c7; color:#fff; border:none; border-radius:8px;
                   padding:5px 12px; font-size:.62em; font-weight:900; cursor:pointer;
                   font-family:Georgia,serif; flex-shrink:0; }
    .dg-save     { background:#065f46; color:#fff; border:none; border-radius:8px;
                   padding:5px 12px; font-size:.62em; font-weight:900; cursor:pointer;
                   font-family:Georgia,serif; flex-shrink:0; }
    .dg-expand   { background:rgba(15,23,42,.9); color:#94a3b8; border:1px solid #334155;
                   border-radius:8px; padding:5px 10px; font-size:.62em; font-weight:900;
                   cursor:pointer; font-family:Georgia,serif; flex-shrink:0; transition:all .2s; }
    .dg-expand:hover { border-color:#38bdf8; color:#38bdf8; }
    .dg-expand-body { display:none; font-size:.74em; color:#bae6fd; font-family:monospace;
                      line-height:1.7; white-space:pre-wrap; padding:12px 16px;
                      background:rgba(0,0,0,.5); border:1px solid #1e293b; border-top:none;
                      border-radius:0 0 10px 10px; margin-bottom:8px; }
    .dg-note     { background:rgba(2,6,23,.95); border:2px solid #f59e0b22;
                   border-radius:14px; padding:18px 20px; margin-bottom:12px; }
    .dg-note-date{ font-size:.56em; font-weight:900; color:#f59e0b;
                   letter-spacing:1px; margin-bottom:8px; }
    .dg-note-text{ font-size:.8em; color:#cbd5e1; line-height:1.7; margin-bottom:12px; }
    .dg-note-actions { display:flex; gap:8px; }
    .dg-note-del { background:rgba(15,23,42,0.7); border:1px solid #334155; border-radius:8px;
                   padding:5px 12px; font-size:.62em; font-weight:900; color:#94a3b8;
                   cursor:pointer; font-family:Georgia,serif; transition:all .2s; }
    .dg-note-del:hover { border-color:#ef4444; color:#ef4444; }
    .dg-remix    { background:rgba(124,58,237,0.18); color:#c084fc; border:1px solid #7c3aed44;
                   border-radius:8px; padding:5px 12px; font-size:.62em; font-weight:900;
                   cursor:pointer; font-family:Georgia,serif; flex-shrink:0; }
    .dg-remix:hover { background:rgba(124,58,237,0.35); }
    .dg-export   { background:rgba(15,23,42,0.8); border:1px solid #334155; border-radius:8px;
                   padding:3px 10px; color:#94a3b8; cursor:pointer; font-size:.6em;
                   font-weight:900; font-family:Georgia,serif; transition:all .2s; }
    .dg-export:hover { border-color:#22c55e; color:#22c55e; }
  </style>
`;
};

// ── MOUNT ─────────────────────────────────────────────────────────────────────
export const mount = async (state) => {
  _state = state;
  if (!state.user) return;
  if (digestTab === 'sheets') await sheetsLoad();
  else                         await notesLoad();
};

// ── SHEETS LOAD ───────────────────────────────────────────────────────────────
const sheetsLoad = async () => {
  const el = document.getElementById('digest-body');
  if (!el) return;

  const sheets = await window.loadNorthPrompts?.(50) ?? [];
  _weekData = {};
  sheets.forEach(s => {
    const key = getWeekKey(s.savedAt || new Date().toISOString());
    if (!_weekData[key]) _weekData[key] = [];
    _weekData[key].push(s);
  });

  el.innerHTML = renderWeeks(sheets);
  fetchPicks(sheets);
};

// ── NORTH'S PICKS (Feature C) ─────────────────────────────────────────────────
const fetchPicks = async (sheets) => {
  const hasKey = _state?.keys?.anthropic || _state?.keys?.gemini;
  if (!hasKey || !sheets.length) return;

  const groups = {};
  sheets.forEach(s => {
    const key = getWeekKey(s.savedAt || new Date().toISOString());
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  // Process only the 3 most recent weeks without cached picks
  const weeks = Object.entries(groups)
    .sort(([a],[b]) => b.localeCompare(a))
    .slice(0, 3)
    .filter(([key]) => !_pickCache[key]);

  await Promise.all(weeks.map(async ([key, items]) => {
    const best = items.reduce((m, s) => ((s.score ?? -1) > (m?.score ?? -1) ? s : m), null);
    if (!best) return;
    const idea = (best.idea || best.clean || '').slice(0, 80);
    const note = await window.callNorthDirect([{
      role: 'user',
      content: `One sentence — North's director voice — on why this Pine Barron Farms scene idea is worth filming: "${idea}". Max 20 words.`,
    }]);
    if (!note) return;
    _pickCache[key] = note.trim();
    // Patch just the pick slot — no full re-render needed
    const slot = document.getElementById(`pick-slot-${key}`);
    if (slot) {
      const thinking = slot.querySelector('.dg-pick-thinking');
      if (thinking) thinking.outerHTML = `<div class="dg-pick-note">"${esc(_pickCache[key])}"</div>`;
    }
  }));
};

// ── NOTES LOAD ────────────────────────────────────────────────────────────────
let _notes = [];

const notesLoad = async () => {
  const el = document.getElementById('digest-body');
  if (!el) return;
  _notes = await window.loadNorthNotes?.(50) ?? [];
  el.innerHTML = renderNotes(_notes);
};

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.digestSetTab = (tab) => {
  digestTab = tab;
  window.goTo('digest');
};

window.digestRefresh = () => {
  Object.keys(_pickCache).forEach(k => delete _pickCache[k]);
  if (digestTab === 'sheets') sheetsLoad();
  else                         notesLoad();
};

window.digestExpand = (btn) => {
  const body = btn.closest('.dg-row').nextElementSibling;
  if (!body) return;
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '⬇ Read' : '⬆ Close';
};

window.digestCopy = (idx, weekKey) => {
  const items = _weekData[weekKey];
  if (!items) return;
  const clean = items[idx]?.clean || '';
  if (!clean) { window.showToast('Nothing to copy'); return; }
  navigator.clipboard.writeText(clean)
    .then(() => window.showToast('✓ Copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.digestCopyNote = (noteId) => {
  const note = _notes.find(n => n.id === noteId);
  if (!note) return;
  navigator.clipboard.writeText(note.text)
    .then(() => window.showToast('✓ Note copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.digestDeleteNote = async (noteId) => {
  await window.deleteNorthNote?.(noteId);
  _notes = _notes.filter(n => n.id !== noteId);
  const el = document.getElementById('digest-body');
  if (el) el.innerHTML = renderNotes(_notes);
  window.showToast('Note deleted');
};

window.digestRemix = (idx, weekKey) => {
  const items = _weekData[weekKey];
  if (!items) return;
  const s = items[idx];
  if (!s) return;
  const idea = s.idea || s.clean?.slice(0, 120) || '';
  if (!idea) { window.showToast('No idea text to remix'); return; }
  window.showToast('↺ Remixing with North...');
  window.forgeScene(`REMIX THIS SCENE — give me a completely fresh take on this idea, new angle, new energy:\n"${idea}"`);
};

window.digestExportWeek = (weekKey) => {
  const items = _weekData[weekKey];
  if (!items?.length) { window.showToast('Nothing to export'); return; }
  const label = weekLabel(weekKey);
  const lines = [
    `# North Forge — ${label}`,
    '**Pine Barron Farms Production — Piscataway NJ**',
    '', '---', '',
  ];
  items.forEach((s, i) => {
    const date = s.savedAt ? new Date(s.savedAt).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
    lines.push(`## Scene ${i + 1}${s.idea ? ` — ${s.idea.slice(0,60)}` : ''}`,
      date ? `*${date}*` : '',
      s.score != null ? `> 🔥 Viral Score: ${s.score}/10` : '',
      '', '### Clean Prompt', '', s.clean || '', '', '---', '');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `north-forge-${weekKey}.md`;
  a.click();
  URL.revokeObjectURL(url);
  window.showToast(`✓ ${items.length} scenes exported!`);
};

window.digestSaveMD = (idx, weekKey) => {
  const items = _weekData[weekKey];
  if (!items) return;
  const s = items[idx];
  if (!s) return;
  const date  = new Date(s.savedAt || Date.now()).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const md = [
    '# North Forge Call Sheet',
    `**Generated:** ${date}`,
    '**Pine Barron Farms Production — Piscataway NJ**',
    s.idea  ? `**Scene Idea:** ${s.idea}` : '',
    s.score != null ? `**Viral Score:** ${s.score}/10` : '',
    '', '---', '',
    '## Clean Prompt', '',
    s.clean || '', '',
  ].filter(l => l !== null).join('\n');
  const blob = new Blob([md], { type:'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `north-forge-${Date.now()}.md`; a.click();
  URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .md!');
};
