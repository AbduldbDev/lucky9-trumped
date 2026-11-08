// Audio configuration — sound effect keys and heartbeat parameters.
// Actual audio file loading happens in the component layer.

import { GAME_CONFIG } from "./gameRules.config.js";

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
    // ── Game flow ─────────────────────────────
    GAME_START: "game_start", // match begins
    GAME_OVER: "game_over", // match ends (neutral)
    VICTORY: "victory", // local player wins the match
    DEFEAT: "defeat", // local player loses the match
    ROUND_START: "round_start",
    ROUND_END: "round_end",
    TURN_START: "turn_start", // it's your turn
    REMATCH_VOTE: "rematch_vote",

    // ── Countdown & timer ─────────────────────
    COUNTDOWN_TICK: "countdown_tick", // 3, 2, 1
    COUNTDOWN_GO: "countdown_go", // final "go" beat
    TIMER_TICK: "tick",
    TIMER_HEARTBEAT: "heartbeat",
    TIMER_EXPIRE: "timer_expire",

    // ── Cards ─────────────────────────────────
    CARD_DEAL: "card_deal",
    CARD_DRAW: "card_draw", // player draws a card
    CARD_FLIP: "card_flip",
    CARD_PLACE: "card_place", // card laid on the table
    NINE_HIT: "nine_hit",
    SHOWDOWN: "showdown_reveal",

    // ── Trump cards ───────────────────────────
    TRUMP_DRAW: "trump_draw", // player draws a trump card
    TRUMP_PLACE: "trump_place", // trump card placed on the table
    TRUMP_PLAY: "trump_play", // default activation (fallback)
    TRUMP_RARE: "trump_rare",
    TRUMP_LEGENDARY: "trump_legendary",
    TRUMP_MYTHIC: "trump_mythic",
    TRUMP_BLOCKED: "trump_blocked", // shatter / disabled effect
    TRUMP_DISCARD: "trump_discard",
    ANGEL_ACTIVATE: "angel_activate",

    // ── Betting ───────────────────────────────
    BET_CHANGE: "bet_change",
    BET_UP: "bet_up",
    BET_DOWN: "bet_down",

    // ── Results ───────────────────────────────
    WIN_ROUND: "win_round",
    LOSE_ROUND: "lose_round",
    DRAW_ROUND: "draw_round",
    ELIMINATE: "eliminate",

    // ── Lobby & UI ────────────────────────────
    PLAYER_JOIN: "player_join",
    PLAYER_LEAVE: "player_leave",
    READY: "ready",
    UI_CLICK: "ui_click",
    UI_HOVER: "ui_hover",
    UI_ERROR: "ui_error",
  },

  // Trump activation sound by rarity (falls back to TRUMP_PLAY)
  TRUMP_PLAY_BY_RARITY: {
    COMMON: "trump_play",
    UNCOMMON: "trump_play",
    RARE: "trump_rare",
    LEGENDARY: "trump_legendary",
    MYTHIC: "trump_mythic",
  },
};

/** Returns the sound key to play when a trump card of the given rarity is used. */
export function getTrumpPlaySfx(rarity) {
  return (
    AUDIO_CONFIG.TRUMP_PLAY_BY_RARITY[rarity] || AUDIO_CONFIG.SFX.TRUMP_PLAY
  );
}
