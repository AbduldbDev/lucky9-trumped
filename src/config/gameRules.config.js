export const GAME_CONFIG = {
  // GENERAL GAME SETTINGS
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,

  MIN_BET: 0,
  MAX_CARDS_IN_HAND: 5,

  // PLAYER SETTINGS
  STARTING_LIVES: 12,
  MAX_LIVES: 12,
  STARTING_BET: 1,

  PARTY_CODE_LENGTH: 6,

  // DECK SETTINGS
  DECK_SIZE: 52,
  SUITS: ["hearts", "spades", "clubs", "diamonds"],
  CARD_VALUES: [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ],
  RESET_DECK_EVERY_ROUND: true,
  SHUFFLE_DECK_EVERY_ROUND: true,

  // TURN SETTINGS
  TURN_TIMER: 30, // seconds per turn
  TIMER_WARNING: 10, // blink/heartbeat threshold (seconds)
  AUTO_ELIMINATE_ON_TIMEOUT: true,
  SKIP_ELIMINATED_PLAYERS: true,
  COUNTER_PROMPT_TIME_MS: 5000,

  // ROUND SETTINGS
  ROUND_DURATION_TIMER: true,
  RESET_ROUND_TIMER: true,
  ROUND_RESULT_COUNTDOWN: 3, // 3-2-1 showdown overlay
  REQUIRE_ALL_PLAYERS_TO_PASS: true,

  // MATCH SETTINGS
  RANDOM_FIRST_PLAYER: true,
  WINNER_FIRST_NEXT_ROUND: true,
  RANDOM_FIRST_PLAYER_ON_DRAW: true,
  ENABLE_REMATCH: true,
  REMATCH_VOTING_TIMER: 30,
  REQUIRE_UNANIMOUS_REMATCH: true,

  // TRUMP CARD SETTINGS
  // No inventory cap — trump cards are unlimited per SRD clarification.
  STARTING_TRUMP_CARDS: 5, // trump cards granted at match start
  TRUMP_CARDS_FOR_WINNER: 2, // trump cards awarded to round winner(s)
  TRUMP_CARDS_FOR_LOSER: 1, // trump cards awarded to round loser(s)
  TRUMP_CARD_ON_TOTAL_NINE: true, // bonus trump card when hand first hits 9

  // ENABLED TRUMP CARDS
  // List of trump card IDs that can appear in the game.
  // Leave empty array [] to enable all cards, or specify IDs to restrict.
  // Example: ["BET_UP", "BET_DOWN", "SHATTER"] - only these 3 cards can appear
  ENABLED_TRUMP_CARDS: [
    // ── COMMON ──
    "BET_UP",
    "BET_DOWN",
    "SHATTER",
    // ── UNCOMMON ──
    "DOUBLE_BET_UP",
    "DOUBLE_BET_DOWN",
    "RETURN",
    "DISCARD",
    "HUSH",
    // ── RARE ──
    "REFRESH",
    "EXCHANGE",
    "TARGET",
    "CHECKER",
    // ── LEGENDARY ──
    "SELECT",
    "DISABLE",
    // ── MYTHIC ──
    "FRIENDSHIP_CARD",
    "ANGEL_CARD",
    "FORTUNE_TELLER",
  ],

  // ORIGINAL TRUMP CARD RARITY SETTINGS
  // TRUMP_RARITY: {
  //   COMMON: 45,
  //   UNCOMMON: 27,
  //   RARE: 17,
  //   LEGENDARY: 8,
  //   MYTHIC: 3,
  // },

  // BETA TRUMP CARD RARITY SETTINGS
  TRUMP_RARITY: {
    COMMON: 35,
    UNCOMMON: 25,
    RARE: 18,
    LEGENDARY: 12,
    MYTHIC: 10,
  },

  // TRUMP_RARITY: {
  //   COMMON: 0,
  //   UNCOMMON: 0,
  //   RARE: 0,
  //   LEGENDARY: 100,
  //   MYTHIC: 0,
  // },

  // CHIP ECONOMY
  WIN_REWARD_MIN: 100,
  WIN_REWARD_MAX: 120,
  ENABLE_CHIP_REWARDS: true,
  TABLE_BACKGROUND: "blue", // "green" | "purple" | "blue" | "red" | "black"

  ENABLE_SOUND: true,
  ENABLE_HEARTBEAT_SOUND: true,
  HEARTBEAT_WARNING_TIME: 10,
  DEFAULT_MUSIC_VOLUME: 0.5,
  DEFAULT_SFX_VOLUME: 0.7,

  // MAX CARDS IN HAND (derived, used throughout engine)
};
