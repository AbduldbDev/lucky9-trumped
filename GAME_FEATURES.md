# Lucky 9: Trump Card Edition - Game Features

## Game Description

Multiplayer real-time card game combining Lucky 9 mechanics with strategic Trump Cards, fog-of-war gameplay, and reactive counter mechanics.

## Core Features

### Gameplay

- **2-6 Player Multiplayer** with real-time synchronization
- **Lives-Based Elimination** - 12 lives, bet-based damage
- **Escalating Bets** - Bet increases each round + trump modifiers
- **3-Card Maximum** - Strategic hand management
- **Lucky 9 Bonus** - Score exactly 9 to get bonus trump card
- **Fog-of-War** - Hole cards hidden until showdown

### Trump Card System

- **20 Unique Trump Cards** across 5 rarity tiers
- **Counter Mechanics** - SHATTER blocks counterable trumps, MIRROR reflects them back
- **Strategic Timing** - Play multiple trumps per turn
- **Rarity Distribution** - Common (45%) → Uncommon (27%) → Rare (17%) → Legendary (8%) → Mythic (3%)

### Trump Cards Breakdown

#### Common (4 cards)

- Bet Up/Down - Modify round bet
- SHATTER - Counter opponent trump cards
- SACRIFICE - Lose 2 lives for 2 trump cards

#### Uncommon (5 cards)

- Double Bet Up/Down - Modify bet by 2
- Return - Remove your last card
- Discard - Remove opponent's last card (counterable)
- HUSH - Draw hidden card

#### Rare (4 cards)

- Refresh - Replace all cards with 2 new ones
- Exchange - Swap last card with opponent (counterable)
- Target - Force opponent to draw (counterable)
- MIRROR - Reflect counterable trump back to attacker
- Checker - Inspect deck for specific rank

#### Legendary (4 cards)

- Select - Draw specific rank from deck
- Disable - Skip opponent's turns for round (counterable)
- LOCKDOWN - Lock opponent's trump usage for round (counterable)

#### Mythic (3 cards)

- Friendship Card - All players draw 1 card (each can counter)
- Angel Card - Survive at 0 lives for current round
- Fortune Teller - See next 3 cards in deck

### Economy & Customization

- **Coin System** - Earn from round payouts and match wins
- **8 Unlockable Card Skins** - Common to Legendary rarity
- **Shop System** - Spend coins on cosmetic card backs
- **Equipped Skin** - Visible to all players at table

### Multiplayer Features

- **Party Code System** - 6-character room codes
- **Host-Authoritative** - Secure game state management
- **Spectator Mode** - Watch after elimination
- **Rematch System** - Quick game restart
- **Kick System** - Host can remove disruptive players
- **Opponent Stats Modal** - View player stats mid-game

### UI/UX

- **Modern Interface** - Polished with animations
- **Sound Effects** - Card draw, countdown, victory/defeat
- **Turn Timer** - 30 second turns with visual indicator
- **Counter Prompt** - 10 second decision window for counters
- **Trump Notifications** - Visual display of trump card plays
- **Leaderboard** - Player rankings by total coins

### Technical

- **Real-time Sync** - Supabase Realtime
- **Anonymous Auth** - No signup required
- **Offline Fallback** - Local storage for guest mode
- **Automated Testing** - 300+ match simulations
- **Pure Game Logic** - Testable, deterministic reducer

## Game Flow

1. **Lobby** - Host creates room, shares party code
2. **Waiting Room** - Players join and ready up
3. **Round Start** - Deal 2 cards + 1 trump to each player
4. **Player Turns** - Play trumps, hit (draw), or stand
5. **Counter Phase** - Respond to counterable trumps (if any)
6. **Showdown** - All stood → reveal hands → highest score wins
7. **Payout** - Losers lose bet in lives, winners gain chips
8. **Next Round** - Repeat until one player survives
9. **Game Over** - Winner announced, rematch voting

## Unique Mechanics

### Counter System

- **Reactive Defense** - Block or reflect opponent trumps
- **10 Second Timer** - Quick decision-making
- **SHATTER** - Cancels trump effect
- **MIRROR** - Reflects trump back to attacker (NEW!)
- **Three-Button UI** - Decline, Mirror, or Shatter

### MIRROR Card Mechanics

- Only usable during counter phase
- Reflects single-target trumps back to original user
- Attacker suffers their own effect
- Cannot reflect ANGEL or mass-effect trumps
- Strategic counter to high-value trumps

### Trump Card Filtering

- Host can enable/disable specific trump cards
- Custom game modes via `ENABLED_TRUMP_CARDS` config
- Empty array = all cards enabled

## Statistics Tracked

- Total matches played
- Wins/losses
- Win rate percentage
- Total coins earned
- Trumps played
- Natural 9s hit
- Lives taken from opponents
