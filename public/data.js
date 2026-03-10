// data.js — ALL content arrays for North Forge
// Edit this file to add stories, locations, idioms, weird cards, etc.
// Wren can edit this file without touching any other code.

// ── SCENES (animated sky backgrounds) ───────────────────────────────────────
export const SCENES = [
  { id:"golden", sky:["#0d0500","#7a2808","#f0a030"], skyPct:[0,45,100], ground:"#1e3208", treeColor:"#2a4810", treeCount:40, treeH:[60,80,70,90] },
  { id:"pines",  sky:["#010402","#051408","#122a14"], skyPct:[0,50,100], ground:"#030e05", treeColor:"#061608", treeCount:60, treeH:[100,140,110,150] },
  { id:"storm",  sky:["#0f172a","#1e293b","#334155"], skyPct:[0,50,100], ground:"#0a1020", treeColor:"#050c18", treeCount:35, treeH:[60,80,70,90] },
  { id:"night",  sky:["#000002","#020010","#0c0920"], skyPct:[0,50,100], ground:"#050308", treeColor:"#030208", treeCount:45, treeH:[70,90,80,100] },
  { id:"dawn",   sky:["#200530","#8a1060","#f0a080"], skyPct:[0,45,100], ground:"#180a20", treeColor:"#1a0830", treeCount:38, treeH:[65,85,72,92] },
];

// ── ROOMS (navigation) ───────────────────────────────────────────────────────
export const ROOMS = [
  { id:"chat",    emoji:"💬", title:"Talk to North",    color:"#0ea5e9", desc:"Ask anything. North writes cinematic prompts for your crew."        },
  { id:"slots",   emoji:"🎰", title:"Story Slots",      color:"#f59e0b", desc:"Pick your cast and location. Pull the lever for a wild plot twist."  },
  { id:"rocklab", emoji:"⛏️", title:"Randy's Rock Lab", color:"#3b82f6", desc:"The Geode Hunting series. NJ caves, crystals, and cave drama."       },
  { id:"racing",  emoji:"🏁", title:"Racing Garage",    color:"#ef4444", desc:"Sarge's need for speed. F1, dirt track, and backyard go-karts."      },
  { id:"weird",   emoji:"👻", title:"Weird NJ",         color:"#a855f7", desc:"Jersey Devil. Clinton Road. Action Park. The strange truth of NJ."   },
  { id:"jeeb",    emoji:"🍄", title:"The Jeeb",         color:"#c084fc", desc:"The psychedelic, dreamlike side of the Pine Barrens."                },
  { id:"idioms",  emoji:"🤬", title:"Randy's Idioms",   color:"#d97706", desc:"North generates a random idiom. Randy reacts. Chaos ensues."         },
  { id:"cast",    emoji:"🧠", title:"The Cast",         color:"#22c55e", desc:"Everyone on the farm. Tap any character to generate their scene."    },
  { id:"setup",   emoji:"🔑", title:"Setup",            color:"#94a3b8", desc:"Connect your API keys and configure North Forge."                    },
];

// ── SLOT OPTIONS ─────────────────────────────────────────────────────────────
export const SLOT_LOCATIONS = [
  { id:"barn",      icon:"🏚️", label:"Big Red Barn",     desc:"The farm's warm neural heart"   },
  { id:"coop",      icon:"🐣", label:"Chicken Coop",      desc:"Safe, loud, chaotic"            },
  { id:"boardwalk", icon:"🎡", label:"AC Boardwalk",      desc:"Neon nights, ocean brine"       },
  { id:"track",     icon:"🏁", label:"Wall Stadium",      desc:"Screeching NJ dirt-track clay"  },
  { id:"pines",     icon:"🌲", label:"Deep Pine Barrens", desc:"Ancient shadows, Jersey legends"},
  { id:"lake",      icon:"🎣", label:"Lake Assunpink",    desc:"Still water, mist, silence"     },
  { id:"mine",      icon:"⛏️", label:"Secret Mine Shaft", desc:"Underground, crystal dark"      },
];

export const SLOT_RIDES = [
  { id:"tractor", icon:"🚜", label:"Red Farmall",  desc:"1960s steel barn beast"       },
  { id:"f1",      icon:"🏎️", label:"Formula 1",   desc:"Sarge's greatest dream"       },
  { id:"kart",    icon:"🏎️", label:"Go-Kart",     desc:"Dust trails through the pines"},
  { id:"horse",   icon:"🐎", label:"On Horseback", desc:"Through the back meadow"      },
  { id:"foot",    icon:"🥾", label:"On Foot",      desc:"Just walking the grounds"     },
];

export const SLOT_AUDIO = [
  { id:"waterslager", icon:"🎵", label:"Waterslagers",  desc:"Grandma's water-bubbling birds"},
  { id:"rock",        icon:"🎸", label:"Classic Rock",   desc:"80s AM radio"                 },
  { id:"jeeb",        icon:"🍄", label:"Psychedelic",    desc:"Echoing Jeeb frequencies"     },
  { id:"silence",     icon:"🍃", label:"Eerie Silence",  desc:"Wind through the pines"       },
  { id:"scanner",     icon:"📻", label:"Police Scanner", desc:"Crackling NJ chatter"         },
];

// ── PLOT TWISTS ──────────────────────────────────────────────────────────────
export const TWISTS = [
  "A massive nor'easter rolls in, burying everything in glowing snow.",
  "Dark web neural artifacts bleed into the NJ sky like corrupted static.",
  "A silent black triangle UFO hovers above the chicken coop.",
  "BigTheSqua calmly walks out of the morning fog and sits down.",
  "A portal to 1985 tears open, flooding the farm in synth-wave neon.",
  "It starts raining cats and dogs. Literally. Canines from the clouds.",
  "The power cuts to zero. Emergency red lighting floods the barn.",
  "Luna the goat escapes and destroys everything in the scene.",
  "A full double rainbow appears but the colors are wrong — purple and green.",
  "Skully the dog finds something buried and will not stop barking.",
  "A vintage 1967 Cadillac rolls slowly down the farm road with no driver.",
  "Every crow in New Jersey descends on the barn roof at once.",
  "The Farmall tractor starts itself and begins slow circles in the field.",
  "A hot air balloon shaped like a giant ear of corn drifts overhead.",
  "The Jersey Devil lands on the barn roof, looks around, and leaves.",
  "Marguerite walks out with a tray of food and everyone stops.",
  "Ken cuts the wrong wire. All farm lights turn permanently purple.",
  "A pack of deer walks through in perfect single file, unbothered.",
  "All the canaries escape and form a perfect swirling murmuration.",
  "Randy shows up in full F1 racing gear. Nobody asks why.",
  "A thick wall of Pine Barrens fog swallows the bottom half of everything.",
  "The barn door swings open by itself. North's loft light pulses three times.",
  "It begins snowing fireflies — warm glowing light falling upward.",
  "A 1980s ice cream truck rolls past playing something deeply unsettling.",
  "Salem appears, takes one photo, disappears without explaining anything.",
];

// ── RACING CARDS ─────────────────────────────────────────────────────────────
export const RACING_CARDS = [
  { id:"f1",   title:"Formula 1 Monaco",     desc:"Randy behind the wheel of a screaming red F1. Monaco blur.",     prompt:"SPORTS + RACING + set: Monaco Grand Prix start line + 30s — @geodudenj in red F1 cockpit, hyper-realistic, sparks cascading under chassis on launch, cockpit cam tight on his focused eyes behind visor." },
  { id:"dirt", title:"Wall Stadium Speedway", desc:"Sideways in a sprint car on NJ red clay, mud in plumes.",        prompt:"REAL NJ + RACING + set: Wall Stadium Speedway Belmar NJ + 30s — @geodudenj drifting dirt-track sprint car completely sideways through tight banked turn, rooster tail of red NJ clay, stadium lights cutting through dust." },
  { id:"kart", title:"Backyard Grand Prix",   desc:"Go-karts dangerously fast through impossibly tight pine trees.", prompt:"BIG RED BARN + RACING + set: Pine Barrens fire road + 30s — @kennethwalker479 and @geodudenj racing 100cc go-karts at reckless speed through impossibly tight NJ pines, engines screaming, branches slapping windshields." },
  { id:"pit",  title:"Pit Lane Drama",        desc:"Four-tire swap in under four seconds. Randy is watching.",       prompt:"SPORTS + RACING + set: F1 pit lane + 20s — Ultra slow-motion four-tire swap, @geodudenj watching from cockpit. Four mechanics move as one organism. The gun fires. Done." },
  { id:"dawn", title:"Empty Track at Dawn",   desc:"Wall Stadium at 5am. Just Randy and the machine.",               prompt:"REAL NJ + RACING + set: Wall Stadium Speedway empty at dawn + 45s — @geodudenj alone on the dirt oval at 5am, morning mist over clay, single slow lap, no crowds, just the engine and NJ birds waking up." },
];

// ── WEIRD NJ CARDS ───────────────────────────────────────────────────────────
export const WEIRD_CARDS = [
  { id:"devil",   cat:"👹 LEGEND",  color:"#a855f7", title:"Jersey Devil",        body:"The 13th child of Leeds Point. Still out there.",               prompt:"WEIRD NJ + NIGHT VISION + set: Deep Pine Barrens + 45s — @kennethwa.bigthesqua tracking the Jersey Devil through thermal fog. Green night-vision. Massive wings just outside frame. Something exhales." },
  { id:"clinton", cat:"👻 DARK",    color:"#ef4444", title:"Clinton Road",         body:"Haunted road. Phantom truck. No explanation ever.",              prompt:"WEIRD NJ + DARK + set: Clinton Road midnight + 30s — @kennethwa.shadowblaz center of road. Single phantom headlights approaching from a mile away. Lights stop. Nothing arrives." },
  { id:"action",  cat:"🎢 HISTORY", color:"#eab308", title:"Action Park",          body:"The 80s NJ survival park. No safety. Pure chaos.",               prompt:"WEIRD NJ + 1980s VHS + set: Action Park NJ looping water slide + 30s — VHS scan lines, chaotic summer crowd, rider launched off the loop, laughter and screaming, dangerous 80s energy." },
  { id:"pine3am", cat:"🌲 EERIE",   color:"#22c55e", title:"The Pines at 3AM",     body:"Something is always moving out there. Always.",                  prompt:"WEIRD NJ + PARANORMAL + set: Pine Barrens 3AM + 45s — @kennethwa.bigthesqua standing perfectly still between ancient pines. A single branch snaps. He does not flinch." },
  { id:"droptop", cat:"🚗 GHOSTLY", color:"#f43f5e", title:"The Phantom Drop-top", body:"A 1967 Cadillac. No driver. Always heading south on Route 9.",  prompt:"WEIRD NJ + NIGHT + set: Route 9 South NJ + 30s — A pristine 1967 Cadillac Eldorado convertible cruising at 35mph, no driver, radio playing, turn signal on, heading somewhere specific." },
  { id:"steeple", cat:"🌊 LEGEND",  color:"#38bdf8", title:"The Sunken Steeple",   body:"A town drowned beneath a NJ reservoir. The bells still ring.",  prompt:"WEIRD NJ + EERIE + set: NJ reservoir ruins + 45s — Underwater church steeple, murky water, @kennethwa.bigthesqua in a canoe above it, watching bubbles rise from below." },
];

// ── JEEB CARDS ───────────────────────────────────────────────────────────────
export const JEEB_CARDS = [
  { id:"neon",    title:"The Neon Pines",       desc:"Psychedelic glowing wood walk at midnight.",   prompt:"WEIRD NJ + PSYCHEDELIC + set: Pine Barrens midnight + 45s — Glowing Jeeb vines pulse in dark, trees breathe slowly, sky melts from purple to liquid gold, everything slightly wrong in the best way." },
  { id:"loft",    title:"North's Loft Trip",    desc:"The server room becomes a lava lamp.",         prompt:"BIG RED BARN + PSYCHEDELIC + set: Hayloft neural server lab + 45s — @prprincess138 in full 1960s hippie attire surrounded by lava lamps and glowing server racks, fractal patterns climbing barn wood walls, canaries singing through a gap." },
  { id:"luna",    title:"Luna's Inner World",   desc:"A goat's consciousness. It's a lot.",          prompt:"BIG RED BARN + PSYCHEDELIC + set: Pine Barron Farm through Luna the goat's mind + 30s — Extreme fisheye lens, psychedelic palette, every blade of grass is significant, a human hand offers a treat and it is the most important event in recorded history." },
  { id:"canary",  title:"The Waterslager Mind", desc:"What a canary hears when it sings.",           prompt:"BIG RED BARN + PSYCHEDELIC + set: Canary room at golden hour + 45s — POV inside a Waterslager canary's mind, song visualized as liquid light rippling outward, grandma's memory in the light." },
  { id:"jeebcar", title:"Jeeb Road Trip",       desc:"Route 9 at 2am. The pines are watching.",     prompt:"WEIRD NJ + PSYCHEDELIC + set: Route 9 South NJ 2am + 30s — @kennethwalker479 and @geodudenj in the Farmall cab on Route 9, pine trees have faces, every exit sign written in a language that used to be English, everything is fine." },
];

// ── ROCK LAB ─────────────────────────────────────────────────────────────────
export const GEODE_TYPES = [
  { id:"amethyst", name:"NJ Amethyst",       icon:"💜", desc:"Deep purple crystal spike cluster" },
  { id:"zeolite",  name:"Zeolite Cluster",   icon:"🤍", desc:"Radiating white needle minerals"   },
  { id:"agate",    name:"Banded Agate",      icon:"🟠", desc:"Layered orange-red mineral bands"  },
  { id:"quartz",   name:"Smoky Quartz",      icon:"🖤", desc:"Dark crystal points from NJ clay"  },
  { id:"calcite",  name:"Calcite Formation", icon:"💙", desc:"Ice-blue crystal cave formations"  },
];

export const CAVE_EPISODES = [
  { ep:"EP 01", title:"The First Crack",  prompt:"FORGE: @geodudenj at mouth of a secret NJ mineshaft at midnight. Headlamp through crystal fog. The crack of a geode split open is the HOOK. Purple inside catches light first. Full SORA 9:16." },
  { ep:"EP 02", title:"200 Feet Down",    prompt:"FORGE: @geodudenj deep in tight NJ cave passage 200 feet underground. Discovers a wall of zeolite crystals. Breath visible. Dead silence. He mouths 'there it is' to camera. Full SORA 9:16." },
  { ep:"EP 03", title:"The Mother Lode",  prompt:"FORGE: @geodudenj pulling a massive amethyst geode from NJ red clay with both hands. Purple crystals catch his headlamp. A Navy SEAL moved to silence by a rock. Full SORA 9:16." },
  { ep:"EP 04", title:"Night Hunt",       prompt:"FORGE: @geodudenj and @kennethwalker479 on a night geode hunt through NJ pine barrens with UV flashlights. Minerals fluoresce green and orange in total darkness. Their faces glow. Neither speaks. Full SORA 9:16." },
];

// ── SLOT PROMPT TEMPLATES ────────────────────────────────────────────────────
export const SLOT_TEMPLATES = [
  (a,l,r,aud,t) => `NORTH — Story Slots fired:\nStar: ${a}\nLocation: ${l}\nVehicle: ${r}\nSoundtrack: ${aud}\nPLOT TWIST: ${t}\nBuild a 45-second cinematic treatment. Lead with the twist.`,
  (a,l,r,aud,t) => `FORGE a scene:\n• Who: ${a}\n• Where: ${l}\n• How they arrived: ${r}\n• What we hear: ${aud}\n• What changes everything: ${t}\nFocus on the emotional beat after the twist lands.`,
  (a,l,r,aud,t) => `Pine Barron Farms random scenario:\n${a} at ${l} arriving by ${r}. Audio: ${aud}. Chaos factor: ${t}\nOpen on the twist already in progress. We drop in mid-scene.`,
  (a,l,r,aud,t) => `Cinematic scene — 30 seconds, vertical:\nSubject: ${a} | Place: ${l} | Transport: ${r} | Sound: ${aud} | Wild card: ${t}\nEvery second earns its place. Viral hook in the first 1.5 seconds.`,
];