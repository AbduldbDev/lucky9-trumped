# Lucky 9 - Sound Effects Setup

Place your MP3 audio files in this directory. The audio system will automatically load them based on the filenames below.

## Required Sound Files

All files should be in `.mp3` format and named exactly as listed:

### Game Flow

- `game_start.mp3` - Match begins <!-- Check  -->
- `game_over.mp3` - Match ends (neutral)
- `victory.mp3` - Local player wins the match
- `defeat.mp3` - Local player loses the match
- `round_start.mp3` - New round begins <!-- Check  -->
- `round_end.mp3` - Round ends
- `turn_start.mp3` - It's your turn
- `rematch_vote.mp3` - Rematch vote cast

### Countdown & Timer

- `countdown_tick.mp3` - Countdown 3, 2, 1 tick <!-- Check  -->
- `countdown_go.mp3` - Final "go" beat
- `tick.mp3` - Timer tick (last 10 seconds)
- `heartbeat.mp3` - Low time heartbeat sound (loops) <!-- Check  -->
- `timer_expire.mp3` - Time runs out

### Cards

- `card_deal.mp3` - Card being dealt
- `card_draw.mp3` - Player draws a card <!-- Check  -->
- `card_flip.mp3` - Card flipped
- `card_place.mp3` - Card placed on table
- `nine_hit.mp3` - Player hits Lucky 9 <!-- Check  -->
- `showdown_reveal.mp3` - Showdown reveal

### Trump Cards

- `trump_draw.mp3` - Draw a trump card
- `trump_place.mp3` - Trump card placed
- `trump_play.mp3` - Default trump activation (Common/Uncommon)
- `trump_rare.mp3` - Rare trump activated
- `trump_legendary.mp3` - Legendary trump activated
- `trump_mythic.mp3` - Mythic trump activated
- `trump_blocked.mp3` - Trump blocked/disabled
- `trump_discard.mp3` - Trump discarded
- `angel_activate.mp3` - Angel trump activated

### Betting

- `bet_change.mp3` - Bet amount changed
- `bet_up.mp3` - Bet increased
- `bet_down.mp3` - Bet decreased

### Results

- `win_round.mp3` - Win a round
- `lose_round.mp3` - Lose a round
- `draw_round.mp3` - Round draw
- `eliminate.mp3` - Player eliminated <!-- Check  -->

### Lobby & UI

- `player_join.mp3` - Player joins room
- `player_leave.mp3` - Player leaves room
- `ready.mp3` - Player ready
- `ui_click.mp3` - UI button click <!-- Check  -->
- `ui_hover.mp3` - UI hover sound
- `ui_error.mp3` - Error/invalid action

## Missing Files

If an audio file is missing, the game will still work - it just won't play that specific sound. Check your browser console for warnings about missing audio files.

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
   - Ensure files are named exactly as listed (case-sensitive)
   - Verify files are in `/public/sfx/` directory
   - Check browser autoplay policy (user must interact with page first)

2. **Sound cutting off?**
   - File may be too long or large
   - Check MP3 encoding

3. **Heartbeat not looping?**
   - Ensure `heartbeat.mp3` is designed to loop seamlessly
   - Check `ENABLE_HEARTBEAT_SOUND` in game config
