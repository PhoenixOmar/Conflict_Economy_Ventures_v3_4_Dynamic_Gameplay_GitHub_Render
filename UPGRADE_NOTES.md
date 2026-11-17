# Version 3.4 — Upgrade and migration notes

**Use this ZIP as a complete replacement. Do not mix individual JS files with older versions.** The ZIP has no additional containing folder; `server.js`, `package.json` and `public/` are at its root.

Changes from 3.3:
- `host:assign`: shuffles economic faction identities separately from shuffled player/team allocation. One human can choose a faction via `player:preferFaction`, or the main host can override with `soloFaction` in the lobby settings. New default game length is **Standard (4 rounds, includes Backdeals)**.
- `AI.chooseDiplomacy`: proposes different deal types and personalized pitches, reacting to industry, personality, morale, target conditions and prior offers. AI-to-human private proposals now have visible, distinct terms on phone screens.
- `scenarioForTeam`: server computes exact fictional change previews through the new pure `game-economy.js` module. Deterministic sanctions are incorporated, risks and *projected income* are explicitly labeled as conditions/estimates.
- `reveal`: stores before/after full-round economic snapshots and net resource changes. Labor settlements are included in actual outcomes.
- `public/district.js`: new lightweight animated SVG sectors on phones; Three.js host map retained.
- `summitSignal`: progressive shared summit storyline and shortened decision timers.
- `package.json` and `/api/health`: 3.4.0.

Preserved intact: QR-code lobby, unique room code, two roles of host + player, 0–4 NPA teams, distinct 3/4/5 round schedules, private backdeals, real-time submissions, strikes, workforce defections, 3D host world, VC scoring, Manual/Auto pacing, 3-second reveals and Reality Check debrief.

## Deploy

1. Copy all ZIP contents over the files in your existing GitHub Desktop repository directory (where your *current* `package.json` is located), then commit and push.
2. Render: Node Web Service, `npm install` then `npm start`, health `/api/health`; preserve your already-correct Root Directory.
3. After successful deployment, `/api/health` should say **3.4.0**.
4. Create a new room after redeploying; in-memory old rooms may disappear.
5. Try **Standard 4-round**, one human + three AI, **Surprise Me**. Run a second match specifying **Pipelines**. AI offers and the human's starting economy should differ.

## Manual smoke test

- Phone lobby: Choose/Surprise Me appears with one human team.
- Host lobby: solo economy override dropdown exists, next to AI/round settings.
- Briefing: both the shared 2040 story and correct randomized faction mandate appear on phone.
- Active decision: choose A/B/C and verify exact Capital, Workforce, Influence, Stability, Intel and Morale impacts; conditional strike/sanction warnings are distinct from estimates.
- Reveal: before/after and actual changes visible on phone; compare with updated portfolio.
- Backdeals: three AI teams' offers have different kinds/pitches and are answerable.
- Summit Watch: banner evolves across rounds *before* the summit.
- Investment Award: **Begin Reality Check** sends reflections and mediation vote to all connected phones.

## Automated tests

Run `npm test` (41 regression tests in this build). The Node unit suite uses simulated socket connections; an actual real-phone Socket.io session on Render remains a separate deployment verification.
