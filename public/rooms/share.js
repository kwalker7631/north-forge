// share.js — Read-only public call sheet viewer (Crew Share)
// Loaded when URL path matches /s/{token}

export const render = (state) => {
  const d = state.shareData;
  if (!d) return `
    <div class="room-wrap">
      <div style="text-align:center;padding:80px 20px;color:#64748b;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🔗</div>
        <div style="font-size:1.1rem;">Loading call sheet…</div>
      </div>
    </div>`;

  const score     = d.score != null ? d.score : null;
  const scoreBar  = score != null
    ? `<div class="share-score">
         <span class="share-score-label">VIRAL SCORE</span>
         <span class="share-score-val" style="color:${score>=8?'#4ade80':score>=5?'#fbbf24':'#f87171'}">${score}/10</span>
       </div>`
    : '';

  const ideaLine  = d.idea
    ? `<div class="share-idea">"${d.idea}"</div>`
    : '';

  const cleanText = (d.clean || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  return `
<div class="room-wrap">
  <div style="max-width:720px;margin:0 auto;">
    <div class="share-header">
      <div class="share-brand">
        <span style="color:#38bdf8;font-size:1.4rem;">🎬</span>
        <span style="color:#fff;font-size:1.1rem;font-weight:bold;margin-left:8px;">North Forge</span>
        <span style="color:#64748b;font-size:0.85rem;margin-left:6px;">· Pine Barron Farms</span>
      </div>
      <div class="share-badge">Call Sheet</div>
    </div>

    ${ideaLine}
    ${scoreBar}

    <div class="share-prompt-box">
      <div class="share-prompt-label">CLEAN PROMPT</div>
      <div class="share-prompt-text" id="share-prompt-text">${cleanText}</div>
    </div>

    <div class="share-actions">
      <button class="share-btn" onclick="shareCopy()">📋 Copy Prompt</button>
      <button class="share-btn share-btn-go" onclick="window.location.href='https://north-forge-ai.web.app'">
        Open North Forge ↗
      </button>
    </div>

    <div class="share-footer">
      Shared via North Forge AI Studio · Pine Barron Farms, NJ
    </div>
  </div>
</div>

<style>
.share-header{display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #1e293b;}
.share-badge{background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid #38bdf844;
  border-radius:6px;padding:3px 10px;font-size:0.78rem;letter-spacing:1px;}
.share-idea{color:#94a3b8;font-style:italic;margin-bottom:16px;font-size:0.95rem;
  padding:10px 14px;background:rgba(15,23,42,0.6);border-radius:8px;
  border-left:3px solid #38bdf844;}
.share-score{display:flex;align-items:center;gap:10px;margin-bottom:16px;
  padding:10px 14px;background:rgba(15,23,42,0.6);border-radius:8px;}
.share-score-label{color:#64748b;font-size:0.8rem;letter-spacing:1px;}
.share-score-val{font-size:1.3rem;font-weight:bold;}
.share-prompt-box{background:rgba(15,23,42,0.8);border:1px solid #1e293b;
  border-radius:10px;padding:20px;margin-bottom:20px;}
.share-prompt-label{color:#38bdf8;font-size:0.75rem;letter-spacing:2px;
  margin-bottom:12px;font-weight:bold;}
.share-prompt-text{color:#e2e8f0;line-height:1.7;white-space:pre-wrap;font-size:0.95rem;}
.share-actions{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;}
.share-btn{padding:10px 18px;border:1px solid #334155;border-radius:8px;
  background:rgba(15,23,42,0.8);color:#cbd5e1;cursor:pointer;
  font-family:inherit;font-size:0.9rem;transition:background 0.2s;}
.share-btn:hover{background:rgba(56,189,248,0.08);}
.share-btn-go{background:rgba(56,189,248,0.12);color:#38bdf8;border-color:#38bdf844;}
.share-btn-go:hover{background:rgba(56,189,248,0.2);}
.share-footer{color:#475569;font-size:0.78rem;text-align:center;
  padding-top:16px;border-top:1px solid #1e293b;}
</style>`;
};

export const mount = (state) => {
  window.shareCopy = () => {
    const el = document.getElementById('share-prompt-text');
    if (!el) return;
    navigator.clipboard.writeText(el.innerText)
      .then(() => window.showToast('📋 Copied!'))
      .catch(() => window.showToast('Copy failed'));
  };
};
