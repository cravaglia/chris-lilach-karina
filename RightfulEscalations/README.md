# Rightful Escalations — agent-recovery (latest version)

This is the **current** version of the concept (the one to collaborate on). It measures the customer's
**recovery across the AI→human seam** on *rightful* escalations — the contacts a bot shouldn't handle —
then closes the loop by publishing best-practice guidance into Agent Assist. All data is **synthetic**
(the "Voyager" airline).

Two parts:

## `app/` — the buildable modular app (collaborate here)
Data-driven Express app, skinned to look like a page inside NICE Agentic Analytics.
```bash
cd RightfulEscalations/app
npm install      # first time
npm start        # → http://localhost:3100
npm test         # engine unit tests (5)
```
- `data/recovery.json` — all demo content (edit this; the UI is data-driven)
- `engine/recovery.js` — pure scoring functions (+ tests in `test/`)
- `server.js` — API + serves `public/`
- `public/` — `index.html` · `styles.css` · `app.js` (charts are inline SVG, no CDN)

## `demo/` — the shareable single-file demo
`indexrecovery.html` — open in any browser (no install, works offline). Best for sending to people or
quick walkthroughs. Use the **🎬 Demo Script** toggle (▶ Next) to walk the full story.

## The flow it tells
Recovery Quality (diagnose: which escalations/journeys are breaking) → **Recovery Playbook** (fix
workspace: who recovers best → what they say → AI-suggested **tokenized** guidance → preview on real
cases → publish) → the published, human-polished guidance appears in the agent's Assist panel.

> Publish path is modeled on NICE's real surface: a **Copilot for Agents** suggested response authored
> in the **GenAI Prompt Editor** (Draft → Test → Publish). The runtime contact-data tokens + the
> historical backtest are the net-new bits. (See the research docs kept separately.)

## Everyday git rhythm
`git pull` before you start · `git add` / `git commit -m "…"` / `git push` to share. Golden rule: pull
before you push.
