// rooms/idioms.js — Randy's Idioms
// North picks an idiom. Randy reacts. Chaos ensues.

import { IDIOMS } from '../data.js';

const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let idiomIdx  = Math.floor(Math.random() * IDIOMS.length);
let reaction  = null;
let reacting  = false;

export const render = (state) => {
  const idiom  = IDIOMS[idiomIdx];
  const hasKey = state.keys.anthropic || state.keys.gemini;
  return `
  <div class="room-wrap">

    <div class="panel-desc">
      A random idiom from the farm. Hit <strong>Randy Reacts</strong> and watch
      Sarge process it in real time.
    </div>

    <div class="id-card">
      <div class="id-card-label">💬 IDIOM</div>
      <div class="id-text">"${esc(idiom.text)}"</div>
      <div class="id-src">— ${esc(idiom.src)}</div>
    </div>

    <div class="id-btn-row">
      <button class="id-btn-next" onclick="idNext()">↺ Next Idiom</button>
      ${hasKey
        ? `<button class="id-btn-react ${reacting?'disabled':''}"
                  onclick="idReact()" ${reacting?'disabled':''}>
             ${reacting
               ? '<span class="id-thinking">🪖 Randy is processing…</span>'
               : '🪖 Randy Reacts'}
           </button>`
        : `<button class="id-btn-react disabled" onclick="goTo('setup')"
                  title="Add an API key in Setup">🔑 Need API key</button>`
      }
    </div>

    ${reaction ? `
      <div class="id-reaction-card">
        <div class="id-react-label">🪖 RANDY'S REACTION</div>
        <div class="id-react-text">${esc(reaction)}</div>
        <button class="id-forge-btn" onclick="idForgeScene()">🎬 Forge Randy's Scene</button>
      </div>` : ''}

  </div>

  <style>
    .id-card        { background:rgba(2,6,23,.95); border:2px solid #d9770633; border-radius:20px;
                      padding:28px 26px; margin-bottom:20px; }
    .id-card-label  { font-size:.56em; font-weight:900; letter-spacing:2px; color:#d97706;
                      text-transform:uppercase; margin-bottom:14px; }
    .id-text        { font-size:1.05em; color:#fff; font-weight:900; line-height:1.7;
                      margin-bottom:12px; }
    .id-src         { font-size:.7em; color:#64748b; font-style:italic; }
    .id-btn-row     { display:flex; gap:12px; margin-bottom:22px; }
    .id-btn-next    { flex:1; background:none; border:2px solid #1e293b; border-radius:14px;
                      padding:14px; font-weight:900; font-size:.86em; color:#94a3b8;
                      cursor:pointer; font-family:Georgia,serif; transition:all .2s; }
    .id-btn-next:hover { border-color:#38bdf8; color:#38bdf8; }
    .id-btn-react   { flex:2; background:linear-gradient(135deg,#92400e,#d97706); color:#fff;
                      border:none; border-radius:14px; padding:14px 20px; font-weight:900;
                      font-size:.86em; cursor:pointer; font-family:Georgia,serif;
                      transition:all .2s; box-shadow:0 4px 18px rgba(217,119,6,.25); }
    .id-btn-react:hover:not(.disabled) { transform:scale(1.02); }
    .id-btn-react.disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .id-thinking    { color:#fcd34d; }
    .id-reaction-card { background:rgba(146,64,14,.1); border:2px solid #d9770644;
                        border-radius:18px; padding:24px 26px; }
    .id-react-label { font-size:.56em; font-weight:900; letter-spacing:2px; color:#d97706;
                      text-transform:uppercase; margin-bottom:12px; }
    .id-react-text  { color:#fef3c7; font-size:.9em; line-height:1.8; font-weight:700; }
    .id-forge-btn   { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#fff;
                      border:none; border-radius:10px; padding:10px 20px; font-weight:900;
                      font-size:0.72em; cursor:pointer; font-family:Georgia,serif;
                      margin-top:14px; transition:all .2s; width:100%; }
    .id-forge-btn:hover { transform:scale(1.02); }
  </style>
  `;
};

window.idNext = () => {
  idiomIdx = (idiomIdx + 1) % IDIOMS.length;
  reaction = null;
  reacting = false;
  window.goTo('idioms');
};

window.idReact = async () => {
  if (reacting) return;
  reacting = true;
  reaction = null;
  window.goTo('idioms');
  const idiom = IDIOMS[idiomIdx];
  const text  = await window.callNorthDirect([{
    role: 'user',
    content: `Randy "Sarge" (@geodudenj) at Pine Barron Farms just heard: "${idiom.text}"\n\nWrite his raw in-character reaction. Ex-military, NJ dirt track racer, underground cave hunter — Piscataway born. 3 sentences max, first person, no labels, pure Randy. Reference the farm, the cave, or the track if it fits.`,
  }]);
  reaction = text || "...Randy stares at you for a long moment. Says nothing. Walks away.";
  reacting = false;
  window.goTo('idioms');
};

window.idForgeScene = () => {
  if (!reaction) return;
  const idiom = IDIOMS[idiomIdx];
  window.forgeScene(
    `Randy "Sarge" (@geodudenj) at Pine Barron Farms. He just said: "${reaction}" ` +
    `Triggered by hearing: "${idiom.text}". ` +
    `Frame this as a tight cinematic reaction shot — close on Randy's face at the cave entrance or barn, ` +
    `raw NJ energy, real emotion.`
  );
};

export const mount = () => {};
