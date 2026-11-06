# Lucky 9 - Audio System Integration Complete

## Overview
The game now has a complete audio system integrated throughout. Sound effects will automatically play for all game events once you add MP3 files to `/public/sfx/`.

## What Was Added

### 1. Core Audio System
- **`src/hooks/useAudioManager.js`** - Audio playback engine with caching, volume control, and heartbeat support
- **`src/contexts/AudioContext.jsx`** - React context provider for audio access throughout the app
- **`src/config/audio.config.js`** - Centralized audio configuration (already existed, now actively used)

### 2. Audio Integration Points

#### Table Component (`src/components/table/Table.jsx`)
- **Phase changes**: ROUND_START, SHOWDOWN, ROUND_END, VICTORY, DEFEAT
- **Round changes**: ROUND_START on new rounds
- **Turn changes**: TURN_START when it becomes your turn
- **Trump cards**: Plays rarity-specific sounds (COMMON, RARE, LEGENDARY, MYTHIC)
- **Personal notifications**: NINE_HIT when you hit Lucky 9

#### Controls Component (`src/components/table/components/Controls.jsx`)
- **Hit button**: CARD_DRAW sound
- **Stand button**: UI_CLICK sound
- **Trump card selection**: UI_CLICK when selecting, rarity-specific sound on play

#### Showdown Overlay (`src/components/table/components/ShowdownOverlay.jsx`)
- **Countdown**: COUNTDOWN_TICK for 3, 2, 1
- **Go**: COUNTDOWN_GO at 0

#### Turn Timer (`src/hooks/useTurnTimer.js`)
- **Timer ticks**: TIMER_TICK in last 10 seconds
- **Heartbeat**: Loops when time drops below warning threshold
- **Timeout**: TIMER_EXPIRE when time runs out

#### Lobby Components
- **WaitingRoom**: GAME_START on match start, UI_CLICK on copy/leave
- **Lobby**: UI_CLICK on create room, join room, open shop

### 3. Audio Settings UI
- **`src/components/table/components/AudioSettings.jsx`** - Modal for audio controls
- **TopBar integration** - Audio settings button (volume icon) next to help button
- Controls:
  - Enable/disable sound effects
  - Adjust SFX volume (0-100%)
  - Enable/disable heartbeat sound
  - Test sound button

## How to Add Your Sound Effects

1. **Create the directory** (if it doesn't exist):
   ```
   /public/sfx/
   ```

2. **Add your MP3 files** using these exact filenames:
   - `game_start.mp3`, `victory.mp3`, `defeat.mp3`
   - `round_start.mp3`, `round_end.mp3`, `turn_start.mp3`
   - `countdown_tick.mp3`, `countdown_go.mp3`
   - `card_draw.mp3`, `card_flip.mp3`, `card_place.mp3`
   - `nine_hit.mp3`, `showdown_reveal.mp3`
   - `trump_play.mp3`, `trump_rare.mp3`, `trump_legendary.mp3`, `trump_mythic.mp3`
   - `tick.mp3`, `heartbeat.mp3`, `timer_expire.mp3`
   - `ui_click.mp3`, `ui_hover.mp3`, `ui_error.mp3`
   - And more... (see `/public/sfx/README.md` for complete list)

3. **The audio system will automatically load and play them** based on game events!

## Configuration

Edit `src/config/audio.config.js` to adjust:
- `ENABLE_SOUND` - Master toggle for all audio
- `ENABLE_HEARTBEAT` - Enable/disable heartbeat warning sound
- `HEARTBEAT_WARNING_TIME` - Seconds before timeout when heartbeat starts
- `SFX_VOLUME` - Default sound effects volume (0.0 - 1.0)
- `MUSIC_VOLUME` - Default music volume (0.0 - 1.0)

## Testing

1. **Start the game**: `npm run dev`
2. **Open Audio Settings**: Click the volume icon in the top-right corner during gameplay
3. **Test a sound**: Click "Test Sound" button
4. **Play the game**: Audio will play automatically for all events

## Troubleshooting

### No sound playing?
- Check browser console for "Failed to load sound" warnings
- Verify MP3 files are in `/public/sfx/` directory
- Ensure filenames match exactly (case-sensitive)
- Check that sounds are enabled in Audio Settings

### Browser blocks audio?
- Modern browsers require user interaction before playing audio
- The first sound may be blocked - subsequent sounds will work
- Users must click something on the page first

### Heartbeat not looping smoothly?
- Ensure `heartbeat.mp3` is designed to loop seamlessly
- Add a small fade-out/fade-in at loop points
- Keep the file under 2 seconds for best results

## Audio Event Map

| Event | Sound Key | Trigger Location |
|-------|-----------|------------------|
| Game starts | `game_start` | WaitingRoom → start button |
| Your turn | `turn_start` | Table → turn change |
| Draw card | `card_draw` | Controls → hit button |
| Stand | `ui_click` | Controls → stand button |
| Trump played | `trump_*` (by rarity) | Table → trump play effect |
| Lucky 9 hit | `nine_hit` | Table → personal notification |
| Countdown tick | `countdown_tick` | ShowdownOverlay → 3,2,1 |
| Countdown go | `countdown_go` | ShowdownOverlay → 0 |
| Timer warning | `heartbeat` (loop) | useTurnTimer → low time |
| Timer tick | `tick` | useTurnTimer → last 10s |
| Time expires | `timer_expire` | useTurnTimer → 0 seconds |
| Round ends | `round_end` | Table → SHOWDOWN phase |
| Victory | `victory` | Table → GAMEOVER (won) |
| Defeat | `defeat` | Table → GAMEOVER (lost) |
| UI clicks | `ui_click` | Lobby, buttons, etc. |

## Future Enhancements

Potential additions:
- Background music tracks
- Ambient table sounds
- Player-specific sound themes
- Positional audio for multiplayer
- Sound effect packs/themes
- Volume controls per sound category
- Mute individual sound types

## Files Modified/Created

### Created:
- `src/hooks/useAudioManager.js`
- `src/contexts/AudioContext.jsx`
- `src/components/table/components/AudioSettings.jsx`
- `public/sfx/README.md`
- `AUDIO_INTEGRATION.md` (this file)

### Modified:
- `src/App.jsx` - Added AudioProvider wrapper
- `src/components/table/Table.jsx` - Phase/round/turn/trump audio triggers
- `src/components/table/components/Controls.jsx` - Hit/stand/trump audio
- `src/components/table/components/ShowdownOverlay.jsx` - Countdown audio
- `src/components/table/components/TopBar.jsx` - Audio settings button
- `src/components/lobby/Lobby.jsx` - UI click sounds
- `src/components/lobby/WaitingRoom.jsx` - Game start audio
- `src/hooks/useTurnTimer.js` - Timer audio (heartbeat, ticks, expire)

## Summary

The audio system is **production-ready** and fully integrated. Simply drop your MP3 files into `/public/sfx/` with the correct filenames and the game will come alive with sound!

Players can control their audio experience through the Audio Settings panel accessible from the game table's top bar.
