// api.js — North Forge AI calls, weather, logging
// PRIMARY:  Anthropic Claude (claude-sonnet-4-6)
// FALLBACK: Google Gemini (gemini-2.0-flash)

import { NORTH_SYSTEM } from './north.js';
import { NorthLog }     from './logs/logger.js';
export { NorthLog };    // re-export so existing imports from api.js still work

// ── SANITIZE MESSAGES ─────────────────────────────────────────────────────────
// Strip leading assistant messages — API requires user message first
const sanitizeMessages = (messages) => {
  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  let start = 0;
  while (start < filtered.length && filtered[start].role !== 'user') start++;
  return filtered.slice(start);
};

// ── ANTHROPIC via server proxy (avoids browser CORS) ─────────────────────────
const callAnthropic = async (messages, apiKey, systemPrompt) => {
  if (!apiKey) return { error: 'no_anthropic_key' };
  NorthLog.info('Calling Anthropic...');

  const clean = sanitizeMessages(messages);
  if (!clean.length) { NorthLog.warn('No valid messages'); return { error: 'no_valid_messages' }; }

  try {
    const res = await fetch('/api/north', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        systemPrompt,
        messages: clean.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.content?.[0]?.text ?? null;
      if (text) { NorthLog.info('Anthropic responded OK'); return { text, provider: 'anthropic' }; }
      NorthLog.warn('Anthropic returned empty content');
      return { error: 'empty_response' };
    }

    const err = await res.text();
    NorthLog.warn(`Anthropic proxy error ${res.status}: ${err.slice(0, 200)}`);
    return { error: `anthropic_${res.status}` };

  } catch (e) {
    NorthLog.warn(`Anthropic proxy error: ${e.message}`);
    return { error: `network: ${e.message}` };
  }
};

// ── GEMINI (FALLBACK) ─────────────────────────────────────────────────────────
const callGemini = async (messages, apiKey, systemPrompt) => {
  if (!apiKey) return { error: 'no_gemini_key' };
  NorthLog.info('Calling Gemini fallback...');

  const clean = sanitizeMessages(messages);
  if (!clean.length) return { error: 'no_valid_messages' };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: clean.map(m => ({
            role:  m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (text) { NorthLog.info('Gemini responded OK'); return { text, provider: 'gemini' }; }
      NorthLog.warn('Gemini returned empty content');
      return { error: 'empty_response' };
    }

    const err = await res.text();
    NorthLog.warn(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
    return { error: `gemini_${res.status}` };

  } catch (e) {
    NorthLog.warn(`Gemini network error: ${e.message}`);
    return { error: `network: ${e.message}` };
  }
};

// ── CAST + PROPS CONTEXT (injected into every North call) ─────────────────────
const CAST_PROPS_CONTEXT = `

CAST PROPS REFERENCE — always pull from this when building scenes:
- Ken Walker (@kennethwalker479): tool belt, camera rig, NJ Nets cap, Old Ford truck, helicopter
- Marguerite (@prprincess138): apron, cast iron skillet, garden gloves, mason jars, rocking chair
- Randy "Sarge" (@geodudenj): camo helmet, headlamp, rock hammer, tactical vest, geode bag, racing goggles
- Salem (@kennethwa.majorbilli): pearl necklace, black notebook, camera, tarot deck
- Skully (@kennethwa.shadowblaz): black hoodie, night vision monocle, laptop, walkie talkie
- Tank (@kennethwa.bronzedogg): bandana, work gloves, wheelbarrow, feed bucket [FARM DOG]
- BigTheSqua (@kennethwa.bigthesqua): field journal, binoculars, trail camera, thermos
- Grand Ma Eleanor (@grandma.eleanor): wheelchair, red blouse, glasses, sweet tea, farm photo albums
- Luna (@kennethwa.luna): gold bell collar, LUNA name sign, tiny horns [PYGMY GOAT — always scheming]
Farm vehicles: helicopter (Ken's), red Farmall tractor, Go-Kart, Old Ford truck.
When a character appears in a scene, ground them with at least one of their props.`;

// ── CALL NORTH (main entry point) ─────────────────────────────────────────────
export const callNorth = async (messages, keys = {}, weather = null, profile = null) => {
  // Inject live weather context into system prompt
  const wxContext = weather
    ? `\n\nCURRENT CONDITIONS AT PINE BARRON FARMS: ${weather.temp}, ${weather.condition}, wind ${weather.wind}.`
    : '';

  // Inject user character profile so North can reference the session user in scenes
  const profileContext = profile?.profileComplete
    ? `\n\nAPP USER PROFILE — The person using this session: ${profile.age || ''}, ${profile.build || ''} build, ` +
      `${profile.hair || ''} hair, ${profile.eyes || ''} eyes, ${profile.style || ''} style. ` +
      `Their Sora IDs: ${(profile.soraIds || []).filter(Boolean).join(', ') || 'none set'}. ` +
      `Preferred video duration: ${profile.preferredDuration || '15s'}. ` +
      `When they want to appear in scenes, use their Sora IDs and match their appearance.`
    : '';

  const systemPrompt = NORTH_SYSTEM + CAST_PROPS_CONTEXT + wxContext + profileContext;

  const reply = await callAnthropic(messages, keys.anthropic, systemPrompt);
  if (reply.text) return { ok: true, ...reply };

  const fallback = await callGemini(messages, keys.gemini, systemPrompt);
  if (fallback.text) return { ok: true, ...fallback };

  const lastError = reply.error || fallback.error || 'unknown';
  NorthLog.error(`All providers failed — ${lastError}`);
  return {
    ok:       false,
    text:     `North lost the signal. Error: ${lastError}. Check your API key in Setup and try again. 🏚️`,
    provider: 'none',
    reason:   lastError,
  };
};

// ── WEATHER ───────────────────────────────────────────────────────────────────
export const fetchWeather = async (location = 'Piscataway') => {
  try {
    const geoRes  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geoData = await geoRes.json();
    const place   = geoData.results?.[0];
    if (!place) return null;

    const wxRes  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true&temperature_unit=fahrenheit`);
    const wxData = await wxRes.json();
    const wx     = wxData.current_weather;
    if (!wx) return null;

    const conditions = {
      0:'Clear', 1:'Mostly Clear', 2:'Partly Cloudy', 3:'Overcast',
      51:'Drizzle', 61:'Rain', 71:'Snow', 80:'Rain Showers', 95:'Thunderstorm',
    };

    return {
      temp:      `${Math.round(wx.temperature)}°F`,
      condition: conditions[wx.weathercode] ?? 'Mixed',
      wind:      `${Math.round(wx.windspeed)} mph`,
      location:  place.name,
    };
  } catch (e) {
    NorthLog.warn(`Weather fetch failed: ${e.message}`);
    return null;
  }
};

// ── 7-DAY FORECAST ────────────────────────────────────────────────────────────
export const fetchForecast = async (location = 'Piscataway') => {
  try {
    const geoRes  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geoData = await geoRes.json();
    const place   = geoData.results?.[0];
    if (!place) return [];
    const wxRes  = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit` +
      `&timezone=America%2FNew_York&forecast_days=7`
    );
    const wxData = await wxRes.json();
    const daily  = wxData.daily;
    if (!daily?.time) return [];
    const conditions = { 0:'Clear',1:'Mostly Clear',2:'Partly Cloudy',3:'Overcast',51:'Drizzle',61:'Rain',71:'Snow',80:'Showers',95:'Storm' };
    const icons      = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',51:'🌦️',61:'🌧️',71:'❄️',80:'🌧️',95:'⛈️' };
    return daily.time.map((date, i) => ({
      date,
      condition: conditions[daily.weathercode[i]] ?? 'Mixed',
      icon:      icons[daily.weathercode[i]] ?? '🌤️',
      high:      Math.round(daily.temperature_2m_max[i]),
      low:       Math.round(daily.temperature_2m_min[i]),
    }));
  } catch (e) {
    NorthLog.warn(`Forecast fetch failed: ${e.message}`);
    return [];
  }
};

// ── MOON PHASE ────────────────────────────────────────────────────────────────
export const getMoonPhase = (d = new Date()) => {
  const days = (((d.getTime() - new Date('1970-01-07T20:35:00Z').getTime()) / 1000) % 2551443) / 86400;
  if (days < 1.84)  return { name:'New Moon',        icon:'🌑' };
  if (days < 5.53)  return { name:'Waxing Crescent', icon:'🌒' };
  if (days < 9.22)  return { name:'First Quarter',   icon:'🌓' };
  if (days < 12.91) return { name:'Waxing Gibbous',  icon:'🌔' };
  if (days < 16.61) return { name:'Full Moon',        icon:'🌕' };
  if (days < 20.30) return { name:'Waning Gibbous',  icon:'🌖' };
  if (days < 23.99) return { name:'Last Quarter',    icon:'🌗' };
  return { name:'Waning Crescent', icon:'🌘' };
};
