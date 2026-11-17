# Conflict Economy Ventures 3.4 — Dynamic Gameplay Edition

A **complete replacement** for Conflict Economy Ventures 3.3: a satirical, educational multiplayer strategy game about resource characteristics, armed-group cohesion, conflict economies and mediation process design. Includes the 3D host map, AI rivals, QR-code rooms, accumulated resources, workforce unrest, private deals, 3/4/5-round schedules, Manual/Auto pacing and post-game **Reality Check**.

**The ZIP has no enclosing folder.** Its first level contains `server.js`, `package.json`, `game-data.js`, `game-economy.js`, `ai-engine.js`, `reality-content.js`, `render.yaml`, `public/` and `tests/`.

## What's different in Version 3.4

1. **Economies are no longer fixed to team letters.** At team assignment, each set of four available resource economies is shuffled independently from player allocation. A solo human sees **Choose your starting economy / Surprise Me** in their phone lobby; the host has an optional override. A new game can put Team A in Diamonds, Oil Pipelines, Copper/Cobalt or Checkpoints, instead of always Diamonds.
2. **AI backdeals are more varied.** The server now evaluates the AI's faction industry, personality, available funds, worker conditions, target vulnerabilities and other offers already sent. Multiple AIs approaching a single human try different deal types (trade, alliance, specialist recruiting); each proposal carries distinct, resource-specific terms. These are rule-based opponents, not external generative AI.
3. **Decision consequences are explicit.** Each choice shows **guaranteed immediate** fictional game changes for Capital ($B), Workforce, Political Influence, Regional Stability, Intel and Morale (0–100), plus the projected after-value. Automatic sanctions for certain decisions are included. Conditional strike/defection/crisis warnings and *estimated* passive income are displayed separately. Rival actions and changing conditions may affect the actual result.
4. **Mobile districts are animated.** Every player's phone shows a lightweight, faction-specific SVG scene, including vehicles/industrial movement and protest crowds when their workforce strikes. It uses CSS transforms, no asset CDN or heavy render loop. The host's existing Three.js map remains in place.
5. **Peace Summit starts earlier as a storyline.** The host and phones display a synchronized “Summit Watch” with an approaching-settlement narrative during the preceding rounds. Normal decision timers are shorter (Seed 135s; Labor 105s; Shock 110s; Backdeals 145s; Summit 125s). The **4-round Standard** game is the recommended default: Seed → Shock → Backdeals → Summit.
6. **Verified after-action resource changes.** At Reveal, each team receives its actual before-and-after portfolio impact including worker negotiations, sanctions, deals, defections, crisis penalties and passive income—not just the promised choice outcome.

All values are fictional educational game-balance units, **not** actual financial returns or measured conflict impacts.

## Modes and game flow

| Mode | Exact rounds | Backdeals |
| --- | --- | --- |
| **Quick (3 rounds)** | Seed & Investment Pitch → Market Shock & Unrest → Final Peace Summit | No |
| **Standard (4 rounds)** | Seed & Investment Pitch → Market Shock & Unrest → Backchannel Diplomacy & Backdeals → Final Peace Summit | **Yes** |
| **Full (5 rounds)** | Seed & Investment Pitch → Supply Chain & Labor Policy → Market Shock & Unrest → Backchannel Diplomacy & Backdeals → Final Peace Summit | **Yes** |

After the final investment awards, the main host clicks **Begin Reality Check**. Players answer three individual reflection prompts, view a four-resource mediation matrix and vote on **The Peace Nobody Wants** process-design dilemma. Neither scores nor resources change during the debrief.

## Solo play with AI

1. Host creates a room and selects **Total teams: 4** and **AI rivals: 3**.
2. Human joins from phone. With one human team, the phone offers **Surprise Me**, Diamonds, Pipelines, Cobalt or Checkpoints. The host may choose a starting economy in the room setup to override the phone.
3. Click **Save settings**, then **Randomly assign humans + activate AI rivals**.
4. All four teams receive distinct initial economies. AI rivals play without phones, submit after a 3–6-second thinking period (or immediately when humans finish), and make distinct Backdeals during Standard/Full mode.
5. Human and AI strategies, resource changes, news updates, 3D districts and final rankings follow the same game rules.

For multiplayer with multiple human teams, faction identities are randomized and evenly used across the roster; the solo choice is ignored, as it should be.

## Host pacing (preserved from 3.3)

**Manual is the default.** The host must click Reveal and Next Round. With **Auto**, 100% of currently connected human teams submitting triggers a **synchronized 3-second countdown** (AI will finish immediately). Choose **Reveal only** or **Reveal + next** after a configurable reading timer; the host can pause/cancel at any time. In the Reality Check, the count is every currently connected individual participant, not every team. The award-to-debrief handoff remains host-controlled.

## Economic mechanics and guarantees

- **Capital:** fictional $B funds wages, infrastructure and trade agreements.
- **Workforce:** staff enable passive income; they may leave or be recruited by rivals.
- **Influence:** political capital for alliances, bargaining and mediation.
- **Stability:** low values trigger a regional crisis and revenue penalties.
- **Intel:** information and technology unlock decisions and warnings.
- **Morale:** on a 0–100 scale; below 35 a strike can stop passive income, below 25 defections may occur. Workers respond to wage and political settlements.

A choice's **Guaranteed immediate impact** panel includes the deterministic choice delta (and applicable deterministic sanctions), bounded by resource caps. Its **Estimated next income** does *not* include unknown incoming deals, later defections or changing conditions. The final **Verified balance changes** panel compares the actual full-round starting balance with the post-reveal balance and *does* include those events. These two panels are deliberately different.

## Run locally

Install Node.js **20+**, then in the project directory:

```bash
npm install
npm test
npm start
```

Open `http://localhost:3000/host.html` and create a new room. Join on a phone using the host's QR link. For LAN testing, open the host from a network-accessible computer IP (`http://192.168.x.x:3000/host.html`), not `localhost`. The computer firewall must permit the port.

### GitHub Desktop and Render

1. Extract the ZIP; copy **its contents, not the ZIP and not a new containing folder**, over the files in your existing cloned GitHub repository, at the directory containing your current `package.json`.
2. Commit and **Push origin**. Your repository must show `server.js`, `package.json` and `public/` together in the correct directory.
3. Render Web Service: Runtime **Node**, branch **main**, Build **`npm install`**, Start **`npm start`**, Health Check Path **`/api/health`**. If files are in repository root, leave Root Directory blank; if they are inside a subfolder, enter the exact subfolder name. Do not change an existing correct Root Directory.
4. Verify `https://YOUR-SERVICE.onrender.com/api/health` returns `"ok":true` and `"version":"3.4.0"`. Create a **fresh room** after each deploy.
5. Try Standard, one human vs three AI, then a new game with a different starting faction. Verify differentiated private offers, decision previews, and the summit/news/debrief flow.

The host's interactive 3D Three.js board uses a pinned CDN, so the 3D layer needs internet access; the artwork fallback uses a bundled image. The new mobile SVG district scenes require no external libraries.

### Persistence, security and limitations

- Default rooms, credentials, scores and offers live in **server memory**; Render free service sleeping/restarting can reset a game. `SAVE_FILE` optionally writes a JSON snapshot to local disk but is **not durable storage on Render Free**. For production or longer sessions use a persistent database and do not redeploy during a match.
- Keep owner/moderator invitation links private. A room code alone does not grant host controls.
- Private offers are visible only to involved teams before reveal. Anonymous reflection responses are revealed only after the host or Auto pacing authorizes it.
- Opponents use a **deterministic, resource-aware rules engine**, not a paid LLM or network-based AI API.
- Phone screens and core scenarios can be inspected offline. A genuine multi-device Socket.io / Render test should still be performed after deployment.

## Files

- `server.js` — authoritative Socket.io rooms, team assignment, rounds, diplomacy, reveals, pacing, debrief
- `game-data.js` — faction setting, choices, round schedules and fictional deltas
- `game-economy.js` — shared pure calculations for immediate impacts and estimated income
- `ai-engine.js` — strategic AI, adaptive values, distinct private offers
- `reality-content.js` — mediation learning, reflection prompts and dilemma
- `public/host.html`, `public/host.js`, `public/world3d.js` — host controls and Three.js world
- `public/player.html`, `public/player.js`, `public/district.js` — mobile gameplay, animated districts and choice feedback
- `public/styles.css`, `public/common.js`, `public/assets/` — shared UI and 2040 city artwork
- `tests/` — unit and simulated multiplayer regression tests

The included screenshots were captured from **simulated browser states**, not a production Render multiplayer session.
