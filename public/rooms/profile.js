// rooms/profile.js — User Character Profile
// Define how you appear in Sora 2 videos.
// Tap-to-select builder: age range, build, hair, eyes, style, Sora IDs, duration.

const OPTS = {
  age:   ['Teens','20s','30s','40s','50s','60s','70s+'],
  build: ['Slim','Athletic','Average','Stocky','Larger'],
  hair:  ['Black','Brown','Blonde','Red','Grey','White','Bald','Locs'],
  eyes:  ['Brown','Blue','Green','Hazel','Grey','Dark'],
  style: ['Outdoorsy','Casual','Rugged','Farm Worker','Athletic','Classic','Streetwear'],
};

const DURATIONS = ['10s','15s','20s'];

// ── LOCAL STATE ───────────────────────────────────────────────────────────────
let draft = {
  age: '', build: '', hair: '', eyes: '', style: '',
  soraIds: ['','',''],
  preferredDuration: '15s',
};

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  // Pre-fill from saved profile
  if (state.profile && !_hydrated) {
    draft = {
      age:               state.profile.age               || '',
      build:             state.profile.build             || '',
      hair:              state.profile.hair              || '',
      eyes:              state.profile.eyes              || '',
      style:             state.profile.style             || '',
      soraIds:           state.profile.soraIds           || ['','',''],
      preferredDuration: state.profile.preferredDuration || '15s',
    };
    _hydrated = true;
  }

  const complete = draft.age && draft.build && draft.hair && draft.eyes && draft.style;

  return `
  <div class="room-wrap">

    <div class="panel-desc">
      Tell North how you appear on camera. He'll lock your look and Sora IDs into
      every scene you forge — so you show up consistently, the way you actually look.
    </div>

    ${!state.user ? `
      <div class="pf-gate">
        <div style="font-size:2em;margin-bottom:14px;">🔐</div>
        <div style="font-weight:900;color:#fff;margin-bottom:8px;">Sign in to save your profile</div>
        <div style="font-size:0.78em;color:#475569;margin-bottom:20px;">
          Your character profile is tied to your Google account.
        </div>
        <button onclick="handleSignIn()" class="pf-save-btn">Sign in with Google</button>
      </div>` : `

    <!-- HOW YOU LOOK --------------------------------------------------------->
    <div class="pf-section">
      <div class="pf-section-label">🎭 HOW YOU APPEAR ON CAMERA</div>

      ${Object.entries(OPTS).map(([field, choices]) => `
        <div class="pf-field">
          <div class="pf-field-label">${fieldLabel(field)}</div>
          <div class="pf-pills">
            ${choices.map(c => `
              <button class="pf-pill ${draft[field]===c?'active':''}"
                      onclick="pfSet('${field}','${c}')">
                ${c}
              </button>`).join('')}
          </div>
        </div>`).join('')}
    </div>

    <!-- SORA IDs ------------------------------------------------------------->
    <div class="pf-section">
      <div class="pf-section-label">🎬 YOUR SORA ACCOUNT IDs</div>
      <div style="font-size:0.72em;color:#475569;margin-bottom:16px;line-height:1.6;">
        Add up to 3 Sora IDs. North will use these to lock your character across scenes.
        Format: <span style="color:#38bdf8;font-family:monospace;">@yourid</span>
      </div>
      ${[0,1,2].map(i => `
        <div class="pf-id-row">
          <span class="pf-id-num">${i+1}</span>
          <input class="pf-id-input" type="text"
                 placeholder="@your-sora-id"
                 value="${esc(draft.soraIds[i] || '')}"
                 oninput="pfSetId(${i}, this.value)" />
        </div>`).join('')}
    </div>

    <!-- PREFERRED DURATION --------------------------------------------------->
    <div class="pf-section">
      <div class="pf-section-label">⏱️ PREFERRED VIDEO DURATION</div>
      <div class="pf-pills">
        ${DURATIONS.map(d => `
          <button class="pf-pill ${draft.preferredDuration===d?'active':''}"
                  onclick="pfSet('preferredDuration','${d}')">
            ${d}
          </button>`).join('')}
      </div>
    </div>

    <!-- PREVIEW CARD --------------------------------------------------------->
    ${complete ? `
      <div class="pf-preview">
        <div class="pf-preview-label">👁️ NORTH SEES YOU AS</div>
        <div class="pf-preview-text">
          ${draft.age}, ${draft.build} build, ${draft.hair} hair, ${draft.eyes} eyes,
          ${draft.style} style.
          ${draft.soraIds.filter(Boolean).length
            ? `Sora IDs: <span style="color:#38bdf8;font-family:monospace;">${draft.soraIds.filter(Boolean).join(', ')}</span>.`
            : 'No Sora IDs set yet.'}
          Preferred: ${draft.preferredDuration}.
        </div>
      </div>` : ''}

    <!-- SAVE ----------------------------------------------------------------->
    <button class="pf-save-btn ${complete?'':'disabled'}"
            onclick="${complete ? 'pfSave()' : 'showToast(\"Complete all appearance fields first\")'}"
            ${complete ? '' : 'disabled'}>
      ${complete ? '💾 Save My Profile' : '⬆ Fill in all fields above to save'}
    </button>
    `}

  </div>

  <style>
    .pf-gate        { background:rgba(15,23,42,.92); border:2px solid #1e293b;
                      border-radius:18px; padding:40px 28px; text-align:center; }
    .pf-section     { background:rgba(2,6,23,.95); border:2px solid #1e293b;
                      border-radius:18px; padding:22px 22px 18px; margin-bottom:16px; }
    .pf-section-label { font-size:.54em; font-weight:900; letter-spacing:2px;
                        color:#c084fc; text-transform:uppercase; margin-bottom:18px; }
    .pf-field       { margin-bottom:16px; }
    .pf-field-label { font-size:.64em; font-weight:900; color:#94a3b8;
                      margin-bottom:10px; text-transform:uppercase; letter-spacing:1px; }
    .pf-pills       { display:flex; flex-wrap:wrap; gap:8px; }
    .pf-pill        { background:rgba(15,23,42,.9); border:2px solid #1e293b;
                      border-radius:10px; padding:8px 14px; cursor:pointer;
                      font-size:.72em; font-weight:900; color:#64748b;
                      font-family:Georgia,serif; transition:all .2s; }
    .pf-pill:hover  { border-color:#c084fc44; color:#c084fc; }
    .pf-pill.active { border-color:#c084fc; color:#c084fc;
                      background:rgba(192,132,252,.12); }
    .pf-id-row      { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .pf-id-num      { font-size:.62em; font-weight:900; color:#475569;
                      width:20px; flex-shrink:0; }
    .pf-id-input    { flex:1; background:rgba(15,23,42,.95); border:2px solid #1e293b;
                      border-radius:12px; padding:12px 14px; color:#38bdf8;
                      font-family:monospace; font-size:.82em; outline:none;
                      transition:border-color .2s; }
    .pf-id-input:focus { border-color:#c084fc; }
    .pf-preview     { background:rgba(192,132,252,.08); border:2px solid #c084fc44;
                      border-radius:14px; padding:18px 20px; margin-bottom:20px; }
    .pf-preview-label { font-size:.54em; font-weight:900; color:#c084fc;
                        letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
    .pf-preview-text  { font-size:.82em; color:#e2e8f0; line-height:1.7; font-weight:700; }
    .pf-save-btn    { width:100%; background:linear-gradient(135deg,#7c3aed,#c084fc);
                      color:#fff; border:none; border-radius:16px; padding:18px;
                      font-weight:900; font-size:.9em; cursor:pointer;
                      font-family:Georgia,serif; transition:all .25s; margin-top:6px;
                      box-shadow:0 6px 24px rgba(192,132,252,.3); }
    .pf-save-btn:hover:not(.disabled) { transform:scale(1.02); }
    .pf-save-btn.disabled { background:rgba(30,41,59,.9); color:#334155;
                             box-shadow:none; cursor:not-allowed; }
  </style>
  `;
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
let _hydrated = false;

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const fieldLabel = (f) => ({
  age:'Age Range', build:'Build', hair:'Hair', eyes:'Eyes', style:'Style Vibe'
}[f] || f);

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.pfSet = (field, value) => {
  draft[field] = value;
  window.goTo('profile');
};

window.pfSetId = (idx, value) => {
  draft.soraIds[idx] = value.trim();
};

window.pfSave = () => {
  window.saveUserProfile({ ...draft });
};

export const mount = (state) => {
  // Reset hydration flag when re-entering so profile changes load fresh
  if (!state.profile) _hydrated = false;
};
