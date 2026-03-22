// rooms/chat-form.js — Prompt Engine: data arrays, form state, pe* window functions
// Imported by chat.js — do not import chat.js from here (one-way dependency)

import { PLATFORMS, getPlatformContext } from '../platforms.js';
import { CAST_DB as CAST }              from '../cast-data.js';

const LOCATIONS = [
  'Big Red Barn','Barn Loft','Chicken Coop','Farm Garden',
  'Assunpink Creek',"Randy's Cave #1",'Pine Barrens Shaft',
  'Route 539','NJ Dirt Track','Back Field','Pine Barrens Forest',
];

const PLATFORM_REASONS = {
  sora:   'Cinematic realism — character consistency locks in your Sora IDs perfectly.',
  kling:  'Physics & texture — fluid motion and material detail are Kling\'s signature.',
  veo:    'Native audio generation — dialogue, ambient sound, and music built in.',
  aurora: 'Stylized surreal output — Grok Aurora handles the weird and dreamcore.',
};

const recommendPlatform = (idea) => {
  if (!idea?.trim()) return null;
  if (/dialogue|speaks|says|conversat|audio|voice|sing|talk/i.test(idea))                 return 'veo';
  if (/fluid|water|fire|rain|smoke|fabric|texture|physics|splash|cloth|pour/i.test(idea)) return 'kling';
  if (/weird|surreal|dream|psyche|strange|supernat|horror|jersey devil|cryptid|ufo|jeeb/i.test(idea)) return 'aurora';
  return 'sora';
};

const TONES = [
  { id:'cinematic',   label:'🎬 Cinematic',      desc:'Epic, dramatic, film quality',     directive:'Treat every frame as a deliberate shot. Deep shadows, golden rims, cool morning mist. No accidental details.' },
  { id:'documentary', label:'📹 Documentary',    desc:'Real, raw, observational',          directive:'No polish. Handheld energy, real dialogue fragments. The camera witnesses — it does not perform.' },
  { id:'weird',       label:'👻 Weird NJ',       desc:'Strange, eerie, paranormal',        directive:'Root it in NJ folklore. Ambiguity over explanation. One thing in the background that should not be there.' },
  { id:'warm',        label:'🌾 Warm Farm Life', desc:'Everyday beauty, golden light',     directive:'Find the extraordinary in the ordinary. Natural light only. Real hands doing real work.' },
  { id:'action',      label:'🏁 High Energy',    desc:'Fast, intense, adrenaline',         directive:'Every beat earns a cut. No wasted motion. Impact first, context second. The edit IS the scene.' },
  { id:'dreamcore',   label:'🍄 Dreamcore',      desc:'Surreal, psychedelic, atmospheric', directive:'Internal logic only. One concrete anchor detail grounds the surreal. Slow reveals. Never explain.' },
];

const STYLES = [
  { id:'cinematic',   label:'🎬 Cinematic',    d:'Film-quality framing. Deliberate composition. Cinematic color grade.' },
  { id:'found',       label:'📹 Found Footage', d:'Raw handheld realism. Camera witnesses — it does not perform.' },
  { id:'drone',       label:'🚁 Drone',         d:'Sweeping aerial. Establish the full scale of Pine Barron Farms.' },
  { id:'bodycam',     label:'👤 Bodycam',       d:'First-person POV. Shaky, immediate, immersive.' },
  { id:'musicvideo',  label:'🎵 Music Video',   d:'Beat-synced motion. Energy-driven. Style carries equal weight to image.' },
  { id:'nightvision', label:'🌑 Night Vision',  d:'Green-tinted grainy NV aesthetic. Something moves in the background.' },
  { id:'surreal',     label:'🍄 Surreal',       d:'One concrete anchor grounds the strange. Internal logic only.' },
  { id:'surveillance',label:'👁 Surveillance',  d:'Fixed CCTV or trail cam angle. Timestamp overlay. Discovered footage feel.' },
];

const PALETTES = [
  { id:'golden',   label:'🌅 Golden',    colors:'warm amber, burnt orange, deep shadow' },
  { id:'bluehour', label:'🌆 Blue Hour', colors:'cobalt blue, violet, silver mist' },
  { id:'contrast', label:'⚡ Contrast',  colors:'stark white, deep black, one saturated accent' },
  { id:'muted',    label:'🌫️ Muted',     colors:'faded cream, grey-green, earth brown' },
  { id:'neon',     label:'🌈 Neon',      colors:'electric cyan, hot magenta, deep black' },
  { id:'verdant',  label:'🌿 Verdant',   colors:'rich forest green, mud brown, overcast sky' },
];

const LEVELS = [
  { id:'rough',  label:'📽 Rough Cut',    d:'Raw energy, imperfect, in-the-moment. Authenticity over polish.' },
  { id:'pro',    label:'🎥 Professional', d:'Polished, broadcast-ready. Clean composition, controlled lighting.' },
  { id:'master', label:'🏆 Master',       d:'Award-quality. Every frame a deliberate artistic decision. No accidents.' },
];

// ── FORM STATE ────────────────────────────────────────────────────────────────
let formData = { idea:'', characters:[], location:'', tone:'', style:'', palette:'', level:'', beats:'', platform:'' };
let formStep = 'idle';

export const resetFormStep = () => { if (formStep === 'generating') formStep = 'idle'; };

// ── FORM VIEW ─────────────────────────────────────────────────────────────────
export const formView = () => `
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
          — pick up to 3${formData.characters.length > 0
            ? ` <span style="color:#38bdf8;font-weight:900;">(${formData.characters.length} selected)</span>` : ''}
        </span>
      </label>
      <div class="pe-grid">
        ${CAST.map(c => {
          const sel   = formData.characters.includes(c.id);
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
      <label class="pe-label">5 · Visual Style <span style="color:#64748b;font-weight:400;text-transform:none;letter-spacing:0;font-size:1.1em;">— optional</span></label>
      <div class="pe-pills">
        ${STYLES.map(s=>`
          <button class="pe-pill ${formData.style===s.id?'sel':''}"
                  onclick="peSet('style','${formData.style===s.id?'':s.id}')"
                  title="${s.d}">${s.label}</button>`).join('')}
      </div>
    </div>

    <div class="pe-field">
      <label class="pe-label">6 · Platform</label>
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

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
      <div style="flex:1;min-width:200px;">
        <label class="pe-label">7 · Color Palette <span style="color:#64748b;font-weight:400;text-transform:none;letter-spacing:0;font-size:1.1em;">— optional</span></label>
        <div class="pe-pills">
          ${PALETTES.map(p=>`
            <button class="pe-pill ${formData.palette===p.id?'sel':''}"
                    onclick="peSet('palette','${formData.palette===p.id?'':p.id}')"
                    title="${p.colors}">${p.label}</button>`).join('')}
        </div>
      </div>
      <div style="flex:1;min-width:200px;">
        <label class="pe-label">8 · Production Level <span style="color:#64748b;font-weight:400;text-transform:none;letter-spacing:0;font-size:1.1em;">— optional</span></label>
        <div class="pe-pills">
          ${LEVELS.map(l=>`
            <button class="pe-pill ${formData.level===l.id?'sel':''}"
                    onclick="peSet('level','${formData.level===l.id?'':l.id}')"
                    title="${l.d}">${l.label}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="pe-field">
      <label class="pe-label">9 · Action Beats <span style="color:#64748b;font-weight:400;text-transform:none;letter-spacing:0;font-size:1.1em;">— optional, timestamped</span></label>
      <textarea class="pe-textarea" id="pe-beats" rows="3"
        placeholder="Beat 1 (0s): Luna breaks free from the pen.&#10;Beat 2 (4s): Randy spins around, rock hammer raised.&#10;Beat 3 (8s): Ken's helicopter banks low overhead.">${formData.beats}</textarea>
    </div>

    <div style="display:flex;gap:10px;margin-top:6px;">
      <button class="pe-forge-btn" onclick="peForge()" ${formStep==='generating'?'disabled':''} style="flex:1;margin-top:0;">
        ${formStep==='generating'
          ? '<span style="animation:spin 1s linear infinite;display:inline-block;">⏳</span> North is building...'
          : '🎬 FORGE FULL CALL SHEET'}
      </button>
      <button class="pe-reset-btn" onclick="peReset()" title="Clear all selections" ${formStep==='generating'?'disabled':''}>↺ New</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button style="flex:1;background:linear-gradient(135deg,#065f46,#059669);color:#fff;border:none;border-radius:12px;padding:13px 8px;font-weight:900;font-size:0.76em;cursor:pointer;font-family:Georgia,serif;" onclick="peForgeStoryboard()" ${formStep==='generating'?'disabled':''}>📽 3-Shot Sequence</button>
      <button style="flex:1;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border:none;border-radius:12px;padding:13px 8px;font-weight:900;font-size:0.76em;cursor:pointer;font-family:Georgia,serif;" onclick="peCompare()" ${formStep==='generating'?'disabled':''}>📊 Compare Platforms</button>
    </div>
  </div>
`;

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.peReset = () => {
  formData = { idea:'', characters:[], location:'', tone:'', style:'', palette:'', level:'', beats:'', platform:'' };
  window.setChatMode?.('form');
};

const _save = () => {
  const a = document.getElementById('pe-idea');  if (a) formData.idea  = a.value;
  const b = document.getElementById('pe-beats'); if (b) formData.beats = b.value;
};

window.peSet = (f, v)  => { _save(); formData[f] = v; window.goTo('chat'); };

window.peToggleChar = (id) => {
  _save();
  const idx = formData.characters.indexOf(id);
  if (idx === -1) { if (formData.characters.length < 3) formData.characters.push(id); }
  else            { formData.characters.splice(idx, 1); }
  window.goTo('chat');
};

window.peForge = async () => {
  _save();
  if (!formData.idea.trim())       { window.showToast('Describe your idea first!'); return; }
  if (!formData.characters.length) { window.showToast('Pick at least one character!'); return; }
  if (!formData.platform)          { window.showToast('Pick a platform!'); return; }

  const chars   = formData.characters.map(id => CAST.find(c => c.id === id)).filter(Boolean);
  const plat    = PLATFORMS.find(p => p.id === formData.platform);
  const tone    = TONES.find(t => t.id === formData.tone);
  const style   = STYLES.find(s => s.id === formData.style);
  const palette = PALETTES.find(p => p.id === formData.palette);
  const level   = LEVELS.find(l => l.id === formData.level);
  const beats   = formData.beats.trim();
  const loc     = formData.location || 'Pine Barron Farms';
  const ctx     = getPlatformContext(formData.platform);
  const charBlock = chars.map(c => `  ${c.name} (${c.soraId}) · ${c.role} · Props: ${c.props.join(', ')}`).join('\n');
  const soraIds   = chars.map(c => c.soraId).join(', ');

  const prompt =
`You are North, AI director of Pine Barron Farms. Generate a FULL PROFESSIONAL CALL SHEET.

IDEA: ${formData.idea}
CAST (${chars.length} character${chars.length>1?'s':''}):
${charBlock}
LOCATION: ${loc}
TONE: ${tone ? tone.label+' — '+tone.desc : 'Cinematic'}
${tone?.directive ? `TONE DIRECTIVE: ${tone.directive}` : ''}
${style   ? `VISUAL STYLE: ${style.label} — ${style.d}` : ''}
${palette ? `COLOR PALETTE: ${palette.colors}` : ''}
${level   ? `PRODUCTION LEVEL: ${level.label} — ${level.d}` : ''}
${beats   ? `ACTION BEATS (timestamped — follow exactly):\n${beats}` : ''}
PLATFORM: ${plat.name} — ${plat.best_for}
PLATFORM CONTEXT: ${ctx}

Lock all Sora IDs (${soraIds}) into the scene. Ground each character with at least one prop.
${chars.length > 1 ? 'Show how the characters interact.' : ''}

OUTPUT THIS EXACT STRUCTURE:

═══════════════════════════════════════
  ${plat.name.toUpperCase()} · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    ${plat.format}
LOCATION:  ${loc}
CAST:      ${chars.map(c=>`${c.name} (${c.soraId})`).join(', ')}
PROPS:     [props in scene]
STYLE:     ${style ? style.label : 'Cinematic'}
PALETTE:   ${palette ? palette.colors : "[North's call]"}
LEVEL:     ${level ? level.label : 'Professional'}
TONE:      ${tone ? tone.label : 'Cinematic'}
───────────────────────────────────────
HOOK (0-1.5s):
[Scroll-stopping opening, present tense]

SCENE:
[2-3 cinematic sentences. Use ALL Sora IDs. Match palette and style.]

CAMERA:
[Angle + movement + lens — one line]

AUDIO:
[Ambient + action sound + music]
${beats ? '\nACTION BEATS:\n[Timestamped progression]' : ''}
───────────────────────────────────────
DIRECTOR'S NOTE:
[Why this works for ${plat.name}]
───────────────────────────────────────
CLEAN PROMPT
[Paste-ready text for ${plat.name} — no labels, no formatting]
═══════════════════════════════════════`;

  formStep = 'generating';
  window.setChatMode?.('chat');
  try {
    await window.send(prompt);
  } finally {
    formStep = 'idle';
    window.render?.();
  }
};

// ── A: 3-SHOT STORYBOARD ──────────────────────────────────────────────────────
window.peForgeStoryboard = async () => {
  _save();
  if (!formData.idea.trim())       { window.showToast('Describe your idea first!'); return; }
  if (!formData.characters.length) { window.showToast('Pick at least one character!'); return; }
  if (!formData.platform)          { window.showToast('Pick a platform!'); return; }
  const chars    = formData.characters.map(id => CAST.find(c => c.id === id)).filter(Boolean);
  const plat     = PLATFORMS.find(p => p.id === formData.platform);
  const charLine = chars.map(c => `${c.name} (${c.soraId}) · Props: ${c.props.join(', ')}`).join('\n');
  const tone     = TONES.find(t => t.id === formData.tone);
  const prompt =
`STORYBOARD — 3-SHOT SEQUENCE · Pine Barron Farms

IDEA: ${formData.idea}
CAST:
${charLine}
LOCATION: ${formData.location || 'Pine Barron Farms'}
PLATFORM: ${plat.name}
${tone ? `TONE: ${tone.label} — ${tone.desc}` : ''}

Generate 3 linked call sheets forming a complete story arc. Match palette, cast, and location across all shots for visual continuity.

SHOT 1 — HOOK (0–3s): Scroll-stopping entry. Establish the world and the energy.
SHOT 2 — BUILD (3–12s): Rising action. Characters react. Tension or wonder grows.
SHOT 3 — PAYOFF (12–20s): Resolution or reveal. Land the emotion. Earn the replay.

For each shot output: HOOK · SCENE · CAMERA · AUDIO · CLEAN PROMPT (paste-ready for ${plat.name}).

End with NORTH'S EDIT NOTE — one line on how the 3 shots cut together.`;
  formStep = 'generating';
  window.setChatMode?.('chat');
  try { await window.send(prompt); }
  finally { formStep = 'idle'; window.render?.(); }
};

// ── E: PLATFORM COMPARISON ────────────────────────────────────────────────────
window.peCompare = async () => {
  _save();
  if (!formData.idea.trim())       { window.showToast('Describe your idea first!'); return; }
  if (!formData.characters.length) { window.showToast('Pick at least one character!'); return; }
  const chars    = formData.characters.map(id => CAST.find(c => c.id === id)).filter(Boolean);
  const charLine = chars.map(c => `${c.name} (${c.soraId})`).join(', ');
  const prompt =
`PLATFORM COMPARISON — Same scene, 3 builds · Pine Barron Farms

IDEA: ${formData.idea}
CAST: ${charLine}
LOCATION: ${formData.location || 'Pine Barron Farms'}

Build the SAME scene optimized for 3 different platforms. Each version should feel different because the platforms are different tools.

1. SORA 2 — lean into character ID locks (@IDs), cinematic physical realism, grounded detail
2. KLING AI — lean into physics, material texture, fluid motion (fabric, water, fire, weight)
3. VEO 3 — lean into native audio: dialogue fragment, ambient sound design, music cue

For each: one-paragraph CLEAN PROMPT (paste-ready, present tense) + one sentence WHY THIS PLATFORM WINS THIS SHOT.

End with: NORTH'S CALL — which platform he'd actually use for this specific shot and why.`;
  window.setChatMode?.('chat');
  await window.send(prompt);
};
