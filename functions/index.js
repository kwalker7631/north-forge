// functions/index.js — North Forge Anthropic proxy + scheduled functions
// Runs server-side to avoid CORS restrictions on the Anthropic API.

const { onRequest }  = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin          = require('firebase-admin');
admin.initializeApp();

const ALLOWED_ORIGINS = [
  'https://north-forge-ai.firebaseapp.com',
  'https://north-forge-ai.web.app',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

exports.northProxy = onRequest(async (req, res) => {
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

// ── WEEKLY BRIEF ──────────────────────────────────────────────────────────────
// Runs every Monday at 8:00 AM ET.
// Reads each user's last 10 prompts, asks North for a one-line weekly summary,
// and stores it in users/{uid}/weekly/{weekKey}.
function getWeekKey(date) {
  const d = new Date(date); d.setUTCHours(0,0,0,0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yr = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const wk = Math.ceil((((d - yr) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(wk).padStart(2,'0')}`;
}

exports.weeklyBrief = onSchedule(
  { schedule: 'every monday 08:00', timeZone: 'America/New_York' },
  async () => {
    const db      = admin.firestore();
    const apiKey  = process.env.ANTHROPIC_KEY;
    if (!apiKey) { console.error('weeklyBrief: ANTHROPIC_KEY env var not set'); return; }

    const weekKey = getWeekKey(new Date());

    // Get all user documents
    const usersSnap = await db.collection('users').listDocuments();

    for (const userRef of usersSnap) {
      try {
        const uid = userRef.id;
        // Load last 10 forged prompts for this user
        const promptsSnap = await db
          .collection('users').doc(uid)
          .collection('prompts')
          .orderBy('savedAt', 'desc')
          .limit(10)
          .get();

        if (promptsSnap.empty) continue;

        const ideas = promptsSnap.docs
          .map(d => d.data().idea || d.data().clean?.slice(0,60) || '')
          .filter(Boolean)
          .join('\n- ');

        // Ask North for a one-liner weekly summary
        const upstream = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type':      'application/json',
            'x-api-key':         apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model:      'claude-sonnet-4-6',
            max_tokens: 80,
            system:     'You are North, the AI director at Pine Barron Farms. Write one short, punchy sentence (max 12 words) summarizing this week\'s creative output. No quotes, no labels — just the sentence.',
            messages:   [{ role:'user', content:`This week's forged scenes:\n- ${ideas}\n\nGive me one line.` }],
          }),
        });

        const data = await upstream.json();
        const summary = data?.content?.[0]?.text?.trim();
        if (!summary) continue;

        await db
          .collection('users').doc(uid)
          .collection('weekly').doc(weekKey)
          .set({ summary, weekKey, savedAt: new Date().toISOString() });

        console.log(`weeklyBrief: wrote ${weekKey} for ${uid}`);
      } catch (e) {
        console.error(`weeklyBrief: failed for ${userRef.id}: ${e.message}`);
      }
    }
  });
