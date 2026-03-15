// logs/logger.js — North Forge unified logging system
// Single source of truth for all error and diagnostic logging.
//
// NorthLog  → in-memory + console (session lifetime)
// logDiag   → localStorage, max 200 entries (persists across reloads)
// Firestore event log lives in firebase.js (logEvent) — auth-gated

// ── NORTHLOG ──────────────────────────────────────────────────────────────────
export const NorthLog = {
  _entries: [],
  info:  (msg) => { console.log(`[North ✓] ${msg}`);   NorthLog._entries.push({ t:'info',  m:msg, ts:Date.now() }); },
  warn:  (msg) => { console.warn(`[North ⚠] ${msg}`);  NorthLog._entries.push({ t:'warn',  m:msg, ts:Date.now() }); },
  error: (msg) => { console.error(`[North ✗] ${msg}`); NorthLog._entries.push({ t:'error', m:msg, ts:Date.now() }); },
  all:   ()    => NorthLog._entries,
  last:  (n=5) => NorthLog._entries.slice(-n),
};

// ── DIAGNOSTIC LOG (localStorage) ─────────────────────────────────────────────
const STORAGE_KEY = 'northforge_diagnostics';
const MAX_ENTRIES = 200;

const safeParse = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export const getDiagLogs   = () => safeParse(localStorage.getItem(STORAGE_KEY));
export const clearDiagLogs = () => localStorage.removeItem(STORAGE_KEY);

export const logDiag = (type, data = {}) => {
  const entry = { ts: new Date().toISOString(), type, data };
  const logs   = getDiagLogs();
  logs.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_ENTRIES)));
  return entry;
};

// ── GLOBAL ERROR LISTENERS ────────────────────────────────────────────────────
let listenersInstalled = false;

export const installDiagListeners = () => {
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener('error', (event) => {
    const data = {
      message:  event?.message  || 'Unknown runtime error',
      filename: event?.filename || null,
      line:     event?.lineno   || null,
      col:      event?.colno    || null,
    };
    NorthLog.error(`Runtime error: ${data.message}`);
    logDiag('runtime_error', data);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const data   = { message: reason?.message || String(reason), stack: reason?.stack || null };
    NorthLog.error(`Unhandled rejection: ${data.message}`);
    logDiag('unhandled_rejection', data);
  });

  window.addEventListener('online',  () => logDiag('network_online',  {}));
  window.addEventListener('offline', () => logDiag('network_offline', {}));
};
