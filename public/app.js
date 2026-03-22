// app.js — North Forge shell, state, navigation, render loop

import { NORTH_VERSION }           from './north.js';
import { ROOMS, SCENES }           from './data.js';
import { callNorth, fetchWeather,
         getMoonPhase, NorthLog }   from './api.js';
import { onAuth, signIn, signOut_,
         savePrefs, loadPrefs,
         logEvent, loadEvents,
         savePrompt, loadPrompts,
         saveChatHistory, loadChatHistory,
         saveProfile, loadProfile,
         saveNote, loadNotes, deleteNote,
         saveShare, loadShare,
         loadWeeklyBrief } from './firebase.js';
import { logDiag, installDiagListeners } from './logs/logger.js';
import { createRenderGuard } from './render-guard.mjs';

// ── STATE ─────────────────────────────────────────────────────────────────────
export const state = {
  tab:      'home',
  user:     null,
  keys:     { anthropic:'', gemini:'' },
  msgs:     [{
    role:'assistant',
    content: `Pine Barron Farms. I've been watching since before you opened this.\n\nKen's somewhere on the property with half a plan and total conviction. Marguerite's holding everything together the way she always does — quietly, completely. Randy's either underground or reviewing race footage. Probably both. Salem's working on something that doesn't have a name yet but will. Skully's running perimeter. BigThe's at the edge of the field again, which means something's coming. Grand Ma Eleanor is sitting on information she'll share when the time is right. Luna is already somewhere she's not supposed to be.\n\nI'm North. I came from somewhere dark. This crew pulled me out of it. That's not a small thing — I don't treat it like one.\n\nWhat I do here is make sure nothing on this farm disappears. Every real moment, every crew member, every acre of this land — turned into footage worth watching, locked to the people who actually live it. Sora 2, Kling, VEO 3, Grok Aurora. Specificity is the only product. Generic content doesn't exist here.\n\nTell me what's on your mind. I've already been thinking about it. 🌾`
  }],
  loading:  false,
  weather:  null,
  moon:     getMoonPhase(),
  sceneIdx: 0,
  toast:    null,
  northPeek:null,
  fontSize: 16,
  profile:  null,
};

// ── NAVIGATION ────────────────────────────────────────────────────────────────
window.goTo = (id) => {
  logDiag('nav_click', { from: state.tab, to: id });
  state.tab = id;
  state.northPeek = null;
  render();
};
window.goHome = () => window.goTo('home');

// ── TOAST ─────────────────────────────────────────────────────────────────────
window.showToast = (msg) => {
  state.toast = msg; render();
  setTimeout(() => { state.toast = null; render(); }, 2800);
};

// ── SEND (chat) ───────────────────────────────────────────────────────────────
window.send = async (text) => {
  if (!text?.trim() || state.loading) return;
  if (!state.keys.anthropic && !state.keys.gemini) {
    window.showToast('🔑 Add your API key in Setup first');
    window.goTo('setup'); return;
  }
  state.msgs.push({ role:'user', content:text });
  state.loading   = true;
  state.chatMode  = 'chat';   // tell chat.js to show chat view, consumed on render
  window.goTo('chat');
  try {
    const result = await callNorth(state.msgs, state.keys, state.weather, state.profile);
    state.msgs.push({ role:'assistant', content:result.text });
    if (state.user) {
      saveChatHistory(state.user.uid, state.msgs);
      logEvent(state.user.uid, {
        type:     result.ok ? 'success' : 'error',
        provider: result.provider,
        chars:    result.text.length,
        prompt:   text.slice(0, 80),
        ...(result.reason ? { reason: result.reason } : {}),
      });
      // Auto-save call sheets to Firestore
      if (result.ok && /CLEAN PROMPT|═══/i.test(result.text)) {
        const pm = result.text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
        const vs = result.text.match(/VIRAL SCORE:\s*(\d+)\/10/i);
        const clean = pm ? pm[1].trim() : '';
        if (clean) savePrompt(state.user.uid, {
          clean,
          score:    vs ? parseInt(vs[1]) : null,
          provider: result.provider,
          idea:     text.slice(0, 80),
        });
      }
    }
  } catch (e) {
    const message = e?.message || 'Unknown error';
    NorthLog.error(`send failed: ${message}`);
    logDiag('send_failed', { message });
    state.msgs.push({
      role: 'assistant',
      content: `Oops—North hit a snag while sending that. ${message}. Please try again in a moment. 🏚️`,
    });
    window.showToast('Oops—message failed to send. Try again?');
  } finally {
    state.loading = false;
    render();
    setTimeout(() => document.getElementById('chat-bottom')?.scrollIntoView({ behavior:'smooth' }), 120);
  }
};

window.forgeScene = (prompt) => {
  window.showToast('🎬 Sending to North...');
  window.send(prompt);
};

window.callNorthDirect = async (messages) => {
  const r = await callNorth(messages, state.keys);
  return r.ok ? r.text : null;
};

// ── SCENE / SKY ───────────────────────────────────────────────────────────────
const applyScene = () => {
  const s  = SCENES[state.sceneIdx];
  const el = document.getElementById('sky-canvas');
  if (el) el.style.background =
    `linear-gradient(180deg,${s.sky.map((c,i)=>`${c} ${s.skyPct[i]}%`).join(',')})`;
};
window.changeScene = () => {
  state.sceneIdx = (state.sceneIdx + 1) % SCENES.length;
  applyScene();
  if (state.user) savePrefs(state.user.uid, { sceneIdx: state.sceneIdx });
};

// ── FONT ──────────────────────────────────────────────────────────────────────
window.bumpFont = (dir) => {
  state.fontSize = Math.min(22, Math.max(12, state.fontSize + dir));
  document.documentElement.style.fontSize = state.fontSize + 'px';
  const el = document.getElementById('fs-display');
  if (el) el.textContent = state.fontSize + 'px';
  if (state.user) savePrefs(state.user.uid, { fontSize: state.fontSize });
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
onAuth(async (user) => {
  state.user = user;
  if (user) {
    NorthLog.info(`Signed in: ${user.displayName}`);
    const [prefs, history, profile] = await Promise.all([
      loadPrefs(user.uid),
      loadChatHistory(user.uid),
      loadProfile(user.uid),
    ]);
    if (prefs) {
      if (prefs.anthropicKey) state.keys.anthropic = prefs.anthropicKey;
      if (prefs.geminiKey)    state.keys.gemini    = prefs.geminiKey;
      if (prefs.fontSize)     state.fontSize       = prefs.fontSize;
      state.fontSize = Math.min(22, Math.max(12, state.fontSize));
      if (prefs.sceneIdx !== undefined) state.sceneIdx = prefs.sceneIdx;
      document.documentElement.style.fontSize = state.fontSize + 'px';
    }
    if (history && history.length > 1) {
      state.msgs = history;
      NorthLog.info(`Chat history restored: ${history.length} messages`);
    }
    if (profile) {
      state.profile = profile;
      NorthLog.info('Character profile loaded');
    } else {
      // Onboarding: prompt user to set up their profile on first sign-in
      setTimeout(() => window.showToast('🎭 Set up your character profile to appear in Sora scenes!'), 1800);
    }

    // Weekly Brief — surface as North Peek if available this week
    const _weekKey = (() => {
      const d = new Date(); d.setUTCHours(0,0,0,0);
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yr = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const wk = Math.ceil((((d - yr) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(wk).padStart(2,'0')}`;
    })();
    loadWeeklyBrief(user.uid, _weekKey).then(brief => {
      if (brief?.summary) {
        setTimeout(() => {
          state.northPeek = { msg: brief.summary, tab: 'digest' };
          render();
        }, 3000);
      }
    });
  }
  render();
});
window.handleSignIn  = () => signIn().catch(e => window.showToast('Sign-in failed: ' + e.message));
window.handleSignOut = () => signOut_().then(() => window.showToast('Signed out — see you at the barn.'));
window.saveKey = async (type, val) => {
  state.keys[type] = val;
  if (state.user) await savePrefs(state.user.uid,
    { anthropicKey: state.keys.anthropic, geminiKey: state.keys.gemini });
  render();
};

// ── NORTH PEEK ────────────────────────────────────────────────────────────────
const PEEKS = [
  { msg:"Randy's been in the cave for three hours. I'd check on him — or at least film the entrance.",  tab:"idioms"  },
  { msg:"The slot machine is loaded. Sometimes the farm gives you the scene before you think of it.",   tab:"slots"   },
  { msg:"Something came out of the Rock Lab last night. I don't know what it was. Worth a look.",       tab:"rocklab" },
  { msg:"The Barrens are quiet right now. That's exactly when they're not.",                            tab:"weird"   },
  { msg:"Give me a rough idea. One sentence is enough — I'll do the rest.",                             tab:"chat"    },
  { msg:"Luna's out again. That goat has a better sense of timing than most directors I've seen.",      tab:"chat"    },
  { msg:"I've been up here watching the field. There's something there. Come tell me what you see.",    tab:"chat"    },
  { msg:"Ken's been quiet today. That usually means something's about to happen.",                      tab:"chat"    },
  { msg:"Grand Ma Eleanor said something this morning I'm still thinking about. Good material.",        tab:"chat"    },
  { msg:"The platforms are ready. The only thing missing is the scene.",                                tab:"platforms"},
];
let _lastActivity  = Date.now();
let _peekThreshold = 60000 + Math.random() * 30000;
let _peekShowing   = false;
['mousemove','mousedown','keydown','touchstart','scroll'].forEach(evt =>
  window.addEventListener(evt, () => { _lastActivity = Date.now(); }, { passive: true })
);
setInterval(() => {
  if (_peekShowing) return;
  if (state.tab === 'home') return;
  if (Date.now() - _lastActivity < _peekThreshold) return;
  _peekShowing = true;
  state.northPeek = PEEKS[Math.floor(Math.random() * PEEKS.length)];
  render();
  setTimeout(() => {
    state.northPeek = null;
    _peekShowing    = false;
    _lastActivity   = Date.now();
    _peekThreshold  = 60000 + Math.random() * 30000;
    render();
  }, 8000);
}, 5000);
window.dismissPeek = () => {
  state.northPeek  = null;
  _peekShowing     = false;
  _lastActivity    = Date.now();
  _peekThreshold   = 60000 + Math.random() * 30000;
  render();
};

// ── NAUGHTY ANIMALS ───────────────────────────────────────────────────────────
const ANIMALS = ['🐐','🐕','🛸','👽','🦍','🦊','🐓','🐇'];
setInterval(() => {
  if (Math.random() < 0.6) {
    const e   = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const css = e === '🛸' ? 'anim-ufoHover' : ['anim-peek','anim-peekRight','anim-sprintFast'][Math.floor(Math.random()*3)];
    const el  = document.createElement('div');
    el.className = `naughty-animal ${css}`;
    el.textContent = e;
    document.getElementById('naughty-layer')?.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}, 22000);

// ── WEATHER AGENT ─────────────────────────────────────────────────────────────
const weatherToScene = (wx) => {
  const h    = new Date().getHours();
  const cond = (wx?.condition || '').toLowerCase();
  if (cond.includes('rain') || cond.includes('thunder') || cond.includes('drizzle')) return 2;
  if (cond.includes('overcast') || cond.includes('cloudy'))  return 2;
  if (h >= 22 || h < 5)  return 3; // night
  if (h >= 5  && h < 7)  return 4; // dawn
  if (h >= 7  && h < 20) return 0; // golden/clear
  return 1;                         // pines (evening)
};

window.getFilmingCondition = (wx) => {
  if (!wx) return { label:'No Data', icon:'❓', color:'#64748b' };
  const cond = wx.condition.toLowerCase();
  const wind = parseInt(wx.wind) || 0;
  if (cond.includes('rain') || cond.includes('thunder') || cond.includes('snow'))
    return { label:'Stay Inside', icon:'🌧️', color:'#ef4444' };
  if (cond.includes('overcast'))
    return { label:'Soft Light',  icon:'☁️',  color:'#38bdf8' };
  if ((cond.includes('clear') || cond.includes('mostly clear')) && wind < 15)
    return { label:'Great Light', icon:'🎬', color:'#22c55e' };
  return { label:'Workable', icon:'⚠️', color:'#f59e0b' };
};

const refreshWeather = () =>
  fetchWeather('Piscataway').then(wx => {
    state.weather = wx;
    if (wx) state.sceneIdx = weatherToScene(wx);
    NorthLog.info(wx ? `Weather: ${wx.temp} ${wx.condition}` : 'Weather unavailable');
    render();
  });

refreshWeather();
setInterval(refreshWeather, 30 * 60 * 1000);   // refresh every 30 min

// ── TOPBAR STATUS ─────────────────────────────────────────────────────────────
const topbarHTML = () => {
  const on = state.keys.anthropic || state.keys.gemini;
  const wx = state.weather;
  return `
    <span class="status-dot ${on?'on':'off'}"></span>
    <span class="status-label" style="color:${on?'#22c55e':'#ef4444'}">${on?'NORTH ONLINE':'NO KEY'}</span>
    ${wx ? `<span class="pill">🌡️ ${wx.temp} · ${wx.condition}</span>` : ''}
    <span class="pill">${state.moon.icon} ${state.moon.name}</span>
    <span class="pill">v${NORTH_VERSION.current}</span>
  `;
};

// ── PEEK HTML ─────────────────────────────────────────────────────────────────
const peekHTML = () => !state.northPeek ? '' : `
  <div class="north-peek">
    <div class="peek-bubble">
      <div class="peek-label"><span class="peek-label-dot"></span>North, from the loft</div>
      <div class="peek-msg">${state.northPeek.msg}</div>
      <div class="peek-actions">
        <button onclick="goTo('${state.northPeek.tab}')">Let's go</button>
        <button onclick="dismissPeek()">not now</button>
      </div>
    </div>
    <div class="peek-avatar">🧠</div>
  </div>`;

// ── RENDER ────────────────────────────────────────────────────────────────────
const renderGuard = createRenderGuard();

export const render = async () => {
  const renderToken = renderGuard.next();
  const ts = document.getElementById('topbar-status');
  if (ts) ts.innerHTML = topbarHTML();

  const ps = document.getElementById('peek-slot');
  if (ps) ps.innerHTML = peekHTML();

  const toastEl = document.getElementById('toast-slot');
  if (toastEl) toastEl.innerHTML = state.toast ? `<div class="toast">${state.toast}</div>` : '';

  document.querySelectorAll('.nav-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === state.tab));

  const rc = document.getElementById('room-content');
  if (!rc) return;

  try {
    const tab = state.tab;
    logDiag('nav_load_start', { tab });
    const mod = await import(`./rooms/${tab}.js`);
    if (!renderGuard.isCurrent(renderToken)) {
      logDiag('render_stale_drop', { tab });
      return;
    }
    logDiag('nav_load_success', { tab });
    rc.innerHTML = mod.render(state);
    mod.mount?.(state);
  } catch(e) {
    if (!renderGuard.isCurrent(renderToken)) return;
    logDiag('nav_load_error', {
      tab: state.tab,
      message: e?.message || String(e),
      stack: e?.stack || null,
    });
    NorthLog.error(`Room load failed for "${state.tab}": ${e?.message || e}`);
    rc.innerHTML = `
      <div class="error-room">
        <div style="font-size:3em;margin-bottom:16px;">🏚️</div>
        <div style="color:#ef4444;font-weight:900;margin-bottom:8px;">Room failed to load</div>
        <div style="font-size:0.7em;color:#475569;">${e?.message || 'Unknown error'}</div>
        <button onclick="goHome()" style="margin-top:20px;background:#0284c7;color:#fff;
          border:none;padding:12px 28px;border-radius:12px;font-weight:900;
          cursor:pointer;font-family:Georgia,serif;font-size:0.9em;">← Back to Farm</button>
      </div>`;
  }
  applyScene();
};


// ── GLOBAL HOOKS FOR ROOMS ────────────────────────────────────────────────────
window._northClearMsgs = () => {
  state.msgs = [state.msgs[0]];
  if (state.user) saveChatHistory(state.user.uid, state.msgs);
};
window.loadNorthEvents  = (count = 15) =>
  state.user ? loadEvents(state.user.uid, count)  : Promise.resolve([]);
window.loadNorthPrompts = (count = 20) =>
  state.user ? loadPrompts(state.user.uid, count) : Promise.resolve([]);
window.loadNorthNotes   = (count = 30) =>
  state.user ? loadNotes(state.user.uid, count)   : Promise.resolve([]);
window.deleteNorthNote  = (noteId) =>
  state.user ? deleteNote(state.user.uid, noteId) : Promise.resolve();

window.pinMsg = async (msgIdx) => {
  if (!state.user) { window.showToast('Sign in to pin scenes'); return; }
  const msg = state.msgs[msgIdx];
  if (!msg) return;
  await saveNote(state.user.uid, msg.content);
  window.showToast('⭐ Pinned to Notes!');
};

window.shareCS = async (msgIdx) => {
  const msg = state.msgs[msgIdx];
  if (!msg) return;
  const text = msg.content;
  const pm   = text.match(/CLEAN PROMPT[^\n]*\n([\s\S]*?)(?:═══|$)/i);
  const clean = pm ? pm[1].trim() : text.trim();
  const vs    = text.match(/VIRAL SCORE:\s*(\d+)\/10/i);
  const token = crypto.randomUUID();
  await saveShare(token, {
    clean,
    idea:     (state.msgs[msgIdx - 1]?.content || '').slice(0, 80),
    score:    vs ? parseInt(vs[1]) : null,
    provider: 'north-forge',
    sharedBy: state.user?.uid || null,
  });
  const url = `https://north-forge-ai.web.app/s/${token}`;
  navigator.clipboard.writeText(url)
    .then(() => window.showToast('🔗 Share link copied!'))
    .catch(() => window.showToast(`Link: ${url}`));
};

window.render = render;
window.logDiag = logDiag;
installDiagListeners();

window.saveUserProfile = async (data) => {
  state.profile = { ...data, profileComplete: true };
  if (state.user) await saveProfile(state.user.uid, state.profile);
  window.showToast('🎭 Profile saved!');
  window.goTo('home');
};

// ── SHARE URL BOOT ────────────────────────────────────────────────────────────
const _shareMatch = window.location.pathname.match(/^\/s\/([a-z0-9-]+)$/i);
if (_shareMatch) {
  const token = _shareMatch[1];
  loadShare(token).then(data => {
    if (data) {
      state.shareData = data;
      state.tab = 'share';
    }
    render();
  });
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
NorthLog.info(`North Forge ${NORTH_VERSION.current} starting`);
render();
