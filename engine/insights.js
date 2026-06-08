// Journey Recovery Intelligence — derived insights layer.
// Builds on the raw signals in score.js to produce the spec's higher-order
// artifacts: loop detection, the whole-journey scorecard (with sub-scores),
// the auto-generated warm-transfer brief, and home-page signal aggregates.
// All pure functions — transcript in, structured insight out.

import {
  deadZone,
  emotionalRecovery,
  overContainment,
  linkReEscalations,
  THRESHOLDS,
} from './score.js';

// ── Loop / repeat detector ───────────────────────────────────────────────────
// The customer repeating themselves is one of the strongest frustration signals.
// We find the most-repeated meaningful token across customer turns.
const STOPWORDS = new Set([
  'the','a','an','is','it','to','of','and','i','you','my','me','this','that',
  'for','on','in','was','give','gave','just','need','have','had','your','please',
]);

export function loopDetector(journey) {
  const customerTurns = journey.turns.filter((x) => x.actor === 'customer' && x.text);
  const counts = new Map(); // token -> [turnNumbers]
  for (const t of customerTurns) {
    const tokens = new Set(
      t.text.toLowerCase().replace(/[^a-z0-9\- ]/g, ' ').split(/\s+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w))
    );
    for (const tok of tokens) {
      if (!counts.has(tok)) counts.set(tok, []);
      counts.get(tok).push(t.turn ?? null);
    }
  }
  let best = { token: null, repeats: 0, turns: [] };
  for (const [token, turns] of counts) {
    if (turns.length > best.repeats) best = { token, repeats: turns.length, turns };
  }
  return {
    detected: best.repeats >= 2,
    repeats: best.repeats,
    token: best.token,
    firstLoopTurn: best.turns.length >= 2 ? best.turns[1] : null,
  };
}

// ── Transfer ping-pong ────────────────────────────────────────────────────────
// More than one human pickup = the customer was bounced between agents.
export function pingPong(journey) {
  const pickups = journey.turns.filter((x) => x.actor === 'system' && x.event === 'human_pickup').length;
  return { transfers: pickups, bounced: pickups > 1 };
}

// ── Emotional temperature at handoff (categorical) ───────────────────────────
export function emotionalTemp(journey) {
  const rec = emotionalRecovery(journey);
  const s = rec ? rec.atHandoff : 0;
  if (s <= -0.5) return { label: 'Hot', tone: 'frustrated, feels unheard, near abandonment', value: s };
  if (s <= -0.2) return { label: 'Warm', tone: 'irritated, patience thinning', value: s };
  if (s < 0.2) return { label: 'Neutral', tone: 'flat, transactional', value: s };
  return { label: 'Calm', tone: 'cooperative', value: s };
}

// ── Whole-journey scorecard with sub-scores (spec Layer 2) ───────────────────
// Sub-scores: AI containment, handoff quality, human resolution, emotional outcome.
export function journeyScorecard(journey, { reEscalated = false } = {}) {
  const rec = emotionalRecovery(journey);
  const dz = deadZone(journey);
  const oc = overContainment(journey);

  // AI containment: penalised for over-containment (holding past optimal).
  const aiContainment = clamp(100 - (oc ? oc.extraTurns * 12 : 0));
  // Handoff quality: penalised for a long dead zone.
  const handoffQuality = clamp(
    100 - (dz && dz.breached ? Math.min(60, (dz.seconds - dz.threshold) * 1.2) : 0)
  );
  // Human resolution: did it stick? Re-escalation is the killer.
  const humanResolution = clamp(reEscalated ? 35 : 90);
  // Emotional outcome: the recovery delta, mapped onto 0–100.
  const emotionalOutcome = clamp(50 + (rec ? rec.delta * 45 : 0));

  const overall = Math.round(
    aiContainment * 0.2 + handoffQuality * 0.25 + humanResolution * 0.3 + emotionalOutcome * 0.25
  );
  return { overall, aiContainment, handoffQuality, humanResolution, emotionalOutcome };
}

// ── Warm-transfer brief generator (spec Layer 4, "reuse") ────────────────────
// Auto-assembled from the transcript: what the customer wants, what the bot
// tried, where it broke, the emotional temperature, and a suggested opening.
export function buildWarmBrief(journey) {
  const loop = loopDetector(journey);
  const oc = overContainment(journey);
  const temp = emotionalTemp(journey);
  const botTurns = journey.turns.filter((x) => x.actor === 'bot');
  const firstCustomer = journey.turns.find((x) => x.actor === 'customer');
  const firstHuman = journey.turns.find((x) => x.actor === 'human');

  return {
    wants: journey.issueLabel
      ? `${journey.issueLabel}${journey.issueSub ? ` — ${journey.issueSub}` : ''}`
      : (firstCustomer ? firstCustomer.text : 'Unknown'),
    botTried: `${botTurns.length} bot turns${loop.detected ? `, then looped re-asking "${loop.token}"` : ''}.`,
    brokeAt: loop.firstLoopTurn
      ? `Turn ${loop.firstLoopTurn} — customer repeated the request ${loop.repeats}×.`
      : (oc ? `Bot held ${oc.extraTurns} turns past the optimal handoff (turn ${oc.optimalTurn}).` : '—'),
    emotionalTemp: `${temp.label} — ${temp.tone}.`,
    carriedOver: 'Account #, captured entities, and full history travel with the transfer — no re-asking.',
    suggestedOpening: firstHuman ? firstHuman.text : null,
  };
}

// ── Home-page signal aggregates (spec Layer 5, "reuse") ──────────────────────
export function homeSignals(journeys) {
  const scored = journeys.map((j) => ({
    j,
    dz: deadZone(j),
    rec: emotionalRecovery(j),
    oc: overContainment(j),
  }));

  const deadZones = scored.filter((s) => s.dz && s.dz.breached);
  const recoveries = scored.filter((s) => s.rec).map((s) => s.rec.delta);
  const failedRecoveries = scored.filter((s) => s.rec && s.rec.label === 'failed');
  const overContained = scored.filter((s) => s.oc && s.oc.extraTurns >= 3);

  return {
    deadZoneCount: deadZones.length,
    failedRecoveryRate: scored.length
      ? Math.round((failedRecoveries.length / scored.length) * 1000) / 10
      : 0,
    overContainedCount: overContained.length,
    avgEmotionalRecovery: recoveries.length
      ? Math.round((recoveries.reduce((a, b) => a + b, 0) / recoveries.length) * 100) / 100
      : 0,
    reEscalations: linkReEscalations(journeys).length,
  };
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
