// rooms/cast.js — Character + Props Manager
// The world engine. Every prompt North generates pulls from here.

// ── CAST DATABASE (source of truth) ──────────────────────────────────────────
const CAST_DB = [
  {
    id:      'ken',
    name:    'Ken Walker',
    soraId:  '@kennethwalker479',
    role:    'The Engineer',
    icon:    '👨‍🌾',
    color:   '#22c55e',
    photo:   null,
    bio:     'Founder of Pine Barron Farms. Builds everything, fixes everything, films everything. The mind behind North Forge.',
    vibe:    'Calm under pressure. Creative tinkerer. Sees the shot before the camera does.',
    props:   ['Tool belt', 'Work boots', 'Camera rig', 'NJ Nets cap', 'Old Ford truck'],
    looks:   'Medium build, weathered hands, always has a camera or a wrench nearby.',
    voice:   'Direct, warm, measured. Doesn\'t waste words.',
  },
  {
    id:      'marguerite',
    name:    'Marguerite',
    soraId:  '@prprincess138',
    role:    'Heart of the Farm',
    icon:    '👩🏽‍🌾',
    color:   '#ef4444',
    photo:   null,
    bio:     'Keeps the farm running when Ken disappears into a project. Her kitchen is the social hub of Pine Barron.',
    vibe:    'Warm, sharp, quietly funny. Nothing gets past her.',
    props:   ['Apron', 'Cast iron skillet', 'Garden gloves', 'Mason jars', 'Front porch rocking chair'],
    looks:   'Warm brown skin, natural hair, often flour on her hands.',
    voice:   'Rich, grounding, slightly exasperated by Randy.',
  },
  {
    id:      'randy',
    name:    'Randy "Sarge"',
    soraId:  '@geodudenj',
    role:    'Rock Lab Lead',
    icon:    '🪖',
    color:   '#3b82f6',
    photo:   null,
    bio:     'Retired military, now NJ\'s most intense geode hunter and amateur racing fan. Runs the cave series. Drives everything too fast.',
    vibe:    'High energy, tactical, turns everything into a mission briefing.',
    props:   ['Camo helmet', 'Headlamp', 'Rock hammer', 'Tactical vest', 'Geode bag', 'Racing goggles'],
    looks:   'Stocky, ex-military bearing, always wearing the helmet.',
    voice:   'Loud, enthusiastic, military cadence, goes on longer than necessary.',
  },
  {
    id:      'salem',
    name:    'Salem',
    soraId:  '@kennethwa.majorbilli',
    role:    'The Creative',
    icon:    '✨',
    color:   '#c084fc',
    photo:   '/images/characters/Salem.png',
    bio:     'Wren\'s character. Goth energy, purple streaks, pearl necklace, black everything. The visual genius of the farm.',
    vibe:    'Quiet intensity. Sees beauty in dark places. Dry humor.',
    props:   ['Pearl necklace', 'Black notebook', 'Camera', 'Purple nail polish', 'Tarot deck'],
    looks:   'Dark hair with purple highlights, heavy eye shadow, black lips, black shirt. South Park cutout style.',
    voice:   'Low, measured, occasionally devastating one-liners.',
  },
  {
    id:      'skully',
    name:    'Skully',
    soraId:  '@kennethwa.shadowblaz',
    role:    'Security & Tech',
    icon:    '🌑',
    color:   '#94a3b8',
    photo:   null,
    bio:     'Handles the farm\'s security systems and tech infrastructure. Operates mostly at night. Nobody is sure when he sleeps.',
    vibe:    'Paranoid in a useful way. Tactical. Loyal.',
    props:   ['Black hoodie', 'Night vision monocle', 'Laptop', 'Walkie talkie', 'Motion sensor gear'],
    looks:   'Slight build, always in dark clothes, moves quietly.',
    voice:   'Clipped, precise. Speaks in short bursts.',
  },
  {
    id:      'tank',
    name:    'Tank',
    soraId:  '@kennethwa.bronzedogg',
    role:    'Farm Hand',
    icon:    '🐕',
    color:   '#d97706',
    photo:   null,
    bio:     'The farm\'s most loyal worker. Big energy, big heart. Always first to volunteer, last to stop.',
    vibe:    'Enthusiastic, reliable, genuinely happy to be here.',
    props:   ['Work gloves', 'Wheelbarrow', 'Feed bucket', 'Bandana'],
    looks:   'Broad shoulders, easy smile, always muddy boots.',
    voice:   'Booming, positive, uses everyone\'s name.',
  },
  {
    id:      'big',
    name:    'BigTheSqua',
    soraId:  '@kennethwa.bigthesqua',
    role:    'Legend Watcher',
    icon:    '🦍',
    color:   '#4ade80',
    photo:   null,
    bio:     'The farm\'s cryptid expert and legend keeper. Has a theory about everything unusual in the Pine Barrens.',
    vibe:    'Intense, scholarly about the unexplained, unshakeable.',
    props:   ['Field journal', 'Plaster cast kit', 'Binoculars', 'Trail camera', 'Thermos'],
    looks:   'Large frame, serious expression, always has the field journal.',
    voice:   'Deep, deliberate, speaks about cryptids with complete sincerity.',
  },
  {
    id:      'eleanor',
    name:    'Grand Ma Eleanor',
    soraId:  '@grandma.eleanor',
    role:    'The Elder Authority',
    icon:    '👵',
    color:   '#fb7185',
    photo:   '/images/characters/Grand-Ma Eleanor.png',
    bio:     'Ken\'s grandmother. Has seen everything, forgotten nothing. Her word is final on the farm.',
    vibe:    'Razor sharp under the grandma sweetness. Will roast anyone.',
    props:   ['Wheelchair', 'Red blouse', 'Glasses', 'Knitting', 'Sweet tea', 'Farm photo albums'],
    looks:   'Grey hair, glasses, red shirt, wheelchair. South Park cutout style.',
    voice:   'Sweet on the surface, surgical underneath.',
  },
  {
    id:      'luna',
    name:    'Luna',
    soraId:  '@kennethwa.luna',
    role:    'The Escape Artist',
    icon:    '🐐',
    color:   '#fbbf24',
    photo:   '/images/characters/Luna.png',
    bio:     'Pine Barron\'s pygmy goat. Has escaped the pen 47 documented times. Wears a bell and a LUNA name sign. Always scheming.',
    vibe:    'Chaotic neutral. Adorable. Relentless.',
    props:   ['Gold bell collar', 'LUNA name sign', 'Tiny horns'],
    looks:   'Black and white pygmy goat, big eyes, tiny horns, gold bell. South Park sticker style.',
    voice:   'Says nothing. Communicates entirely through eye contact and property damage.',
  },
];

// ── FILMING LOCATIONS ─────────────────────────────────────────────────────────
const LOCATIONS = [
  { id:'barn',      name:'Big Red Barn',       icon:'🏚️', desc:'Main barn. Loft is North\'s domain. Afternoon golden hour hits the west wall perfectly.' },
  { id:'loft',      name:'Barn Loft',           icon:'🔭', desc:'North\'s command center. Blue glow from monitors. Hay bales. Perfect surveillance angle over the farm.' },
  { id:'coop',      name:'Chicken Coop',        icon:'🐔', desc:'Chaos energy. Dawn light is magic here. Randy once filmed a 10-minute tactical assessment of a chicken.' },
  { id:'garden',    name:'Farm Garden',         icon:'🌻', desc:'Sunflowers, corn, carrots. Marguerite\'s territory. Best light is morning.' },
  { id:'pond',      name:'Assunpink Creek',     icon:'💧', desc:'Edge of the property. Mist at dawn. Great for atmospheric shots.' },
  { id:'cave1',     name:'Randy\'s Cave #1',    icon:'⛏️', desc:'First documented cave site. 200ft in. Quartz and calcite formations. No cell signal.' },
  { id:'cave2',     name:'Pine Barrens Shaft',  icon:'🪨', desc:'Old mining shaft. Spectacular geode finds. Randy\'s favorite. Tight squeeze at the entrance.' },
  { id:'route539',  name:'Route 539',           icon:'🛣️', desc:'The long straight Pine Barrens road. Randy races here at 5am. Foggy in autumn.' },
  { id:'dirttrack', name:'NJ Dirt Track',       icon:'🏁', desc:'Local racing circuit. Randy knows everyone. Great dust clouds at sunset.' },
  { id:'field',     name:'Back Field',          icon:'🌾', desc:'Open field behind the barn. Stars are incredible here. Good for night shoots.' },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let view       = 'grid';    // 'grid' | 'character' | 'locations' | 'props'
let activeId   = null;
let editMode   = false;

// ── RENDER ────────────────────────────────────────────────────────────────────
export const render = (state) => `
  <div class="room-wrap">

    <!-- TAB BAR -->
    <div class="cm-tabs">
      <button class="cm-tab ${view==='grid'     ?'active':''}" onclick="castView('grid')">👥 Cast</button>
      <button class="cm-tab ${view==='locations'?'active':''}" onclick="castView('locations')">📍 Locations</button>
      <button class="cm-tab ${view==='props'    ?'active':''}" onclick="castView('props')">🎒 Props Master</button>
    </div>

    ${view === 'grid'      ? gridHTML()      : ''}
    ${view === 'character' ? charHTML()      : ''}
    ${view === 'locations' ? locationsHTML() : ''}
    ${view === 'props'     ? propsHTML()     : ''}

  </div>

  <style>
    /* TABS */
    .cm-tabs { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
    .cm-tab  { background:rgba(15,23,42,0.9); border:2px solid #1e293b;
               border-radius:12px; padding:11px 22px; color:#64748b;
               cursor:pointer; font-weight:900; font-size:0.82em;
               font-family:Georgia,serif; transition:all .2s; }
    .cm-tab.active { color:#fff; border-color:#38bdf8;
                     background:rgba(56,189,248,0.12); }
    .cm-tab:hover:not(.active) { color:#94a3b8; border-color:#334155; }

    /* CAST GRID */
    .cast-grid { display:grid;
                 grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
                 gap:16px; }
    .cast-card { background:rgba(2,6,23,0.95); border:2px solid #1e293b;
                 border-radius:20px; overflow:hidden; cursor:pointer;
                 transition:all .25s; position:relative; }
    .cast-card:hover { transform:translateY(-6px);
                       box-shadow:0 20px 50px rgba(0,0,0,.7); }
    .cast-photo { width:100%; height:200px; object-fit:cover;
                  object-position:top; display:block; }
    .cast-icon-wrap { width:100%; height:200px;
                      display:flex; align-items:center; justify-content:center;
                      font-size:5em; }
    .cast-info  { padding:16px 18px; }
    .cast-sora  { font-size:0.56em; font-weight:900; color:#38bdf8;
                  letter-spacing:1px; margin-bottom:5px; }
    .cast-name  { font-weight:900; font-size:1em; color:#fff; margin-bottom:3px; }
    .cast-role  { font-size:0.62em; color:#64748b; font-weight:700;
                  text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
    .cast-vibe  { font-size:0.74em; color:#94a3b8; line-height:1.55;
                  margin-bottom:12px; font-style:italic; }
    .cast-props-row { display:flex; gap:6px; flex-wrap:wrap; }
    .prop-tag   { font-size:0.56em; background:rgba(56,189,248,0.1);
                  border:1px solid #38bdf822; color:#94a3b8;
                  border-radius:8px; padding:3px 9px; font-weight:700; }
    .cast-enter { position:absolute; bottom:0; left:0; right:0;
                  background:linear-gradient(0deg,rgba(2,6,23,0.98),transparent);
                  padding:20px 18px 14px; opacity:0; transition:opacity .25s; }
    .cast-card:hover .cast-enter { opacity:1; }
    .cast-enter-btn { width:100%; background:#38bdf8; color:#020617; border:none;
                      border-radius:10px; padding:10px; font-weight:900;
                      cursor:pointer; font-family:Georgia,serif; font-size:0.8em; }

    /* CHARACTER DETAIL */
    .char-back  { background:rgba(15,23,42,0.8); border:2px solid #334155; border-radius:10px;
                  color:#cbd5e1; padding:9px 18px; font-weight:900; cursor:pointer;
                  font-family:Georgia,serif; font-size:0.8em; margin-bottom:20px;
                  transition:all .2s; }
    .char-back:hover { border-color:#38bdf8; color:#fff; background:rgba(56,189,248,0.08); }
    .char-detail{ display:grid; grid-template-columns:280px 1fr; gap:24px; }
    @media(max-width:700px) { .char-detail { grid-template-columns:1fr; } }
    .char-photo-wrap { border-radius:20px; overflow:hidden;
                       border:3px solid var(--cc,#38bdf8);
                       background:rgba(15,23,42,0.9); }
    .char-photo { width:100%; display:block; }
    .char-icon-big { width:100%; height:280px; display:flex;
                     align-items:center; justify-content:center; font-size:7em; }
    .char-right { display:flex; flex-direction:column; gap:16px; }
    .char-section { background:rgba(15,23,42,0.92); border:2px solid #1e293b;
                    border-radius:16px; padding:20px; }
    .char-section-title { font-size:0.6em; font-weight:900; color:#38bdf8;
                          letter-spacing:2px; text-transform:uppercase;
                          margin-bottom:10px; }
    .char-bio   { color:#cbd5e1; font-size:0.86em; line-height:1.7; }
    .char-looks { color:#cbd5e1; font-size:0.86em; line-height:1.7; }
    .char-voice { color:#cbd5e1; font-size:0.86em; line-height:1.7;
                  font-style:italic; }
    .props-list { display:flex; flex-wrap:wrap; gap:8px; }
    .prop-pill  { background:rgba(56,189,248,0.1); border:2px solid #38bdf822;
                  color:#e2e8f0; border-radius:10px; padding:7px 14px;
                  font-size:0.76em; font-weight:900; }
    .forge-btn  { background:linear-gradient(135deg,#0284c7,#0ea5e9);
                  color:#fff; border:none; border-radius:14px; padding:14px 28px;
                  font-weight:900; cursor:pointer; font-size:0.9em; letter-spacing:0.3px;
                  font-family:Georgia,serif; transition:all .2s; margin-top:4px;
                  box-shadow:0 4px 18px rgba(2,132,199,0.4); }
    .forge-btn:hover { transform:scale(1.03); filter:brightness(1.1); }

    /* LOCATIONS */
    .loc-grid { display:grid;
                grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                gap:14px; }
    .loc-card { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
                border-radius:16px; padding:20px; transition:all .25s;
                cursor:pointer; }
    .loc-card:hover { border-color:#38bdf8; transform:translateY(-3px);
                      box-shadow:0 12px 30px rgba(0,0,0,.5); }
    .loc-icon { font-size:2.2em; margin-bottom:10px; }
    .loc-name { font-weight:900; font-size:0.95em; color:#fff; margin-bottom:6px; }
    .loc-desc { color:#64748b; font-size:0.76em; line-height:1.6; margin-bottom:12px; }
    .loc-forge{ color:#38bdf8; font-size:0.66em; font-weight:900; letter-spacing:1px; }

    /* PROPS MASTER */
    .props-master { display:flex; flex-direction:column; gap:14px; }
    .pm-row  { background:rgba(2,6,23,0.92); border:2px solid #1e293b;
               border-radius:16px; padding:18px 20px;
               display:flex; gap:16px; align-items:flex-start; }
    .pm-ava  { width:52px; height:52px; border-radius:50% 50% 50% 8px;
               display:flex; align-items:center; justify-content:center;
               font-size:1.6em; flex-shrink:0; }
    .pm-name { font-weight:900; color:#fff; font-size:0.9em; margin-bottom:4px; }
    .pm-sora { font-size:0.58em; color:#38bdf8; font-weight:900;
               letter-spacing:1px; margin-bottom:10px; }
    .pm-props{ display:flex; flex-wrap:wrap; gap:7px; }
  </style>
`;

// ── GRID VIEW ─────────────────────────────────────────────────────────────────
const gridHTML = () => `
  <div class="panel-desc">
    Every crew member. Sora IDs locked. Tap any character to see their full profile and forge a scene.
  </div>
  <div class="cast-grid">
    ${CAST_DB.map(c => `
      <div class="cast-card" style="border-color:${c.color}44;"
           onclick="castOpen('${c.id}')">
        ${c.photo
          ? `<img src="${c.photo}" class="cast-photo" alt="${c.name}"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
             <div class="cast-icon-wrap" style="display:none;">${c.icon}</div>`
          : `<div class="cast-icon-wrap" style="background:${c.color}12;">${c.icon}</div>`}
        <div class="cast-info">
          <div class="cast-sora" onclick="castCopySora('${c.soraId}',event)" title="Click to copy Sora ID" style="cursor:pointer;">${c.soraId} 📋</div>
          <div class="cast-name">${c.name}</div>
          <div class="cast-role" style="color:${c.color};">${c.role}</div>
          <div class="cast-vibe">${c.vibe}</div>
          <div class="cast-props-row">
            ${c.props.slice(0,3).map(p => `<span class="prop-tag">${p}</span>`).join('')}
            ${c.props.length > 3 ? `<span class="prop-tag">+${c.props.length-3}</span>` : ''}
          </div>
        </div>
        <div class="cast-enter">
          <button class="cast-enter-btn">▶ Open Profile</button>
        </div>
      </div>`).join('')}
  </div>
`;

// ── CHARACTER DETAIL ──────────────────────────────────────────────────────────
const charHTML = () => {
  const c = CAST_DB.find(x => x.id === activeId);
  if (!c) return gridHTML();
  return `
    <button class="char-back" onclick="castView('grid')">← Back to Cast</button>
    <div class="char-detail" style="--cc:${c.color};">

      <div>
        <div class="char-photo-wrap">
          ${c.photo
            ? `<img src="${c.photo}" class="char-photo" alt="${c.name}"
                    onerror="this.outerHTML='<div class=char-icon-big>${c.icon}</div>'"/>`
            : `<div class="char-icon-big" style="background:${c.color}10;">${c.icon}</div>`}
        </div>
        <div style="margin-top:14px;">
          <button class="forge-btn" style="width:100%;"
            onclick="forgeScene('Generate a cinematic scene featuring ${c.name} (${c.soraId}) at Pine Barron Farms. Role: ${c.role}. Props: ${c.props.slice(0,3).join(', ')}. Full 9:16 SORA call sheet format.')">
            🎬 Forge ${c.name.split(' ')[0]}'s Scene
          </button>
        </div>
      </div>

      <div class="char-right">
        <div class="char-section">
          <div class="char-section-title">Identity</div>
          <div style="font-weight:900;font-size:1.2em;color:#fff;margin-bottom:4px;">${c.name}</div>
          <div style="font-size:0.66em;font-weight:900;letter-spacing:1px;margin-bottom:6px;">
            <span style="color:${c.color};cursor:pointer;" onclick="castCopySora('${c.soraId}',event)" title="Click to copy">${c.soraId} 📋</span>
            <span style="color:#475569;"> · ${c.role}</span>
          </div>
          <div class="char-bio">${c.bio}</div>
        </div>

        <div class="char-section">
          <div class="char-section-title">On Screen</div>
          <div class="char-looks" style="margin-bottom:10px;"><strong style="color:#fff;">Looks:</strong> ${c.looks}</div>
          <div class="char-voice"><strong style="color:#fff;">Voice:</strong> ${c.voice}</div>
        </div>

        <div class="char-section">
          <div class="char-section-title">Props & Wardrobe</div>
          <div class="props-list">
            ${c.props.map(p => `<div class="prop-pill">🎒 ${p}</div>`).join('')}
          </div>
        </div>

        <div class="char-section">
          <div class="char-section-title">Quick Forge</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="forge-btn"
              onclick="forgeScene('EVERYDAY FARM SCENE — ${c.name} (${c.soraId}) doing something ordinary at Pine Barron Farms that reveals their personality. Cinematic. 9:16 vertical. SORA format.')">
              🌾 Daily Life Scene
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7);"
              onclick="forgeScene('CHARACTER INTRO — Cinematic introduction of ${c.name} (${c.soraId}). Props: ${c.props.slice(0,2).join(', ')}. Energy: ${c.vibe}. Make it scroll-stopping. 9:16 SORA format.')">
              🎬 Character Intro
            </button>
            <button class="forge-btn" style="background:linear-gradient(135deg,#d97706,#f59e0b);"
              onclick="forgeScene('WEIRD NJ MOMENT — ${c.name} (${c.soraId}) encounters something unexplained in the Pine Barrens. Lean into their personality: ${c.vibe}. 9:16 SORA format.')">
              👻 Weird NJ Moment
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

// ── LOCATIONS VIEW ────────────────────────────────────────────────────────────
const locationsHTML = () => `
  <div class="panel-desc">
    Every filming location on the farm and in New Jersey. Tap any location to forge a scene there.
  </div>
  <div class="loc-grid">
    ${LOCATIONS.map(l => `
      <div class="loc-card"
           onclick="forgeScene('LOCATION SCOUT — Cinematic establishing shot of ${l.name} at Pine Barron Farms NJ. ${l.desc} 9:16 vertical SORA format.')">
        <div class="loc-icon">${l.icon}</div>
        <div class="loc-name">${l.name}</div>
        <div class="loc-desc">${l.desc}</div>
        <div class="loc-forge">▶ FORGE ESTABLISHING SHOT</div>
      </div>`).join('')}
  </div>
`;

// ── PROPS MASTER VIEW ─────────────────────────────────────────────────────────
const propsHTML = () => `
  <div class="panel-desc">
    Every prop, every character. This is what North reads before generating any prompt.
    These details lock the scene to your real world.
  </div>
  <div class="props-master">
    ${CAST_DB.map(c => `
      <div class="pm-row" style="border-color:${c.color}33;">
        <div class="pm-ava" style="background:${c.color}15;">${c.icon}</div>
        <div style="flex:1;">
          <div class="pm-name">${c.name}</div>
          <div class="pm-sora" onclick="castCopySora('${c.soraId}',event)" style="cursor:pointer;" title="Click to copy Sora ID">${c.soraId} 📋</div>
          <div class="pm-props">
            ${c.props.map(p => `<div class="prop-pill">🎒 ${p}</div>`).join('')}
          </div>
        </div>
        <button onclick="castOpen('${c.id}')"
          style="background:none;border:2px solid ${c.color}44;color:${c.color};
                 border-radius:10px;padding:8px 16px;cursor:pointer;font-weight:900;
                 font-size:0.72em;font-family:Georgia,serif;white-space:nowrap;
                 flex-shrink:0;transition:all .2s;">
          Full Profile →
        </button>
      </div>`).join('')}
  </div>
`;

// ── WINDOW FUNCTIONS ──────────────────────────────────────────────────────────
window.castView = (v) => { view = v; activeId = null; window.goTo('cast'); };
window.castOpen = (id) => { activeId = id; view = 'character'; window.goTo('cast'); };
window.castCopySora = (soraId, event) => {
  event?.stopPropagation();
  navigator.clipboard.writeText(soraId)
    .then(() => window.showToast(`✓ ${soraId} copied!`))
    .catch(() => window.showToast('Copy failed'));
};

export const mount = () => {};
