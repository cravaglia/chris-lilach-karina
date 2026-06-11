// Journey Recovery v2 — engine
// Pure functions over session data. The "recovery" of the HUMAN leg on rightful
// escalations: sentiment delta across the handoff, whether the customer was
// recovered, score banding, and aggregate quality. Sentiment is on NICE's 1–5
// scale (3.0 = neutral). Keep these pure so they're easy to test and extend.

export const NEUTRAL = 3.0;

// Sentiment delta from handoff → final (rounded to 1 dp).
export function recoveryDelta(session) {
  return Math.round((session.final - session.handoff) * 10) / 10;
}

// A contact is "recovered" if it ended at or above neutral sentiment.
export function isRecovered(session) {
  return session.final >= NEUTRAL;
}

// Banding for the recovery quality score (0–10) → CSS class hook.
export function scoreClass(score) {
  const n = Number(score);
  return n >= 8 ? 'hi' : n >= 5 ? 'mid' : 'lo';
}

export function mmss(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

// Decorate a session row with everything the UI needs (kept out of the data file).
export function decorateSession(s) {
  return {
    ...s,
    delta: recoveryDelta(s),
    recovered: isRecovered(s),
    scoreClass: scoreClass(s.score),
    deadZone: mmss(s.deadZoneSec),
    sentiment: `${s.handoff.toFixed(1)} → ${s.final.toFixed(1)}`,
  };
}

// Aggregate quality summary across the rightful-escalation sessions.
export function summarize(sessions) {
  const n = sessions.length || 1;
  const recovered = sessions.filter(isRecovered).length;
  const avg = (sel) => Math.round((sessions.reduce((a, s) => a + sel(s), 0) / n) * 10) / 10;
  return {
    count: sessions.length,
    recoveredCount: recovered,
    recoveryRate: Math.round((recovered / n) * 100),
    avgScore: avg((s) => Number(s.score)),
    avgDeadZoneSec: Math.round(sessions.reduce((a, s) => a + s.deadZoneSec, 0) / n),
  };
}
