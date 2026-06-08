# 🚀 Get Started — For Teammates (No Experience Needed)

Welcome to the team! This guide takes you from **nothing installed** to
**editing the project in Visual Studio Code, running the app, and sharing your
changes** — step by step, no prior coding or Git experience required.
Set aside about **25 minutes** for the one-time setup.

We'll use:
- **GitHub Desktop** — a free app with buttons (not typed commands) to get the project and share changes
- **Visual Studio Code** — a free editor where you'll see and change the project files (your "home base")
- **Node.js** — runs the app

> 🖥️ Written for **Windows**. On a Mac it's nearly identical — the download links
> have Mac versions, and where a step differs there's a *(Mac: …)* note.

---

## Before you start: get a free GitHub account & accept the invite

1. If you don't already have one, go to **[github.com/signup](https://github.com/signup)** and create a free account.
2. Tell **Christina** your GitHub **username** (or your sign-up email) so she can invite you.
3. You'll get an email titled something like *"Christina invited you to collaborate."* Click **View invitation** → **Accept invitation**.

✅ Once you've accepted, continue below.

---

## Step 1 — Install three free programs

You only do this once.

### A) GitHub Desktop — gets the project & shares your changes
1. Go to **[desktop.github.com](https://desktop.github.com)**
2. Click **Download for Windows** *(Mac: Download for macOS)*
3. Open the downloaded file and let it install — it opens automatically when done

### B) Visual Studio Code — where you'll edit the project
> ⚠️ **Get "Visual Studio Code"** — NOT "Visual Studio" (they're different products,
> and Visual Studio is the wrong, much larger one). Use the link below to be sure.

1. Go to **[code.visualstudio.com](https://code.visualstudio.com)**
2. Click **Download for Windows** *(Mac: Download Mac Universal)*
3. Open the installer, click **Next** through the defaults, and **Finish**

### C) Node.js — runs the app
1. Go to **[nodejs.org](https://nodejs.org)**
2. Click the big **"LTS"** button (the recommended version)
3. Open the installer and click **Next** through all the steps at their default settings, then **Finish**

That's all three. 🎉

---

## Step 2 — Sign in to GitHub Desktop

1. Open **GitHub Desktop**
2. Click **Sign in to GitHub.com**
3. Your web browser opens — log in and click **Authorize**
4. If it asks for your name/email, accept the defaults and click **Finish**

> This is the secure login. You do it once here and won't be asked again.

---

## Step 3 — Download the project ("Clone")

"Cloning" just means downloading your own working copy.

1. In GitHub Desktop, click **File → Clone repository** (top-left)
2. Click the **GitHub.com** tab — you'll see **`cravaglia/chris-lilach-karina`** in the list (because you accepted the invite). Click it.
3. The **Local path** shows where it'll be saved (e.g. `C:\Users\YourName\Documents\GitHub\chris-lilach-karina`). Leave it as-is.
4. Click **Clone**

✅ The project is now on your computer.

---

## Step 4 — Open the project in Visual Studio Code

This is your editing space — where you can see every file and change anything.

1. In GitHub Desktop, with the project open, click the **big button "Open in Visual Studio Code"** in the middle of the screen.
   - *Don't see that button?* Click the **Repository** menu (top) → **Open in Visual Studio Code**.
   - *Still not there?* Open VS Code yourself → **File → Open Folder** → pick the project folder from Step 3.
2. VS Code opens with the project. On the **left side** you'll see the file list — `engine`, `data`, `public`, `server.js`, and so on.
3. If VS Code shows a yellow bar saying *"Do you trust the authors of the files in this folder?"*, click **Yes, I trust the authors**.

🎉 **You now have the whole project open in an editable space.** Click any file on the left to view or change it.

---

## Step 5 — Run the app (from inside VS Code)

VS Code has a built-in terminal, so you can run everything in one window.

1. In VS Code, click the **Terminal** menu (top) → **New Terminal**. A panel opens at the bottom.
2. In that panel, type this and press **Enter** (only needed the very first time):
   ```
   npm install
   ```
   Wait for it to finish (it downloads the app's building blocks — about a minute).
3. Then type this and press **Enter**:
   ```
   npm start
   ```
4. You'll see: `Journey Recovery Intelligence running at http://localhost:3000`
5. Open your web browser and go to **http://localhost:3000**

🎉 **You're running the app!**

> **To stop the app:** click the terminal panel and press **Ctrl + C**.
> **To start it again later:** open the terminal (Step 5.1) and type `npm start`.

---

## Step 6 — Make an edit

Let's prove your setup works by making a small change:

1. In VS Code's left file list, open the **`data`** folder, then click **`transcripts.json`**.
2. This file holds the sample customer journeys. Try changing a customer name, a
   message, or a `sentiment` number.
3. Save with **Ctrl + S** *(Mac: Cmd + S)*.
4. Refresh **http://localhost:3000** in your browser — the app **automatically
   recomputes all the scores** with your change. ✨

> This is the **easiest way to contribute without coding** — edit a journey in
> `data/transcripts.json` and watch the scores update.

---

## Step 7 — Share your change with the team

All buttons, no commands — back in **GitHub Desktop**:

1. Open **GitHub Desktop**. Your changes show up automatically in the left panel.
2. At the bottom-left, type a short **Summary** of what you changed (e.g. *"Added a new sample journey"*).
3. Click the blue **Commit to main** button. *(Saves your change as a snapshot.)*
4. Click **Push origin** at the top. *(Uploads it so teammates can get it.)*

✅ Your teammates can now receive your change.

---

## Step 8 — Get your teammates' changes

Before you start working each time, grab the latest:

- In GitHub Desktop, click **Fetch origin** (top). If it changes to **Pull origin**, click that too.

> 💡 **Golden rule:** click **Pull origin** *before* you start working, and again
> *before* you push your own changes. This keeps everyone in sync and avoids clashes.

---

## The daily rhythm (the whole loop)

```
1. GitHub Desktop → Pull origin     (get the team's latest)
2. Edit files in VS Code; run with `npm start` to see your changes
3. GitHub Desktop → type a Summary → Commit to main   (save)
4. GitHub Desktop → Push origin     (share with the team)
```

---

## 🆘 If something goes wrong

| What you see | What to do |
|---|---|
| `'npm' is not recognized` | Node.js didn't finish installing. Re-run the Node.js installer (Step 1C), then **close and reopen** VS Code so the terminal picks it up. |
| The browser page won't load | Make sure the terminal still shows it's running and you didn't press Ctrl+C. Type `npm start` again. |
| I downloaded "Visual Studio" by mistake | That's the wrong (huge) program. Uninstall it and get **Visual Studio Code** from [code.visualstudio.com](https://code.visualstudio.com). |
| GitHub Desktop says "can't push" | Click **Pull origin** first, then **Push origin** again. |
| "Merge conflict" message | Two people edited the same line. Message the team — Christina or Claude can help resolve it quickly. |
| You're just stuck | Take a screenshot and drop it in the team chat. No question is too basic. |

---

Welcome aboard — you're now set up to collaborate. 🙌
