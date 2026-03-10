// platforms.js — Craft Engine: Platform Knowledge Base
// North reads this before generating every prompt.
// Add new hacks here as they're discovered — North uses them immediately.

export const PLATFORMS = [
  {
    id:       'sora2',
    name:     'Sora 2',
    icon:     '🌀',
    color:    '#0ea5e9',
    maker:    'OpenAI',
    best_for: 'Cinematic realism, long duration, complex scene transitions, character consistency',
    format:   '9:16 vertical · up to 20s · 1080p',
    model:    'sora-2',

    prompt_structure: [
      'HOOK (0–1.5s): scroll-stopping visual, present tense, action already happening',
      'SCENE: 2–3 sentences, specific NJ location, exact lighting condition, character @ID',
      'CAMERA: angle + movement + lens in one line (e.g. Low angle, slow push-in, 35mm)',
      'AUDIO: ambient → dialogue/sound → music layer',
      'TEXT OVERLAY: 3 words max, optional',
    ],

    techniques: [
      'Lock characters with @soraId in every scene sentence — consistency breaks without it',
      'Describe lighting as a time + weather combo: "3pm November light, low sun through bare oaks"',
      'Use present tense throughout — Sora responds better to "Ken walks" than "Ken is walking"',
      'Specify lens focal length — "85mm portrait" vs "16mm wide" gives completely different energy',
      'Add micro-details: "mud on boots", "breath visible in cold air" — elevates realism dramatically',
      'Keep scene description under 80 words — Sora degrades with over-stuffed prompts',
      'Name the exact NJ location — "Route 539 Pine Barrens" beats "rural road"',
      'End with an audio note — Sora responds to sound design cues',
    ],

    hacks: [
      '🔥 SEED LOCK: Add [seed:XXXX] to get consistent results across multiple generations',
      '🔥 STYLE ANCHOR: Open with "Shot on RED Komodo, anamorphic lens" for instant film look',
      '🔥 NEGATIVE SPACE: End prompt with "No text overlays, no color grading artifacts" to clean output',
      '🔥 EMOTION FIRST: Start with the emotional tone before the visual — "Melancholy golden hour…" outperforms purely visual openers',
      '🔥 CHARACTER ANCHOR: Describe the character\'s physical tell before the action — "Randy in his camo helmet, headlamp on, crouches at cave entrance" locks the look',
      '🔥 WEATHER AS MOOD: Fog, overcast, golden hour — Sora reads weather as emotional direction',
    ],

    avoid: [
      'Passive voice ("is being seen", "was walking")',
      'More than 2 characters in motion simultaneously — consistency breaks',
      'Abstract concepts without visual anchors ("hope", "freedom" with no image attached)',
      'Overlong prompts — sweet spot is 60–90 words for the scene block',
    ],

    callsheet_template: (scene, char, loc, cam, audio) => `
═══════════════════════════════════════
  SORA 2 · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    9:16 Vertical · 1080p
DURATION:  8–12 seconds recommended
LOCATION:  ${loc}
CHARACTER: ${char}
───────────────────────────────────────
SCENE
${scene}
───────────────────────────────────────
CAMERA
${cam}
───────────────────────────────────────
AUDIO
${audio}
───────────────────────────────────────
CLEAN PROMPT (paste into Sora)
${scene} ${cam} ${audio} Shot on RED Komodo, anamorphic. No text overlays.
═══════════════════════════════════════`,
  },

  {
    id:       'kling',
    name:     'Kling AI',
    icon:     '⚡',
    color:    '#f59e0b',
    maker:    'Kuaishou',
    best_for: 'Physics simulation, fluid motion, material texture, fast action sequences',
    format:   '9:16 vertical · 5s or 10s · 720p/1080p',
    model:    'kling-v1.6',

    prompt_structure: [
      'Subject: exact description of who/what is in motion',
      'Action: precise physical movement with material detail',
      'Environment: location + surface textures + lighting',
      'Camera: movement type + speed (slow/fast/static)',
      'Style: cinematic, photorealistic, high detail',
    ],

    techniques: [
      'Kling is physics-first — describe weight, momentum, material: "heavy boots crunch gravel"',
      'Motion blur is a strength — lean into fast movement: "dust cloud trails the ATV"',
      'Material texture prompting is powerful: "worn leather", "rusted iron", "wet mud"',
      'Camera movement descriptions work well: "tracking shot following subject left to right"',
      'Short focused prompts outperform long ones — 3 tight sentences beats a paragraph',
      'Specify surface the character is moving on — Kling simulates it accurately',
    ],

    hacks: [
      '🔥 PHYSICS ANCHOR: Describe what\'s touching what — "boots on wet pine needles" gives Kling something to simulate',
      '🔥 SPEED CONTRAST: Mix fast and slow in one scene — "Randy sprints then suddenly stops, dust settling around him"',
      '🔥 TEXTURE STACKING: Layer 3 material textures — "mud-caked gloves grip a cold quartz crystal in a damp cave"',
      '🔥 NEGATIVE PROMPT: Always add "no camera shake, no artifacts, photorealistic" at the end',
      '🔥 MOTION DIRECTION: Specify direction of every movement — Kling responds to "left to right pan" vs just "pan"',
    ],

    avoid: [
      'Complex dialogue scenes — Kling is motion-first, not conversation',
      'Multiple scene cuts — it\'s one continuous shot per generation',
      'Abstract environments — needs physical, textured spaces to shine',
      'Asking for specific facial expressions — motion is the strength, not subtle emotion',
    ],

    callsheet_template: (scene, char, loc, cam, audio) => `
═══════════════════════════════════════
  KLING AI · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    9:16 Vertical
DURATION:  5s or 10s
LOCATION:  ${loc}
CHARACTER: ${char}
───────────────────────────────────────
SCENE (physics-first)
${scene}
───────────────────────────────────────
CAMERA
${cam}
───────────────────────────────────────
CLEAN PROMPT (paste into Kling)
${scene} ${cam}. Photorealistic, high detail, cinematic. No camera shake, no artifacts.
═══════════════════════════════════════`,
  },

  {
    id:       'veo3',
    name:     'VEO 3',
    icon:     '🎬',
    color:    '#22c55e',
    maker:    'Google DeepMind',
    best_for: 'Native audio generation, dialogue, ambient sound, music sync, documentary style',
    format:   '9:16 vertical · up to 8s · 1080p',
    model:    'veo-3',

    prompt_structure: [
      'Visual scene: what is happening and where',
      'Character action: specific and present tense',
      'AUDIO BLOCK: this is VEO 3\'s superpower — be very specific',
      '  · Ambient: background sound environment',
      '  · Dialogue: exact words if needed',
      '  · Music: genre + tempo + mood',
      'Camera: movement and framing',
    ],

    techniques: [
      'VEO 3 generates audio natively — this is the differentiator, use it hard',
      'Describe the soundscape in as much detail as the visuals',
      'Dialogue works — write the actual line you want spoken',
      'Music direction is powerful: "lo-fi hip hop beat, 80 BPM, melancholy"',
      'Documentary style is a strength — "handheld, naturalistic, observational"',
      'Ambient layers stack well: "wind through pines + distant chickens + gravel crunch"',
      'North\'s voice could be generated here — describe his vocal quality',
    ],

    hacks: [
      '🔥 AUDIO FIRST: Write your audio description before your visual — VEO 3 builds the world around sound',
      '🔥 DIALOGUE LOCK: Put exact dialogue in quotes: Randy says "I found something. Get the camera."',
      '🔥 SOUND LAYERING: Stack 3 audio layers — ambient + action sound + music = cinematic richness',
      '🔥 VOICE CHARACTER: Describe voice tone — "gruff, military cadence, barely containing excitement"',
      '🔥 NATURE AUDIO: Pine Barrens has a specific sound — "wind through scrub pine, distant crow, dead leaves"',
    ],

    avoid: [
      'Ignoring the audio block — VEO 3 without audio direction wastes its main strength',
      'Fast action sequences — Sora and Kling do this better',
      'Highly stylized looks — VEO 3 leans naturalistic/documentary',
    ],

    callsheet_template: (scene, char, loc, cam, audio) => `
═══════════════════════════════════════
  VEO 3 · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    9:16 Vertical · 1080p
DURATION:  6–8 seconds
LOCATION:  ${loc}
CHARACTER: ${char}
───────────────────────────────────────
VISUAL SCENE
${scene}
───────────────────────────────────────
CAMERA
${cam}
───────────────────────────────────────
⭐ AUDIO (VEO 3 superpower — be specific)
${audio}
───────────────────────────────────────
CLEAN PROMPT (paste into VEO 3)
${scene} ${cam}. AUDIO: ${audio}.
═══════════════════════════════════════`,
  },

  {
    id:       'grok',
    name:     'Grok Aurora',
    icon:     '✖️',
    color:    '#f8fafc',
    maker:    'xAI',
    best_for: 'Stylized visuals, surreal imagery, bold aesthetics, Weird NJ content, dreamcore',
    format:   '9:16 vertical · various durations',
    model:    'aurora',

    prompt_structure: [
      'Aesthetic direction first — Grok responds to strong style anchors',
      'Subject and action',
      'Environment with surreal or heightened details',
      'Mood and color palette',
      'Camera and composition',
    ],

    techniques: [
      'Grok Aurora leans into the surreal and stylized — perfect for Weird NJ and Jeeb content',
      'Lead with aesthetic: "Cinematic dark fairytale", "1970s exploitation film grain", "dreamcore pastoral"',
      'Color palette direction is powerful: "desaturated greens + amber highlights"',
      'Great for Salem\'s content — goth aesthetic, dark beauty, stylized reality',
      'Pine Barrens folklore content is a natural fit — Jersey Devil, ghost roads, fog',
      'Experimental and bold — if other platforms play it safe, Grok will take the risk',
    ],

    hacks: [
      '🔥 STYLE REFERENCE: Name a visual style era — "1970s New Jersey documentary", "80s VHS horror"',
      '🔥 COLOR GRADE FIRST: Open with color palette — "Teal and orange grade, heavy contrast" sets the whole tone',
      '🔥 SURREAL LAYER: Add one impossible detail to ground the weird — "the barn casts no shadow"',
      '🔥 FOLKLORE ANCHOR: Pine Barrens has 300 years of folklore — name it: "Jersey Devil territory", "the pines at 3am"',
      '🔥 SALEM CONTENT: Dark aesthetic + Grok = perfect match. Describe Salem\'s energy: "goth girl, pine forest, moonlight, surreal"',
    ],

    avoid: [
      'Expecting photorealism — that\'s Sora and Kling\'s territory',
      'Complex character consistency across multiple generations',
      'Fast sports/action content — stylized slow burn is the strength',
    ],

    callsheet_template: (scene, char, loc, cam, audio) => `
═══════════════════════════════════════
  GROK AURORA · CALL SHEET
  Pine Barron Farms Production
═══════════════════════════════════════
FORMAT:    9:16 Vertical
LOCATION:  ${loc}
CHARACTER: ${char}
───────────────────────────────────────
AESTHETIC DIRECTION
[Define style/era/mood before scene]
───────────────────────────────────────
SCENE
${scene}
───────────────────────────────────────
CAMERA
${cam}
───────────────────────────────────────
CLEAN PROMPT (paste into Grok Aurora)
${scene} ${cam}. Stylized cinematic, bold aesthetic, high contrast.
═══════════════════════════════════════`,
  },
];

// ── CINEMATOGRAPHY KNOWLEDGE ──────────────────────────────────────────────────
export const CINEMATOGRAPHY = {
  lenses: [
    { name:'14–16mm ultra wide', use:'Establishing shots, vast spaces, barn exterior, field at dawn' },
    { name:'24mm wide',          use:'Environmental storytelling, character in context, cave entrances' },
    { name:'35mm',               use:'Natural perspective, walking shots, Randy\'s daily life' },
    { name:'50mm standard',      use:'Intimate conversations, kitchen scenes, North\'s loft' },
    { name:'85mm portrait',      use:'Character close-ups, emotional moments, cast intros' },
    { name:'135mm telephoto',    use:'Compressed distance, Luna in the field, long road shots' },
    { name:'Anamorphic',         use:'Cinematic widescreen feel, lens flares, epic barn shots' },
    { name:'Macro',              use:'Geode details, crystal formations, Randy\'s rock lab' },
  ],

  moves: [
    { name:'Static locked',      use:'Tension, observation, North watching from loft' },
    { name:'Slow push-in',       use:'Revelation, drama, finding something in the cave' },
    { name:'Pull back reveal',   use:'Scale reveal, farm establishing shot, sunrise over field' },
    { name:'Tracking shot',      use:'Following character, Randy walking to cave, Ken on ATV' },
    { name:'Handheld',           use:'Urgency, documentary feel, found footage energy' },
    { name:'Low angle',          use:'Power, menace, Luna looking up, Jersey Devil territory' },
    { name:'High angle / drone', use:'Farm scale, Pine Barrens canopy, racing overview' },
    { name:'Dutch angle',        use:'Unease, Weird NJ content, something is wrong' },
    { name:'Whip pan',           use:'Energy, action cut, Randy reacting fast' },
  ],

  lighting: [
    { name:'Magic hour / golden', use:'Farm life beauty, warm barn exterior, late day field' },
    { name:'Blue hour / dusk',    use:'Transition, melancholy, end of day on the farm' },
    { name:'Overcast / flat',     use:'Even, documentary, Pine Barrens midday' },
    { name:'Hard noon sun',       use:'Summer farm work, harsh reality, outdoor labor' },
    { name:'Practical interior',  use:'Barn light, kitchen, North\'s loft monitor glow' },
    { name:'Headlamp / torch',    use:'Cave scenes, Randy underground, night search' },
    { name:'Moonlight',           use:'Night farm, Weird NJ, ghostly Pine Barrens' },
    { name:'Storm light',         use:'Drama, tension, before the weather breaks' },
  ],
};

// ── NORTH SYSTEM PROMPT INJECTION ─────────────────────────────────────────────
// This is what gets added to North's system prompt before every generation
export const getPlatformContext = (platformId) => {
  const p = PLATFORMS.find(x => x.id === platformId);
  if (!p) return '';
  return `
PLATFORM: ${p.name} (${p.maker})
BEST FOR: ${p.best_for}
FORMAT: ${p.format}
KEY TECHNIQUES: ${p.techniques.slice(0,4).join(' | ')}
ACTIVE HACKS: ${p.hacks.slice(0,3).map(h => h.replace('🔥 ','')).join(' | ')}
AVOID: ${p.avoid.slice(0,2).join(' | ')}
`;
};
