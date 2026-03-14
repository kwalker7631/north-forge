// rooms/chat.js — North Forge Prompt Engine
// Fixed: multi-character, formStep try/finally, chatMode before send, clearChat

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

// ── STATE ─────────────────────────────────────────────────────────────────────
let chatMode  = 'form';
// characters is now an ARRAY — up to 3 selections
let formData  = { idea:'', characters:[], location:'', tone:'', platform:'' };
let formStep  = 'idle';

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  // If send() was called from another room, force chat view (not form)
  if (state._forceChatView) { chatMode = 'chat'; state._forceChatView = false; }
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
  `;
};

// ── FORM VIEW ─────────────────────────────────────────────────────────────────
const formView = () => `
  <div class="pe-wrap">
    <div class="pe-title">🎬 Prompt Engine</div>
    <div class="pe-sub">Fill in the details. North builds a full call sheet + clean paste-ready prompt.</div>

    <div class="pe-field">
      <label class="pe-label">1 · Your Idea</label>
      <textarea class="pe-textarea" id="pe-idea"
        placeholder="Randy finds a massive geode underground. Luna shows up in the cave somehow...">${formData.idea}</textarea>
    </div>

    <div class="pe-field">
      <label class="pe-label">2 · Characters
        <span style="color:#64748b;font-weight:400;text-transform:none;letter-spacing:0;font-size:1.1em;">
          — pick up to 3
          ${formData.characters.length > 0
            ? `<span style="color:#38bdf8;font-weight:900;">(${formData.characters.length} selected)</span>`
            : ''}
        </span>
      </label>
      <div class="pe-grid">
        ${CAST.map(c => {
          const sel = formData.characters.includes(c.id);
          const maxed = !sel && formData.characters.length >= 3;
          return `
            <div class="pe-opt ${sel?'sel':''} ${maxed?'maxed':''}"
                 onclick="${maxed ? "window.showToast('Max 3 characters')" : `peToggleChar('${c.id}')`}">
              <div class="pe-opt-icon">${c.icon}</div>
              <div>
                <div class="pe-opt-name">${c.name.split(' ')[0]}</div>
                <div class="pe-opt-sub">${c.soraId}</div>
              </div>
              ${sel ? `<div style="margin-left:auto;color:#38bdf8;font-size:0.8em;font-weight:900;">✓</div>` : ''}
            </div>`;
        }).join('')}
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
            <div>
              <div class="pe-opt-name">${t.label.split(' ').slice(1).join(' ')}</div>
              <div class="pe-opt-sub">${t.desc}</div>
            </div>
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
            <div>
              <div class="pe-opt-name" style="${formData.platform===p.id?`color:${p.color};`:''}">${p.name}</div>
              <div class="pe-opt-sub">${p.maker}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <button class="pe-forge-btn" onclick="peForge()" ${formStep==='generating'?'disabled':''}>
      ${formStep==='generating'
        ? '<span style="animation:spin 1s linear infinite;display:inline-block;">⏳</span> North is building your call sheet...'
        : '🎬 FORGE FULL CALL SHEET'}
    </button>
  </div>
`;

// ── CHAT VIEW ─────────────────────────────────────────────────────────────────
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

// ── VIRAL SCORE EXTRACTOR ─────────────────────────────────────────────────────
const extractViralScore = (text) => {
  const m = text.match(/VIRAL SCORE:\s*(\d+)\/10([^\n]*)/i);
  if (!m) return null;
  const score = parseInt(m[1]);
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';
  return { score, color, note: m[2].trim().replace(/^[·—\s]+/, '') };
};

// ── CALL SHEET BLOCK ──────────────────────────────────────────────────────────
const csBlock = (text, idx) => {
  if (!/CLEAN PROMPT|CALL SHEET|═══/i.test(text)) return '';
  const m = text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
  const clean = m ? m[1].trim() : '';
  if (!clean) return '';
  const vs = extractViralScore(text);
  return `
    <div class="callsheet">
      <div style="color:#38bdf8;font-size:0.6em;font-weight:900;letter-spacing:2px;margin-bottom:8px;">📋 CALL SHEET READY</div>
      ${vs ? `<div class="vs-badge" style="background:${vs.color}18;border:1px solid ${vs.color}55;color:${vs.color};">🔥 ${vs.score}/10 VIRAL SCORE${vs.note ? ` · <span style="font-weight:500;font-size:0.9em;">${esc(vs.note)}</span>` : ''}</div>` : ''}
      <div class="cs-body" id="cs-body-${idx}">${esc(clean)}</div>
      <div class="cs-actions">
        <button class="cs-btn cs-copy" onclick="copyCS('cs-body-${idx}')">📋 Copy Prompt</button>
        <button class="cs-btn cs-full" onclick="copyFull(${idx})">📄 Copy Full Sheet</button>
        <button class="cs-btn cs-score" onclick="viralCheck(${idx})">🔥 Score Virality</button>
      </div>
    </div>`;
};

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// (styles moved to index.html global stylesheet)

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.setChatMode = (m) => { chatMode = m; window.goTo('chat'); };

window.peSet = (f, v) => {
  // always save textarea before ANY re-render
  const el = document.getElementById('pe-idea');
  if (el) formData.idea = el.value;
  formData[f] = v;
  window.goTo('chat');
};

// toggle character in/out of multi-select array
window.peToggleChar = (id) => {
  const el = document.getElementById('pe-idea');
  if (el) formData.idea = el.value;
  const idx = formData.characters.indexOf(id);
  if (idx === -1) {
    if (formData.characters.length < 3) formData.characters.push(id);
  } else {
    formData.characters.splice(idx, 1);
  }
  window.goTo('chat');
};

window.clearChat = () => {
  window._northClearMsgs?.();
  window.goTo('chat');
};

window.peForge = async () => {
  // capture latest idea text
  const ideaEl = document.getElementById('pe-idea');
  if (ideaEl) formData.idea = ideaEl.value;

  // validate
  if (!formData.idea.trim())           { window.showToast('Describe your idea first!'); return; }
  if (!formData.characters.length)     { window.showToast('Pick at least one character!'); return; }
  if (!formData.platform)              { window.showToast('Pick a platform!'); return; }

  const chars = formData.characters.map(id => CAST.find(c => c.id === id)).filter(Boolean);
  const plat  = PLATFORMS.find(p => p.id === formData.platform);
  const tone  = TONES.find(t => t.id === formData.tone);
  const loc   = formData.location || 'Pine Barron Farms';
  const ctx   = getPlatformContext(formData.platform);

  // multi-character block for prompt
  const charBlock = chars.map(c =>
    `  ${c.name} (${c.soraId}) · ${c.role} · Props: ${c.props.join(', ')}`
  ).join('\n');

  const soraIds = chars.map(c => c.soraId).join(', ');

  const prompt = `You are North, AI director of Pine Barron Farms. Generate a FULL PROFESSIONAL CALL SHEET.

IDEA: ${formData.idea}
CAST (${chars.length} character${chars.length>1?'s':''}):
${charBlock}
LOCATION: ${loc}
TONE: ${tone ? tone.label + ' — ' + tone.desc : 'Cinematic'}
PLATFORM: ${plat.name} — ${plat.best_for}
PLATFORM CONTEXT: ${ctx}

IMPORTANT: Lock all character Sora IDs (${soraIds}) into the scene description.
${chars.length > 1 ? 'Show how the characters interact with each other.' : ''}

OUTPUT THIS EXACT STRUCTURE:

═══════════════════════════════════════
  ${plat.name.toUpperCase()} · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    ${plat.format}
LOCATION:  ${loc}
CAST:      ${chars.map(c=>`${c.name} (${c.soraId})`).join(', ')}
PROPS:     [which props appear in scene]
TONE:      ${tone ? tone.label : 'Cinematic'}
───────────────────────────────────────
HOOK (0-1.5s):
[Scroll-stopping opening, present tense]

SCENE:
[2-3 cinematic sentences. Use ALL Sora IDs at least once. Hyper-specific details.]

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

  // switch to chat FIRST so user sees the loading state
  formStep  = 'generating';
  chatMode  = 'chat';
  window.goTo('chat');

  // try/finally guarantees formStep always resets
  try {
    await window.send(prompt);
  } finally {
    formStep = 'idle';
    window.goTo('chat');
  }
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
    .catch(() => window.showToast('Copy failed — select and copy manually'));
};

window.copyFull = (idx) => {
  const rows = document.querySelectorAll('.msg-row:not(.user) .msg-text');
  const el = rows[idx];
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Full call sheet copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.viralCheck = (idx) => {
  const el = document.getElementById(`cs-body-${idx}`);
  if (!el) return;
  const prompt = el.textContent.trim().slice(0, 500);
  window.send(
    `Score this video prompt for viral potential on TikTok / Instagram Reels / YouTube Shorts.\n` +
    `Give it a score 1–10 and explain: the scroll-stop power of the hook, the emotional hook, ` +
    `and the single biggest change that would boost the score.\n\nPROMPT:\n${prompt}`
  );
};

export const mount = (state) => {
  if (chatMode === 'chat') {
    setTimeout(() => document.getElementById('chat-bottom')
      ?.scrollIntoView({ behavior:'smooth' }), 100);
  }
};
