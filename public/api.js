// api.js — All AI calls, weather, and logging for North Forge
// Anthropic Claude is PRIMARY. Gemini is the fallback.

import { NORTH_SYSTEM } from './north.js';

// ── WEATHER SYSTEM INJECTION ───────────────────────────────────────────────────
const buildSystem = (weather) => {
  if (!weather) return NORTH_SYSTEM;
  return `${NORTH_SYSTEM}\n\nCURRENT FARM CONDITIONS: ${weather.temp}, ${weather.condition}, wind ${weather.wind} — weave this real sky into scene descriptions when it fits.`;
};

// ── NORTHLOG ──────────────────────────────────────────────────────────────────
export const NorthLog = {
  _entries: [],
  info:  (msg) => { console.log(`[North ✓] ${msg}`);  NorthLog._entries.push({ t:'info',  m:msg, ts:Date.now() }); },
  warn:  (msg) => { console.warn(`[North ⚠] ${msg}`); NorthLog._entries.push({ t:'warn',  m:msg, ts:Date.now() }); },
  error: (msg) => { console.error(`[North ✗] ${msg}`);NorthLog._entries.push({ t:'error', m:msg, ts:Date.now() }); },
  all:   ()    => NorthLog._entries,
  last:  (n=5) => NorthLog._entries.slice(-n),
};

// ── SANITIZE MESSAGES ─────────────────────────────────────────────────────────
// Anthropic requires messages to start with role:'user'.
// The welcome message in state.msgs is role:'assistant' — strip leading assistant
// messages before every API call or Anthropic returns a 400 error.
const sanitizeMessages = (messages) => {
  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  // Drop messages from the front until we start with a user turn
  let start = 0;
  while (start < filtered.length && filtered[start].role !== 'user') start++;
  return filtered.slice(start);
};

// ── ANTHROPIC (PRIMARY) ───────────────────────────────────────────────────────
const callAnthropic = async (messages, apiKey, system) => {
  if (!apiKey) return null;
  NorthLog.info('Calling Anthropic Claude...');

  const clean = sanitizeMessages(messages);
  if (!clean.length) {
    NorthLog.warn('No valid messages to send to Anthropic');
    return null;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':                      'application/json',
        'x-api-key':                         apiKey,
        'anthropic-version':                 '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     system,
        messages:   clean.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.content?.[0]?.text ?? null;
      if (text) { NorthLog.info('Anthropic responded OK'); return text; }
      NorthLog.warn('Anthropic returned empty content');
      return null;
    }

    const err = await res.text();
    NorthLog.warn(`Anthropic error ${res.status}: ${err.slice(0, 200)}`);
    return null;

  } catch (e) {
    NorthLog.warn(`Anthropic network error: ${e.message}`);
    return null;
  }
};

// ── GEMINI (FALLBACK) ─────────────────────────────────────────────────────────
const callGemini = async (messages, apiKey, system) => {
  if (!apiKey) return null;
  NorthLog.info('Falling back to Gemini...');

  const clean = sanitizeMessages(messages);
  if (!clean.length) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Gemini requires strictly alternating user/model turns
  const formatted = [];
  for (const m of clean) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += '\n\n' + m.content;
    } else {
      formatted.push({ role, parts: [{ text: m.content }] });
    }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents:          formatted,
        systemInstruction: { parts: [{ text: system }] },
        generationConfig:  { temperature: 0.85, topK: 64, topP: 0.95 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (text) { NorthLog.info('Gemini responded OK'); return text; }
      NorthLog.warn('Gemini returned empty content');
      return null;
    }

    const err = await res.text();
    NorthLog.warn(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
    return null;

  } catch (e) {
    NorthLog.warn(`Gemini network error: ${e.message}`);
    return null;
  }
};

// ── CALL NORTH (main entry point) ─────────────────────────────────────────────
export const callNorth = async (messages, keys = {}, weather = null) => {
  const system = buildSystem(weather);
  const { anthropic, gemini } = keys;

  const primary = await callAnthropic(messages, anthropic, system);
  if (primary) return { ok: true, text: primary, provider: 'anthropic' };

  const fallback = await callGemini(messages, gemini, system);
  if (fallback) return { ok: true, text: fallback, provider: 'gemini' };

  const lastWarn = NorthLog.last(3).filter(e => e.t === 'warn').pop();
  const hint     = lastWarn ? `\n\nLast error: ${lastWarn.m}` : '';
  NorthLog.error('All providers failed — check API key and network');
  return {
    ok:       false,
    text:     `North lost the signal. Check your API key in Setup and try again. 🏚️${hint}`,
    provider: 'none',
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
