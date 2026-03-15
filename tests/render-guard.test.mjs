import test from 'node:test';
import assert from 'node:assert/strict';

import { createRenderGuard } from '../public/render-guard.mjs';

test('createRenderGuard keeps only latest token current', () => {
  const guard = createRenderGuard();
  const first = guard.next();
  const second = guard.next();

  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
});
