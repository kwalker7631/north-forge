const STORAGE_KEY = 'northforge_diagnostics';
const MAX_ENTRIES = 200;

const safeParse = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getDiagLogs = () => safeParse(localStorage.getItem(STORAGE_KEY));

export const clearDiagLogs = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const logDiag = (type, data = {}) => {
  const entry = {
    ts: new Date().toISOString(),
    type,
    data,
  };

  const logs = getDiagLogs();
  logs.push(entry);
  const bounded = logs.slice(-MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
  return entry;
};

let listenersInstalled = false;

export const installDiagListeners = () => {
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener('error', (event) => {
    logDiag('runtime_error', {
      message: event?.message || 'Unknown runtime error',
      filename: event?.filename || null,
      line: event?.lineno || null,
      col: event?.colno || null,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    logDiag('unhandled_rejection', {
      message: reason?.message || String(reason),
      stack: reason?.stack || null,
    });
  });

  window.addEventListener('online', () => {
    logDiag('network_online', {});
  });

  window.addEventListener('offline', () => {
    logDiag('network_offline', {});
  });
};
