// rooms/chat.js — North Forge Chat: render, chat view, call sheet actions
// Form/Prompt Engine lives in chat-form.js

import { formView, resetFormStep } from './chat-form.js';
import { esc }                    from '../utils.js';

// ── STATE ─────────────────────────────────────────────────────────────────────
let chatMode = 'form';

// ── QUICK-STARTS (free chat seed prompts) ─────────────────────────────────────
const QUICK_STARTS = [
  { icon:'🌾', label:'Today\'s shot',    text:'What\'s the best shot to film at Pine Barron Farms right now based on today\'s conditions?' },
  { icon:'💡', label:'Inspire me',       text:'Surprise me with a scene idea for Pine Barron Farms. Make it scroll-stopping.' },
  { icon:'🎬', label:'Forge a scene',    text:'Forge a cinematic scene at the Big Red Barn. Full call sheet format.' },
  { icon:'🪪', label:'Sora sheet — Ken', text:'Build a Sora 2 character consistency sheet for Ken Walker (@kennethwalker479). Include appearance anchor, props, and 3 example prompts.' },
  { icon:'🐐', label:'Luna chaos',       text:'Luna (@kennethwa.luna) has escaped again. Build a Sora 2 scene around it. Full call sheet.' },
  { icon:'⛏️', label:'Randy\'s Cave',    text:'Forge a scene: Randy "Sarge" (@geodudenj) discovers something in the cave. Camo helmet, headlamp, rock hammer. Sora 2 call sheet.' },
  { icon:'🔍', label:'Critique',         text:'Paste a video prompt here and I\'ll critique it — what\'s generic, what\'s missing, what breaks character consistency — then rewrite it locked to Pine Barron Farms.' },
];

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => {
  const hasKey  = state.keys.anthropic || state.keys.gemini;
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

// ── CHAT VIEW ─────────────────────────────────────────────────────────────────
const chatView = (state) => {
  const isEmpty = state.msgs.length <= 1 && !state.loading;
  return `
  <div class="chat-msgs" id="chat-messages">
    ${state.msgs.map((m,i)=>`
      <div class="msg-row ${m.role}">
        <div class="msg-ava">${m.role==='assistant'?'🧠':'👨‍🌾'}</div>
        <div class="msg-bub">
          ${m.role==='assistant'?'<div class="msg-lbl">North · Loft Lab</div>':''}
          <div class="msg-text" id="msg-text-${i}">${esc(m.content)}</div>
          ${m.role==='assistant' ? csBlock(m.content, i) : ''}
          ${m.role==='assistant' ? `<button class="msg-copy-btn" onclick="copyMsgText(${i})">📋 Copy</button>` : ''}
        </div>
      </div>`).join('')}
    ${state.loading ? `
      <div class="north-thinking">
        <span style="font-size:1.4em;">🧠</span> North is thinking
        <span class="tdot">●</span><span class="tdot">●</span><span class="tdot">●</span>
      </div>` : ''}
    <div id="chat-bottom"></div>
  </div>
  ${isEmpty ? `
  <div class="qs-strip">
    <div class="qs-label">QUICK START</div>
    <div class="qs-row">
      ${QUICK_STARTS.map(q=>`
        <button class="qs-btn" onclick="fillChat(${JSON.stringify(q.text)})">
          <span class="qs-icon">${q.icon}</span>
          <span class="qs-lbl">${q.label}</span>
        </button>`).join('')}
    </div>
  </div>` : ''}
  <div class="chat-input-bar">
    <textarea id="chat-input" class="chat-ta" rows="2"
      placeholder="Tell North what's on your mind..."
      onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendFreeChat();}"></textarea>
    <button class="chat-send" onclick="sendFreeChat()">➤</button>
  </div>
`;
};

// ── CALL SHEET BLOCK ──────────────────────────────────────────────────────────
const csBlock = (text, idx) => {
  if (!/CLEAN PROMPT|CALL SHEET|═══/i.test(text)) return '';
  const m = text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
  const clean = m ? m[1].trim() : '';
  if (!clean) return '';
  const vs = text.match(/VIRAL SCORE:\s*(\d+)\/10\s*[—\-]\s*(.+)/i);
  const score = vs ? parseInt(vs[1]) : null;
  const reason = vs ? vs[2].trim() : null;
  const vsColor = score >= 8 ? '#22c55e' : score >= 5 ? '#d97706' : score ? '#ef4444' : null;
  const vsBadge = score ? `<div class="vs-badge cs-score" style="background:${vsColor};">🔥 VIRAL SCORE: ${score}/10 — ${esc(reason)}</div>` : '';
  return `
    <div class="callsheet">
      <div style="color:#38bdf8;font-size:0.6em;font-weight:900;letter-spacing:2px;margin-bottom:10px;">📋 CALL SHEET READY</div>
      ${vsBadge}
      <div class="cs-body" id="cs-body-${idx}">${esc(clean)}</div>
      <div class="cs-actions">
        <div class="cs-row-primary">
          <button class="cs-btn cs-copy" onclick="copyCS('cs-body-${idx}')">
            <span class="cs-btn-icon">📋</span><span class="cs-btn-lbl">Copy Prompt</span>
          </button>
          <button class="cs-btn cs-full" onclick="copyFull(${idx})">
            <span class="cs-btn-icon">📄</span><span class="cs-btn-lbl">Copy Full</span>
          </button>
          <button class="cs-btn cs-extend" onclick="extendCS(${idx})">
            <span class="cs-btn-icon">⬡</span><span class="cs-btn-lbl">Extend 35s</span>
          </button>
        </div>
        <div class="cs-row-secondary">
          <button class="cs-btn cs-mini" onclick="variantsCS(${idx})">↻ Variants</button>
          <button class="cs-btn cs-mini" onclick="shotListCS(${idx})">📋 Shot List</button>
          <button class="cs-btn cs-mini" onclick="saveMD(${idx})">💾 MD</button>
          <button class="cs-btn cs-mini" onclick="saveTXT(${idx})">📝 TXT</button>
          <button class="cs-btn cs-mini cs-pin" onclick="pinMsg(${idx})">⭐ Pin</button>
          <button class="cs-btn cs-mini cs-share" onclick="shareCS(${idx})">🔗 Share</button>
        </div>
      </div>
    </div>`;
};

// esc() imported from utils.js

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = () => `<style>
  .no-key-banner{background:rgba(245,158,11,0.1);border-bottom:2px solid #f59e0b44;padding:10px 20px;font-size:0.76em;color:#fbbf24;font-weight:700;}
  .chat-mode-bar{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:2px solid #1e293b;background:rgba(2,6,23,0.98);flex-shrink:0;}
  .mode-btn{background:rgba(15,23,42,0.9);border:2px solid #1e293b;border-radius:10px;padding:9px 18px;color:#94a3b8;cursor:pointer;font-weight:900;font-size:0.76em;font-family:Georgia,serif;transition:all .2s;}
  .mode-btn.active{color:#fff;border-color:#38bdf8;background:rgba(56,189,248,0.12);}
  .clear-btn{background:none;border:2px solid #1e293b;border-radius:10px;padding:9px 14px;color:#94a3b8;cursor:pointer;font-size:0.76em;font-family:Georgia,serif;transition:all .2s;}
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
  .pe-reset-btn{background:none;border:2px solid #334155;border-radius:16px;padding:18px 20px;color:#94a3b8;cursor:pointer;font-size:.86em;font-weight:900;font-family:Georgia,serif;transition:all .2s;white-space:nowrap;flex-shrink:0;}
  .pe-reset-btn:hover:not(:disabled){border-color:#38bdf8;color:#38bdf8;}
  .pe-reset-btn:disabled{opacity:0.4;cursor:not-allowed;}
  .pe-rec{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:rgba(15,23,42,0.9);border:1px solid #1e293b;border-radius:12px;padding:11px 16px;margin-bottom:10px;}
  .pe-rec-label{font-size:.6em;font-weight:900;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;}
  .pe-rec-icon{font-size:1.2em;}
  .pe-rec-name{font-size:.78em;font-weight:900;}
  .pe-rec-why{flex:1;font-size:.66em;color:#64748b;line-height:1.4;min-width:0;}
  .pe-rec-use{background:none;border:1px solid #334155;border-radius:8px;padding:5px 12px;font-size:.66em;font-weight:900;cursor:pointer;font-family:Georgia,serif;white-space:nowrap;flex-shrink:0;transition:all .2s;}
  .pe-rec-use:hover{opacity:0.8;}
  .pe-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px;}
  .pe-pill{background:rgba(15,23,42,0.9);border:2px solid #1e293b;border-radius:20px;padding:7px 14px;color:#94a3b8;cursor:pointer;font-size:0.68em;font-weight:900;font-family:Georgia,serif;transition:all .2s;white-space:nowrap;}
  .pe-pill:hover{border-color:#38bdf833;color:#cbd5e1;}
  .pe-pill.sel{border-color:#38bdf8;background:rgba(56,189,248,0.14);color:#38bdf8;box-shadow:0 0 10px rgba(56,189,248,0.15);}
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
  .cs-body{font-family:monospace;font-size:0.74em;color:#bae6fd;line-height:1.7;white-space:pre-wrap;max-height:300px;overflow-y:auto;margin-bottom:14px;}
  .cs-actions{display:flex;flex-direction:column;gap:8px;}
  .cs-row-primary{display:flex;gap:8px;flex-wrap:wrap;}
  .cs-row-secondary{display:flex;gap:6px;flex-wrap:wrap;}
  .cs-btn{border:none;border-radius:12px;font-weight:900;cursor:pointer;font-family:Georgia,serif;transition:all .22s;display:flex;align-items:center;gap:7px;}
  .cs-btn-icon{font-size:1.1em;line-height:1;}
  .cs-btn-lbl{font-size:0.74em;letter-spacing:0.3px;}
  .cs-copy{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;padding:11px 18px;flex:1;box-shadow:0 4px 16px rgba(2,132,199,0.45);justify-content:center;}
  .cs-copy:hover{transform:scale(1.03);box-shadow:0 6px 22px rgba(2,132,199,0.6);}
  .cs-full{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:11px 18px;flex:1;box-shadow:0 4px 16px rgba(124,58,237,0.4);justify-content:center;}
  .cs-full:hover{transform:scale(1.03);box-shadow:0 6px 22px rgba(124,58,237,0.55);}
  .cs-extend{background:linear-gradient(135deg,#b45309,#f59e0b);color:#fff;padding:11px 18px;flex:1;box-shadow:0 4px 16px rgba(245,158,11,0.38);justify-content:center;}
  .cs-extend:hover{transform:scale(1.03);box-shadow:0 6px 22px rgba(245,158,11,0.52);}
  .cs-mini{background:rgba(15,23,42,0.85);border:1px solid #334155;color:#94a3b8;padding:7px 13px;border-radius:9px;font-size:0.66em;font-weight:900;flex-shrink:0;transition:all .2s;}
  .cs-mini:hover{border-color:#475569;color:#cbd5e1;}
  .cs-pin:hover{border-color:#f59e0b44;color:#f59e0b;}
  .cs-share:hover{border-color:#38bdf844;color:#38bdf8;}
  .msg-copy-btn{background:rgba(15,23,42,0.7);border:1px solid #334155;border-radius:8px;padding:5px 12px;color:#94a3b8;cursor:pointer;font-size:0.65em;font-family:Georgia,serif;margin-top:8px;transition:all .2s;}
  .msg-copy-btn:hover{border-color:#38bdf8;color:#38bdf8;}
  .north-thinking{display:flex;align-items:center;gap:12px;padding:12px 0;color:#38bdf8;font-weight:900;font-size:0.82em;}
  @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .tdot{animation:pulse 1.2s ease-in-out infinite;}.tdot:nth-child(2){animation-delay:.2s;}.tdot:nth-child(3){animation-delay:.4s;}
  .qs-strip{padding:10px 20px 0;flex-shrink:0;}
  .qs-label{font-size:0.52em;font-weight:900;color:#334155;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
  .qs-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;}
  .qs-row::-webkit-scrollbar{display:none;}
  .qs-btn{background:rgba(15,23,42,0.9);border:2px solid #1e293b;border-radius:12px;padding:9px 14px;cursor:pointer;font-family:Georgia,serif;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;min-width:72px;}
  .qs-btn:hover{border-color:#38bdf844;background:rgba(56,189,248,0.06);}
  .qs-icon{font-size:1.3em;line-height:1;}
  .qs-lbl{font-size:0.58em;font-weight:900;color:#94a3b8;white-space:nowrap;}
  .chat-input-bar{padding:12px 20px 16px;background:rgba(2,6,23,0.98);border-top:2px solid #1e293b;display:flex;gap:10px;flex-shrink:0;}
  .chat-ta{flex:1;background:rgba(15,23,42,0.95);border:2px solid #334155;border-radius:14px;padding:13px 16px;color:#fff;font-family:Georgia,serif;resize:none;outline:none;font-size:0.9em;transition:border-color .3s;}
  .chat-ta:focus{border-color:#38bdf8;}
  .chat-send{background:linear-gradient(135deg,#0284c7,#0369a1);border:none;border-radius:14px;width:58px;color:#fff;cursor:pointer;font-size:1.4em;transition:all .25s;}
  .chat-send:hover{transform:scale(1.06);}
</style>`;

// ── MOUNT ─────────────────────────────────────────────────────────────────────
export const mount = (state) => {
  resetFormStep();
  if (chatMode === 'chat') {
    setTimeout(() => document.getElementById('chat-bottom')
      ?.scrollIntoView({ behavior:'smooth' }), 100);
  }
};

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.setChatMode = (m) => { chatMode = m; window.goTo('chat'); };
window.clearChat   = () => { window._northClearMsgs?.(); window.goTo('chat'); };

window.fillChat = (text) => {
  window.setChatMode('chat');
  setTimeout(() => {
    const el = document.getElementById('chat-input');
    if (el) { el.value = text; el.focus(); }
  }, 80);
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
    .catch(() => window.showToast('Copy failed'));
};

window.copyFull = (msgIdx) => {
  const el = document.getElementById(`msg-text-${msgIdx}`)
          || Array.from(document.querySelectorAll('.msg-row.assistant .msg-text'))[msgIdx];
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(() => window.showToast('✓ Full sheet copied!'))
    .catch(() => window.showToast('Copy failed'));
};

window.saveMD = (msgIdx) => {
  const fullEl  = document.getElementById(`msg-text-${msgIdx}`);
  const cleanEl = document.getElementById(`cs-body-${msgIdx}`);
  if (!fullEl) return;
  const full  = fullEl.textContent.trim();
  const clean = cleanEl ? cleanEl.textContent.trim() : '';
  const date  = new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  const meta  = (rx) => full.match(rx)?.[1]?.trim() ?? '';
  const vs    = full.match(/VIRAL SCORE:\s*(\d+)\/10\s*[—\-]\s*(.+)/i);
  const blk   = (lbl) => {
    const rx = new RegExp(`\\n${lbl}[^\\n]*\\n([\\s\\S]+?)(?=\\n[A-Z][A-Z' ]{2,}\\n|\\n[─═]{4}|$)`,'i');
    return full.match(rx)?.[1]?.trim() ?? null;
  };
  const lines = ['# North Forge Call Sheet',`**Generated:** ${date}`,'**Pine Barron Farms Production — Piscataway NJ**',''];
  if (vs) lines.push(`> 🔥 **Viral Score: ${vs[1]}/10** — ${vs[2]}`,'');
  [meta(/^FORMAT:\s*(.+)/im)&&`**Format:** ${meta(/^FORMAT:\s*(.+)/im)}`,
   meta(/^LOCATION:\s*(.+)/im)&&`**Location:** ${meta(/^LOCATION:\s*(.+)/im)}`,
   meta(/^CAST:\s*(.+)/im)&&`**Cast:** ${meta(/^CAST:\s*(.+)/im)}`,
   meta(/^PROPS:\s*(.+)/im)&&`**Props:** ${meta(/^PROPS:\s*(.+)/im)}`,
  ].filter(Boolean).forEach(l=>lines.push(l));
  lines.push('','---','');
  const h=blk('HOOK'),sc=blk('SCENE'),ca=blk('CAMERA'),au=blk('AUDIO'),dn=blk("DIRECTOR.S NOTE");
  if(h)  lines.push('## Hook (0–1.5s)','',h,'');
  if(sc) lines.push('## Scene','',sc,'');
  if(ca) lines.push('## Camera','',ca,'');
  if(au) lines.push('## Audio','',au,'');
  if(dn) lines.push("## Director's Note",'',dn,'');
  if(clean) lines.push('---','','## Clean Prompt','_Paste into Sora · Kling · VEO 3 · Grok_','',clean,'');
  else if(!h&&!sc) lines.push('## Full Response','',full,'');
  const url = URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown'}));
  const a = Object.assign(document.createElement('a'),{href:url,download:`north-forge-${Date.now()}.md`});
  a.click(); URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .md!');
};

window.saveTXT = (msgIdx) => {
  const el = document.getElementById(`msg-text-${msgIdx}`);
  if (!el) return;
  const url = URL.createObjectURL(new Blob([el.innerText||el.textContent||''],{type:'text/plain'}));
  const a = Object.assign(document.createElement('a'),{href:url,download:`north-forge-${Date.now()}.txt`});
  a.click(); URL.revokeObjectURL(url);
  window.showToast('✓ Saved as .txt!');
};

window.variantsCS = (msgIdx) => {
  const cleanEl = document.getElementById(`cs-body-${msgIdx}`);
  if (!cleanEl) { window.showToast('No prompt to vary'); return; }
  const clean = cleanEl.textContent.trim();
  window.showToast('↻ Generating variants...');
  window.send(
`SCENE VARIANTS — 3 alternative takes on this exact scene. Keep all Sora IDs, cast, and location locked. Change only the variables listed.

Original:
"${clean}"

VARIANT 1 — DIFFERENT TIME: Same scene at a completely different time of day. New light, new mood.
VARIANT 2 — DIFFERENT WEATHER: Same scene with a weather change that transforms the energy.
VARIANT 3 — DIFFERENT REGISTER: Same action, different emotional tone (tense vs. playful vs. haunting).

For each: one CLEAN PROMPT (paste-ready) + one line why this version might out-perform the original.`
  );
};

window.shotListCS = (msgIdx) => {
  const fullEl = document.getElementById(`msg-text-${msgIdx}`);
  if (!fullEl) { window.showToast('No call sheet to convert'); return; }
  const full = fullEl.textContent.trim();
  window.showToast('📋 Building shot list...');
  window.send(
`SHOT LIST — Convert this call sheet into a physical production document for the day of filming.

${full}

Format it as:
═══════════════════════════════════
  SHOT LIST · Pine Barron Farms
  ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
═══════════════════════════════════
SHOT 01 | [angle] | [duration]
Setup:   [what needs to be in place before action]
Props:   [exact props needed on set]
Crew:    [who does what — Ken directs, Salem holds cam, etc.]
Action:  [exactly what happens, beat by beat]
─────────────────────────────────
[repeat for each distinct shot or beat]

End with:
PRODUCTION NOTES — timing windows, weather requirements, equipment flags.`
  );
};

window.extendCS = (msgIdx) => {
  const cleanEl = document.getElementById(`cs-body-${msgIdx}`);
  if (!cleanEl) return;
  const clean = cleanEl.textContent.trim();
  if (!clean) { window.showToast('No prompt to extend'); return; }
  window.showToast('⬡ Extending to 35s...');
  window.send(
`EXTEND INTO 3-PART SEQUENCE — 35 seconds total

Original prompt:
"${clean}"

Split this into 3 linked shots that play as a single continuous scene. Keep all Sora IDs, location, and visual tone locked across all 3 parts.

PART 1 — OPEN (10s):
Establish the world. The hook. Everything the viewer needs before the action starts. Should work as a standalone clip.

PART 2 — BUILD (15s):
The main action. What happens. Character interaction, tension, discovery, or beauty. This is the longest and most cinematic part.

PART 3 — PAYOFF (10s):
Resolution or reveal. The emotional or visual punch that earns the replay. End on a frame worth pausing.

For each part output:
- Duration and shot label
- SCENE (2 sentences, present tense, Sora IDs embedded)
- CAMERA (angle + movement)
- AUDIO (ambient → action → music)
- CLEAN PROMPT (paste-ready for the original platform)

End with: EDIT NOTE — one line on the cut points between the 3 parts.`
  );
};
