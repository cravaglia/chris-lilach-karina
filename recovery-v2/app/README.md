# Journey Recovery — v2 (modular app)

The buildable, data-driven version of the v2 prototype, skinned to look like a page inside NICE
**Agentic Analytics**. The single-file shareable demo lives at `../journey-recovery-v2/indexrecovery.html`;
this is the one to **build on**.

## Run it
```bash
npm install      # first time
npm start        # → http://localhost:3100
npm test         # engine unit tests (5)
```

## What it shows (the four-move story)
1. **Classify** — rightful vs avoidable escalations (Overview → Escalation Quality)
2. **Score the human's recovery** on the hard ones (Recovery Quality → radar, by-type, sessions)
3. **The gap** — open a failed session (Alex Chen, medical-equipment exception): the agent's Assist
   panel has **no best-practice play** — that's why recovery broke
4. **Close the loop** — Recovery Playbook flags the standout step as **★ MISSING FROM TIPS**;
   "＋ Add to tips → Publish" pushes it into Agent Assist; re-open the journey and the play is there

Use the **🎬 Demo Script** toggle (top bar) — ◀ Prev / Next ▶ walks the whole flow, including
opening/closing the Transcript Viewer.

## Layout
```
data/recovery.json    all demo content (edit this — UI is data-driven)
engine/recovery.js    pure functions: recovery delta, isRecovered, scoreClass, summarize
server.js             Express: serves public/ + GET /api/recovery (engine-decorated)
public/index.html     scaffolding (chrome + empty containers)
public/styles.css     all styles
public/app.js         fetches /api/recovery, renders, charts (inline SVG), modal, publish, demo script
test/recovery.test.js engine unit tests
```

## Notes
- Charts are **inline SVG** — no external library, works offline / on `file://` (the original demo's
  Chart.js CDN was blocked on the work network).
- Port is **3100** so it won't clash with the original Journey Recovery app (3000).
- The "publish to Agent Assist" labels (Copilot · Real-Time Interaction Guidance) are a plausible
  mechanism for the demo — pending the product-path verification (see
  `../journey-recovery/docs/task2-nice-gap-confirmation.md`).
