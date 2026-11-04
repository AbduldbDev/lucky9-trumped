// Audio configuration — sound effect keys and heartbeat parameters.
// Actual audio file loading happens in the component layer.

import { GAME_CONFIG } from './gameRules.config.js';

export const AUDIO_CONFIG = {
  // Master toggles (mirrored from GAME_CONFIG)
  ENABLE_SOUND: GAME_CONFIG.ENABLE_SOUND,
  ENABLE_HEARTBEAT: GAME_CONFIG.ENABLE_HEARTBEAT_SOUND,
  HEARTBEAT_WARNING_TIME: GAME_CONFIG.HEARTBEAT_WARNING_TIME, // seconds

  // Volume defaults (0.0 – 1.0)
  MUSIC_VOLUME: GAME_CONFIG.DEFAULT_MUSIC_VOLUME,
  SFX_VOLUME: GAME_CONFIG.DEFAULT_SFX_VOLUME,

  // SFX event → key mapping (swap filenames as needed)
  SFX: {
    CARD_DEAL:       'card_deal',
    CARD_FLIP:       'card_flip',
    TRUMP_PLAY:      'trump_play',
    BET_CHANGE:      'bet_change',
    WIN_ROUND:       'win_round',
    LOSE_ROUND:      'lose_round',
    ELIMINATE:       'eliminate',
    TIMER_HEARTBEAT: 'heartbeat',
    TIMER_TICK:      'tick',
    REMATCH_VOTE:    'rematch_vote',
    NINE_HIT:        'nine_hit',        // lucky 9 bonus trump card
    SHOWDOWN:        'showdown_reveal',
    ANGEL_ACTIVATE:  'angel_activate',
  },
};
