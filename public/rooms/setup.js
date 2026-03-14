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
        Get your key at <span style="color:#38bdf8;">console.anthropic.com</span>
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
        Get your key at <span style="color:#38bdf8;">aistudio.google.com</span>
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
    <div class="setup-card">
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
            ${state.weather ? `Weather · ${state.weather.temp} ${state.weather.condition}` : 'Weather · Unavailable'}
          </span>
        </div>
      </div>
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
  </style>
`;

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

export const mount = () => {};
