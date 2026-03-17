// rooms/setup.js — API Keys, Google Sign-In, Preferences

export const render = (state) => `
  <div class="room-wrap">

    <div class="panel-desc">
      North needs your Anthropic API key to generate prompts and call sheets.
      Your key is saved to your account and never shared.
    </div>

    <!-- SIGN IN STATUS -->
    <div class="setup-card" style="margin-bottom:18px;">
      <div class="setup-card-title">🔐 Google Account</div>
      ${state.user ? `
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <img src="${state.user.photoURL || ''}"
               style="width:48px;height:48px;border-radius:50%;border:2px solid #22c55e;"
               onerror="this.style.display='none'"/>
          <div>
            <div style="font-weight:900;color:#fff;font-size:0.95em;">${state.user.displayName || 'Signed In'}</div>
            <div style="font-size:0.66em;color:#22c55e;font-weight:700;">✓ SIGNED IN · Prefs auto-save</div>
          </div>
          <button class="setup-btn outline" onclick="handleSignOut()" style="margin-left:auto;">Sign Out</button>
        </div>` : `
        <div style="color:#64748b;font-size:0.82em;margin-bottom:14px;line-height:1.6;">
          Sign in with Google to save your API key and preferences across devices.
        </div>
        <button class="setup-btn" onclick="handleSignIn()">🔑 Sign in with Google</button>`}
    </div>

    <!-- ANTHROPIC KEY -->
    <div class="setup-card" style="margin-bottom:18px;">
      <div class="setup-card-title">🤖 Anthropic API Key <span style="color:#22c55e;font-size:0.8em;">(PRIMARY)</span></div>
      <div style="color:#64748b;font-size:0.74em;margin-bottom:14px;line-height:1.6;">
        Powers all of North's prompt generation and call sheet output.
        Get your key at <span onclick="window.open('https://console.anthropic.com','_blank')" style="color:#38bdf8;cursor:pointer;text-decoration:underline;">console.anthropic.com ↗</span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <input type="password"
               id="anthropic-key-input"
               class="setup-input"
               placeholder="${state.keys.anthropic ? '••••••••••••••••••••' : 'sk-ant-...'}"
               value="${state.keys.anthropic || ''}"
               style="flex:1;min-width:200px;"/>
        <button class="setup-btn" onclick="saveAnthropicKey()">Save Key</button>
      </div>
      ${state.keys.anthropic ? `
        <div style="margin-top:10px;font-size:0.68em;color:#22c55e;font-weight:900;">
          ✓ KEY SAVED · NORTH ONLINE
        </div>` : `
        <div style="margin-top:10px;font-size:0.68em;color:#ef4444;font-weight:900;">
          ✗ NO KEY · North cannot generate prompts
        </div>`}
    </div>

    <!-- GEMINI KEY -->
    <div class="setup-card" style="margin-bottom:18px;">
      <div class="setup-card-title">✨ Google Gemini API Key <span style="color:#64748b;font-size:0.8em;">(FALLBACK)</span></div>
      <div style="color:#64748b;font-size:0.74em;margin-bottom:14px;line-height:1.6;">
        Optional backup if Anthropic is unavailable.
        Get your key at <span onclick="window.open('https://aistudio.google.com','_blank')" style="color:#38bdf8;cursor:pointer;text-decoration:underline;">aistudio.google.com ↗</span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <input type="password"
               id="gemini-key-input"
               class="setup-input"
               placeholder="${state.keys.gemini ? '••••••••••••••••••••' : 'AIza...'}"
               value="${state.keys.gemini || ''}"
               style="flex:1;min-width:200px;"/>
        <button class="setup-btn" style="background:rgba(99,102,241,0.8);" onclick="saveGeminiKey()">Save Key</button>
      </div>
      ${state.keys.gemini ? `
        <div style="margin-top:10px;font-size:0.68em;color:#22c55e;font-weight:900;">✓ FALLBACK READY</div>` : ''}
    </div>

    <!-- STATUS -->
    <div class="setup-card" style="margin-bottom:18px;">
      <div class="setup-card-title">📡 System Status</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="status-row">
          <span class="sdot ${state.keys.anthropic?'on':'off'}"></span>
          <span style="font-size:0.82em;color:${state.keys.anthropic?'#22c55e':'#ef4444'};font-weight:900;">
            ${state.keys.anthropic ? 'Anthropic · ONLINE' : 'Anthropic · NO KEY'}
          </span>
        </div>
        <div class="status-row">
          <span class="sdot ${state.keys.gemini?'on':'off'}"></span>
          <span style="font-size:0.82em;color:${state.keys.gemini?'#22c55e':'#64748b'};font-weight:900;">
            ${state.keys.gemini ? 'Gemini · FALLBACK READY' : 'Gemini · Not configured'}
          </span>
        </div>
        <div class="status-row">
          <span class="sdot ${state.user?'on':'off'}"></span>
          <span style="font-size:0.82em;color:${state.user?'#22c55e':'#64748b'};font-weight:900;">
            ${state.user ? `Google · ${state.user.displayName}` : 'Google · Not signed in'}
          </span>
        </div>
        <div class="status-row">
          <span class="sdot ${state.weather?'on':'off'}"></span>
          <span style="font-size:0.82em;color:${state.weather?'#22c55e':'#64748b'};font-weight:900;">
            ${state.weather ? `Weather · ${state.weather.temp} ${state.weather.condition} · sky auto-set` : 'Weather · Unavailable'}
          </span>
        </div>
      </div>
    </div>

    <!-- EVENT LOG -->
    <div class="setup-card" style="margin-bottom:18px;">
      <div class="setup-card-title">📋 North Event Log
        ${!state.user ? `<span style="color:#64748b;font-weight:400;font-size:0.78em;"> — sign in to enable</span>` : ''}
      </div>
      <div id="event-log-body" style="font-size:0.72em;color:#64748b;min-height:40px;">
        ${state.user ? 'Loading…' : 'Sign in with Google to view your event log.'}
      </div>
      ${state.user ? `
        <button class="setup-btn" style="margin-top:14px;font-size:0.72em;padding:10px 18px;"
                onclick="setupRefreshLog()">↺ Refresh Log</button>` : ''}
    </div>

    <!-- CALL SHEET HISTORY -->
    <div class="setup-card">
      <div class="setup-card-title">🎬 Call Sheet History
        ${!state.user ? `<span style="color:#64748b;font-weight:400;font-size:0.78em;"> — sign in to enable</span>` : ''}
      </div>
      <div id="sheet-history-body" style="font-size:0.72em;color:#64748b;min-height:40px;">
        ${state.user ? 'Loading…' : 'Sign in with Google to view your call sheet history.'}
      </div>
      ${state.user ? `
        <button class="setup-btn" style="margin-top:14px;font-size:0.72em;padding:10px 18px;"
                onclick="setupRefreshSheets()">↺ Refresh History</button>` : ''}
    </div>

  </div>

  <style>
    .setup-card { background:rgba(2,6,23,0.95); border:2px solid #1e293b;
                  border-radius:18px; padding:22px; }
    .setup-card-title { font-weight:900; font-size:0.88em; color:#fff;
                        margin-bottom:14px; }
    .setup-input { background:rgba(15,23,42,0.95); border:2px solid #334155;
                   border-radius:12px; padding:13px 16px; color:#fff;
                   font-family:Georgia,serif; font-size:0.88em; outline:none;
                   transition:border-color .3s; }
    .setup-input:focus { border-color:#38bdf8; }
    .setup-btn { background:linear-gradient(135deg,#0284c7,#0ea5e9);
                 color:#fff; border:none; border-radius:12px;
                 padding:13px 24px; font-weight:900; font-size:0.82em;
                 cursor:pointer; font-family:Georgia,serif; transition:all .2s;
                 white-space:nowrap; }
    .setup-btn:hover { transform:scale(1.03); }
    .setup-btn.outline { background:none; border:2px solid #334155; color:#94a3b8; }
    .setup-btn.outline:hover { border-color:#ef4444; color:#ef4444; transform:none; }
    .status-row { display:flex; align-items:center; gap:10px; }
    .sdot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .sdot.on  { background:#22c55e; box-shadow:0 0 8px #22c55e; }
    .sdot.off { background:#334155; }
    @media (max-width: 640px) {
      .setup-input { min-width: 0 !important; width: 100%; }
    }
  </style>
`;

const formatReason = (code) => ({
  gemini_quota_exceeded:    'Gemini quota exceeded',
  anthropic_auth_error:     'Anthropic key rejected (401)',
  gemini_auth_error:        'Gemini key rejected',
  anthropic_no_key:         'No Anthropic key configured',
  gemini_no_key:            'No Gemini key configured',
  anthropic_network_error:  'Anthropic network error',
  gemini_network_error:     'Gemini network error',
  anthropic_empty_response: 'Anthropic returned empty response',
  gemini_empty_response:    'Gemini returned empty response',
  all_providers_failed:     'All providers failed',
})[code] ?? code;

const renderEventRows = (events) => {
  if (!events.length) return '<div style="color:#475569;">No events logged yet. Generate a prompt to start.</div>';

  const total   = events.length;
  const success = events.filter(e => e.type === 'success').length;
  const rate    = Math.round((success / total) * 100);
  const lastTs  = events[0]?.ts ? new Date(events[0].ts).toLocaleDateString() : '—';
  const statsBar = `
    <div style="display:flex;gap:20px;flex-wrap:wrap;padding:10px 0 14px;
                border-bottom:1px solid #1e293b;margin-bottom:10px;font-size:0.72em;color:#64748b;">
      <span>📊 <strong style="color:#fff">${total}</strong> calls</span>
      <span>✅ <strong style="color:#22c55e">${rate}%</strong> success</span>
      <span>🕐 Last: <strong style="color:#38bdf8">${lastTs}</strong></span>
    </div>`;

  const rows = events.map(e => {
    const icon  = e.type === 'error' ? '🔴' : e.type === 'warn' ? '🟡' : '🟢';
    const time  = e.ts ? new Date(e.ts).toLocaleTimeString() : '—';
    const label = e.provider ? `[${e.provider}]` : '';
    const msg   = e.prompt ? `"${e.prompt.slice(0,50)}…"` : (e.msg || '');
    return `
      <div style="padding:7px 0;border-bottom:1px solid #1e293b22;">
        <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;">
          <span>${icon}</span>
          <span style="color:#38bdf8;white-space:nowrap;">${time}</span>
          <span style="color:#94a3b8;font-weight:900;">${label}</span>
          <span style="color:#cbd5e1;flex:1;">${msg}</span>
          ${e.chars ? `<span style="color:#475569;">${e.chars} chars</span>` : ''}
        </div>
        ${e.type === 'error' && e.reason
          ? `<div style="color:#f87171;font-size:0.85em;padding-left:28px;margin-top:3px;">↳ ${formatReason(e.reason)}</div>`
          : ''}
      </div>`;
  }).join('');

  return statsBar + rows;
};

const renderSheetRows = (sheets) => {
  if (!sheets.length) return '<div style="color:#475569;">No call sheets saved yet. Forge a scene to start building your history.</div>';
  const groups = {};
  sheets.forEach(s => {
    const d = s.savedAt ? new Date(s.savedAt).toLocaleDateString() : 'Unknown';
    (groups[d] = groups[d] || []).push(s);
  });
  return Object.entries(groups).map(([date, items]) => `
    <div style="margin-bottom:14px;">
      <div style="font-size:0.66em;font-weight:900;color:#38bdf8;letter-spacing:1px;
                  text-transform:uppercase;padding:6px 0 8px;border-bottom:1px solid #1e293b;
                  margin-bottom:8px;">${date}</div>
      ${items.map(s => {
        const sc = s.score >= 8 ? '#22c55e' : s.score >= 5 ? '#d97706' : s.score ? '#ef4444' : '#475569';
        const preview = (s.idea || s.clean || '').slice(0, 60);
        return `
          <div style="padding:8px 0;border-bottom:1px solid #1e293b22;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            ${s.score ? `<span style="color:${sc};font-weight:900;font-size:0.8em;flex-shrink:0;">🔥 ${s.score}/10</span>` : ''}
            <span style="color:#94a3b8;font-size:0.78em;flex:1;">${preview}…</span>
            <button onclick="navigator.clipboard.writeText(${JSON.stringify(s.clean || '').replace(/"/g,'&quot;')}).then(()=>window.showToast('✓ Copied!'))"
                    style="background:#0284c7;color:#fff;border:none;border-radius:8px;
                           padding:5px 12px;font-size:0.62em;font-weight:900;cursor:pointer;
                           font-family:Georgia,serif;flex-shrink:0;">📋 Copy</button>
          </div>`;
      }).join('')}
    </div>`).join('');
};

window.setupRefreshSheets = async () => {
  const el = document.getElementById('sheet-history-body');
  if (el) el.innerHTML = '<span style="color:#64748b;">Loading…</span>';
  const sheets = await window.loadNorthPrompts?.(30) || [];
  if (el) el.innerHTML = renderSheetRows(sheets);
};

window.setupRefreshLog = async () => {
  const el = document.getElementById('event-log-body');
  if (el) el.innerHTML = '<span style="color:#64748b;">Refreshing…</span>';
  const events = await window.loadNorthEvents?.(20) || [];
  if (el) el.innerHTML = renderEventRows(events);
};

window.saveAnthropicKey = () => {
  const val = document.getElementById('anthropic-key-input')?.value?.trim();
  if (!val) { window.showToast('Paste your key first'); return; }
  window.saveKey('anthropic', val);
  window.showToast('✓ Anthropic key saved — North is online!');
};

window.saveGeminiKey = () => {
  const val = document.getElementById('gemini-key-input')?.value?.trim();
  if (!val) { window.showToast('Paste your key first'); return; }
  window.saveKey('gemini', val);
  window.showToast('✓ Gemini key saved');
};

export const mount = async (state) => {
  if (state?.user && window.loadNorthEvents) {
    const [events, sheets] = await Promise.all([
      window.loadNorthEvents(30),
      window.loadNorthPrompts?.(30) ?? Promise.resolve([]),
    ]);
    const el = document.getElementById('event-log-body');
    if (el) el.innerHTML = renderEventRows(events);
    const sl = document.getElementById('sheet-history-body');
    if (sl) sl.innerHTML = renderSheetRows(sheets);
  }
};
