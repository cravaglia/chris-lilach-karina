// Journey Recovery v2 — API + static server.
import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { decorateSession, summarize } from './engine/recovery.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3100; // 3100 so it won't clash with the first app (3000)

// Load fresh each request so editing data/recovery.json is live in dev.
function loadData() {
  return JSON.parse(readFileSync(join(__dirname, 'data', 'recovery.json'), 'utf8'));
}

const app = express();
app.use(express.static(join(__dirname, 'public')));

// Single consolidated payload for the dashboard. The engine decorates sessions
// (recovery delta, recovered flag, score band) and computes the quality summary —
// so the UI stays dumb and the logic stays testable.
app.get('/api/recovery', (req, res) => {
  const d = loadData();
  d.quality.sessions = d.quality.sessions.map(decorateSession);
  d.quality.summary = summarize(d.quality.sessions);
  res.json(d);
});

app.listen(PORT, () => {
  console.log(`Journey Recovery v2 running at http://localhost:${PORT}`);
});
