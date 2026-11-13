import { GAME_CONFIG } from "./gameRules.config.js";

export const NEW_RELEASE_TRUMP_CARDS = [
  "SACRIFICE",
  "ODDS",
  "MIRROR",
  "LOCKDOWN",
  "AEGIS",
  "REBIRTH",
  "DEVOUR",
  "BOND",
];

export const ENABLED_TRUMP_CARDS = [
  // ── COMMON ──
  "BET_UP",
  "BET_DOWN",
  "SHATTER",
  "SACRIFICE",
  "ODDS",
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
  "MIRROR",
  // ── LEGENDARY ──
  "SELECT",
  "DISABLE",
  "LOCKDOWN",
  "AEGIS",
  // ── MYTHIC ──
  "FRIENDSHIP_CARD",
  "DEVOUR",
  "ANGEL_CARD",
  "FORTUNE_TELLER",
  "REBIRTH",
  "BOND",
];

export const TRUMP_RARITY = {
  COMMON: 35,
  UNCOMMON: 25,
  RARE: 18,
  LEGENDARY: 12,
  MYTHIC: 10,
  SECRET: 0,
};

export const TRUMP_ICONS = {
  BET_UP: "fa-arrow-trend-up",
  BET_DOWN: "fa-arrow-trend-down",
  DOUBLE_BET_UP: "fa-angles-up",
  DOUBLE_BET_DOWN: "fa-angles-down",
  SHATTER: "fa-ban",
  RETURN: "fa-rotate-left",
  DISCARD: "fa-trash-can",
  REFRESH: "fa-arrows-rotate",
  EXCHANGE: "fa-right-left",
  TARGET: "fa-location-crosshairs",
  SELECT: "fa-hand-pointer",
  DISABLE: "fa-eye-slash",
  CHECKER: "fa-magnifying-glass",
  FRIENDSHIP_CARD: "fa-people-group",
  DEVOUR: "fa-skull",
  ANGEL_CARD: "fa-shield-halved",
  FORTUNE_TELLER: "fa-magnifying-glass-chart",
  HUSH: "fa-eye-slash",
  SACRIFICE: "fa-heart-crack",
  LOCKDOWN: "fa-lock",
  AEGIS: "fa-shield-halved",
  MIRROR: "fa-retweet",
  ODDS: "fa-dice",
  REBIRTH: "fa-fire-flame-curved",
  BOND: "fa-link",
};

export const RARITY_COLOR = {
  COMMON: "#6b7280",
  UNCOMMON: "#22c55e",
  RARE: "#3b82f6",
  LEGENDARY: "#eab308",
  MYTHIC: "#a855f7",
  SECRET: "#ffffff",
};

export const TRUMP_RARITIES = {
  COMMON: {
    id: "COMMON",
    name: "Common",
    chance: TRUMP_RARITY.COMMON,
    color: "#6b7280",
  },
  UNCOMMON: {
    id: "UNCOMMON",
    name: "Uncommon",
    chance: TRUMP_RARITY.UNCOMMON,
    color: "#22c55e",
  },
  RARE: {
    id: "RARE",
    name: "Rare",
    chance: TRUMP_RARITY.RARE,
    color: "#3b82f6",
  },
  LEGENDARY: {
    id: "LEGENDARY",
    name: "Legendary",
    chance: TRUMP_RARITY.LEGENDARY,
    color: "#eab308",
  },
  MYTHIC: {
    id: "MYTHIC",
    name: "Mythic",
    chance: TRUMP_RARITY.MYTHIC,
    color: "#a855f7",
  },
  SECRET: {
    id: "SECRET",
    name: "Secret",
    chance: TRUMP_RARITY.SECRET,
    color: "#ffffff",
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
  SHATTER: {
    id: "SHATTER",
    name: "Shatter",
    rarity: "COMMON",
    description:
      "Destroy an opponent's Trump Card effect on the table (bet changes, Angel Card, Aegis) or counter their Trump Card, canceling its effect.",
    targetType: "NONE",
    effect: { type: "CANCEL_LAST_TRUMP" },
  },
  SACRIFICE: {
    id: "SACRIFICE",
    name: "Sacrifice",
    rarity: "COMMON",
    description:
      "Lose 2 lives to gain 2 trump cards. Cannot be used if you have 1 or fewer lives remaining.",
    targetType: "SELF",
    effect: { type: "SACRIFICE_FOR_TRUMP" },
  },
  ODDS: {
    id: "ODDS",
    name: "Odds",
    rarity: "COMMON",
    description:
      "Check whether the next card in the deck is above or below 5 without revealing its exact value.",
    targetType: "NONE",
    effect: { type: "CHECK_NEXT_CARD_RANGE" },
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
    counterable: true, // Can be blocked by SHATTER
    effect: { type: "REMOVE_TARGET_LAST_CARD" },
  },
  HUSH: {
    id: "HUSH",
    name: "Hush",
    rarity: "UNCOMMON",
    description: "Draw one card face-down. Other players cannot see its value.",
    targetType: "NONE",
    effect: { type: "DRAW_HIDDEN" },
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
    counterable: true, // Can be blocked by SHATTER
    mirrorable: false, // Cannot be countered with MIRROR
    effect: { type: "SWAP_LAST_CARDS" },
  },

  TARGET: {
    id: "TARGET",
    name: "Target",
    rarity: "RARE",
    description: "Force a selected player to draw 1 additional card.",
    targetType: "SINGLE_PLAYER",
    counterable: true, // Can be blocked by SHATTER
    effect: { type: "FORCE_DRAW" },
  },
  CHECKER: {
    id: "CHECKER",
    name: "Checker",
    rarity: "RARE",
    description:
      "Inspect remaining copies of a selected card rank in the deck (visible only to you).",
    targetType: "RANK_CHOICE",
    effect: { type: "INSPECT_DECK" },
  },
  MIRROR: {
    id: "MIRROR",
    name: "Mirror",
    rarity: "RARE",
    description:
      "Use when countering to reflect a trump card targeting you back to its original user.",
    targetType: "COUNTER", // Special type - only usable as counter
    effect: { type: "REFLECT_COUNTER" },
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
    counterable: true, // Can be blocked by SHATTER
    effect: { type: "SKIP_TURNS_ROUND" },
  },
  FORTUNE_TELLER: {
    id: "FORTUNE_TELLER",
    name: "Fortune Teller",
    rarity: "LEGENDARY",
    description: "Reveals the next 3 cards in the deck (visible only to you).",
    targetType: "NONE",
    effect: { type: "PEEK_DECK" },
  },
  LOCKDOWN: {
    id: "LOCKDOWN",
    name: "Lockdown",
    rarity: "LEGENDARY",
    description:
      "Prevent a selected player from using Trump Cards for the remainder of the round.",
    targetType: "SINGLE_PLAYER",
    counterable: true, // Can be blocked by SHATTER
    effect: { type: "DISABLE_TRUMP" },
  },
  AEGIS: {
    id: "AEGIS",
    name: "Aegis",
    rarity: "LEGENDARY",
    description:
      "Halve the life penalty when you lose this round's showdown (deductions round up). Lasts for the current round. Can be destroyed by Shatter.",
    targetType: "SELF",
    effect: { type: "REDUCE_LOSS_PENALTY" },
  },

  // ── MYTHIC ──────────────────────────────────────────────────────────────
  FRIENDSHIP_CARD: {
    id: "FRIENDSHIP_CARD",
    name: "Friendship Card",
    rarity: "MYTHIC",
    description:
      "All non-eliminated players (including yourself) draw one additional card.",
    targetType: "ALL_PLAYERS",
    counterable: true, // Can be blocked by SHATTER (each player decides)
    mirrorable: false, // Cannot be countered with MIRROR
    effect: { type: "MASS_DRAW_ALL" },
  },
  ANGEL_CARD: {
    id: "ANGEL_CARD",
    name: "Angel Card",
    rarity: "MYTHIC",
    description:
      "Prevents death when running out of lives. Protection lasts only for the current round. Can be destroyed by Shatter.",
    targetType: "SELF",
    effect: { type: "DEATH_PROTECTION" },
  },
  DEVOUR: {
    id: "DEVOUR",
    name: "Devour",
    rarity: "MYTHIC",
    description:
      "Steal up to 2 lives from a selected player and transfer them to yourself. The amount stolen cannot exceed the target's remaining lives.",
    targetType: "SINGLE_PLAYER",
    counterable: true, // Can be blocked by SHATTER / reflected by MIRROR
    effect: { type: "STEAL_LIFE" },
  },
  REBIRTH: {
    id: "REBIRTH",
    name: "Rebirth",
    rarity: "MYTHIC",
    description:
      "Discard all Trump Cards in your hand, and replace with the same amount of new Trump Cards.",
    targetType: "SELF",
    effect: { type: "REFRESH_TRUMP_CARDS" },
  },
  BOND: {
    id: "BOND",
    name: "Bond",
    rarity: "MYTHIC",
    description:
      "Bond two players for 3 rounds. Negative targeted Trump effects are shared equally. Either can use SHATTER to counter, if both counter, no bond forms.",
    targetType: "TWO_PLAYERS",
    counterable: true, // Both targets can counter with SHATTER
    mirrorable: false, // Cannot be reflected with MIRROR
    effect: { type: "CREATE_BOND", duration: 3 },
  },
};

/**
 * Helper to determine which players can counter a trump card
 */
export function getCounterableTargets(
  trumpId,
  actorId,
  targetId,
  allPlayers,
  target2Id = null,
) {
  const card = TRUMP_CARDS_CATALOG[trumpId];
  if (!card || !card.counterable) return [];

  const targets = [];

  if (card.targetType === "SINGLE_PLAYER" && targetId) {
    // Single target can counter
    targets.push(targetId);
  } else if (card.targetType === "TWO_PLAYERS" && targetId && target2Id) {
    // Both targets can counter
    targets.push(targetId);
    targets.push(target2Id);
  } else if (card.targetType === "ALL_PLAYERS") {
    // All players except actor can counter
    allPlayers.forEach((p) => {
      if (p.id !== actorId && !p.isEliminated && !p.isSpectator) {
        targets.push(p.id);
      }
    });
  }

  return targets;
}
