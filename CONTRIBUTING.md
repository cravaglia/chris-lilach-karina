# Contributing — Team Guide

Welcome to **Journey Recovery Intelligence**! This guide gets you from zero to
running the app and sharing changes with the team. No deep technical background
needed — just follow the steps.

---

## 1. One-time setup

You'll need **Git** and **Node.js** installed:
- Git — [git-scm.com/downloads](https://git-scm.com/downloads)
- Node.js (v18 or newer) — [nodejs.org](https://nodejs.org)

Then get the project (run these in PowerShell or a terminal):

```bash
git clone https://github.com/cravaglia/chris-lilach-karina.git
cd chris-lilach-karina
npm install
```

> The **first** time you `git clone` or `git push`, a browser window pops up
> asking you to log into GitHub — just approve it. That's the secure login
> (no tokens to copy or paste). You only do this once.

---

## 2. Run the app

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

To stop the server: press `Ctrl + C` in the terminal (on Windows you can also run
`Get-Process node | Stop-Process`).

---

## 3. Run the tests

The scoring engine has automated tests that prove the numbers are correct:

```bash
npm test
```

You should see `pass 7`. **Please run this before pushing** — if a test fails,
something you changed broke a calculation.

---

## 4. The everyday rhythm

| To do this | Run this |
|---|---|
| Get the team's latest changes | `git pull` |
| See what you've changed | `git status` |
| Save & share your changes | `git add .` → `git commit -m "what you changed"` → `git push` |

> 💡 **Golden rule to avoid conflicts:** run `git pull` *before* you start
> working, and again *before* you `git push`.

**Writing a good commit message:** describe *what changed and why* in a few words.
- 👍 `git commit -m "Add re-escalation count to home signal cards"`
- 👎 `git commit -m "stuff"`

---

## 5. Optional — work on a branch for bigger changes

If you're making an experimental change and don't want to disturb `main`:

```bash
git checkout -b my-change   # create & switch to your own branch
# ...make changes, commit them...
git push -u origin my-change
```

Then open a **Pull Request** on GitHub so a teammate can review before it merges
into `main`.

---

## What's in this project

| Path | What it is |
|---|---|
| `engine/score.js` | The scoring engine — the 4 seam signals (pure, tested functions) |
| `engine/insights.js` | Loop detector, journey sub-scores, warm-transfer brief generator |
| `data/transcripts.json` | Sample interaction transcripts — **edit these and the dashboard updates live** |
| `server.js` | The API + serves the dashboard |
| `public/index.html` | The dashboard UI (data-driven) |
| `test/score.test.js` | Tests that prove the engine's numbers |

**Easiest way to contribute without coding:** edit `data/transcripts.json` to add
or tweak a customer journey — the app recomputes all the scores automatically.

---

## Common problems

| Problem | Fix |
|---|---|
| `git push` rejected (non-fast-forward) | Run `git pull` first, then `git push` |
| Merge conflict | Open the file, find the `<<<<<<<` markers, keep the right version, then `git add` + `git commit` |
| `npm start` fails | Make sure you ran `npm install` first |
| Login keeps failing | Close the terminal and try again — the browser login will reappear |

Questions? Ask in the team chat. Happy building! 🚀
