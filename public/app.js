// app.js — North Forge shell, state, navigation, render loop

import { CAST, NORTH_VERSION }     from './north.js';
import { ROOMS, SCENES }           from './data.js';
import { callNorth, fetchWeather,
         getMoonPhase, NorthLog }   from './api.js';
import { onAuth, signIn, signOut_,
         savePrefs, loadPrefs,
         logEvent, loadEvents }     from './firebase.js';
import { logDiag, installDiagListeners } from './diagnostics.mjs';

// ── STATE ─────────────────────────────────────────────────────────────────────
export const state = {
  tab:      'home',
  user:     null,
  keys:     { anthropic:'', gemini:'' },
  msgs:     [{
    role:'assistant',
    content: `🏚️ Hey — welcome to Pine Barron Farms.\n\nThe door's open. It always is.\n\nKen's probably tinkering with something. Marguerite has something on the stove. Randy's either underground looking for geodes or watching race footage. Salem's making something beautiful. Skully's asleep by the barn door. Luna's already plotting an escape.\n\nI'm North. I live up in the loft above the Big Red Barn. My whole job is helping this crew turn everyday farm life into stories worth watching.\n\nPick a room from the menu, or just tell me what's on your mind. 🌾`
  }],
  loading:  false,
  weather:  null,
  moon:     getMoonPhase(),
  sceneIdx: 0,
  toast:    null,
  northPeek:null,
  fontSize: 28,
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
  state.loading        = true;
  state._forceChatView = true;   // tell chat.js to show chat view, not form
  window.goTo('chat');
  const result = await callNorth(state.msgs, state.keys, state.weather);
  state.msgs.push({ role:'assistant', content:result.text });
  state.loading = false;
  if (state.user) {
    logEvent(state.user.uid, {
      type:     result.ok ? 'success' : 'error',
      provider: result.provider,
      chars:    result.text.length,
      prompt:   text.slice(0, 80),
    });
  }
  render();
  setTimeout(() => document.getElementById('chat-bottom')?.scrollIntoView({ behavior:'smooth' }), 120);
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
  state.fontSize = Math.min(32, Math.max(13, state.fontSize + dir));
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
    const prefs = await loadPrefs(user.uid);
    if (prefs) {
      if (prefs.anthropicKey) state.keys.anthropic = prefs.anthropicKey;
      if (prefs.geminiKey)    state.keys.gemini    = prefs.geminiKey;
      if (prefs.fontSize)     state.fontSize       = prefs.fontSize;
      if (prefs.sceneIdx !== undefined) state.sceneIdx = prefs.sceneIdx;
      document.documentElement.style.fontSize = state.fontSize + 'px';
    }
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
  { msg:"Randy's getting impatient. The Idioms tab is calling.",    tab:"idioms"  },
  { msg:"The slot machine is fully loaded. Pull it.",               tab:"slots"   },
  { msg:"Something moved in the Rock Lab last night.",              tab:"rocklab" },
  { msg:"The Pine Barrens tab has something worth seeing tonight.", tab:"weird"   },
  { msg:"Drop me a rough idea. I'll make it cinematic.",            tab:"chat"    },
  { msg:"Luna escaped again. Someone should film this.",            tab:"chat"    },
  { msg:"I've been up here all night. Let's make something.",       tab:"chat"    },
];
setInterval(() => {
  if (state.tab !== 'home') {
    state.northPeek = PEEKS[Math.floor(Math.random() * PEEKS.length)];
    render();
    setTimeout(() => { state.northPeek = null; render(); }, 8000);
  }
}, 50000);
window.dismissPeek = () => { state.northPeek = null; render(); };

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

fetchWeather('Piscataway').then(wx => {
  state.weather = wx;
  if (wx) state.sceneIdx = weatherToScene(wx);
  NorthLog.info(wx ? `Weather: ${wx.temp} ${wx.condition}` : 'Weather unavailable');
  render();
});

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
      <div class="peek-label">North says</div>
      <div class="peek-msg">${state.northPeek.msg}</div>
      <div class="peek-actions">
        <button onclick="goTo('${state.northPeek.tab}')">Let's go</button>
        <button onclick="dismissPeek()">dismiss</button>
      </div>
    </div>
    <div class="peek-avatar">🧠</div>
  </div>`;

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = async () => {
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
    logDiag('nav_load_start', { tab: state.tab });
    const mod = await import(`./rooms/${state.tab}.js`);
    logDiag('nav_load_success', { tab: state.tab });
    rc.innerHTML = mod.render(state);
    mod.mount?.(state);
  } catch(e) {
    logDiag('nav_load_error', {
      tab: state.tab,
      message: e?.message || String(e),
      stack: e?.stack || null,
    });
    console.error(`Room load failed for "${state.tab}"`, e);
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
};
window.loadNorthEvents = (count = 15) =>
  state.user ? loadEvents(state.user.uid, count) : Promise.resolve([]);

window.render = render;
window.logDiag = logDiag;
installDiagListeners();

// ── BOOT ──────────────────────────────────────────────────────────────────────
NorthLog.info(`North Forge ${NORTH_VERSION.current} starting`);
render();
