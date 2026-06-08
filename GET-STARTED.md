# 🚀 Get Started — For Teammates (No Experience Needed)

Welcome to the team! This guide takes you from **nothing installed** to
**running the app and sharing your changes** — step by step, no prior coding or
Git experience required. Set aside about **20 minutes** for the one-time setup.

We'll use **GitHub Desktop**, a free app with buttons (not typed commands), so
you never have to touch a command line for the Git parts.

> 🖥️ Written for **Windows**. On a Mac it's nearly identical — download links
> have Mac versions, and where a step differs there's a *(Mac: …)* note.

---

## Before you start: you need a free GitHub account

1. If you don't already have one, go to **[github.com/signup](https://github.com/signup)** and create a free account.
2. Tell **Christina** your GitHub **username** (or the email you signed up with) so she can invite you to the project.
3. You'll get an email titled something like *"Christina invited you to collaborate."* Click **View invitation** → **Accept invitation**.

✅ Once you've accepted the invite, continue below.

---

## Step 1 — Install two free programs

You only do this once.

### A) GitHub Desktop (this manages the project files)
1. Go to **[desktop.github.com](https://desktop.github.com)**
2. Click **Download for Windows** *(Mac: Download for macOS)*
3. Open the downloaded file and let it install — it opens automatically when done

### B) Node.js (this runs the app)
1. Go to **[nodejs.org](https://nodejs.org)**
2. Click the big button that says **"LTS"** (the recommended version)
3. Open the downloaded installer and click **Next** through all the steps, leaving everything at the default settings, then **Finish**

That's both programs. 🎉

---

## Step 2 — Sign in to GitHub Desktop

1. Open **GitHub Desktop**
2. Click **Sign in to GitHub.com**
3. Your web browser opens — log in with your GitHub account and click **Authorize**
4. Back in GitHub Desktop, it may ask for your name/email — accept the defaults and click **Finish**

> This is the secure login. You did it once here; you won't be asked again.

---

## Step 3 — Download the project ("Clone")

"Cloning" just means downloading your own working copy of the project.

1. In GitHub Desktop, click **File → Clone repository** (top-left menu)
2. Click the **GitHub.com** tab — you should see **`cravaglia/chris-lilach-karina`** in the list (because you accepted the invite)
3. Click it to select it
4. The **Local path** is where it'll be saved on your computer — note this location (e.g. `C:\Users\YourName\Documents\GitHub\chris-lilach-karina`)
5. Click **Clone**

✅ The project is now on your computer.

---

## Step 4 — Run the app

The app runs through a terminal, but GitHub Desktop opens one for you in the right place:

1. In GitHub Desktop, with the project open, click the **Repository** menu (top) → **Open in Command Prompt** *(Mac: Open in Terminal)*. A black/blue text window opens.
2. In that window, type this and press **Enter** (only needed the first time):
   ```
   npm install
   ```
   Wait for it to finish (it downloads the app's building blocks — takes a minute).
3. Then type this and press **Enter**:
   ```
   npm start
   ```
4. You'll see a line like: `Journey Recovery Intelligence running at http://localhost:3000`
5. Open your web browser and go to **http://localhost:3000**

🎉 **You're running the app!**

> **To stop the app:** click the terminal window and press **Ctrl + C**.
> **To start it again next time:** open the project's terminal (Step 4.1) and just type `npm start`.

---

## Step 5 — Make a change and share it with the team

Let's say you edited a file. Here's how to send your change to everyone — all in
**GitHub Desktop**, no typing commands:

1. Open **GitHub Desktop**. Your changes appear automatically in the left panel.
2. At the bottom-left, type a short note in the **Summary** box describing what you changed (e.g. *"Added a new sample journey"*).
3. Click the blue **Commit to main** button. *(This saves your change as a snapshot.)*
4. Click **Push origin** at the top. *(This uploads it so teammates can get it.)*

✅ Done — your teammates can now receive your change.

---

## Step 6 — Get your teammates' changes

Before you start working each time, grab the latest from the team:

- In GitHub Desktop, click **Fetch origin** (top). If it changes to **Pull origin**, click that too.

> 💡 **Golden rule:** click **Pull origin** *before* you start working, and again
> *before* you push your own changes. This keeps everyone in sync and avoids clashes.

---

## The daily rhythm (the whole loop)

```
1. Open GitHub Desktop → Pull origin   (get latest)
2. Make your changes / run the app
3. Write a summary → Commit to main     (save your change)
4. Push origin                          (share it)
```

---

## ✏️ The easiest way to contribute (no coding!)

You can add or edit a customer journey without writing any code:

1. In the project folder, open `data/transcripts.json` in any text editor (even Notepad)
2. Copy an existing journey block and change the details (customer name, messages, sentiment numbers)
3. Save the file
4. Refresh **http://localhost:3000** — the app **automatically recomputes all the scores** for your new journey

Then commit + push it (Step 5) to share with the team.

---

## 🆘 If something goes wrong

| What you see | What to do |
|---|---|
| `'npm' is not recognized` | Node.js didn't install fully. Re-run the Node.js installer (Step 1B), then **close and reopen** the terminal. |
| The browser page won't load | Make sure the terminal still shows it's "running" and you didn't press Ctrl+C. Re-run `npm start`. |
| GitHub Desktop says "can't push" | Click **Pull origin** first, then **Push origin** again. |
| "Merge conflict" message | Two people edited the same line. Message the team — Christina or Claude can help resolve it quickly. |
| You're just stuck | Take a screenshot and drop it in the team chat. No question is too basic. |

---

Welcome aboard — you're now set up to collaborate. 🙌
