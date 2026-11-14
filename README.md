# Lucky 9: Trump Card Edition

> **A multiplayer, real-time card game combining traditional Lucky 9 mechanics with strategic Trump Cards, fog-of-war gameplay, and reactive counter mechanics.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.6-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.10-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Overview

**Lucky 9: Trump Card Edition** is a real-time multiplayer card game that enhances the classic Lucky 9 (Filipino card game) with a strategic Trump Cards system, lives-based elimination, escalating bets, and fog-of-war mechanics. Built with React, Vite, TailwindCSS, and Supabase for seamless multiplayer.

### Key Features

- 🎴 **2–6 Player Multiplayer** — Real-time gameplay with Supabase Realtime
- 🃏 **25 Unique Trump Cards** — 5 rarity tiers from Common to Mythic
- 🛒 **In-Game Trump Shop** — Spend chips on bundles of random Trump Cards (database-priced)
- 🛡️ **Counter System** — SHATTER counters and MIRROR reflects targeted effects
- 🎭 **Fog-of-War** — Hidden hole cards and strategic information control
- 💰 **Economy System** — Chips, Trump Shop, and 25 unlockable card skins
- 👤 **Player Profiles** — Username, lifetime stats, match history, and leaderboards
- ⚡ **Host-Authoritative Architecture** — Secure, validated game state management
- 🎨 **Modern UI/UX** — Polished interface with animations, sound effects, and themes
- 👥 **Spectator Mode** — Watch games after elimination or when joining mid-match

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Supabase Account** (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lucky9-trumped.git
cd lucky9-trumped

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
# Run headless engine self-test (300 simulated matches + trump card suites)
npm test
```

---

## ⚙️ Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Public Key**

### 2. Run Database Migrations

1. Open the **SQL Editor** in the Supabase Dashboard
2. Run the migrations in order:

| Migration | Purpose |
| --------- | ------- |
| `000_complete_setup.sql` | Core schema: profiles, card skins, player stats, match history, RPCs (`record_match`, `purchase_skin`, `equip_skin`, …) |
| `005_fix_trigger.sql` | Profile creation trigger fix |
| `006_add_sync_functions.sql` | Sync/helper functions |
| `007_verify_sync.sql` | Verification helper |
| `008_update_match_history.sql` | Match history columns + nullable winner |
| `009_fix_match_history_function.sql` | History view function fix |
| `010_fix_match_history_type.sql` | History type fix |
| `011_fix_match_history_permissions.sql` | RLS policies for history inserts |
| `012_trump_shop.sql` | **Trump Shop**: `trump_shop_items` + `trump_purchases` tables, `purchase_trump_bundle` and `verify_trump_purchase` RPCs |

> The **Trump Shop bundles are seeded in `012_trump_shop.sql`** — the database is the
> authoritative price source. If you change bundles in `src/config/trumpShop.config.js`,
> update the SQL seed to match.

### 3. Configure Environment Variables

Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

### Accounts & Authentication

- Players sign up with a **username + password** (3–20 characters, letters/numbers/underscores)
- Usernames are stored on the profile and also used for login
- Profiles hold chips, level/rank, equipped skin, owned inventory, table color, and lifetime stats
- The original username used at signup remains the login credential (username changes on the profile page don't affect login)

---

## 🎮 How to Play

### Game Setup

1. **Host Creates Room**
   - Click **"Create Room"**
   - Share the generated 6-character **Party Code**

2. **Players Join**
   - Click **"Join Room"**
   - Enter the Party Code
   - Wait in the lobby and mark yourself **Ready**

3. **Start Game**
   - Host clicks **"Start Game"** when everyone is ready
   - Minimum 2 players required

### Core Rules

#### Objective

Be the last player standing by winning rounds and preserving your lives.

#### Scoring

- **Score = (Sum of card values) mod 10**
- Card values: **A=1**, **2–9=face value**, **10/J/Q/K=0**
- Up to **5 cards** per hand
- **Highest score wins** the round

#### Lives & Betting

- Players start with **1 life** (can grow up to **12**)
- **Bet = round number + bet modifiers** (Bet Up/Down cards, min 0)
- Losers lose the **bet amount** in lives
- Winners **gain bet × number of losers** (split among tied winners)
- **0 lives = Eliminated** (become a spectator)
- **Angel Card** and **Aegis** interact with life loss — see the Trump Cards catalog
- Leaving a match mid-game eliminates you immediately

#### Turn Actions

**On Your Turn:**

1. **Play Trump Cards** (optional, multiple allowed)
2. **Hit** — Draw a card (if < 5 cards and not sealed)
3. **Stand** — End your turn

**Showdown Trigger:**

- All active players must **Stand**
- Trump cards **reset** all Stand flags (extends the round)
- A 3-second reveal countdown starts before the showdown resolves

#### Lucky 9 Bonus

- When your hand totals exactly **9**, you receive a **bonus Trump Card**
- Works for the initial deal AND trump card draws

#### Timeouts & Rematch

- Turn timer is **30 seconds**; a timeout eliminates you for that round
- **2 consecutive timeouts** = permanent elimination for the match
- After a match ends, players **vote on a rematch** (30s timer, unanimous required, otherwise the room returns to the lobby)

---

## 🃏 Trump Cards System

### Rarity Tiers

| Rarity        | Drop Rate | Color  |
| ------------- | --------- | ------ |
| **Common**    | 35%       | Gray   |
| **Uncommon**  | 25%       | Green  |
| **Rare**      | 18%       | Blue   |
| **Legendary** | 12%       | Yellow |
| **Mythic**    | 10%       | Purple |

### Distribution

- **5 Trump Cards** at match start
- **2 Trump Cards** for round winners, **1** for active losers
- **1 Bonus Card** when hitting Lucky 9
- **Trump Shop bundles** (see below)
- No inventory cap (unlimited storage)
- Cards can have a `minPlayers` requirement — they only roll into hands and can only be played while enough players are active (e.g. **Bond needs 3+**)

---

## 📋 Trump Card Catalog

### 🟢 Common (35%)

| Card           | Effect                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| **Bet Up**     | Increase total bet by 1                                                                 |
| **Bet Down**   | Decrease total bet by 1 (min: 0)                                                        |
| **Shatter**    | Counter a targeted trump (cancel its effect) or destroy table effects (bets, Angel, Aegis) |
| **Sacrifice**  | Lose 2 lives to gain 2 Trump Cards (needs more than 1 life)                             |
| **Odds**       | Check whether the next deck card is above or below 5 (without revealing its value)      |

### 🟢 Uncommon (25%)

| Card                | Effect                                        | Counterable |
| ------------------- | --------------------------------------------- | ----------- |
| **Double Bet Up**   | Increase total bet by 2                       | ❌          |
| **Double Bet Down** | Decrease total bet by 2 (min: 0)              | ❌          |
| **Return**          | Remove your own last drawn card               | ❌          |
| **Discard**         | Remove target player's last drawn card        | ✅          |
| **Hush**            | Draw one hidden card (only you see its value) | ❌          |

### 🔵 Rare (18%)

| Card         | Effect                                                   | Counterable |
| ------------ | -------------------------------------------------------- | ----------- |
| **Refresh**  | Replace all your cards with 2 new cards                  | ❌          |
| **Exchange** | Swap your last card with target player's last card       | ✅          |
| **Target**   | Force target player to draw 1 card (max 5)               | ✅          |
| **Checker**  | Inspect remaining copies of a rank in the deck (private) | ❌          |
| **Mirror**   | When countering, reflect the trump back at its user      | —           |

### 🟡 Legendary (12%)

| Card               | Effect                                                | Counterable |
| ------------------ | ----------------------------------------------------- | ----------- |
| **Select**         | Draw a specific rank (A–10) from the remaining deck   | ❌          |
| **Disable**        | Target player skips turns for the round               | ✅          |
| **Fortune Teller** | Reveal the next 3 deck cards (private vision)         | ❌          |
| **Lockdown**       | Target player cannot use Trump Cards for the round    | ✅          |
| **Aegis**          | Halve your life penalty this round (destroyable by Shatter) | ❌    |

### 🟣 Mythic (10%)

| Card                | Effect                                                                     | Counterable |
| ------------------- | -------------------------------------------------------------------------- | ----------- |
| **Friendship Card** | All active players draw 1 card (each can counter)                          | ✅          |
| **Angel Card**      | Survive at 0 lives for the current round (destroyable by Shatter)          | ❌          |
| **Devour**          | Steal up to 2 lives from a target and add them to your own                 | ✅          |
| **Rebirth**         | Discard all your Trump Cards and roll the same number of new ones          | ❌          |
| **Bond**            | Bond two players for 3 rounds: negative targeted effects are shared. **Requires 3+ active players** | ✅ |

---

## 🛡️ Counter System

### How Countering Works

1. **Counterable Trump Played**
   - Player 1 uses a targeted trump (e.g., **Discard** on Player 3)

2. **Counter Prompt Appears**
   - Player 3 sees a **10-second timer** popup
   - Options: **Counter** (use SHATTER — or MIRROR) or **Decline**

3. **Resolution**
   - **Shatter:** the SHATTER card is consumed and the original trump has no effect
   - **Mirror:** the effect is reflected back at the original user (self-targeting allowed)
   - **Decline / Timeout:** the original trump effect executes normally

### Rules & Restrictions

- **Bonded players** each get their own counter window — if *both* counter with SHATTER, no bond forms
- **Locked-down players** (LOCKDOWN victim) cannot counter with SHATTER or MIRROR — only "Accept Fate"
- **Devour** and **Friendship Card** can also be countered

### Counterable Cards

- **Discard** — Remove target's last card
- **Exchange** — Swap last cards
- **Target** — Force target to draw
- **Disable** — Skip target's turns
- **Lockdown** — Disable target's trumps
- **Devour** — Steal lives
- **Friendship Card** — Mass draw (each player decides independently)
- **Bond** — Create a bond (either target may counter)

---

## 🛒 Trump Shop

Spend **chips** on bundles of random Trump Cards during a match (PLAYING phase only — starting a match wipes held Trumps).

| Bundle    | Random Trumps | Price (chips) |
| --------- | ------------- | ------------- |
| **Starter** | 1           | 150           |
| **Duo**     | 2           | 280           |
| **Value**   | 5           | 650           |
| **Mega**    | 7           | 850           |

### How It Works

1. Open the shop from the **top bar** during a match and pick a bundle
2. Confirm the purchase — chips are deducted **atomically in the database**
3. The host verifies the purchase server-side and rolls your random cards (using the same rarity logic as normal draws, respecting `minPlayers`)
4. **Everyone in the room** sees a notification that you bought Trumps; only you see which cards you got
5. If the host never delivers, a 12-second watchdog warns you instead of leaving you hanging

- **Prices live in the database** (`trump_shop_items`), never trusted from the client
- Purchases are audited in `trump_purchases` and processed exactly once

---

## 👤 Profiles, Stats & Leaderboards

- **Profile page**: avatar, username (inline rename, up to 20 chars, must be unique), rank/level, chips, wins/losses/win-rate
- **Match history**: recent matches with result, room code, rounds, duration, and chips rewarded
- **Statistics**: total matches, current/best win streak, wins, losses, level
- **Leaderboard**: global rankings from the database
- **Winners earn 100–120 chips** per match

---

## 🏗️ Architecture

### Project Structure

```
lucky9-trumped/
├── src/
│   ├── components/
│   │   ├── auth/            # Login, SignUp, route guards
│   │   ├── cards/           # Card UI (Card.jsx, FogBadge.jsx)
│   │   ├── common/          # Shared layout atoms
│   │   ├── intro/           # Splash, Welcome, asset loader
│   │   ├── leaderboard/     # Leaderboard panel/modal
│   │   ├── lobby/           # Lobby and WaitingRoom
│   │   ├── profile/         # Profile page (player card, history,
│   │   │                    #   skins inventory, table color settings)
│   │   ├── room/            # Room orchestration (Table / WaitingRoom)
│   │   ├── shop/            # Skin shop + in-game Trump Shop
│   │   └── table/
│   │       ├── game/        # Table, seats, deck, Controls (ActionBar + TrumpTray)
│   │       ├── ui/          # TopBar, panels, round result, audio settings
│   │       ├── modals/      # CounterPrompt, TrumpGuide, GameOver, OpponentStats
│   │       └── effects/     # Trump notifications, showdown overlay, active effects
│   ├── config/              # Data-driven configuration
│   │   ├── audio.config.js
│   │   ├── cardSkins.config.js
│   │   ├── gameRules.config.js
│   │   ├── profilePreferences.config.js
│   │   ├── trumpCards.config.js
│   │   ├── trumpShop.config.js
│   │   └── updates.config.js
│   ├── contexts/            # Auth, Audio, Intro contexts
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameState.js         # Host-authoritative state sync + dispatch
│   │   ├── useSupabaseRealtime.js  # Realtime connection
│   │   ├── useMatchSettlement.js   # Per-player match result saving
│   │   ├── useTrumpShop.js         # Shop purchase flow
│   │   ├── usePersonalNotifications.js
│   │   └── ...                     # Timers, targeting, rematch, audio, etc.
│   ├── pages/               # Route pages
│   ├── services/            # All Supabase access lives here
│   │   ├── supabaseClient.js
│   │   ├── statsService.js       # Profile, stats, match history, skins, table color
│   │   └── trumpShopService.js   # Shop purchases + purchase verification
│   ├── utils/               # Pure logic (testable)
│   │   ├── deckEngine.js       # Deck management
│   │   ├── gameEngine.js       # Core game reducer
│   │   ├── trumpExecutors.js   # Trump card effects + rarity rolls
│   │   ├── assetCache.js
│   │   ├── partyCode.js        # 6-char code generator
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/          # 000_complete_setup.sql … 012_trump_shop.sql
├── scripts/
│   └── selftest.mjs         # Automated testing (300 matches + suites)
├── package.json
└── vite.config.js
```

### Authority Model

**Host-Authoritative Architecture:**

- **Host** (room creator) runs the authoritative game state
  - Holds the deck and all hands
  - Executes all game logic via a pure reducer (`gameEngine.js`)
  - Verifies Trump Shop purchases against the database before granting cards
  - Broadcasts two types of events:
    - `state` — Public game state (deck stripped, hole cards hidden)
    - `private` — Per-player events (only their hole cards, trump inventory, and private results)

- **Guests** (other players)
  - Send action requests to the host
  - Receive public state + their private state
  - UI updates based on broadcasted state

**Security Considerations:**

- Fog-of-war is **not cheat-proof** in the current implementation
- Broadcast channels are readable by anyone with the Party Code
- Determined players can inspect `private` messages in browser dev tools
- **Fine for friends; competitive play should move the reducer to an Edge Function**
- Trump Shop purchases are protected server-side: prices come from the DB and grants are verified + deduplicated by purchase ID

---

## 🎨 Card Skins

### Unlockable Skins (25 total)

| Tier             | Count | Price              | Examples                                        |
| ---------------- | ----- | ------------------ | ----------------------------------------------- |
| **Common**       | 6     | Free / 100 chips   | Default Card, Default Red/Purple/Yellow/Pink/Blue |
| **Uncommon**     | 2     | 300 chips          | The Devil, The Castle                           |
| **Rare**         | 4     | 1,000 chips        | Silent Origin, Azure Horizon, Void Prism, Solaris Prime |
| **Legendary**    | 4     | 2,000 chips        | Celestial Reverie, Eclipse of the Velvet Moon, Heavenly Ascendance, Petal Whispers |
| **Mythic**       | 9     | 3,500 chips        | Abyssal Sovereign, Crimson Requiem, Void Emperor, Obsidian Sovereign, Eternal Void, Celestial Ascension, Abyssal Overlord, Celestial Dominion, Eternal Ascendant |

### Earning Chips

- **Match winners** earn 100–120 chips
- Chips also fund the **Trump Shop**

### Appearance Settings

- Equip any owned skin from the profile page
- Choose your **table felt color** (local view preference, persisted per profile)

---

## 🧪 Testing

### Automated Testing

```bash
npm test
```

Runs **300 simulated matches** with:

- Random player counts (2–6)
- Random actions and trump plays
- Validation of game state integrity
- Trump card suites: shop grants, LOCKDOWN counter restrictions, the `minPlayers` player-count gate, catalog completeness, and rarity chances summing to 100%

### Manual Testing Checklist

- [ ] Create and join rooms
- [ ] All 25 trump cards function correctly
- [ ] Counter system (SHATTER / MIRROR) works with the 10s timer
- [ ] LOCKDOWN blocks SHATTER/MIRROR counters
- [ ] BOND requires 3+ active players (rolls and plays)
- [ ] Lucky 9 bonus triggers properly
- [ ] Fog-of-war hides appropriate information
- [ ] Spectator mode after elimination
- [ ] Chip rewards, skin purchases, and Trump Shop purchases
- [ ] Username change on the profile page
- [ ] Rematch voting

---

## 🔧 Configuration

### Game Rules (`src/config/gameRules.config.js`)

```javascript
export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  MIN_BET: 0,
  MAX_CARDS_IN_HAND: 5,
  STARTING_LIVES: 1,
  MAX_LIVES: 12,
  STARTING_TRUMP_CARDS: 5,
  TRUMP_CARDS_FOR_WINNER: 2,
  TRUMP_CARDS_FOR_LOSER: 1,
  TURN_TIMER: 30, // seconds per turn
  COUNTER_PROMPT_TIME_MS: 10000, // 10s counter window
  WIN_REWARD_MIN: 100,
  WIN_REWARD_MAX: 120,
  ENABLE_REMATCH: true,
  // ... more config
};
```

### Adding New Trump Cards

1. **Add to the catalog** (`src/config/trumpCards.config.js`) and to `ENABLED_TRUMP_CARDS`:

```javascript
MY_CARD: {
  id: "MY_CARD",
  name: "My Card",
  rarity: "RARE",
  description: "Does something awesome",
  targetType: "NONE", // NONE, SELF, SINGLE_PLAYER, TWO_PLAYERS, ALL_PLAYERS, RANK_CHOICE
  counterable: false, // true if it can be blocked by SHATTER
  mirrorable: true,   // false to opt out of MIRROR reflection
  minPlayers: 3,      // optional: only usable/rollable with N+ active players
  effect: { type: "MY_EFFECT", ...params }
}
```

2. **Add an executor** (`src/utils/trumpExecutors.js`):

```javascript
MY_EFFECT({ draft, actor, target }) {
  // Mutate the draft state directly.
  // Return a human-readable result message.
}
```

3. **Test**: Run `npm test` to validate

### Adding New Trump Shop Bundles

Update **both** sides — the UI config and the DB seed must stay in sync:

1. `src/config/trumpShop.config.js` → add an entry to `TRUMP_SHOP_ITEMS`
2. `supabase/migrations/012_trump_shop.sql` → add the same row to the `trump_shop_items` seed

The database is the price authority; the client config only drives the display.

### Adding New Skins

1. **Add to config** (`src/config/cardSkins.config.js`):

```javascript
{
  id: "my_skin",
  name: "My Awesome Skin",
  rarity: "RARE",
  price: 1000,
  unlockedByDefault: false,
  previewColor: "from-color-700 to-color-950", // Tailwind gradient
  borderColor: "border-color-400",
  backSvg: "/card_skins/my_skin.png",
}
```

2. **Add to database** (Supabase SQL Editor):

```sql
INSERT INTO card_skins (id, name, price, rarity)
VALUES ('my_skin', 'My Awesome Skin', 1000, 'RARE');
```

---

## 📊 Database Schema

### Tables

**`profiles`** — one per user

```sql
- id (uuid, primary key, references auth.users)
- username (text, unique)
- chips (integer)
- level (integer)
- current_rank (text)
- equipped_skin_id (text)
- table_color (text)
```

**`player_stats`** — lifetime statistics

```sql
- user_id (uuid)
- total_matches, total_wins, total_losses (integer)
- current_win_streak, highest_win_streak (integer)
- favorite_trump_card (text)
```

**`match_history`** — one row per player per match

```sql
- match_code (text)
- winner_id (uuid, nullable)
- player_id (uuid)
- won (boolean)
- total_rounds (integer)
- duration_seconds (integer)
- chips_rewarded (integer)
```

**`user_inventory`** — owned items

```sql
- user_id (uuid)
- item_id (text)
- item_type (text)  -- e.g. CARD_SKIN
```

**`card_skins`** — skin catalog

```sql
- id (text, primary key)
- name (text)
- price (integer)
- rarity (text)
```

**`trump_shop_items`** — Trump Shop bundle catalog (price authority)

```sql
- id (text, primary key)      -- bundle id
- name (text)
- quantity (integer)          -- random trumps granted
- price (integer)             -- chips
```

**`trump_purchases`** — purchase audit trail (consumed exactly once by the host)

```sql
- id (uuid, primary key)
- user_id (uuid)
- party_code (text)
- bundle_id (text)
- quantity (integer)
- price_chips (integer)
- verified (boolean)
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Production build
npm run preview  # Preview production build
npm test         # Run engine self-tests
```

### Tech Stack

- **Frontend:** React 18.3.1, TailwindCSS 3.4.10, react-router-dom 7
- **Build Tool:** Vite 8.3.6
- **Backend:** Supabase (Auth, Realtime, PostgreSQL + RLS + RPCs)
- **State Management:** React hooks + pure reducer (no external state library)
- **Icons:** Font Awesome

### Code Style

- **Pure functions** for game logic (`gameEngine.js`, `trumpExecutors.js`)
- **Services** own all Supabase access; **config files** own all constants
- **React hooks** for UI state and side effects; components stay thin
- **Config-driven** design (easy to extend trump cards, skins, bundles, rules)

---

## ⚠️ Known Limitations

### Security

1. **Fog-of-war not cheat-proof**
   - Broadcast channels readable by anyone with the Party Code
   - Private messages visible in browser dev tools
   - **Mitigation:** Move the reducer to a Supabase Edge Function for competitive play

2. **Client-reported match results**
   - `record_match` RPC trusts the client's reward claim
   - Caps exist per match, but this is not foolproof
   - **Mitigation:** Server-side match settlement for real stakes

3. **Host is a single point of failure**
   - If the host closes their tab, the match ends for all players
   - **Mitigation:** Implement host migration or a serverless reducer

### UX

- **Chips can be deducted without a grant** if the host disconnects right after a shop purchase (a watchdog warns the buyer after 12s)
- **No in-game chat** (planned feature)

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Host Migration** — Transfer host if the original disconnects
- [ ] **In-Game Chat** — Text communication during games
- [ ] **Tournaments** — Multi-match bracket system
- [ ] **More Trump Cards** — Expand the catalog
- [ ] **Achievements** — Unlock badges and rewards
- [ ] **Mobile App** — Native iOS/Android versions

### Recently Shipped

- [x] **Trump Shop** — Chip-priced random Trump bundles during matches
- [x] **25 Trump Cards** — Including Sacrifice, Odds, Mirror, Lockdown, Aegis, Rebirth, Devour, Bond
- [x] **Username changes** — Rename from the profile page
- [x] **Match History & Leaderboards**
- [x] **Player-count gates** — Cards that require a minimum number of active players

### Community Requests

- [ ] Custom game modes (speed rounds, no trump, etc.)
- [ ] Private rooms with passwords
- [ ] AI opponents for solo practice
- [ ] Replay system

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Write tests** for new trump cards/features
4. **Follow existing code style** (pure logic, config-driven, services for DB access)
5. **Commit with clear messages** (`git commit -m 'Add: Fortune Teller trump card'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Setup

```bash
git clone https://github.com/yourusername/lucky9-trumped.git
cd lucky9-trumped
npm install
cp .env.example .env
# Add your Supabase credentials
npm run dev
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Lucky 9** — Traditional Filipino card game
- **React Team** — Excellent UI library
- **Supabase** — Real-time multiplayer infrastructure
- **Vite** — Lightning-fast build tool
- **TailwindCSS** — Utility-first styling

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/lucky9-trumped/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/lucky9-trumped/discussions)
- **Email:** your.email@example.com

---

<div align="center">

**Built with ❤️ by [Your Name]**

⭐ **Star this repo if you enjoy playing!** ⭐

</div>
