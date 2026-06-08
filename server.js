// Journey Recovery Intelligence — API + static dashboard server.
import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scoreJourney, emotionalRecovery, deadZone, overContainment, linkReEscalations } from './engine/score.js';
import { buildWarmBrief, journeyScorecard, homeSignals, loopDetector, pingPong, emotionalTemp } from './engine/insights.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Load transcripts fresh each request so editing data/transcripts.json is live in dev.
function loadJourneys() {
  return JSON.parse(readFileSync(join(__dirname, 'data', 'transcripts.json'), 'utf8')).journeys;
}

// Which journeys re-escalated (used to dock the QM score).
function reEscalatedIds(journeys) {
  return new Set(linkReEscalations(journeys).map((l) => l.reEscalatedSession));
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Home signal cards
app.get('/api/signals', (req, res) => {
  res.json(homeSignals(loadJourneys()));
});

// Flagged journey list (summary rows for the table)
app.get('/api/journeys', (req, res) => {
  const journeys = loadJourneys();
  const reEsc = reEscalatedIds(journeys);
  const rows = journeys.map((j) => {
    const rec = emotionalRecovery(j);
    const dz = deadZone(j);
    const temp = emotionalTemp(j);
    return {
      id: j.id,
      customer: j.customer,
      account: j.account,
      issueLabel: j.issueLabel,
      issueSub: j.issueSub,
      agent: j.agent,
      handoffTemp: temp.label,
      deadZoneSeconds: dz ? dz.seconds : null,
      recovery: rec ? { delta: rec.delta, label: rec.label } : null,
      resolution: j.resolution,
      reEscalated: reEsc.has(j.id),
    };
  });
  res.json(rows);
});

// Re-escalation linkage feed
app.get('/api/reescalations', (req, res) => {
  res.json(linkReEscalations(loadJourneys()));
});

// Full journey detail: scores, scorecard, warm brief, timeline events
app.get('/api/journeys/:id', (req, res) => {
  const journeys = loadJourneys();
  const j = journeys.find((x) => x.id === req.params.id);
  if (!j) return res.status(404).json({ error: 'journey not found' });

  const reEsc = reEscalatedIds(journeys).has(j.id);
  res.json({
    ...j,
    scores: scoreJourney(j, { reEscalated: reEsc }),
    scorecard: journeyScorecard(j, { reEscalated: reEsc }),
    warmBrief: buildWarmBrief(j),
    loop: loopDetector(j),
    pingPong: pingPong(j),
    emotionalTemp: emotionalTemp(j),
    reEscalated: reEsc,
  });
});

// Supervisor action feed: signals → recommended action → owner
app.get('/api/supervisor-actions', (req, res) => {
  const journeys = loadJourneys();
  const sig = homeSignals(journeys);
  res.json([
    { signal: 'Refund intent loops before escalation', detail: '28% of refund chats · repeated order-number ask', impact: '~$31K/yr', action: 'Add refund-policy answer to the bot knowledge base', owner: 'Bot team', type: 'ticket' },
    { signal: 'Billing transfers wait 60s+ in dead zone', detail: `${sig.deadZoneCount} contacts flagged · 5% drop mid-transfer`, impact: '~$18K/yr', action: 'Re-balance routing & staffing on the billing queue', owner: 'WFM', type: 'ticket' },
    { signal: 'MFA intent — over-contained 6+ turns', detail: '8 contacts this week · same bot failure', impact: 'Systemic', action: 'Lower handoff threshold for MFA intent to turn 3', owner: 'Bot team', type: 'ticket' },
    { signal: 'Team B — weakest emotional recovery', detail: `Avg +0.28 vs. +${sig.avgEmotionalRecovery} platform avg`, impact: 'CSAT risk', action: 'Coach de-escalation; rebalance hot transfers to Team A', owner: 'Team lead', type: 'coaching' },
    { signal: 'Subscription cancel re-escalates in 3 days', detail: '4 of last 5 closes did not hold', impact: '~$9 × N', action: 'Coach resolution quality + update KB article', owner: 'Team lead', type: 'coaching' },
  ]);
});

app.listen(PORT, () => {
  console.log(`Journey Recovery Intelligence running at http://localhost:${PORT}`);
});
