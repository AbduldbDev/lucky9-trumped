# Lucky 9 - Sound Effects Setup

Place your MP3 audio files in this directory. The audio system will automatically load them based on the filenames below.

## Current Files (✓ = Present)

### Game Flow

- ✓ `game_start.mp3` - Match begins
- ✓ `game_over.mp3` - Match ends (neutral)
- ✓ `victory.mp3` - Local player wins the match
- ✓ `defeat.mp3` - Local player loses the match
- ✓ `round_start.mp3` - New round begins
- ✗ `round_end.mp3` - Round ends **(Fallback: round_start.mp3)**
- ✓ `turn_start.mp3` - It's your turn
- ✗ `rematch_vote.mp3` - Rematch vote cast **(Fallback: ui_click.mp3)**

### Countdown & Timer

- ✓ `countdown_tick.mp3` - Countdown 3, 2, 1 tick
- ✗ `countdown_go.mp3` - Final "go" beat **(Fallback: countdown_tick.mp3)**
- ✗ `tick.mp3` - Timer tick (last 10 seconds) **(Fallback: countdown_tick.mp3)**
- ✓ `heartbeat.mp3` - Low time heartbeat sound (loops)
- ✗ `timer_expire.mp3` - Time runs out **(Fallback: countdown_tick.mp3)**

### Cards

- ✗ `card_deal.mp3` - Card being dealt **(Fallback: card_draw.mp3)**
- ✓ `card_draw.mp3` - Player draws a card
- ✗ `card_flip.mp3` - Card flipped **(Fallback: card_draw.mp3)**
- ✗ `card_place.mp3` - Card placed on table **(Fallback: card_draw.mp3)**
- ✓ `nine_hit.mp3` - Player hits Lucky 9
- ✗ `showdown_reveal.mp3` - Showdown reveal **(Fallback: nine_hit.mp3)**

### Trump Cards

- ✗ `trump_draw.mp3` - Draw a trump card **(Fallback: card_draw.mp3)**
- ✗ `trump_place.mp3` - Trump card placed **(Fallback: card_draw.mp3)**
- ✗ `trump_play.mp3` - Default trump activation **(Fallback: card_draw.mp3)**
- ✗ `trump_rare.mp3` - Rare trump activated **(Fallback: card_draw.mp3)**
- ✗ `trump_legendary.mp3` - Legendary trump activated **(Fallback: card_draw.mp3)**
- ✗ `trump_mythic.mp3` - Mythic trump activated **(Fallback: card_draw.mp3)**
- ✗ `trump_blocked.mp3` - Trump blocked/disabled **(Fallback: ui_click.mp3)**
- ✗ `trump_discard.mp3` - Trump discarded **(Fallback: card_draw.mp3)**
- ✗ `angel_activate.mp3` - Angel trump activated **(Fallback: card_draw.mp3)**

### Betting

- ✗ `bet_change.mp3` - Bet amount changed **(Fallback: ui_click.mp3)**
- ✗ `bet_up.mp3` - Bet increased **(Fallback: ui_click.mp3)**
- ✗ `bet_down.mp3` - Bet decreased **(Fallback: ui_click.mp3)**

### Results

- ✗ `win_round.mp3` - Win a round **(Fallback: victory.mp3)**
- ✗ `lose_round.mp3` - Lose a round **(Fallback: defeat.mp3)**
- ✗ `draw_round.mp3` - Round draw **(Fallback: round_start.mp3)**
- ✓ `eliminate.mp3` - Player eliminated

### Lobby & UI

- ✗ `player_join.mp3` - Player joins room **(Fallback: ui_click.mp3)**
- ✗ `player_leave.mp3` - Player leaves room **(Fallback: ui_click.mp3)**
- ✗ `ready.mp3` - Player ready **(Fallback: ui_click.mp3)**
- ✓ `ui_click.mp3` - UI button click
- ✗ `ui_hover.mp3` - UI hover sound **(Fallback: ui_click.mp3)**
- ✗ `ui_error.mp3` - Error/invalid action **(Fallback: ui_click.mp3)**

## Fallback System

The game now uses a **fallback audio system** - if a sound file is missing, it automatically uses a similar existing sound. This prevents 404 errors and ensures audio always works!

**Currently present files (13/47):**

- game_start.mp3
- game_over.mp3
- victory.mp3
- defeat.mp3
- round_start.mp3
- turn_start.mp3
- countdown_tick.mp3
- heartbeat.mp3
- card_draw.mp3
- nine_hit.mp3
- eliminate.mp3
- ui_click.mp3

**Missing files (34/47):** Will use fallbacks automatically

## Audio Configuration

To adjust volumes, enable/disable sounds, or configure heartbeat timing, edit:
`src/config/audio.config.js`

## Supported Format

- **Format**: MP3
- **Recommended bitrate**: 128kbps or higher
- **Recommended length**: Keep SFX under 3 seconds for best UX (except music/heartbeat loops)

## Troubleshooting

1. **No sound playing?**
   - Check browser console for errors
   - User must interact with page first (browser autoplay policy)
   - Check `ENABLE_SOUND` in game config

2. **404 errors in console?**
   - These are now handled gracefully with fallbacks
   - No action needed unless you want to add the specific files

3. **Sound cutting off?**
   - File may be too long or large
   - Check MP3 encoding

4. **Heartbeat not looping?**
   - Ensure `heartbeat.mp3` is designed to loop seamlessly
   - Check `ENABLE_HEARTBEAT_SOUND` in game config
