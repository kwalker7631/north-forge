// rooms/setup.js — API Keys, Google Sign-In, Preferences

let _setupSheets  = [];   // cached for live filter
let _setupQuery   = '';   // search text
let _setupPlat    = '';   // platform filter: '' | 'sora' | 'kling' | 'veo' | 'aurora'

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
      ${state.keys.anthropic ? `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <div style="flex:1;background:rgba(15,23,42,0.95);border:2px solid #1e4d2b;border-radius:12px;
                      padding:11px 16px;font-family:monospace;font-size:0.82em;color:#22c55e;letter-spacing:1px;">
            ✓ ${state.keys.anthropic.slice(0,14)}••••••••••••${state.keys.anthropic.slice(-4)}
          </div>
          <button class="setup-btn" style="background:rgba(15,23,42,0.8);border:2px solid #334155;color:#cbd5e1;"
                  onclick="document.getElementById('key-replace-form').style.display='flex';this.style.display='none';">
            🔄 Replace
          </button>
          <button class="setup-btn" id="test-key-btn" onclick="testAnthropicKey()">✓ Test</button>
        </div>
        <div id="key-replace-form" style="display:none;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="password" id="anthropic-key-input" class="setup-input"
                 placeholder="Paste new key — sk-ant-..."
                 style="flex:1;min-width:200px;"/>
          <button class="setup-btn" onclick="saveAnthropicKey()">Save</button>
          <button class="setup-btn" style="background:rgba(15,23,42,0.8);border:2px solid #334155;color:#64748b;"
                  onclick="document.getElementById('key-replace-form').style.display='none';
                           document.querySelector('[onclick*=key-replace-form]').style.display='';">
            Cancel
          </button>
        </div>` : `
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="password" id="anthropic-key-input" class="setup-input"
                 placeholder="Paste your key — sk-ant-..."
                 style="flex:1;min-width:200px;"/>
          <button class="setup-btn" onclick="saveAnthropicKey()">Save Key</button>
        </div>
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
      ${state.keys.gemini ? `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <div style="flex:1;background:rgba(15,23,42,0.95);border:2px solid #1e4d2b;border-radius:12px;
                      padding:11px 16px;font-family:monospace;font-size:0.82em;color:#22c55e;letter-spacing:1px;">
            ✓ ${state.keys.gemini.slice(0,10)}••••••••••••${state.keys.gemini.slice(-4)}
          </div>
          <button class="setup-btn" style="background:rgba(15,23,42,0.8);border:2px solid #334155;color:#cbd5e1;"
                  onclick="document.getElementById('gemini-replace-form').style.display='flex';this.style.display='none';">
            🔄 Replace
          </button>
          <button class="setup-btn" id="test-gemini-btn" style="background:rgba(99,102,241,0.8);" onclick="testGeminiKey()">✓ Test</button>
        </div>
        <div id="gemini-replace-form" style="display:none;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="password" id="gemini-key-input" class="setup-input"
                 placeholder="Paste new key — AIza..."
                 style="flex:1;min-width:200px;"/>
          <button class="setup-btn" style="background:rgba(99,102,241,0.8);" onclick="saveGeminiKey()">Save</button>
          <button class="setup-btn" style="background:rgba(15,23,42,0.8);border:2px solid #334155;color:#64748b;"
                  onclick="document.getElementById('gemini-replace-form').style.display='none';
                           document.querySelector('[onclick*=gemini-replace-form]').style.display='';">
            Cancel
          </button>
        </div>` : `
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="password" id="gemini-key-input" class="setup-input"
                 placeholder="Paste your key — AIza..."
                 style="flex:1;min-width:200px;"/>
          <button class="setup-btn" style="background:rgba(99,102,241,0.8);" onclick="saveGeminiKey()">Save Key</button>
        </div>
        <div style="margin-top:10px;font-size:0.68em;color:#64748b;font-weight:900;">
          — Not configured · Anthropic is primary
        </div>`}
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
      ${state.user ? `
        <input type="text" class="setup-input sh-search" id="sh-search"
          placeholder="🔍 Search by idea, character, location..."
          oninput="setupFilterSheets()"
          value="${_setupQuery}"
          style="width:100%;margin-bottom:10px;box-sizing:border-box;font-size:0.82em;padding:10px 14px;">
        <div class="sh-plat-row">
          ${['','sora','kling','veo','aurora'].map(p => `
            <button class="sh-plat-btn ${_setupPlat===p?'active':''}"
                    onclick="setupSetPlat('${p}')">${p||'All'}</button>`).join('')}
        </div>` : ''}
      <div id="sheet-history-body" style="font-size:0.72em;color:#64748b;min-height:40px;margin-top:12px;">
        ${state.user ? 'Loading…' : 'Sign in with Google to view your call sheet history.'}
      </div>
      ${state.user ? `
        <button class="setup-btn" style="margin-top:14px;font-size:0.72em;padding:10px 18px;"
                onclick="setupRefreshSheets()">↺ Refresh</button>` : ''}
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
    .setup-btn.outline { background:rgba(15,23,42,0.7); border:2px solid #334155; color:#cbd5e1; }
    .setup-btn.outline:hover { border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,0.06); transform:none; }
    .status-row { display:flex; align-items:center; gap:10px; }
    .sdot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .sdot.on  { background:#22c55e; box-shadow:0 0 8px #22c55e; }
    .sdot.off { background:#334155; }
    .sh-plat-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px; }
    .sh-plat-btn { background:rgba(15,23,42,0.9); border:1px solid #334155; border-radius:20px;
                   padding:5px 14px; color:#64748b; font-size:.64em; font-weight:900;
                   cursor:pointer; font-family:Georgia,serif; text-transform:uppercase;
                   letter-spacing:.5px; transition:all .2s; }
    .sh-plat-btn:hover  { border-color:#38bdf844; color:#cbd5e1; }
    .sh-plat-btn.active { border-color:#38bdf8; background:rgba(56,189,248,.12); color:#38bdf8; }
    .sh-reforge { background:linear-gradient(135deg,#065f46,#059669); color:#fff; border:none;
                  border-radius:8px; padding:5px 12px; font-size:.62em; font-weight:900;
                  cursor:pointer; font-family:Georgia,serif; flex-shrink:0; transition:all .2s; }
    .sh-reforge:hover { transform:scale(1.04); }
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
  if (!sheets.length) return '<div style="color:#475569;">No call sheets match. Try a different search or filter.</div>';
  const groups = {};
  sheets.forEach(s => {
    const d = s.savedAt ? new Date(s.savedAt).toLocaleDateString() : 'Unknown';
    (groups[d] = groups[d] || []).push(s);
  });
  return Object.entries(groups).map(([date, items]) => `
    <div style="margin-bottom:14px;">
      <div style="font-size:.66em;font-weight:900;color:#38bdf8;letter-spacing:1px;
                  text-transform:uppercase;padding:6px 0 8px;border-bottom:1px solid #1e293b;
                  margin-bottom:8px;">${date}</div>
      ${items.map(s => {
        const sc      = s.score >= 8 ? '#22c55e' : s.score >= 5 ? '#d97706' : s.score ? '#ef4444' : '#475569';
        const preview = (s.idea || s.clean || '').slice(0, 65);
        const idea    = (s.idea || s.clean || '').slice(0, 200);
        return `
          <div style="padding:8px 0;border-bottom:1px solid #1e293b22;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${s.score ? `<span style="color:${sc};font-weight:900;font-size:.78em;flex-shrink:0;">🔥 ${s.score}/10</span>` : ''}
            <span style="color:#94a3b8;font-size:.76em;flex:1;min-width:0;">${preview}…</span>
            <button class="sh-reforge"
                    onclick="window.forgeScene(${JSON.stringify('REFORGE — fresh take on this scene idea:\n"' + idea + '"')})">
              ↺ Reforge</button>
            <button onclick="navigator.clipboard.writeText(${JSON.stringify(s.clean||'').replace(/"/g,'&quot;')}).then(()=>window.showToast('✓ Copied!'))"
                    style="background:#0284c7;color:#fff;border:none;border-radius:8px;
                           padding:5px 12px;font-size:.62em;font-weight:900;cursor:pointer;
                           font-family:Georgia,serif;flex-shrink:0;">📋 Copy</button>
          </div>`;
      }).join('')}
    </div>`).join('');
};

const _applyFilter = () => {
  const el = document.getElementById('sheet-history-body');
  if (!el) return;
  let filtered = _setupSheets;
  if (_setupQuery) {
    const q = _setupQuery.toLowerCase();
    filtered = filtered.filter(s => (s.idea || s.clean || '').toLowerCase().includes(q));
  }
  if (_setupPlat) {
    filtered = filtered.filter(s => (s.idea || s.clean || '').toLowerCase().includes(_setupPlat));
  }
  el.innerHTML = renderSheetRows(filtered);
};

window.setupRefreshSheets = async () => {
  const el = document.getElementById('sheet-history-body');
  if (el) el.innerHTML = '<span style="color:#64748b;">Loading…</span>';
  _setupSheets = await window.loadNorthPrompts?.(50) || [];
  _applyFilter();
};

window.setupFilterSheets = () => {
  _setupQuery = document.getElementById('sh-search')?.value || '';
  _applyFilter();
};

window.setupSetPlat = (p) => {
  _setupPlat = p;
  window.goTo('setup');
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
  window.goTo('setup');
};

window.testAnthropicKey = async () => {
  const btn = document.getElementById('test-key-btn');
  if (!btn) return;
  btn.textContent = '⟳ Testing…';
  btn.disabled = true;
  try {
    const result = await window.callNorthDirect([{ role:'user', content:'Reply with exactly: ONLINE' }]);
    if (result && result.toUpperCase().includes('ONLINE')) {
      btn.textContent = '✅ Connected';
      btn.style.background = 'linear-gradient(135deg,#065f46,#059669)';
      window.showToast('✓ Anthropic key is working!');
    } else {
      btn.textContent = '⚠ Check key';
      btn.style.background = 'linear-gradient(135deg,#92400e,#d97706)';
      window.showToast('Key responded but unexpected reply');
    }
  } catch {
    btn.textContent = '✗ Failed';
    btn.style.background = 'linear-gradient(135deg,#7f1d1d,#ef4444)';
    window.showToast('✗ Key test failed — check your key');
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = '✓ Test';
      btn.style.background = '';
    }, 4000);
  }
};

window.saveGeminiKey = () => {
  const val = document.getElementById('gemini-key-input')?.value?.trim();
  if (!val) { window.showToast('Paste your key first'); return; }
  window.saveKey('gemini', val);
  window.showToast('✓ Gemini key saved');
  window.goTo('setup');
};

window.testGeminiKey = async () => {
  const btn = document.getElementById('test-gemini-btn');
  if (!btn) return;
  btn.textContent = '⟳ Testing…';
  btn.disabled = true;
  try {
    const key = window._state?.keys?.gemini;
    if (!key) throw new Error('No key');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents:[{ role:'user', parts:[{ text:'Reply with exactly: ONLINE' }] }] }),
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text.toUpperCase().includes('ONLINE')) {
      btn.textContent = '✅ Connected';
      btn.style.background = 'linear-gradient(135deg,#065f46,#059669)';
      window.showToast('✓ Gemini key is working!');
    } else {
      btn.textContent = '⚠ Check key';
      btn.style.background = 'linear-gradient(135deg,#92400e,#d97706)';
      window.showToast('Key responded but unexpected reply');
    }
  } catch {
    btn.textContent = '✗ Failed';
    btn.style.background = 'linear-gradient(135deg,#7f1d1d,#ef4444)';
    window.showToast('✗ Gemini key test failed');
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = '✓ Test';
      btn.style.background = 'rgba(99,102,241,0.8)';
    }, 4000);
  }
};

export const mount = async (state) => {
  if (state?.user && window.loadNorthEvents) {
    const [events, sheets] = await Promise.all([
      window.loadNorthEvents(30),
      window.loadNorthPrompts?.(50) ?? Promise.resolve([]),
    ]);
    const el = document.getElementById('event-log-body');
    if (el) el.innerHTML = renderEventRows(events);
    _setupSheets = sheets;
    _applyFilter();
  }
};
