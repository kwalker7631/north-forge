import test from 'node:test';
import assert from 'node:assert/strict';

const chatModulePath = new URL('../public/rooms/chat.js', import.meta.url);

global.window = {
  goTo: () => {},
  showToast: () => {},
  send: async () => {}
};

global.document = {
  _ideaValue: '',
  getElementById(id) {
    if (id === 'pe-idea') return { value: this._ideaValue };
    return null;
  },
  querySelectorAll() {
    return [];
  }
};

global.navigator = {
  clipboard: {
    async writeText() {}
  }
};

const chat = await import(chatModulePath);

test('peSet preserves typed idea text across rerenders', () => {
  document._ideaValue = 'Luna and Salem run through fog.';
  window.peSet('tone', 'gritty');

  const html = chat.render({ msgs: [], loading: false, keys: { anthropic: '', gemini: '' } });
  assert.match(html, /Luna and Salem run through fog\./);
});

test('copyFull uses assistant-rendered message index order', async () => {
  const copied = [];
  document.querySelectorAll = () => [
    { textContent: 'Assistant row one' },
    { textContent: 'Assistant row two' }
  ];
  navigator.clipboard.writeText = async (txt) => {
    copied.push(txt);
  };

  window.copyFull(1);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(copied, ['Assistant row two']);
});
