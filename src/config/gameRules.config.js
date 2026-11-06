export const GAME_CONFIG = {
  // GENERAL GAME SETTINGS
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  GAME_MODE: "standard",

  // PLAYER SETTINGS
  STARTING_LIVES: 12,
  MAX_LIVES: 12,
  STARTING_BET: 1,

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
  TURN_TIMER: 999999, // seconds per turn
  TIMER_WARNING: 10, // blink/heartbeat threshold (seconds)
  AUTO_ELIMINATE_ON_TIMEOUT: true,
  SKIP_ELIMINATED_PLAYERS: true,

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
  STARTING_TRUMP_CARDS: 2, // trump cards granted at match start
  TRUMP_CARDS_PER_ROUND: 1, // trump card drawn after each round
  TRUMP_CARD_ON_TOTAL_NINE: true, // bonus trump card when hand first hits 9
  ALLOW_MULTIPLE_TRUMP_CARDS_PER_TURN: true,
  TRUMP_CARD_DRAW_PRIVATE: true,

  // TRUMP CARD RARITY DROP PROBABILITIES (total = 100 %)
  TRUMP_RARITY: {
    COMMON: 45,
    UNCOMMON: 27,
    RARE: 17,
    LEGENDARY: 8,
    MYTHIC: 3,
  },

  // BET SETTINGS
  MIN_BET: 0,
  MAX_BET: 999,
  BET_UP_VALUE: 1,
  BET_DOWN_VALUE: 1,
  DOUBLE_BET_VALUE: 2,

  // CHIP ECONOMY
  WIN_REWARD_MIN: 100,
  WIN_REWARD_MAX: 120,
  STARTING_CHIPS: 0,
  ENABLE_CHIP_REWARDS: true,

  // SPECTATOR SETTINGS
  // ENABLE_SPECTATOR_MODE: true,
  // SPECTATOR_ON_ELIMINATION: true,
  // SPECTATOR_CAN_VIEW_PLAYER_CARDS: true,
  // SPECTATOR_CAN_VIEW_TRUMP_CARDS: true,
  // SPECTATOR_CAN_VIEW_LIVES: true,
  // SPECTATOR_CAN_VIEW_BETS: true,
  // SPECTATOR_CAN_INTERACT: false,

  // GAME TABLE SETTINGS
  TABLE_LAYOUT: "circular",
  TABLE_BACKGROUNDS: ["green", "purple", "yellow", "blue", "gray"],
  DEFAULT_TABLE_BACKGROUND: "green",
  PLAYER_SKIN_VISIBLE_TO_ALL: true,

  // ANIMATION & AUDIO SETTINGS
  ENABLE_ANIMATIONS: true,
  ENABLE_SOUND: true,
  ENABLE_HEARTBEAT_SOUND: true,
  HEARTBEAT_WARNING_TIME: 10,
  DEFAULT_MUSIC_VOLUME: 0.5,
  DEFAULT_SFX_VOLUME: 0.7,

  // APPLICATION & TIMERS
  // SPLASH_SCREEN_ENABLED: true,
  // SPLASH_SCREEN_INTERVAL: 60 * 60 * 1000, // 1 hour in ms
  // ENABLE_GUIDE_PAGE: true,
  // ENABLE_IN_GAME_HELP: true,
  // ENABLE_MATCH_HISTORY: true,
  // ENABLE_PLAYER_PROFILES: true,

  // LEGACY / INTERNAL — kept for partyCode utility
  PARTY_CODE_LENGTH: 6,

  // MAX CARDS IN HAND (derived, used throughout engine)
  MAX_CARDS_IN_HAND: 5,
};
