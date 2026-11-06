// Trump Card effect executors.
// Each executor receives { draft, actor, target, card, effect, ctx } and
// MUTATES the draft state, then returns a log message string.
// Throws Error on invalid plays — the reducer discards the draft on error.
//
// SRD §4.2 defines all 15 trump cards and their effect.type values.

import { GAME_CONFIG } from "../config/gameRules.config.js";
import {
  TRUMP_CARDS_CATALOG,
  TRUMP_RARITIES,
} from "../config/trumpCards.config.js";
import { SUMMONABLE_RANKS } from "./deckEngine.js";
import { checkLucky9 } from "./gameEngine.js";

const randInt = (n) => Math.floor(Math.random() * n);

/** Insert a card back into the deck at a random position. */
function returnToDeck(draft, card) {
  if (!card || card.hidden) return;
  draft.deck.splice(randInt(draft.deck.length + 1), 0, card);
}

// ---------------------------------------------------------------------------
// Effect executors keyed by effect.type
// ---------------------------------------------------------------------------
export const EFFECT_EXECUTORS = {
  // ── BET_UP / BET_DOWN / DOUBLE_BET_UP / DOUBLE_BET_DOWN ─────────────────
  MODIFY_BET({ draft, actor, effect }) {
    // betModifiers accumulates freely (e.g. two BET_DOWN → -2).
    // computeBetTotal clamps the effective bet to MIN_BET at resolution time,
    // so we do NOT clamp here — that would erase subsequent reductions.
    draft.betModifiers += effect.amount;
    const sign = effect.amount > 0 ? "+" : "";
    return `${actor.name} changed the bet pool (${sign}${effect.amount}).`;
  },

  // ── SHUTTER ──────────────────────────────────────────────────────────────
  CANCEL_LAST_TRUMP({ draft, actor }) {
    // Find the most recent trump log entry placed by someone else this round
    // We track a trumpLog array on the state for this purpose.
    if (!draft.trumpLog || draft.trumpLog.length === 0)
      throw new Error("No unresolved Trump Card to cancel.");
    const last = draft.trumpLog[draft.trumpLog.length - 1];
    if (last.playerId === actor.id)
      throw new Error("You can only cancel another player's Trump Card.");
    draft.trumpLog.pop();
    // Reverse the effect that was logged
    if (last.betDelta !== undefined) {
      draft.betModifiers -= last.betDelta;
    }

    // Remove from active trump effects if it was persistent
    if (draft.activeTrumpEffects) {
      const cancelledCardId = last.cardId;
      const cancelledPlayerId = last.playerId;
      // Remove the most recent matching active effect from that player
      const matchingIdx = [...draft.activeTrumpEffects]
        .reverse()
        .findIndex(
          (e) =>
            e.trumpId === cancelledCardId && e.playerId === cancelledPlayerId,
        );

      if (matchingIdx !== -1) {
        const actualIdx = draft.activeTrumpEffects.length - 1 - matchingIdx;
        draft.activeTrumpEffects.splice(actualIdx, 1);
      }
    }

    return `${actor.name} used Shutter! Cancelled ${last.playerName}'s ${last.cardName}.`;
  },

  // ── RETURN ───────────────────────────────────────────────────────────────
  REMOVE_SELF_LAST_CARD({ draft, actor }) {
    if (actor.hand.length < 2)
      throw new Error("No drawn card to return (hole card stays).");
    const card = actor.hand.pop();
    returnToDeck(draft, card);
    return `${actor.name} returned their last drawn card to the deck.`;
  },

  // ── DISCARD ──────────────────────────────────────────────────────────────
  REMOVE_TARGET_LAST_CARD({ draft, actor, target }) {
    if (target.hand.length < 2)
      throw new Error("Target has no drawn card to discard (only hole card).");
    const card = target.hand.pop();
    returnToDeck(draft, card);
    return `${actor.name} discarded ${target.name}'s last drawn card.`;
  },

  // ── REFRESH ──────────────────────────────────────────────────────────────
  REFRESH_HAND({ draft, actor }) {
    if (draft.deck.length < 2)
      throw new Error("Not enough cards in deck to refresh.");
    // Return all current cards to deck
    for (const c of actor.hand) returnToDeck(draft, c);
    actor.hand = [];
    // Draw exactly 2 new cards
    actor.hand.push(draft.deck.pop(), draft.deck.pop());
    // Check for Lucky 9 after drawing new cards
    checkLucky9(draft, actor);
    return `${actor.name} refreshed their hand with 2 new cards.`;
  },

  // ── EXCHANGE ─────────────────────────────────────────────────────────────
  SWAP_LAST_CARDS({ draft, actor, target }) {
    if (actor.hand.length < 1) throw new Error("You have no card to swap.");
    if (target.hand.length < 1) throw new Error("Target has no card to swap.");
    const myLast = actor.hand.pop();
    const theirLast = target.hand.pop();
    actor.hand.push(theirLast);
    target.hand.push(myLast);
    // Check Lucky 9 for both players after swap
    checkLucky9(draft, actor);
    checkLucky9(draft, target);
    return `${actor.name} exchanged their last card with ${target.name}.`;
  },

  // ── TARGET ───────────────────────────────────────────────────────────────
  FORCE_DRAW({ draft, target, actor }) {
    if (target.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND)
      throw new Error(
        `${target.name}'s hand is already full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards max).`,
      );
    if (!draft.deck.length) throw new Error("Deck is empty.");
    target.hand.push(draft.deck.pop());
    // Check Lucky 9 for target after forced draw
    checkLucky9(draft, target);
    return `${actor.name} forced ${target.name} to draw a card.`;
  },

  // ── SELECT ───────────────────────────────────────────────────────────────
  DRAW_RANK({ draft, actor, ctx }) {
    if (actor.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND)
      throw new Error(
        `Your hand is full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards max).`,
      );
    if (!SUMMONABLE_RANKS.includes(ctx?.rank))
      throw new Error("Choose a rank from Ace to 10.");
    const idx = draft.deck.findIndex((c) => c.rank === ctx.rank);
    if (idx === -1) throw new Error(`No ${ctx.rank} remaining in the deck.`);
    actor.hand.push(draft.deck.splice(idx, 1)[0]);
    // Check Lucky 9 after drawing selected card
    checkLucky9(draft, actor);
    return `${actor.name} selected a ${ctx.rank} from the deck.`;
  },

  // ── DISABLE ──────────────────────────────────────────────────────────────
  SKIP_TURNS_ROUND({ target, actor }) {
    if (target.isEliminated) throw new Error("Target is already eliminated.");
    target.disabled = true;
    target.stood = true; // treated as stood so advanceTurn skips them
    return `${actor.name} disabled ${target.name} for the rest of this round.`;
  },

  // ── CHECKER ──────────────────────────────────────────────────────────────
  INSPECT_DECK({ draft, actor, ctx }) {
    if (!SUMMONABLE_RANKS.includes(ctx?.rank))
      throw new Error("Choose a rank from Ace to 10.");
    const count = draft.deck.filter((c) => c.rank === ctx.rank).length;
    // Store the result on a per-player checker field visible only to actor
    if (!draft.checkerResults) draft.checkerResults = {};
    draft.checkerResults[actor.id] = { rank: ctx.rank, count };
    return `${actor.name} checked the deck for ${ctx.rank}.`;
  },

  // ── FRIENDSHIP CARD ──────────────────────────────────────────────────────
  MASS_DRAW_ALL({ draft, actor }) {
    let drew = 0;
    for (const p of draft.players) {
      // Skip only eliminated players (stood players can still draw)
      if (p.isEliminated) continue;
      if (p.hand.length < GAME_CONFIG.MAX_CARDS_IN_HAND && draft.deck.length) {
        p.hand.push(draft.deck.pop());
        // Check Lucky 9 for each player who drew
        checkLucky9(draft, p);
        drew++;
      }
    }
    return `${actor.name} played Friendship Card! ${drew} player(s) drew a card.`;
  },

  // ── ANGEL CARD ───────────────────────────────────────────────────────────
  DEATH_PROTECTION({ actor }) {
    if (actor.angelProtected)
      throw new Error("Angel Card protection is already active.");
    actor.angelProtected = true;
    return `${actor.name} activated Angel Card — protected from death by life loss!`;
  },

  // ── HUSH ─────────────────────────────────────────────────────────────────
  DRAW_HIDDEN({ draft, actor }) {
    if (actor.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND)
      throw new Error(
        `Your hand is full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards max).`,
      );
    if (!draft.deck.length) throw new Error("Deck is empty.");
    const card = draft.deck.pop();
    // Mark the card as hidden so it won't be revealed to other players
    card.hidden = true;
    actor.hand.push(card);
    // Check Lucky 9 after drawing hidden card
    checkLucky9(draft, actor);
    return `${actor.name} drew a hidden card.`;
  },

  // ── FORTUNE TELLER ───────────────────────────────────────────────────────
  PEEK_DECK({ draft, actor }) {
    const peekCount = Math.min(3, draft.deck.length);
    if (peekCount === 0) throw new Error("Deck is empty.");

    // Get the next cards that would be drawn (last cards in deck array)
    const nextCards = draft.deck.slice(-peekCount).reverse();

    // Store the card IDs so we can track when they've been drawn
    const cardIds = nextCards.map((c) => c.id);

    // Store the result on a per-player fortune field visible only to actor
    if (!draft.fortuneResults) draft.fortuneResults = {};
    draft.fortuneResults[actor.id] = {
      cards: nextCards,
      cardIds: cardIds, // Track which cards were revealed
      initialDeckCount: draft.deck.length, // Store current deck count
      timestamp: Date.now(),
    };

    return `${actor.name} used Fortune Teller to peek at the next ${peekCount} card(s) in the deck.`;
  },
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Execute a trump card effect on the draft state.
 * @param {object} draft  - mutable game state clone
 * @param {object} actor  - player object from draft.players (by reference)
 * @param {string} trumpId
 * @param {object} ctx    - { targetId, rank } optional extras
 * @returns {string} log message
 */
export function executeTrump(draft, actor, trumpId, ctx = {}) {
  const card = TRUMP_CARDS_CATALOG[trumpId];
  if (!card) throw new Error(`Unknown trump card: ${trumpId}`);
  const exec = EFFECT_EXECUTORS[card.effect.type];
  if (!exec)
    throw new Error(`No executor for effect type: ${card.effect.type}`);

  let target = null;
  if (card.targetType === "SINGLE_PLAYER") {
    target = draft.players.find(
      (p) => p.id === ctx.targetId && p.id !== actor.id && !p.isEliminated,
    );
    if (!target) throw new Error("Choose a valid opponent.");
  }

  // For SHUTTER we record the bet delta of the last log entry before calling
  if (!draft.trumpLog) draft.trumpLog = [];

  const msg = exec({ draft, actor, target, card, effect: card.effect, ctx });

  // Record this trump in the log (used by SHUTTER)
  const betDelta =
    card.effect.type === "MODIFY_BET" ? card.effect.amount : undefined;

  draft.trumpLog.push({
    playerId: actor.id,
    playerName: actor.name,
    cardId: trumpId,
    cardName: card.name,
    betDelta,
  });

  return msg;
}

// ---------------------------------------------------------------------------
// Rarity-weighted trump card roll
// ---------------------------------------------------------------------------

/**
 * Roll a random trump card ID based on SRD rarity probabilities.
 * Total weights: COMMON 45, UNCOMMON 27, RARE 17, LEGENDARY 8, MYTHIC 3 = 100
 */
export function rollTrumpCard(rng = Math.random) {
  const cards = Object.values(TRUMP_CARDS_CATALOG);
  const rarities = Object.values(TRUMP_RARITIES);
  const total = rarities.reduce((s, r) => s + r.chance, 0);
  let roll = rng() * total;
  let rarity = rarities[rarities.length - 1];
  for (const r of rarities) {
    roll -= r.chance;
    if (roll < 0) {
      rarity = r;
      break;
    }
  }
  const pool = cards.filter((c) => c.rarity === rarity.id);
  return pool[Math.floor(rng() * pool.length)].id;
}
