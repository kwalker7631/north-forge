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

// ── PLATFORM RECOMMENDER ──────────────────────────────────────────────────────
const PLATFORM_REASONS = {
  sora:   'Cinematic realism — character consistency locks in your Sora IDs perfectly.',
  kling:  'Physics & texture — fluid motion and material detail are Kling\'s signature.',
  veo:    'Native audio generation — dialogue, ambient sound, and music built in.',
  aurora: 'Stylized surreal output — Grok Aurora handles the weird and dreamcore.',
};

const recommendPlatform = (idea) => {
  if (!idea?.trim()) return null;
  const t = idea.toLowerCase();
  if (/dialogue|speaks|says|conversat|audio|voice|sing|talk/i.test(t))           return 'veo';
  if (/fluid|water|fire|rain|smoke|fabric|texture|physics|splash|cloth|pour/i.test(t)) return 'kling';
  if (/weird|surreal|dream|psyche|strange|supernat|horror|jersey devil|cryptid|ufo|paranormal|jeeb/i.test(t)) return 'aurora';
  return 'sora';
};

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
  const hasKey = state.keys.anthropic || state.keys.gemini;
  // Consume one-shot chatMode signal from app.js (forge from Cast/Platforms/Home)
  if (state.chatMode) { chatMode = state.chatMode; state.chatMode = null; }
  const showChat = chatMode === 'chat' || state.loading;
  return `
    <div style="height:100%;display:flex;flex-direction:column;">
      ${!hasKey ? `<div class="no-key-banner">🔑 No API key — <span onclick="goTo('setup')" style="color:#38bdf8;cursor:pointer;text-decoration:underline;">go to Setup</span></div>` : ''}
      <div class="chat-mode-bar">
        <button class="mode-btn ${!showChat?'active':''}" onclick="setChatMode('form')">📋 Prompt Engine</button>
        <button class="mode-btn ${showChat?'active':''}" onclick="setChatMode('chat')">💬 Free Chat</button>
        <div style="flex:1;"></div>
        <button class="clear-btn" onclick="clearChat()">🗑 Clear</button>
      </div>
      ${!showChat ? formView() : chatView(state)}
    </div>
    ${styles()}
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
      ${(() => {
        const rec = recommendPlatform(formData.idea);
        const p   = rec ? PLATFORMS.find(x => x.id === rec) : null;
        return p ? `
          <div class="pe-rec">
            <span class="pe-rec-label">North suggests</span>
            <span class="pe-rec-icon">${p.icon}</span>
            <span class="pe-rec-name" style="color:${p.color};">${p.name}</span>
            <span class="pe-rec-why">${PLATFORM_REASONS[rec]}</span>
            <button class="pe-rec-use" onclick="peSet('platform','${p.id}')" style="border-color:${p.color}44;color:${p.color};">Use ${p.name} →</button>
          </div>` : '';
      })()}
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

    <div style="display:flex;gap:10px;margin-top:6px;">
      <button class="pe-forge-btn" onclick="peForge()" ${formStep==='generating'?'disabled':''} style="flex:1;margin-top:0;">
        ${formStep==='generating'
          ? '<span style="animation:spin 1s linear infinite;display:inline-block;">⏳</span> North is building...'
          : '🎬 FORGE FULL CALL SHEET'}
      </button>
      <button class="pe-reset-btn" onclick="peReset()" title="Clear all selections" ${formStep==='generating'?'disabled':''}>↺ New</button>
    </div>
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
          <div class="msg-text" id="msg-text-${i}">${esc(m.content)}</div>
          ${m.role==='assistant' ? csBlock(m.content, i) : ''}
          ${m.role==='assistant' ? `<button class="msg-copy-btn" onclick="copyMsgText(${i})" title="Copy message">📋 Copy</button>` : ''}
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

// ── CALL SHEET BLOCK ──────────────────────────────────────────────────────────
const csBlock = (text, idx) => {
  if (!/CLEAN PROMPT|CALL SHEET|═══/i.test(text)) return '';
  const m = text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
  const clean = m ? m[1].trim() : '';
  if (!clean) return '';

  // Extract viral score from North's response
  const vs = text.match(/VIRAL SCORE:\s*(\d+)\/10\s*[—\-]\s*(.+)/i);
  const score = vs ? parseInt(vs[1]) : null;
  const reason = vs ? vs[2].trim() : null;
  const vsColor = score >= 8 ? '#22c55e' : score >= 5 ? '#d97706' : score ? '#ef4444' : null;
  const vsBadge = score ? `
    <div class="vs-badge cs-score" style="background:${vsColor};">
      🔥 VIRAL SCORE: ${score}/10 — ${esc(reason)}
    </div>` : '';

  return `
    <div class="callsheet">
      <div style="color:#38bdf8;font-size:0.6em;font-weight:900;letter-spacing:2px;margin-bottom:10px;">📋 CALL SHEET READY</div>
      ${vsBadge}
      <div class="cs-body" id="cs-body-${idx}">${esc(clean)}</div>
      <div class="cs-actions">
        <button class="cs-btn cs-copy" onclick="copyCS('cs-body-${idx}')">📋 Copy Prompt</button>
        <button class="cs-btn cs-full" onclick="copyFull(${idx})">📄 Copy Full Sheet</button>
        <button class="cs-btn cs-save" onclick="saveMD(${idx})">💾 Save MD</button>
        <button class="cs-btn cs-save" onclick="saveTXT(${idx})">📝 Save TXT</button>
        <button class="cs-btn cs-pin"  onclick="pinMsg(${idx})">⭐ Pin</button>
        <button class="cs-btn cs-share" onclick="shareCS(${idx})">🔗 Share</button>
      </div>
    </div>`;
};

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = () => `<style>
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
  .pe-opt:hover:not(.maxed){border-color:#38bdf833;}
  .pe-opt.sel{border-color:#38bdf8;background:rgba(56,189,248,0.12);}
  .pe-opt.maxed{opacity:0.4;cursor:not-allowed;}
  .pe-opt-icon{font-size:1.3em;flex-shrink:0;}
  .pe-opt-name{font-weight:900;font-size:0.74em;color:#fff;}
  .pe-opt-sub{font-size:0.6em;color:#64748b;margin-top:1px;}
  .pe-select{width:100%;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:12px;padding:12px 14px;color:#fff;font-family:Georgia,serif;font-size:0.88em;outline:none;cursor:pointer;}
  .pe-select:focus{border-color:#38bdf8;}
  option{background:#020617;}
  .pe-forge-btn{width:100%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:16px;padding:18px;font-weight:900;font-size:1.05em;cursor:pointer;font-family:Georgia,serif;transition:all .25s;margin-top:6px;box-shadow:0 6px 24px rgba(2,132,199,0.35);}
  .pe-forge-btn:hover:not(:disabled){transform:scale(1.02);}
  .pe-forge-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .pe-reset-btn{background:none;border:2px solid #334155;border-radius:16px;padding:18px 20px;color:#475569;cursor:pointer;font-size:.86em;font-weight:900;font-family:Georgia,serif;transition:all .2s;white-space:nowrap;flex-shrink:0;}
  .pe-reset-btn:hover:not(:disabled){border-color:#38bdf8;color:#38bdf8;}
  .pe-reset-btn:disabled{opacity:0.4;cursor:not-allowed;}
  .pe-rec{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:rgba(15,23,42,0.9);border:1px solid #1e293b;border-radius:12px;padding:11px 16px;margin-bottom:10px;}
  .pe-rec-label{font-size:.6em;font-weight:900;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;}
  .pe-rec-icon{font-size:1.2em;}
  .pe-rec-name{font-size:.78em;font-weight:900;}
  .pe-rec-why{flex:1;font-size:.66em;color:#64748b;line-height:1.4;min-width:0;}
  .pe-rec-use{background:none;border:1px solid #334155;border-radius:8px;padding:5px 12px;font-size:.66em;font-weight:900;cursor:pointer;font-family:Georgia,serif;white-space:nowrap;flex-shrink:0;transition:all .2s;}
  .pe-rec-use:hover{opacity:0.8;}
  .vs-badge{display:block;border-radius:10px;padding:10px 16px;font-size:.72em;font-weight:900;color:#fff;margin-bottom:10px;}
  .chat-msgs{flex:1;overflow-y:auto;padding:20px 24px 10px;}
  .msg-row{display:flex;gap:14px;margin-bottom:26px;align-items:flex-start;}
  .msg-row.user{flex-direction:row-reverse;}
  .msg-ava{width:46px;height:46px;border-radius:50% 50% 50% 8px;flex-shrink:0;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center;font-size:1.3em;}
  .msg-row.user .msg-ava{background:linear-gradient(135deg,#166534,#14532d);border-radius:50%;}
  .msg-bub{max-width:84%;background:rgba(15,23,42,0.95);border:2px solid #1e293b;padding:16px 20px;border-radius:6px 20px 20px 20px;overflow-wrap:break-word;word-break:break-word;}
  .msg-row.user .msg-bub{background:rgba(20,83,45,0.92);border-color:#14532d;border-radius:20px 6px 20px 20px;}
  .msg-lbl{color:#38bdf8;font-size:0.56em;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;}
  .msg-text{color:#f1f5f9;font-size:0.88em;line-height:1.8;white-space:pre-wrap;}
  .callsheet{background:#000;border:2px solid #38bdf8;border-radius:14px;padding:18px;margin-top:14px;}
  .cs-body{font-family:monospace;font-size:0.74em;color:#bae6fd;line-height:1.7;white-space:pre-wrap;max-height:300px;overflow-y:auto;overflow-x:auto;margin-bottom:12px;}
  .cs-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .cs-btn{border:none;border-radius:10px;padding:10px 18px;font-weight:900;font-size:0.72em;cursor:pointer;font-family:Georgia,serif;transition:all .2s;}
  .cs-copy{background:#0284c7;color:#fff;}
  .cs-full{background:#7c3aed;color:#fff;}
  .cs-save{background:#065f46;color:#fff;}
  .cs-pin{background:#92400e;color:#fff;}
  .cs-share{background:#1e3a5f;color:#38bdf8;border:1px solid #38bdf844;}
  .msg-copy-btn{background:rgba(15,23,42,0.7);border:1px solid #334155;border-radius:8px;padding:5px 12px;color:#94a3b8;cursor:pointer;font-size:0.65em;font-family:Georgia,serif;margin-top:8px;transition:all .2s;}
  .msg-copy-btn:hover{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,0.06);}
  .north-thinking{display:flex;align-items:center;gap:12px;padding:12px 0;color:#38bdf8;font-weight:900;font-size:0.82em;}
  @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .tdot{animation:pulse 1.2s ease-in-out infinite;}.tdot:nth-child(2){animation-delay:.2s;}.tdot:nth-child(3){animation-delay:.4s;}
  .chat-input-bar{padding:12px 20px 16px;background:rgba(2,6,23,0.98);border-top:2px solid #1e293b;display:flex;gap:10px;flex-shrink:0;}
  .chat-ta{flex:1;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:14px;padding:13px 16px;color:#fff;font-family:Georgia,serif;resize:none;outline:none;font-size:0.9em;transition:border-color .3s;}
  .chat-ta:focus{border-color:#38bdf8;}
  .chat-send{background:linear-gradient(135deg,#0284c7,#0369a1);border:none;border-radius:14px;width:58px;color:#fff;cursor:pointer;font-size:1.4em;transition:all .25s;}
  .chat-send:hover{transform:scale(1.06);}
</style>`;

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.setChatMode = (m) => { chatMode = m; window.goTo('chat'); };

window.peReset = () => {
  formData = { idea:'', characters:[], location:'', tone:'', platform:'' };
  chatMode = 'form';
  window.goTo('chat');
};

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
    window.render?.();
  }
};

window.sendFreeChat = () => {
  const el = document.getElementById('chat-input');
  if (!el?.value.trim()) return;
  const text = el.value.trim();
  el.value = '';
  window.send(text);
};

window.copyMsgText = (idx) => {
  const el = document.getElementById(`msg-text-${idx}`);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.copyCS = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Prompt copied!'))
    .catch(() => window.showToast('Copy failed — select and copy manually'));
};

window.copyFull = (msgIdx) => {
  // Use id="msg-text-{msgIdx}" set directly on each bubble — no index guessing.
  const el = document.getElementById(`msg-text-${msgIdx}`);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Full call sheet copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.saveMD = (msgIdx) => {
  const fullEl  = document.getElementById(`msg-text-${msgIdx}`);
  const cleanEl = document.getElementById(`cs-body-${msgIdx}`);
  if (!fullEl) return;

  const fullText  = fullEl.textContent.trim();
  const cleanText = cleanEl ? cleanEl.textContent.trim() : '';
  const date = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

  // Pull single-line metadata fields
  const meta = (rx) => fullText.match(rx)?.[1]?.trim() ?? '';
  const format   = meta(/^FORMAT:\s*(.+)/im);
  const location = meta(/^LOCATION:\s*(.+)/im);
  const cast     = meta(/^CAST:\s*(.+)/im);
  const props    = meta(/^PROPS:\s*(.+)/im);
  const tone     = meta(/^TONE:\s*(.+)/im);
  const vsMatch  = fullText.match(/VIRAL SCORE:\s*(\d+)\/10\s*[—\-]\s*(.+)/i);

  // Pull multi-line sections — grab everything after the header until next separator or all-caps header
  const block = (label) => {
    const rx = new RegExp(
      `\\n${label}[^\\n]*\\n([\\s\\S]+?)(?=\\n[A-Z][A-Z' ]{2,}\\n|\\n[─═]{4}|$)`, 'i'
    );
    return fullText.match(rx)?.[1]?.trim() ?? null;
  };

  const hook    = block('HOOK');
  const scene   = block('SCENE');
  const camera  = block('CAMERA');
  const audio   = block('AUDIO');
  const dirNote = block("DIRECTOR.S NOTE");

  const lines = [
    '# North Forge Call Sheet',
    `**Generated:** ${date}`,
    '**Pine Barron Farms Production — Piscataway NJ**',
    '',
  ];

  if (vsMatch) lines.push(`> 🔥 **Viral Score: ${vsMatch[1]}/10** — ${vsMatch[2]}`, '');

  [
    format   && `**Format:** ${format}`,
    location && `**Location:** ${location}`,
    cast     && `**Cast:** ${cast}`,
    props    && `**Props:** ${props}`,
    tone     && `**Tone:** ${tone}`,
  ].filter(Boolean).forEach(l => lines.push(l));

  lines.push('', '---', '');

  if (hook)    lines.push('## Hook (0–1.5s)', '', hook, '');
  if (scene)   lines.push('## Scene', '', scene, '');
  if (camera)  lines.push('## Camera', '', camera, '');
  if (audio)   lines.push('## Audio', '', audio, '');
  if (dirNote) lines.push("## Director's Note", '', dirNote, '');

  if (cleanText) {
    lines.push('---', '', '## Clean Prompt', '_Paste directly into Sora · Kling · VEO 3 · Grok_', '', cleanText, '');
  } else if (!hook && !scene) {
    // Freeform North response — no structured sections found
    lines.push('## Full Response', '', fullText, '');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `north-forge-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .md!');
};

window.saveTXT = (msgIdx) => {
  const el = document.getElementById(`msg-text-${msgIdx}`);
  if (!el) return;
  const text = el.innerText || el.textContent || '';
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `north-forge-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .txt!');
};

export const mount = (state) => {
  // Reset stuck formStep if user navigated away mid-forge
  if (formStep === 'generating') formStep = 'idle';
  if (chatMode === 'chat') {
    setTimeout(() => document.getElementById('chat-bottom')
      ?.scrollIntoView({ behavior:'smooth' }), 100);
  }
};
