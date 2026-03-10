// api.js — All AI calls, weather, and logging for North Forge
// Anthropic Claude is PRIMARY. Gemini is the fallback.
// Add new API integrations here. Nothing else needs to change.

import { NORTH_SYSTEM } from './north.js';

// ── NORTHLOG ─────────────────────────────────────────────────────────────────
export const NorthLog = {
  _entries: [],
  info:  (msg) => { console.log(`[North ✓] ${msg}`);  NorthLog._entries.push({ t:"info",  m:msg, ts:Date.now() }); },
  warn:  (msg) => { console.warn(`[North ⚠] ${msg}`); NorthLog._entries.push({ t:"warn",  m:msg, ts:Date.now() }); },
  error: (msg) => { console.error(`[North ✗] ${msg}`);NorthLog._entries.push({ t:"error", m:msg, ts:Date.now() }); },
  all:   ()    => NorthLog._entries,
  last:  (n=5) => NorthLog._entries.slice(-n),
};

// ── ANTHROPIC (PRIMARY) ───────────────────────────────────────────────────────
const callAnthropic = async (messages, apiKey) => {
  if (!apiKey) return null;
  NorthLog.info('Calling Anthropic Claude...');
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1500,
        system:     NORTH_SYSTEM,
        messages:   messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.content?.[0]?.text ?? null;
      if (text) { NorthLog.info('Anthropic responded OK'); return text; }
    }
    const err = await res.text();
    NorthLog.warn(`Anthropic error ${res.status}: ${err.slice(0,120)}`);
  } catch (e) {
    NorthLog.warn(`Anthropic network error: ${e.message}`);
  }
  return null;
};

// ── GEMINI (FALLBACK) ─────────────────────────────────────────────────────────
const callGemini = async (messages, apiKey) => {
  if (!apiKey) return null;
  NorthLog.info('Falling back to Gemini...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Gemini requires alternating user/model turns — normalize here
  const formatted = [];
  for (const m of messages) {
    const role = (m.role === 'assistant') ? 'model' : 'user';
    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += '\n\n' + m.content;
    } else {
      formatted.push({ role, parts: [{ text: m.content }] });
    }
  }
  // Gemini needs user turn first
  if (formatted.length > 0 && formatted[0].role === 'model') {
    formatted.unshift({ role: 'user', parts: [{ text: 'System initialized.' }] });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formatted,
        systemInstruction: { parts: [{ text: NORTH_SYSTEM }] },
        generationConfig:  { temperature: 0.85, topK: 64, topP: 0.95 },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (text) { NorthLog.info('Gemini responded OK'); return text; }
    }
    const err = await res.text();
    NorthLog.warn(`Gemini error ${res.status}: ${err.slice(0,120)}`);
  } catch (e) {
    NorthLog.warn(`Gemini network error: ${e.message}`);
  }
  return null;
};

// ── CALL NORTH (main entry point) ─────────────────────────────────────────────
// Always call this. Never call callAnthropic or callGemini directly.
export const callNorth = async (messages, keys = {}) => {
  const { anthropic, gemini } = keys;

  // Try Anthropic first
  const primaryReply = await callAnthropic(messages, anthropic);
  if (primaryReply) return { ok: true, text: primaryReply, provider: 'anthropic' };

  // Fall back to Gemini
  const fallbackReply = await callGemini(messages, gemini);
  if (fallbackReply) return { ok: true, text: fallbackReply, provider: 'gemini' };

  // Both failed
  NorthLog.error('All providers failed');
  return {
    ok:   false,
    text: "Hmm — North lost the signal up in the loft. Check your API key in Setup and try again. The door's still open. 🏚️",
    provider: 'none',
  };
};

// ── WEATHER ───────────────────────────────────────────────────────────────────
export const fetchWeather = async (location = 'Piscataway') => {
  try {
    // Step 1 — resolve location to lat/lng
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (!place) return null;

    // Step 2 — fetch current weather
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true&temperature_unit=fahrenheit`
    );
    const wxData = await wxRes.json();
    const wx = wxData.current_weather;
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