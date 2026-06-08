// Journey Recovery Intelligence — scoring engine
// Pure functions over a "journey" object. No I/O, no framework — so it can be
// unit-tested and later pointed at real NICE CXone interaction data unchanged.
//
// Journey shape (see data/transcripts.json):
//   {
//     id, customer, account, intent, agent, startTime,
//     turns: [ { actor, turn?, t, text, sentiment?, event? } ]
//   }
// Conventions:
//   - actor: 'bot' | 'customer' | 'human' | 'system'
//   - sentiment: customer sentiment AFTER this turn, in [-1, +1]
//   - system events: event = 'escalation_triggered' | 'human_pickup'
//   - t: seconds from journey start

export const THRESHOLDS = {
  deadZoneSeconds: 30,        // dead zone above this is flagged
  degradedSentiment: -0.3,    // at/below this the bot should have handed off (optimal point)
  reEscalationWindowDays: 7,  // a repeat within this window = resolution didn't stick
};

// ── phase boundaries ────────────────────────────────────────────────────────
function findEvent(journey, name) {
  return journey.turns.find((x) => x.actor === 'system' && x.event === name) || null;
}

export function phases(journey) {
  const esc = findEvent(journey, 'escalation_triggered');
  const pickup = findEvent(journey, 'human_pickup');
  return {
    escalationAt: esc ? esc.t : null,
    pickupAt: pickup ? pickup.t : null,
    aiTurns: journey.turns.filter((x) => x.actor === 'bot' || x.actor === 'customer'),
    humanTurns: journey.turns.filter((x) => x.actor === 'human'),
  };
}

// ── 1. Dead zone: silent gap between escalation and human pickup ─────────────
export function deadZone(journey) {
  const { escalationAt, pickupAt } = phases(journey);
  if (escalationAt == null || pickupAt == null) return null;
  const seconds = pickupAt - escalationAt;
  return {
    seconds,
    threshold: THRESHOLDS.deadZoneSeconds,
    breached: seconds > THRESHOLDS.deadZoneSeconds,
  };
}

// ── 2. Emotional recovery: sentiment delta across the seam ───────────────────
// sentimentAtHandoff = last known customer sentiment before/at escalation
// finalSentiment     = last customer sentiment on the human leg
export function emotionalRecovery(journey) {
  const { escalationAt } = phases(journey);
  const sentimentTurns = journey.turns.filter((x) => typeof x.sentiment === 'number');

  const beforeHandoff = sentimentTurns.filter(
    (x) => escalationAt == null || x.t <= escalationAt
  );
  const onHumanLeg = journey.turns.filter(
    (x) => x.actor === 'human' && typeof x.sentiment === 'number'
  );

  const atHandoff = beforeHandoff.length ? beforeHandoff[beforeHandoff.length - 1].sentiment : null;
  const final = onHumanLeg.length ? onHumanLeg[onHumanLeg.length - 1].sentiment : null;
  if (atHandoff == null || final == null) return null;

  const delta = round2(final - atHandoff);
  return {
    atHandoff,
    final,
    delta,
    label: delta >= 0.8 ? 'strong' : delta >= 0.2 ? 'partial' : 'failed',
  };
}

// ── 3. Over-containment: bot turns held past the optimal handoff point ───────
// Optimal = first AI turn at/below the degraded-sentiment threshold.
// Escalation turn = the AI turn number where escalation fired.
export function overContainment(journey) {
  const aiSentimentTurns = journey.turns
    .filter((x) => (x.actor === 'bot' || x.actor === 'customer') && typeof x.sentiment === 'number')
    .filter((x) => typeof x.turn === 'number')
    .sort((a, b) => a.turn - b.turn);
  if (!aiSentimentTurns.length) return null;

  const optimal = aiSentimentTurns.find((x) => x.sentiment <= THRESHOLDS.degradedSentiment);
  const optimalTurn = optimal ? optimal.turn : null;
  const escalationTurn = aiSentimentTurns[aiSentimentTurns.length - 1].turn;
  if (optimalTurn == null) return { optimalTurn: null, escalationTurn, extraTurns: 0 };

  return {
    optimalTurn,
    escalationTurn,
    extraTurns: Math.max(0, escalationTurn - optimalTurn),
  };
}

// ── Composite journey QM score (0–100) ───────────────────────────────────────
// Rewards strong recovery; penalises long dead zones, over-containment, re-esc.
export function journeyQmScore(journey, { reEscalated = false } = {}) {
  const rec = emotionalRecovery(journey);
  const dz = deadZone(journey);
  const oc = overContainment(journey);

  let score = 60;
  if (rec) score += rec.delta * 25;                       // ±25 for a full swing
  if (dz && dz.breached) score -= Math.min(20, (dz.seconds - dz.threshold) / 3);
  if (oc) score -= Math.min(15, oc.extraTurns * 3);
  if (reEscalated) score -= 25;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── 4. Cross-session re-escalation linkage ───────────────────────────────────
// Same customer + same intent recurring within the window = resolution didn't stick.
export function linkReEscalations(journeys, windowDays = THRESHOLDS.reEscalationWindowDays) {
  const byKey = new Map();
  for (const j of journeys) {
    const key = `${j.customer}|${j.intent}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(j);
  }

  const links = [];
  for (const group of byKey.values()) {
    const sorted = group.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      const gapDays = (new Date(cur.startTime) - new Date(prev.startTime)) / 86_400_000;
      if (gapDays <= windowDays) {
        links.push({
          customer: cur.customer,
          intent: cur.intent,
          originalSession: prev.id,
          reEscalatedSession: cur.id,
          gapDays: Math.round(gapDays),
          // If the bot loop recurred unfixed → bot failure; otherwise the human
          // close was placation rather than resolution.
          attribution: cur.attributionHint || 'Human resolution quality',
        });
      }
    }
  }
  return links;
}

// ── Top-level: score one journey end to end ───────────────────────────────────
export function scoreJourney(journey, opts = {}) {
  const rec = emotionalRecovery(journey);
  const dz = deadZone(journey);
  const oc = overContainment(journey);
  const { aiTurns, humanTurns } = phases(journey);
  return {
    id: journey.id,
    customer: journey.customer,
    intent: journey.intent,
    emotionalRecovery: rec,
    deadZone: dz,
    overContainment: oc,
    aiTurnCount: aiTurns.filter((x) => x.actor === 'bot').length,
    humanTurnCount: humanTurns.length,
    qmScore: journeyQmScore(journey, opts),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
