# Conflict Economy Ventures 3.4 — GitHub Desktop / Render deployment checklist

- [ ] Extract Version 3.4 ZIP. Confirm **no outer project folder** inside ZIP.
- [ ] In GitHub Desktop, paste all contents into the existing correct project directory; **replace** files rather than combining versions.
- [ ] GitHub shows `package.json`, `server.js`, `ai-engine.js`, **`game-economy.js`**, `game-data.js`, `render.yaml` and `public/` together.
- [ ] Inside `public/` are `host.html`, `player.html`, `host.js`, `player.js`, **`district.js`**, `world3d.js`, `styles.css`, `common.js` and `assets/2040-territory.webp`.
- [ ] Commit and Push origin.
- [ ] Render: Node Web Service, correct repo and branch, correct Root Directory, `npm install`, `npm start`, `/api/health`.
- [ ] Status **Live**; `/api/health` returns `"version":"3.4.0"`.
- [ ] Create a **new room**. Select 4 total teams, 3 AI rivals, Standard (4 rounds).
- [ ] Join one phone; select Pipelines (or Surprise Me), verify matching faction profile.
- [ ] Run another new match and confirm the player can be a different faction.
- [ ] All players mark briefing Ready; host sees synchronized progression.
- [ ] Check animated mobile district and choice cards with **guaranteed** immediate changes and conditional warnings.
- [ ] On reveal, verify the **actual full-round** changes (including passive income and workforce impacts).
- [ ] During Backdeals, AI rivals should produce differentiated, private proposals; accept/reject/retention actions work.
- [ ] Summit Watch appears in earlier rounds; Peace Summit ends in Investment Award.
- [ ] Begin Reality Check; verify reflection count, anonymous reveal, mediation matrix and final poll.
- [ ] Manual mode never reveals without a host action; Auto reveals with a synchronized 3-second countdown.

**Operational warning:** Server memory is not permanent. Render free instance sleep/restart or deploy can reset rooms. Do not upgrade during a live workshop.
