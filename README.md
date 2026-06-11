# Journey Recovery Intelligence

> 🚀 **Latest version → [`RightfulEscalations/`](RightfulEscalations/)** (see `RightfulEscalations/README.md`). That's the one to collaborate on. The files at the repo root are the original prototype.


A working prototype for **NICE CXone Quality Management** that measures the AI→human
handoff "seam" — the moment a customer fails with the bot and waits for a human.

It turns the original static mockup into a real app: a **scoring engine** computes the
four signals over interaction transcripts, a small **API** serves them, and the existing
**dashboard UI** renders live results.

## What it measures

| Signal | What it is |
|---|---|
| **Dead zone** | Silent gap (seconds) between escalation and human pickup |
| **Emotional recovery** | Customer-sentiment delta across the seam (handoff → resolution) |
| **Over-containment** | Bot turns held past the optimal handoff point |
| **Re-escalation** | Same customer + intent recurring within 7 days (resolution didn't stick) |

## Run it

```bash
npm install
npm start
# open http://localhost:3000
```

## Run the tests

```bash
npm test
```

## Project layout

```
engine/score.js        the scoring engine (pure, testable functions)
data/transcripts.json  sample interaction transcripts with turn-level sentiment
server.js              Express API + serves the dashboard
public/                the dashboard UI
test/                  engine unit tests
```

> The engine is data-source agnostic — today it reads sample transcripts; the same
> functions can be pointed at real NICE CXone interaction data unchanged.
