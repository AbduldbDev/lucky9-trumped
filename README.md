# Lucky 9 — Trump Card Multiplayer Edition

Real-time 2–6 player Lucky 9 with lives, escalating bets, fog-of-war hole cards,
rarity-tiered Trump Cards and a skin shop. React + Vite + Tailwind + Supabase.

## Quick start

```bash
npm install
cp .env.example .env        # then fill in your Supabase URL + anon key
npm run dev                 # http://localhost:5173
npm test                    # headless engine self-test (300 simulated matches)
```

### Supabase setup (one time)

1. Create a project at supabase.com.
2. **Authentication → Providers → enable “Allow anonymous sign-ins”** (players get a profile with no signup).
3. Run `supabase/migrations/001_schema.sql` in the SQL Editor.
4. Put the project URL and anon key in `.env`.

Realtime Broadcast needs no extra setup. If Supabase auth/tables aren't available, the
app falls back to a local guest profile (coins/skins in `localStorage`), but multiplayer
still requires the URL + anon key.

### Playing

One player clicks **Create room** and shares the 6-character Party Code. Others on any
network click **Join**. The host presses **Start game**.

## How it works

```
src/
├── config/        trumpCards · cardSkins · gameRules   (data only, easy to extend)
├── components/    lobby · table · cards · shop
├── hooks/         useSupabaseRealtime (channel) · useGameState (host/guest sync)
├── services/      supabaseClient · statsService (cloud + local fallback)
└── utils/         deckEngine · trumpExecutors · gameEngine (pure reducer) · partyCode
supabase/migrations/001_schema.sql
scripts/selftest.mjs
```

**Authority model.** The room creator is the host. The host runs the pure `gameReducer`
(`utils/gameEngine.js`), holds the deck and every hand, and broadcasts:
`state` (deck stripped, every hole card and trump hand hidden) plus a `private` event per
player carrying only that player's hole card and trump hand. Guests just send actions.

**Rules implemented**
- Score = (sum of card values) mod 10; A=1, 2–9 face, 10/J/Q/K=0. Max 3 cards.
- Bet = `max(1, round + Σ modifiers)`; losers lose that many lives; 0 lives → eliminated/spectating.
- Highest score wins; ties share the win (all-tied = no lives lost). Winner payout = bet × losers
  (split among tied winners). Last player standing wins the match.
- Each player is dealt `TRUMP_CARDS_PER_ROUND` weighted-random trump cards per round (unused ones carry over, capped).
- Turn: any number of trump plays, then **Hit** (if < 3 cards and not sealed) and **Stand**.
- Coins at match end: `payout × ROUND_PAYOUT_COIN_VALUE` + `WINNER_COIN_REWARD_MULTIPLIER × players` for the winner.

**Judgment calls** (the spec was silent — change in `gameEngine.js` / `trumpExecutors.js`)
- *Seal of Draw* also blocks forced draws (Mass Chaos Draw) and Divine Summon for that player.
- *Bet Slash* clamps so the effective bet never drops below 1.
- Rotating first-to-act each round.

### Add a Trump Card
Add one entry to `TRUMP_CARDS_CATALOG` in `src/config/trumpCards.config.js`. Reusing an existing
`effect.type` (e.g. `MODIFY_BET` with `amount: 2`) needs no other change. A brand-new mechanic
needs one handler added to `EFFECT_EXECUTORS` in `src/utils/trumpExecutors.js`.

### Add a skin
Add an entry to `src/config/cardSkins.config.js` **and** a row to the `card_skins` table
(prices are enforced server-side).

## Known limitations (read before launching publicly)

- **Fog-of-war is not cheat-proof.** Broadcast channels are readable by anyone who knows the
  Party Code, so a determined player could inspect other players' `private` messages in dev tools.
  Fine for friends; for competitive play move the reducer into a Supabase Edge Function / server
  and use per-user private channels.
- **The host is a single point of failure** — if the host closes the tab, the match ends.
- **Match results are client-reported.** `record_match` caps coins per match; settle matches
  server-side before real stakes.
- Skin “assets” are gradient/border classes only; swap in images via `cardSkins.config.js`.
