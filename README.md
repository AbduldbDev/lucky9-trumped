# Lucky 9: Trump Card Edition

> **A multiplayer, real-time card game combining traditional Lucky 9 mechanics with strategic Trump Cards, fog-of-war gameplay, and reactive counter mechanics.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.6-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.10-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Overview

**Lucky 9: Trump Card Edition** is a sophisticated real-time multiplayer card game that enhances the classic Lucky 9 (Filipino card game) with strategic Trump Cards system, lives-based elimination, escalating bets, and fog-of-war mechanics. Built with React, Vite, TailwindCSS, and Supabase for seamless multiplayer experiences.

### Key Features

- 🎴 **2-6 Player Multiplayer** — Real-time gameplay with Supabase Realtime
- 🃏 **17 Unique Trump Cards** — 5 rarity tiers from Common to Mythic
- 🛡️ **Counter System** — Reactive defense mechanics with SHATTER card
- 🎭 **Fog-of-War** — Hidden hole cards and strategic information control
- 💰 **Economy System** — Coins, shop, and 8 unlockable card skins
- ⚡ **Host-Authoritative Architecture** — Secure game state management
- 🎨 **Modern UI/UX** — Polished interface with animations and sound effects
- 👥 **Spectator Mode** — Watch games after elimination

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
# Run headless engine self-test (300 simulated matches)
npm test
```

---

## ⚙️ Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Public Key**

### 2. Enable Anonymous Authentication

1. Navigate to **Authentication → Providers**
2. Enable **"Allow anonymous sign-ins"**
   - Players get anonymous profiles without signup
   - Required for seamless multiplayer experience

### 3. Run Database Migrations

1. Open **SQL Editor** in Supabase Dashboard
2. Run the following migrations in order:
   - `supabase/migrations/001_schema.sql` — Core schema (profiles, card_skins)
   - `supabase/migrations/002_game_rooms.sql` — Game rooms table

### 4. Configure Environment Variables

Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

### Fallback Mode

If Supabase is unavailable, the app falls back to:

- Local guest profile (localStorage)
- Coins/skins stored locally
- Multiplayer still requires Supabase URL + anon key

---

## 🎮 How to Play

### Game Setup

1. **Host Creates Room**
   - Click **"Create Room"**
   - Share the generated 6-character **Party Code**

2. **Players Join**
   - Click **"Join Room"**
   - Enter the Party Code
   - Wait in lobby

3. **Start Game**
   - Host clicks **"Start Game"** when ready
   - Minimum 2 players required

### Core Rules

#### Objective

Be the last player standing by winning rounds and preserving your lives.

#### Scoring

- **Score = (Sum of card values) mod 10**
- Card values: **A=1**, **2-9=face value**, **10/J/Q/K=0**
- Maximum **3 cards** per hand
- **Highest score wins** the round

#### Lives & Betting

- Each player starts with **12 lives**
- **Bet = max(1, round + Σ bet modifiers)**
- Losers lose **bet amount** in lives
- Winners gain: **bet × number of losers** (split among tied winners)
- **0 lives = Eliminated** (become spectator)

#### Turn Actions

**On Your Turn:**

1. **Play Trump Cards** (optional, multiple allowed)
2. **Hit** — Draw a card (if < 3 cards and not sealed)
3. **Stand** — End your turn

**Showdown Trigger:**

- All active players must **Stand**
- Trump cards **reset** all Stand flags (extends the round)

#### Lucky 9 Bonus

- When your hand totals exactly **9**, you receive a **bonus Trump Card**
- Works for initial deal AND trump card draws

---

## 🃏 Trump Cards System

### Rarity Tiers

| Rarity        | Drop Rate | Color  |
| ------------- | --------- | ------ |
| **Common**    | 45%       | Gray   |
| **Uncommon**  | 27%       | Green  |
| **Rare**      | 17%       | Blue   |
| **Legendary** | 8%        | Yellow |
| **Mythic**    | 3%        | Purple |

### Distribution

- **2 Trump Cards** at match start
- **1 Trump Card** per round
- **1 Bonus Card** when hitting Lucky 9
- No inventory cap (unlimited storage)

---

## 📋 Trump Card Catalog

### 🟢 Common (45%)

| Card               | Effect                                               |
| ------------------ | ---------------------------------------------------- |
| **Bet Up**         | Increase total bet by 1                              |
| **Bet Down**       | Decrease total bet by 1 (min: 0)                     |
| **Hush**           | Draw one hidden card (only you can see its value)    |
| **Fortune Teller** | Reveal the next 3 cards in the deck (private vision) |

### 🟢 Uncommon (27%)

| Card                | Effect                                               | Counterable |
| ------------------- | ---------------------------------------------------- | ----------- |
| **Double Bet Up**   | Increase total bet by 2                              | ❌          |
| **Double Bet Down** | Decrease total bet by 2 (min: 0)                     | ❌          |
| **Shatter**         | Counter targeted trump effects (10s decision window) | ❌          |
| **Return**          | Remove your own last drawn card                      | ❌          |
| **Discard**         | Remove target player's last drawn card               | ✅          |

### 🔵 Rare (17%)

| Card         | Effect                                             | Counterable |
| ------------ | -------------------------------------------------- | ----------- |
| **Refresh**  | Replace all your cards with 2 new cards            | ❌          |
| **Exchange** | Swap your last card with target player's last card | ✅          |
| **Target**   | Force target player to draw 1 card (max 3)         | ✅          |

### 🟡 Legendary (8%)

| Card        | Effect                                          | Counterable |
| ----------- | ----------------------------------------------- | ----------- |
| **Select**  | Draw a specific rank (A-10) from remaining deck | ❌          |
| **Disable** | Target player skips turns for the round         | ✅          |
| **Checker** | Inspect remaining copies of a card rank in deck | ❌          |

### 🟣 Mythic (3%)

| Card                | Effect                                     | Counterable |
| ------------------- | ------------------------------------------ | ----------- |
| **Friendship Card** | All players draw 1 card (each can counter) | ✅          |
| **Angel Card**      | Survive with 0 lives for the current round | ❌          |

---

## 🛡️ Counter System

### How Countering Works

1. **Counterable Trump Played**
   - Player 1 uses a targeted trump (e.g., **Discard** on Player 3)

2. **Counter Prompt Appears**
   - Player 3 sees a **10-second timer** popup
   - Options: **Accept** (use SHATTER) or **Decline**

3. **Resolution**
   - **Accept:** SHATTER is consumed, original trump has no effect
   - **Decline:** Original trump effect executes normally
   - **Timeout:** Treated as Decline

### Counterable Cards

- **Discard** — Remove target's last card
- **Exchange** — Swap last cards
- **Target** — Force target to draw
- **Disable** — Skip target's turns
- **Friendship Card** — Mass draw (each player decides independently)

---

## 🏗️ Architecture

### Project Structure

```
lucky9-trumped/
├── src/
│   ├── components/         # React components
│   │   ├── cards/          # Card UI (Card.jsx, FogBadge.jsx)
│   │   ├── intro/          # Splash, Welcome, Lobby screens
│   │   ├── lobby/          # Lobby and WaitingRoom
│   │   ├── shop/           # Coin shop for skins
│   │   └── table/          # Game table components
│   │       ├── components/ # Table sub-components
│   │       ├── Controls.jsx
│   │       ├── Table.jsx
│   │       └── Timerring.jsx
│   ├── config/             # Data-driven configuration
│   │   ├── audio.config.js
│   │   ├── cardSkins.config.js
│   │   ├── gameRules.config.js
│   │   └── trumpCards.config.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useGameState.js         # State synchronization
│   │   ├── useSupabaseRealtime.js  # Realtime connection
│   │   ├── useTurnTimer.js
│   │   └── ...
│   ├── services/           # External services
│   │   ├── supabaseClient.js
│   │   └── statsService.js
│   ├── utils/              # Pure logic (testable)
│   │   ├── deckEngine.js       # Deck management
│   │   ├── gameEngine.js       # Core game reducer
│   │   ├── trumpExecutors.js   # Trump card effects
│   │   ├── partyCode.js        # 6-char code generator
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql      # Core schema
│       └── 002_game_rooms.sql  # Game rooms table
├── scripts/
│   └── selftest.mjs        # Automated testing (300 matches)
├── package.json
└── vite.config.js
```

### Authority Model

**Host-Authoritative Architecture:**

- **Host** (room creator) runs the authoritative game state
- Holds the deck and all hands
- Executes all game logic via pure reducer (`gameEngine.js`)
- Broadcasts two types of events:
  - `state` — Public game state (deck stripped, hole cards hidden)
  - `private` — Per-player events (only their hole cards and trump inventory)

- **Guests** (other players)
  - Send action requests to host
  - Receive public state + their private state
  - UI updates based on broadcasted state

**Security Considerations:**

- Fog-of-war is **not cheat-proof** in current implementation
- Broadcast channels are readable by anyone with the Party Code
- Determined players can inspect `private` messages in browser dev tools
- **Fine for friends; competitive play should move reducer to Edge Function**

---

## 🎨 Card Skins

### Unlockable Skins

| Skin                     | Rarity    | Price      | Preview                |
| ------------------------ | --------- | ---------- | ---------------------- |
| **Classic Velvet Red**   | Common    | Free       | Default starter skin   |
| **Cyberpunk Neon**       | Rare      | 500 coins  | Cyan/Fuchsia gradient  |
| **Royal Amethyst**       | Rare      | 750 coins  | Purple/Indigo gradient |
| **Emerald Dynasty**      | Rare      | 750 coins  | Emerald/Green gradient |
| **Midnight Obsidian**    | Epic      | 1200 coins | Slate/Black gradient   |
| **Sakura Blossom**       | Epic      | 1200 coins | Pink/Rose gradient     |
| **Imperial Dragon Gold** | Legendary | 2000 coins | Amber/Yellow gradient  |
| **Celestial Diamond**    | Legendary | 2000 coins | Sky/Blue gradient      |

### Earning Coins

- **Round Payout:** `round_payout × ROUND_PAYOUT_COIN_VALUE`
- **Match Winner:** Base payout + `WINNER_MULTIPLIER × player_count`

---

## 🧪 Testing

### Automated Testing

```bash
npm test
```

Runs **300 simulated matches** with:

- Random player counts (2-6)
- Random actions and trump plays
- Validation of game state integrity
- Edge case coverage

### Manual Testing Checklist

- [ ] Create and join rooms
- [ ] All 17 trump cards function correctly
- [ ] Counter system (SHATTER) works with 10s timer
- [ ] Lucky 9 bonus triggers properly
- [ ] Fog-of-war hides appropriate information
- [ ] Spectator mode after elimination
- [ ] Coin rewards and shop purchases
- [ ] Rematch functionality

---

## 🔧 Configuration

### Game Rules (`src/config/gameRules.config.js`)

```javascript
export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  STARTING_LIVES: 12,
  STARTING_TRUMP_CARDS: 2,
  TRUMP_CARDS_PER_ROUND: 1,
  TRUMP_CARD_ON_TOTAL_NINE: true,
  TURN_TIMER: 30, // seconds per turn
  // ... more config
};
```

### Adding New Trump Cards

1. **Add to catalog** (`src/config/trumpCards.config.js`):

```javascript
MY_CARD: {
  id: "MY_CARD",
  name: "My Card",
  rarity: "RARE",
  description: "Does something awesome",
  targetType: "NONE", // or SINGLE_PLAYER, ALL_PLAYERS, RANK_CHOICE
  counterable: false, // true if can be blocked by SHATTER
  effect: { type: "MY_EFFECT", ...params }
}
```

2. **Add executor** (`src/utils/trumpExecutors.js`):

```javascript
MY_EFFECT: (ctx) => {
  // ctx = { state, playerId, targetId, params }
  // Mutate ctx.state directly (Immer draft)

  // Example: Modify player's hand
  const player = ctx.state.players.find((p) => p.id === ctx.playerId);
  player.hand.push(somethingNew);

  // Optional: Check Lucky 9 after draws
  checkLucky9(ctx.state, ctx.playerId);
};
```

3. **Test**: Run `npm test` to validate

### Adding New Skins

1. **Add to config** (`src/config/cardSkins.config.js`):

```javascript
{
  id: "my_skin",
  name: "My Awesome Skin",
  rarity: "Epic",
  price: 1000,
  unlockedByDefault: false,
  previewColor: "from-color-700 to-color-950", // Tailwind gradient
  borderColor: "border-color-400"
}
```

2. **Add to database** (Supabase SQL Editor):

```sql
INSERT INTO card_skins (id, name, price, rarity)
VALUES ('my_skin', 'My Awesome Skin', 1000, 'Epic');
```

---

## 📊 Database Schema

### Tables

**`profiles`**

```sql
- id (uuid, primary key, references auth.users)
- name (text, default "Guest")
- coins (integer, default 0)
- equipped_skin (text, default "classic_red")
- unlocked_skins (jsonb, default ["classic_red"])
```

**`card_skins`**

```sql
- id (text, primary key)
- name (text)
- price (integer)
- rarity (text)
```

**`game_rooms`** (optional, for persistence)

```sql
- id (text, primary key)
- created_at (timestamp)
- host_id (uuid)
- state (jsonb)
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

- **Frontend:** React 18.3.1, TailwindCSS 3.4.10
- **Build Tool:** Vite 8.3.6
- **Backend:** Supabase (Auth, Realtime, PostgreSQL)
- **State Management:** React hooks + Immer (via pure reducer)
- **Icons:** Font Awesome

### Code Style

- **Pure functions** for game logic (`gameEngine.js`, `trumpExecutors.js`)
- **React hooks** for UI state and side effects
- **Config-driven** design (easy to extend trump cards, skins, rules)
- **Component composition** for maintainability

---

## ⚠️ Known Limitations

### Security

1. **Fog-of-war not cheat-proof**
   - Broadcast channels readable by anyone with Party Code
   - Private messages visible in browser dev tools
   - **Mitigation:** Move reducer to Supabase Edge Function for competitive play

2. **Client-reported match results**
   - `record_match` RPC trusts client coin amounts
   - Caps exist per match, but not foolproof
   - **Mitigation:** Server-side match settlement for real stakes

3. **Host is single point of failure**
   - If host closes tab, match ends for all players
   - **Mitigation:** Implement host migration or serverless reducer

### UX

- **No rejoin after disconnect** (reload creates new profile)
- **No match history** (planned feature)
- **No in-game chat** (planned feature)

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Host Migration** — Transfer host if original disconnects
- [ ] **Match History** — View past game statistics
- [ ] **In-Game Chat** — Text communication during games
- [ ] **Tournaments** — Multi-match bracket system
- [ ] **More Trump Cards** — Expand to 25+ unique cards
- [ ] **Achievements** — Unlock badges and rewards
- [ ] **Leaderboards** — Global and friends rankings
- [ ] **Mobile App** — Native iOS/Android versions

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
4. **Follow existing code style** (pure functions, config-driven)
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
