// rooms/chat.js — North Forge Prompt Engine
// 3-question form → full call sheet + clean prompt

import { PLATFORMS, getPlatformContext } from '../platforms.js';

const CAST = [
  { id:'ken',       name:'Ken Walker',       soraId:'@kennethwalker479',     icon:'👨‍🌾', role:'The Engineer',       props:['Tool belt','Camera rig','NJ Nets cap'] },
  { id:'marguerite',name:'Marguerite',        soraId:'@prprincess138',        icon:'👩🏽‍🌾', role:'Heart of the Farm',   props:['Apron','Cast iron skillet','Garden gloves'] },
  { id:'randy',     name:'Randy "Sarge"',     soraId:'@geodudenj',            icon:'🪖',  role:'Rock Lab Lead',       props:['Camo helmet','Headlamp','Rock hammer'] },
  { id:'salem',     name:'Salem',             soraId:'@kennethwa.majorbilli', icon:'✨',  role:'The Creative',        props:['Pearl necklace','Black notebook','Camera'] },
  { id:'skully',    name:'Skully',            soraId:'@kennethwa.shadowblaz', icon:'🌑',  role:'Security & Tech',     props:['Black hoodie','Night vision monocle'] },
  { id:'tank',      name:'Tank',              soraId:'@kennethwa.bronzedogg', icon:'🐕',  role:'Farm Hand',           props:['Work gloves','Wheelbarrow','Bandana'] },
  { id:'big',       name:'BigTheSqua',        soraId:'@kennethwa.bigthesqua', icon:'🦍',  role:'Legend Watcher',      props:['Field journal','Binoculars','Trail camera'] },
  { id:'eleanor',   name:'Grand Ma Eleanor',  soraId:'@grandma.eleanor',      icon:'👵',  role:'The Elder Authority', props:['Wheelchair','Red blouse','Glasses'] },
  { id:'luna',      name:'Luna',              soraId:'@kennethwa.luna',       icon:'🐐',  role:'The Escape Artist',   props:['Gold bell collar','LUNA name sign'] },
];

const LOCATIONS = [
  'Big Red Barn','Barn Loft','Chicken Coop','Farm Garden',
  'Assunpink Creek',"Randy's Cave #1",'Pine Barrens Shaft',
  'Route 539','NJ Dirt Track','Back Field','Pine Barrens Forest',
];

const TONES = [
  { id:'cinematic',   label:'🎬 Cinematic',      desc:'Epic, dramatic, film quality' },
  { id:'documentary', label:'📹 Documentary',    desc:'Real, raw, observational' },
  { id:'weird',       label:'👻 Weird NJ',       desc:'Strange, eerie, paranormal' },
  { id:'warm',        label:'🌾 Warm Farm Life', desc:'Everyday beauty, golden light' },
  { id:'action',      label:'🏁 High Energy',    desc:'Fast, intense, adrenaline' },
  { id:'dreamcore',   label:'🍄 Dreamcore',      desc:'Surreal, psychedelic, atmospheric' },
];

let chatMode = 'form';
let formData = { idea:'', character:'', location:'', tone:'', platform:'' };
let formStep = 'idle';

export const render = (state) => {
  const hasKey = state.keys.anthropic || state.keys.gemini;
  return `
    <div style="height:100%;display:flex;flex-direction:column;">

      ${!hasKey ? `<div class="no-key-banner">🔑 No API key — <span onclick="goTo('setup')" style="color:#38bdf8;cursor:pointer;text-decoration:underline;">go to Setup</span></div>` : ''}

      <div class="chat-mode-bar">
        <button class="mode-btn ${chatMode==='form'?'active':''}" onclick="setChatMode('form')">📋 Prompt Engine</button>
        <button class="mode-btn ${chatMode==='chat'?'active':''}" onclick="setChatMode('chat')">💬 Free Chat</button>
        <div style="flex:1;"></div>
        <button class="clear-btn" onclick="clearChat()">🗑 Clear</button>
      </div>

      ${chatMode === 'form' ? formView() : chatView(state)}

    </div>

    <style>
      .no-key-banner{background:rgba(245,158,11,0.1);border-bottom:2px solid #f59e0b44;padding:10px 20px;font-size:0.76em;color:#fbbf24;font-weight:700;}
      .chat-mode-bar{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:2px solid #1e293b;background:rgba(2,6,23,0.98);flex-shrink:0;}
      .mode-btn{background:rgba(15,23,42,0.9);border:2px solid #1e293b;border-radius:10px;padding:9px 18px;color:#64748b;cursor:pointer;font-weight:900;font-size:0.76em;font-family:Georgia,serif;transition:all .2s;}
      .mode-btn.active{color:#fff;border-color:#38bdf8;background:rgba(56,189,248,0.12);}
      .clear-btn{background:none;border:2px solid #1e293b;border-radius:10px;padding:9px 14px;color:#475569;cursor:pointer;font-size:0.76em;font-family:Georgia,serif;transition:all .2s;}
      .clear-btn:hover{border-color:#ef4444;color:#ef4444;}
      .pe-wrap{flex:1;overflow-y:auto;padding:20px 24px;}
      .pe-title{font-weight:900;font-size:1.1em;color:#fff;margin-bottom:4px;}
      .pe-sub{color:#64748b;font-size:0.76em;margin-bottom:22px;line-height:1.55;}
      .pe-field{margin-bottom:20px;}
      .pe-label{font-size:0.62em;font-weight:900;color:#38bdf8;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;display:block;}
      .pe-textarea{width:100%;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:14px;padding:14px 16px;color:#fff;font-family:Georgia,serif;resize:none;outline:none;font-size:0.9em;transition:border-color .3s;min-height:80px;}
      .pe-textarea:focus{border-color:#38bdf8;}
      .pe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;}
      .pe-opt{background:rgba(2,6,23,0.9);border:2px solid #1e293b;border-radius:12px;padding:11px 13px;cursor:pointer;text-align:left;font-family:Georgia,serif;transition:all .2s;display:flex;align-items:center;gap:8px;}
      .pe-opt:hover{border-color:#38bdf833;}
      .pe-opt.sel{border-color:#38bdf8;background:rgba(56,189,248,0.12);}
      .pe-opt-icon{font-size:1.3em;flex-shrink:0;}
      .pe-opt-name{font-weight:900;font-size:0.74em;color:#fff;}
      .pe-opt-sub{font-size:0.6em;color:#64748b;margin-top:1px;}
      .pe-select{width:100%;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:12px;padding:12px 14px;color:#fff;font-family:Georgia,serif;font-size:0.88em;outline:none;cursor:pointer;}
      .pe-select:focus{border-color:#38bdf8;}
      option{background:#020617;}
      .pe-forge-btn{width:100%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:16px;padding:18px;font-weight:900;font-size:1.05em;cursor:pointer;font-family:Georgia,serif;transition:all .25s;margin-top:6px;box-shadow:0 6px 24px rgba(2,132,199,0.35);}
      .pe-forge-btn:hover{transform:scale(1.02);}
      .pe-forge-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
      .chat-msgs{flex:1;overflow-y:auto;padding:20px 24px 10px;}
      .msg-row{display:flex;gap:14px;margin-bottom:26px;align-items:flex-start;}
      .msg-row.user{flex-direction:row-reverse;}
      .msg-ava{width:46px;height:46px;border-radius:50% 50% 50% 8px;flex-shrink:0;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center;font-size:1.3em;}
      .msg-row.user .msg-ava{background:linear-gradient(135deg,#166534,#14532d);border-radius:50%;}
      .msg-bub{max-width:84%;background:rgba(15,23,42,0.95);border:2px solid #1e293b;padding:16px 20px;border-radius:6px 20px 20px 20px;}
      .msg-row.user .msg-bub{background:rgba(20,83,45,0.92);border-color:#14532d;border-radius:20px 6px 20px 20px;}
      .msg-lbl{color:#38bdf8;font-size:0.56em;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;}
      .msg-text{color:#f1f5f9;font-size:0.88em;line-height:1.8;white-space:pre-wrap;}
      .callsheet{background:#000;border:2px solid #38bdf8;border-radius:14px;padding:18px;margin-top:14px;}
      .cs-body{font-family:monospace;font-size:0.74em;color:#bae6fd;line-height:1.7;white-space:pre-wrap;max-height:300px;overflow-y:auto;margin-bottom:12px;}
      .cs-actions{display:flex;gap:10px;flex-wrap:wrap;}
      .cs-btn{border:none;border-radius:10px;padding:10px 18px;font-weight:900;font-size:0.72em;cursor:pointer;font-family:Georgia,serif;transition:all .2s;}
      .cs-copy{background:#0284c7;color:#fff;}
      .cs-full{background:#7c3aed;color:#fff;}
      .north-thinking{display:flex;align-items:center;gap:12px;padding:12px 0;color:#38bdf8;font-weight:900;font-size:0.82em;}
      @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
      .tdot{animation:pulse 1.2s ease-in-out infinite;}.tdot:nth-child(2){animation-delay:.2s;}.tdot:nth-child(3){animation-delay:.4s;}
      .chat-input-bar{padding:12px 20px 16px;background:rgba(2,6,23,0.98);border-top:2px solid #1e293b;display:flex;gap:10px;flex-shrink:0;}
      .chat-ta{flex:1;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:14px;padding:13px 16px;color:#fff;font-family:Georgia,serif;resize:none;outline:none;font-size:0.9em;transition:border-color .3s;}
      .chat-ta:focus{border-color:#38bdf8;}
      .chat-send{background:linear-gradient(135deg,#0284c7,#0369a1);border:none;border-radius:14px;width:58px;color:#fff;cursor:pointer;font-size:1.4em;transition:all .25s;}
      .chat-send:hover{transform:scale(1.06);}
    </style>
  `;
};

const formView = () => `
  <div class="pe-wrap">
    <div class="pe-title">🎬 Prompt Engine</div>
    <div class="pe-sub">Fill in the details. North builds a full call sheet + clean paste-ready prompt.</div>

    <div class="pe-field">
      <label class="pe-label">1 · Your Idea</label>
      <textarea class="pe-textarea" id="pe-idea" placeholder="Randy finds a massive geode underground. Luna somehow escapes and shows up in the cave...">${formData.idea}</textarea>
    </div>

    <div class="pe-field">
      <label class="pe-label">2 · Lead Character</label>
      <div class="pe-grid">
        ${CAST.map(c=>`
          <div class="pe-opt ${formData.character===c.id?'sel':''}" onclick="peSet('character','${c.id}')">
            <div class="pe-opt-icon">${c.icon}</div>
            <div><div class="pe-opt-name">${c.name.split(' ')[0]}</div><div class="pe-opt-sub">${c.soraId}</div></div>
          </div>`).join('')}
      </div>
    </div>

    <div class="pe-field">
      <label class="pe-label">3 · Location</label>
      <select class="pe-select" onchange="peSet('location',this.value)">
        <option value="">— pick a location —</option>
        ${LOCATIONS.map(l=>`<option value="${l}" ${formData.location===l?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>

    <div class="pe-field">
      <label class="pe-label">4 · Tone</label>
      <div class="pe-grid">
        ${TONES.map(t=>`
          <div class="pe-opt ${formData.tone===t.id?'sel':''}" onclick="peSet('tone','${t.id}')">
            <div class="pe-opt-icon">${t.label.split(' ')[0]}</div>
            <div><div class="pe-opt-name">${t.label.split(' ').slice(1).join(' ')}</div><div class="pe-opt-sub">${t.desc}</div></div>
          </div>`).join('')}
      </div>
    </div>

    <div class="pe-field">
      <label class="pe-label">5 · Platform</label>
      <div class="pe-grid">
        ${PLATFORMS.map(p=>`
          <div class="pe-opt ${formData.platform===p.id?'sel':''}"
               style="${formData.platform===p.id?`border-color:${p.color};background:${p.color}15;`:''}"
               onclick="peSet('platform','${p.id}')">
            <div class="pe-opt-icon">${p.icon}</div>
            <div><div class="pe-opt-name" style="${formData.platform===p.id?`color:${p.color};`:''}">${p.name}</div><div class="pe-opt-sub">${p.maker}</div></div>
          </div>`).join('')}
      </div>
    </div>

    <button class="pe-forge-btn" onclick="peForge()" ${formStep==='generating'?'disabled':''}>
      ${formStep==='generating' ? '⏳ North is building your call sheet...' : '🎬 FORGE FULL CALL SHEET'}
    </button>
  </div>
`;

const chatView = (state) => `
  <div class="chat-msgs" id="chat-messages">
    ${state.msgs.map((m,i)=>`
      <div class="msg-row ${m.role}">
        <div class="msg-ava">${m.role==='assistant'?'🧠':'👨‍🌾'}</div>
        <div class="msg-bub">
          ${m.role==='assistant'?'<div class="msg-lbl">North · Loft Lab</div>':''}
          <div class="msg-text">${esc(m.content)}</div>
          ${m.role==='assistant' ? csBlock(m.content, i) : ''}
        </div>
      </div>`).join('')}
    ${state.loading ? `
      <div class="north-thinking">
        <span style="font-size:1.4em;">🧠</span> North is thinking
        <span class="tdot">●</span><span class="tdot">●</span><span class="tdot">●</span>
      </div>` : ''}
    <div id="chat-bottom"></div>
  </div>
  <div class="chat-input-bar">
    <textarea id="chat-input" class="chat-ta" rows="2"
      placeholder="Tell North what's on your mind..."
      onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendFreeChat();}"></textarea>
    <button class="chat-send" onclick="sendFreeChat()">➤</button>
  </div>
`;

const csBlock = (text, idx) => {
  if (!/CLEAN PROMPT|CALL SHEET|═══/i.test(text)) return '';
  const m = text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
  const clean = m ? m[1].trim() : '';
  if (!clean) return '';
  return `
    <div class="callsheet">
      <div style="color:#38bdf8;font-size:0.6em;font-weight:900;letter-spacing:2px;margin-bottom:10px;">📋 CALL SHEET READY</div>
      <div class="cs-body" id="cs-body-${idx}">${esc(clean)}</div>
      <div class="cs-actions">
        <button class="cs-btn cs-copy" onclick="copyCS('cs-body-${idx}')">📋 Copy Prompt</button>
        <button class="cs-btn cs-full" onclick="copyFull(${idx})">📄 Copy Full Sheet</button>
      </div>
    </div>`;
};

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

window.setChatMode = (m) => { chatMode = m; window.goTo('chat'); };
window.peSet = (f, v) => { formData[f] = v; window.goTo('chat'); };

window.clearChat = () => {
  if (window.appState) {
    window.appState.msgs = [window.appState.msgs[0]];
  }
  window.goTo('chat');
};

window.peForge = async () => {
  const ideaEl = document.getElementById('pe-idea');
  if (ideaEl) formData.idea = ideaEl.value;
  if (!formData.idea.trim()) { window.showToast('Describe your idea first!'); return; }
  if (!formData.character)   { window.showToast('Pick a character!'); return; }
  if (!formData.platform)    { window.showToast('Pick a platform!'); return; }

  const char = CAST.find(c => c.id === formData.character);
  const plat = PLATFORMS.find(p => p.id === formData.platform);
  const tone = TONES.find(t => t.id === formData.tone);
  const loc  = formData.location || 'Pine Barron Farms';
  const ctx  = getPlatformContext(formData.platform);

  const prompt = `You are North, AI director of Pine Barron Farms. Generate a FULL PROFESSIONAL CALL SHEET.

IDEA: ${formData.idea}
CHARACTER: ${char.name} (${char.soraId}) · ${char.role} · Props: ${char.props.join(', ')}
LOCATION: ${loc}
TONE: ${tone ? tone.label + ' — ' + tone.desc : 'Cinematic'}
PLATFORM: ${plat.name} — ${plat.best_for}
PLATFORM CONTEXT: ${ctx}

OUTPUT THIS EXACT STRUCTURE:

═══════════════════════════════════════
  ${plat.name.toUpperCase()} · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    ${plat.format}
LOCATION:  ${loc}
CHARACTER: ${char.name} (${char.soraId})
PROPS:     [which props appear in scene]
TONE:      ${tone ? tone.label : 'Cinematic'}
───────────────────────────────────────
HOOK (0-1.5s):
[Scroll-stopping opening, present tense]

SCENE:
[2-3 cinematic sentences. Lock ${char.soraId} at least once. Hyper-specific details.]

CAMERA:
[Angle + movement + lens — one line]

AUDIO:
[Ambient + action sound + music]
───────────────────────────────────────
DIRECTOR'S NOTE:
[Why this works for ${plat.name} specifically]
───────────────────────────────────────
CLEAN PROMPT
[Raw paste-ready prompt — no labels, no formatting, just the optimized text for ${plat.name}]
═══════════════════════════════════════`;

  formStep = 'generating';
  window.goTo('chat');
  await window.send(prompt);
  formStep = 'idle';
  chatMode = 'chat';
  window.goTo('chat');
};

window.sendFreeChat = () => {
  const el = document.getElementById('chat-input');
  if (!el?.value.trim()) return;
  const text = el.value.trim();
  el.value = '';
  window.send(text);
};

window.copyCS = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Prompt copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.copyFull = (idx) => {
  const msgs = window.appState?.msgs || [];
  const msg  = msgs[idx];
  if (!msg) return;
  navigator.clipboard.writeText(msg.content.trim())
    .then(() => window.showToast('✓ Full call sheet copied!'))
    .catch(() => window.showToast('Copy failed'));
};

export const mount = (state) => {
  if (chatMode === 'chat') {
    setTimeout(() => document.getElementById('chat-bottom')
      ?.scrollIntoView({ behavior:'smooth' }), 100);
  }
};
