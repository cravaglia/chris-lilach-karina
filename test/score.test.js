import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  deadZone,
  emotionalRecovery,
  overContainment,
  linkReEscalations,
  scoreJourney,
} from '../engine/score.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { journeys } = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'transcripts.json'), 'utf8')
);
const byId = (id) => journeys.find((j) => j.id === id);

test('JRN-00847 dead zone is 45s and breaches the 30s threshold', () => {
  const dz = deadZone(byId('JRN-00847'));
  assert.equal(dz.seconds, 45);
  assert.equal(dz.breached, true);
});

test('JRN-00847 emotional recovery is +1.17 (−0.75 → +0.42)', () => {
  const rec = emotionalRecovery(byId('JRN-00847'));
  assert.equal(rec.atHandoff, -0.75);
  assert.equal(rec.final, 0.42);
  assert.equal(rec.delta, 1.17);
  assert.equal(rec.label, 'strong');
});

test('JRN-00847 over-containment is +4 turns (optimal turn 3, escalated turn 7)', () => {
  const oc = overContainment(byId('JRN-00847'));
  assert.equal(oc.optimalTurn, 3);
  assert.equal(oc.escalationTurn, 7);
  assert.equal(oc.extraTurns, 4);
});

test('JRN-00851 is a partial recovery that did not fully recover', () => {
  const rec = emotionalRecovery(byId('JRN-00851'));
  assert.equal(rec.label, 'partial');
  assert.ok(rec.delta > 0 && rec.delta < 0.8);
});

test('re-escalation linkage catches Okonkwo MFA repeat within 7 days', () => {
  const links = linkReEscalations(journeys);
  const mfa = links.find((l) => l.reEscalatedSession === 'JRN-00851');
  assert.ok(mfa, 'expected JRN-00851 to be linked as a re-escalation');
  assert.equal(mfa.originalSession, 'JRN-00843');
  assert.equal(mfa.gapDays, 1);
  assert.equal(mfa.attribution, 'Bot failure (same intent)');
});

test('re-escalation linkage catches Patel cancel repeat (3-day gap)', () => {
  const links = linkReEscalations(journeys);
  const cancel = links.find((l) => l.reEscalatedSession === 'JRN-00853');
  assert.ok(cancel);
  assert.equal(cancel.originalSession, 'JRN-00831');
  assert.equal(cancel.gapDays, 3);
  assert.equal(cancel.attribution, 'Human resolution quality');
});

test('scoreJourney returns a 0–100 QM score, higher for strong recovery', () => {
  const good = scoreJourney(byId('JRN-00847'));
  const bad = scoreJourney(byId('JRN-00853'), { reEscalated: true });
  assert.ok(good.qmScore >= 0 && good.qmScore <= 100);
  assert.ok(good.qmScore > bad.qmScore, 'strong recovery should outscore a re-escalated placation');
});
