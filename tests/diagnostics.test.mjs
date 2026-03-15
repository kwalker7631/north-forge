import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();

global.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

const listeners = {};
global.window = {
  addEventListener: (event, handler) => {
    listeners[event] = handler;
  },
};

const { logDiag, getDiagLogs, clearDiagLogs, installDiagListeners } = await import('../public/logs/logger.js');

test('logDiag persists and bounds entries', () => {
  clearDiagLogs();
  for (let i = 0; i < 205; i += 1) {
    logDiag('event', { i });
  }
  const logs = getDiagLogs();
  assert.equal(logs.length, 200);
  assert.equal(logs[0].data.i, 5);
  assert.equal(logs.at(-1).data.i, 204);
});

test('installDiagListeners logs runtime and promise events', () => {
  clearDiagLogs();
  installDiagListeners();
  assert.ok(listeners.error);
  assert.ok(listeners.unhandledrejection);
  assert.ok(listeners.online);
  assert.ok(listeners.offline);

  listeners.error({ message: 'boom', filename: 'app.js', lineno: 1, colno: 2 });
  listeners.unhandledrejection({ reason: new Error('nope') });
  listeners.online();
  listeners.offline();

  const types = getDiagLogs().map((x) => x.type);
  assert.deepEqual(types, ['runtime_error', 'unhandled_rejection', 'network_online', 'network_offline']);
});
