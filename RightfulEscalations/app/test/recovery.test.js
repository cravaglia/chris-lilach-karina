import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recoveryDelta, isRecovered, scoreClass, mmss, summarize } from '../engine/recovery.js';

const A = { handoff: 2.1, final: 4.5, deadZoneSec: 48, score: 9.1 }; // strong recovery, held
const B = { handoff: 2.0, final: 1.9, deadZoneSec: 94, score: 3.4 }; // failed recovery

test('recoveryDelta is final − handoff (1 dp)', () => {
  assert.equal(recoveryDelta(A), 2.4);
  assert.equal(recoveryDelta(B), -0.1);
});

test('isRecovered when final sentiment reaches neutral (3.0)', () => {
  assert.equal(isRecovered(A), true);
  assert.equal(isRecovered(B), false);
});

test('scoreClass bands the 0–10 quality score', () => {
  assert.equal(scoreClass(9.1), 'hi');
  assert.equal(scoreClass(5.6), 'mid');
  assert.equal(scoreClass(3.4), 'lo');
});

test('mmss formats dead-zone seconds', () => {
  assert.equal(mmss(48), '0:48');
  assert.equal(mmss(94), '1:34');
});

test('summarize aggregates recovery rate, avg score, avg dead zone', () => {
  const s = summarize([A, B]);
  assert.equal(s.count, 2);
  assert.equal(s.recoveredCount, 1);
  assert.equal(s.recoveryRate, 50);
  assert.equal(s.avgScore, 6.3);  // (9.1 + 3.4) / 2 = 6.25 → 6.3
  assert.equal(s.avgDeadZoneSec, 71); // (48 + 94) / 2 = 71
});
