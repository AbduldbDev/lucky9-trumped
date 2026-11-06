import { GAME_CONFIG } from "./gameRules.config.js";

export const RARITY_COLOR = {
  COMMON: "#9ca3af",
  UNCOMMON: "#22c55e",
  RARE: "#3b82f6",
  LEGENDARY: "#eab308",
  MYTHIC: "#a855f7",
};

export const TRUMP_ICONS = {
  BET_UP: "fa-arrow-trend-up",
  BET_DOWN: "fa-arrow-trend-down",
  DOUBLE_BET_UP: "fa-angles-up",
  DOUBLE_BET_DOWN: "fa-angles-down",
  SHUTTER: "fa-ban",
  RETURN: "fa-rotate-left",
  DISCARD: "fa-trash-can",
  REFRESH: "fa-arrows-rotate",
  EXCHANGE: "fa-right-left",
  TARGET: "fa-location-crosshairs",
  SELECT: "fa-hand-pointer",
  DISABLE: "fa-eye-slash",
  CHECKER: "fa-magnifying-glass",
  FRIENDSHIP_CARD: "fa-people-group",
  ANGEL_CARD: "fa-shield-halved",
  FORTUNE_TELLER: "fa-magnifying-glass-chart",
  HUSH: "fa-eye-slash",
};

export const TRUMP_RARITIES = {
  COMMON: {
    id: "COMMON",
    name: "Common",
    chance: GAME_CONFIG.TRUMP_RARITY.COMMON,
    color: "#9ca3af",
  },
  UNCOMMON: {
    id: "UNCOMMON",
    name: "Uncommon",
    chance: GAME_CONFIG.TRUMP_RARITY.UNCOMMON,
    color: "#22c55e",
  },
  RARE: {
    id: "RARE",
    name: "Rare",
    chance: GAME_CONFIG.TRUMP_RARITY.RARE,
    color: "#3b82f6",
  },
  LEGENDARY: {
    id: "LEGENDARY",
    name: "Legendary",
    chance: GAME_CONFIG.TRUMP_RARITY.LEGENDARY,
    color: "#eab308",
  },
  MYTHIC: {
    id: "MYTHIC",
    name: "Mythic",
    chance: GAME_CONFIG.TRUMP_RARITY.MYTHIC,
    color: "#a855f7",
  },
};

export const TRUMP_CARDS_CATALOG = {
  // ── COMMON ──────────────────────────────────────────────────────────────
  BET_UP: {
    id: "BET_UP",
    name: "Bet Up",
    rarity: "COMMON",
    description: "Increase total bet by 1.",
    targetType: "NONE",
    effect: { type: "MODIFY_BET", amount: 1 },
  },
  BET_DOWN: {
    id: "BET_DOWN",
    name: "Bet Down",
    rarity: "COMMON",
    description: "Decrease total bet by 1 (Min bet: 0).",
    targetType: "NONE",
    effect: { type: "MODIFY_BET", amount: -1 },
  },

  // ── UNCOMMON ────────────────────────────────────────────────────────────
  DOUBLE_BET_UP: {
    id: "DOUBLE_BET_UP",
    name: "Double Bet Up",
    rarity: "UNCOMMON",
    description: "Increase total bet by 2.",
    targetType: "NONE",
    effect: { type: "MODIFY_BET", amount: 2 },
  },
  DOUBLE_BET_DOWN: {
    id: "DOUBLE_BET_DOWN",
    name: "Double Bet Down",
    rarity: "UNCOMMON",
    description: "Decrease total bet by 2 (Min bet: 0).",
    targetType: "NONE",
    effect: { type: "MODIFY_BET", amount: -2 },
  },
  SHUTTER: {
    id: "SHUTTER",
    name: "Shutter",
    rarity: "UNCOMMON",
    description:
      "Remove the most recently played unresolved Trump Card by another player.",
    targetType: "NONE",
    effect: { type: "CANCEL_LAST_TRUMP" },
  },
  RETURN: {
    id: "RETURN",
    name: "Return",
    rarity: "UNCOMMON",
    description: "Remove your own most recently drawn card.",
    targetType: "NONE",
    effect: { type: "REMOVE_SELF_LAST_CARD" },
  },
  DISCARD: {
    id: "DISCARD",
    name: "Discard",
    rarity: "UNCOMMON",
    description: "Remove the most recently drawn card of a selected player.",
    targetType: "SINGLE_PLAYER",
    effect: { type: "REMOVE_TARGET_LAST_CARD" },
  },

  // ── RARE ────────────────────────────────────────────────────────────────
  REFRESH: {
    id: "REFRESH",
    name: "Refresh",
    rarity: "RARE",
    description:
      "Replace all cards in your hand with 2 new cards from the deck.",
    targetType: "NONE",
    effect: { type: "REFRESH_HAND" },
  },
  EXCHANGE: {
    id: "EXCHANGE",
    name: "Exchange",
    rarity: "RARE",
    description:
      "Swap your last drawn card with a selected player's last drawn card.",
    targetType: "SINGLE_PLAYER",
    effect: { type: "SWAP_LAST_CARDS" },
  },
  TARGET: {
    id: "TARGET",
    name: "Target",
    rarity: "RARE",
    description:
      "Force a selected player to draw 1 additional card (up to 3 max).",
    targetType: "SINGLE_PLAYER",
    effect: { type: "FORCE_DRAW" },
  },
  HUSH: {
    id: "HUSH",
    name: "Hush",
    rarity: "COMMON",
    description: "Draw one card face-down. Other players cannot see its value.",
    targetType: "NONE",
    effect: { type: "DRAW_HIDDEN" },
  },

  // ── LEGENDARY ───────────────────────────────────────────────────────────
  SELECT: {
    id: "SELECT",
    name: "Select",
    rarity: "LEGENDARY",
    description:
      "Choose and draw a specific card rank (Ace through 10) from remaining deck.",
    targetType: "RANK_CHOICE",
    effect: { type: "DRAW_RANK" },
  },
  DISABLE: {
    id: "DISABLE",
    name: "Disable",
    rarity: "LEGENDARY",
    description:
      "Prevent a selected player from taking turns for the remainder of the round.",
    targetType: "SINGLE_PLAYER",
    effect: { type: "SKIP_TURNS_ROUND" },
  },
  CHECKER: {
    id: "CHECKER",
    name: "Checker",
    rarity: "LEGENDARY",
    description:
      "Inspect remaining copies of a selected card rank in the deck (visible only to you).",
    targetType: "RANK_CHOICE",
    effect: { type: "INSPECT_DECK" },
  },

  // ── MYTHIC ──────────────────────────────────────────────────────────────
  FRIENDSHIP_CARD: {
    id: "FRIENDSHIP_CARD",
    name: "Friendship Card",
    rarity: "MYTHIC",
    description:
      "All non-eliminated players (including yourself) draw one additional card.",
    targetType: "ALL_PLAYERS",
    effect: { type: "MASS_DRAW_ALL" },
  },
  ANGEL_CARD: {
    id: "ANGEL_CARD",
    name: "Angel Card",
    rarity: "MYTHIC",
    description:
      "Prevents death when running out of lives. Protection lasts only for the current round.",
    targetType: "SELF",
    effect: { type: "DEATH_PROTECTION" },
  },
  FORTUNE_TELLER: {
    id: "FORTUNE_TELLER",
    name: "Fortune Teller",
    rarity: "COMMON",
    description: "Reveals the next 3 cards in the deck (visible only to you).",
    targetType: "NONE",
    effect: { type: "PEEK_DECK" },
  },
};
