// functions/index.js — North Forge Anthropic proxy
// Runs server-side to avoid CORS restrictions on the Anthropic API.

const functions = require('firebase-functions');

const ALLOWED_ORIGINS = [
  'https://north-forge-ai.firebaseapp.com',
  'https://north-forge-ai.web.app',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

exports.northProxy = functions.https.onRequest(async (req, res) => {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')   { res.status(405).send('Method Not Allowed'); return; }

  // ── VALIDATE ──────────────────────────────────────────────────────────────
  const { messages, systemPrompt, apiKey } = req.body || {};
  if (!apiKey || !messages?.length) {
    res.status(400).json({ error: 'missing_params' });
    return;
  }

  // ── PROXY TO ANTHROPIC ────────────────────────────────────────────────────
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1500,
        system:     systemPrompt || '',
        messages,
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
