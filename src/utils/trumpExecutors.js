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
  ENABLED_TRUMP_CARDS,
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

  // ── SHATTER ──────────────────────────────────────────────────────────────
  CANCEL_LAST_TRUMP({ draft, actor }) {
    // Destroyable persistent "table" effects placed by opponents
    const TABLE_EFFECTS = ["ANGEL_CARD", "AEGIS"];

    // Newest opponent-placed persistent effect (Angel Card / Aegis shield)
    let effectIdx = -1;
    let effectTime = -1;
    if (draft.activeTrumpEffects) {
      draft.activeTrumpEffects.forEach((e, i) => {
        if (
          e.playerId !== actor.id &&
          TABLE_EFFECTS.includes(e.trumpId) &&
          (e.timestamp || 0) > effectTime
        ) {
          effectTime = e.timestamp || 0;
          effectIdx = i;
        }
      });
    }

    // Newest opponent-placed bet modifier (iterate backwards)
    let logIdx = -1;
    let logTime = -1;
    for (let i = (draft.trumpLog?.length || 0) - 1; i >= 0; i--) {
      const entry = draft.trumpLog[i];
      if (entry.betDelta !== undefined && entry.playerId !== actor.id) {
        logTime = entry.timestamp || 0;
        logIdx = i;
        break;
      }
    }

    // Nothing to destroy
    if (effectIdx === -1 && logIdx === -1) {
      return `${actor.name} used Shatter, but there are no opponent trump effects to cancel.`;
    }

    // Destroy whichever opponent effect was placed most recently
    if (effectTime >= logTime) {
      const target = draft.activeTrumpEffects[effectIdx];
      draft.activeTrumpEffects.splice(effectIdx, 1);

      // Cancel the effect on its owner
      const victim = draft.players.find((p) => p.id === target.playerId);
      const cardName =
        TRUMP_CARDS_CATALOG[target.trumpId]?.name || target.trumpId;
      if (victim) {
        if (target.trumpId === "ANGEL_CARD") victim.angelProtected = false;
        if (target.trumpId === "AEGIS") victim.aegisActive = false;
      }

      return `${actor.name} used Shatter! Destroyed ${target.playerName}'s ${cardName} on the table.`;
    }

    // Bet modifier path (unchanged behavior)
    const targetEntry = draft.trumpLog[logIdx];

    // Remove the entry from trumpLog
    draft.trumpLog.splice(logIdx, 1);

    // Reverse the bet effect
    if (targetEntry.betDelta !== undefined) {
      draft.betModifiers -= targetEntry.betDelta;
    }

    // Remove from active trump effects if it was persistent
    if (draft.activeTrumpEffects) {
      const cancelledCardId = targetEntry.cardId;
      const cancelledPlayerId = targetEntry.playerId;

      // Find and remove the specific effect that matches
      const matchingIdx = draft.activeTrumpEffects.findIndex(
        (e) =>
          e.trumpId === cancelledCardId &&
          e.playerId === cancelledPlayerId &&
          (e.timestamp === targetEntry.timestamp ||
            Math.abs(e.timestamp - (targetEntry.timestamp || 0)) < 100), // Match by timestamp
      );

      if (matchingIdx !== -1) {
        draft.activeTrumpEffects.splice(matchingIdx, 1);
      }
    }

    return `${actor.name} used Shatter! Cancelled ${targetEntry.playerName}'s ${targetEntry.cardName}.`;
  },

  // ── RETURN ───────────────────────────────────────────────────────────────
  REMOVE_SELF_LAST_CARD({ draft, actor }) {
    // BUGFIX: Return message instead of throwing error
    if (actor.hand.length < 2) {
      return `${actor.name} tried to return a card, but only has their hole card remaining.`;
    }

    const card = actor.hand.pop();
    returnToDeck(draft, card);
    return `${actor.name} returned their last drawn card to the deck.`;
  },

  // ── DISCARD ──────────────────────────────────────────────────────────────
  REMOVE_TARGET_LAST_CARD({ draft, actor, target, ctx }) {
    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to discard ${target.name}'s card, but ${target.name} countered with SHATTER!`;
    }

    // BUGFIX: Return message instead of throwing error
    if (target.hand.length < 2) {
      return `${actor.name} tried to discard ${target.name}'s card, but ${target.name} only has their hole card remaining.`;
    }

    const card = target.hand.pop();
    returnToDeck(draft, card);
    return `${actor.name} discarded ${target.name}'s last drawn card.`;
  },

  // ── REFRESH ──────────────────────────────────────────────────────────────
  REFRESH_HAND({ draft, actor }) {
    // BUGFIX: Check deck availability
    if (draft.deck.length < 2) {
      return `${actor.name} tried to refresh their hand, but not enough cards remain in the deck.`;
    }

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
  SWAP_LAST_CARDS({ draft, actor, target, ctx }) {
    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to exchange cards with ${target.name}, but ${target.name} countered with SHATTER!`;
    }

    // BUGFIX: Return message instead of throwing error
    if (actor.hand.length < 1) {
      return `${actor.name} tried to exchange cards, but has no cards to swap.`;
    }

    if (target.hand.length < 1) {
      return `${actor.name} tried to exchange cards with ${target.name}, but ${target.name} has no cards to swap.`;
    }

    const myLast = actor.hand.pop();
    const theirLast = target.hand.pop();
    actor.hand.push(theirLast);
    target.hand.push(myLast);
    // Check Lucky 9 for both players after swap
    checkLucky9(draft, actor);
    checkLucky9(draft, target);
    return `${actor.name} exchanged their last card with ${target.name}.`;
  },

  // ── DEVOUR ─────────────────────────────────────────────────────────────
  STEAL_LIFE({ draft, actor, target, ctx }) {
    const MAX_TRANSFER = 2;

    // Reflected by MIRROR: the effect is reversed — the attacker must
    // transfer up to 2 of their own lives to the reflector (the original
    // target). The transfer is capped by the attacker's remaining lives.
    if (ctx?.reflected && ctx?.reflectedFrom) {
      const reflector = draft.players.find((p) => p.id === ctx.reflectedFrom);
      if (!reflector) throw new Error("Reflector not found.");

      const give = Math.min(MAX_TRANSFER, actor.lives);
      if (give <= 0) {
        return `${actor.name}'s Devour was reversed by MIRROR, but ${actor.name} has no lives to transfer.`;
      }
      actor.lives -= give;
      reflector.lives += give;
      // A player reaching 0 lives through the reversed Devour is NOT
      // eliminated by this card — elimination only happens at showdown.
      return `${actor.name}'s Devour was reversed by MIRROR! ${actor.name} transferred ${give} life${give === 1 ? "" : "s"} to ${reflector.name}.`;
    }

    // Normal steal
    if (!target) throw new Error("Choose a valid opponent.");

    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to devour ${target.name}'s lives, but ${target.name} countered with SHATTER!`;
    }

    // The amount stolen cannot exceed the target's remaining lives
    // (a target with only 1 life loses only 1 life).
    const steal = Math.min(MAX_TRANSFER, target.lives);
    if (steal <= 0) {
      return `${actor.name} tried to devour ${target.name}'s lives, but ${target.name} has no lives left.`;
    }
    target.lives -= steal;
    actor.lives += steal;
    // A player reaching 0 lives through Devour is NOT eliminated by this
    // card — elimination only happens at showdown resolution.
    return `${actor.name} devoured ${steal} life${steal === 1 ? "" : "s"} from ${target.name}!`;
  },

  // ── TARGET ───────────────────────────────────────────────────────────────
  FORCE_DRAW({ draft, target, actor, ctx }) {
    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to force ${target.name} to draw, but ${target.name} countered with SHATTER!`;
    }

    // BUGFIX: Don't crash if target has max cards - just fail gracefully
    if (target.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND) {
      return `${actor.name} tried to force ${target.name} to draw, but ${target.name}'s hand is already full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards).`;
    }

    if (!draft.deck.length) {
      return `${actor.name} tried to force ${target.name} to draw, but the deck is empty.`;
    }

    target.hand.push(draft.deck.pop());
    // Check Lucky 9 for target after forced draw
    checkLucky9(draft, target);
    return `${actor.name} forced ${target.name} to draw a card.`;
  },

  // ── SELECT ───────────────────────────────────────────────────────────────
  DRAW_RANK({ draft, actor, ctx }) {
    // BUGFIX: Return message instead of throwing error
    if (actor.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND) {
      return `${actor.name} tried to select a card, but their hand is already full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards).`;
    }

    if (!SUMMONABLE_RANKS.includes(ctx?.rank)) {
      return `${actor.name} tried to select an invalid rank.`;
    }

    const idx = draft.deck.findIndex((c) => c.rank === ctx.rank);
    if (idx === -1) {
      return `${actor.name} tried to select a ${ctx.rank}, but none remain in the deck.`;
    }

    actor.hand.push(draft.deck.splice(idx, 1)[0]);
    // Check Lucky 9 after drawing selected card
    checkLucky9(draft, actor);
    return `${actor.name} selected a ${ctx.rank} from the deck.`;
  },

  // ── DISABLE ──────────────────────────────────────────────────────────────
  SKIP_TURNS_ROUND({ target, actor, ctx }) {
    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to disable ${target.name}, but ${target.name} countered with SHATTER!`;
    }

    // BUGFIX: Return message instead of throwing error
    if (target.isEliminated) {
      return `${actor.name} tried to disable ${target.name}, but ${target.name} is already eliminated.`;
    }

    target.disabled = true;
    target.stood = true; // treated as stood so advanceTurn skips them
    return `${actor.name} disabled ${target.name} for the rest of this round.`;
  },

  // ── LOCKDOWN ─────────────────────────────────────────────────────────────
  DISABLE_TRUMP({ target, actor, ctx }) {
    // Check if target countered with SHATTER
    if (ctx?.countered && ctx.countered.includes(target.id)) {
      return `${actor.name} tried to lock down ${target.name}'s trump cards, but ${target.name} countered with SHATTER!`;
    }

    // BUGFIX: Return message instead of throwing error
    if (target.isEliminated) {
      return `${actor.name} tried to lock down ${target.name}'s trump cards, but ${target.name} is already eliminated.`;
    }

    target.trumpsDisabled = true;
    return `${actor.name} locked down ${target.name}'s trump cards for the rest of this round!`;
  },

  // ── MIRROR ───────────────────────────────────────────────────────────────
  REFLECT_TRUMP({ actor }) {
    // Activate mirror shield for this player
    // The shield will reflect the next counterable trump targeting them
    actor.mirrorActive = true;
    return `${actor.name} activated Mirror — ready to reflect the next trump card!`;
  },

  // ── CHECKER ──────────────────────────────────────────────────────────────
  INSPECT_DECK({ draft, actor, ctx }) {
    // BUGFIX: Return message instead of throwing error
    if (!SUMMONABLE_RANKS.includes(ctx?.rank)) {
      return `${actor.name} tried to check the deck for an invalid rank.`;
    }

    const count = draft.deck.filter((c) => c.rank === ctx.rank).length;
    // Store the result on a per-player checker field visible only to actor
    if (!draft.checkerResults) draft.checkerResults = {};
    draft.checkerResults[actor.id] = { rank: ctx.rank, count };
    return `${actor.name} checked the deck for ${ctx.rank}.`;
  },

  // ── FRIENDSHIP CARD ──────────────────────────────────────────────────────
  MASS_DRAW_ALL({ draft, actor, ctx }) {
    let drew = 0;
    let skipped = 0;
    const countered = ctx?.countered || [];

    for (const p of draft.players) {
      // Skip only eliminated players (stood players can still draw)
      if (p.isEliminated) continue;

      // Skip players who countered with SHATTER
      if (countered.includes(p.id)) {
        continue;
      }

      // BUGFIX: Check for full hand before attempting to draw
      if (p.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND) {
        skipped++;
        continue;
      }

      if (draft.deck.length > 0) {
        p.hand.push(draft.deck.pop());
        // Check Lucky 9 for each player who drew
        checkLucky9(draft, p);
        drew++;
      }
    }

    const counteredCount = countered.length;
    let msg = `${actor.name} played Friendship Card! ${drew} player(s) drew a card.`;
    if (counteredCount > 0) {
      msg += ` ${counteredCount} player(s) countered with SHATTER.`;
    }
    if (skipped > 0) {
      msg += ` ${skipped} player(s) had full hands.`;
    }
    return msg;
  },

  // ── ANGEL CARD ───────────────────────────────────────────────────────────
  DEATH_PROTECTION({ actor }) {
    // BUGFIX: Return message instead of throwing error
    if (actor.angelProtected) {
      return `${actor.name} tried to activate Angel Card, but protection is already active.`;
    }

    actor.angelProtected = true;
    return `${actor.name} activated Angel Card — protected from death by life loss!`;
  },

  // ── AEGIS ────────────────────────────────────────────────────────────────
  REDUCE_LOSS_PENALTY({ actor }) {
    if (actor.aegisActive) {
      return `${actor.name} tried to activate Aegis, but the shield is already active.`;
    }

    // Consumed by resolveShowdown when the player loses this round:
    // life penalty is halved (odd deductions round up).
    actor.aegisActive = true;
    return `${actor.name} raised Aegis — life penalties are halved if they lose this round!`;
  },

  // ── HUSH ─────────────────────────────────────────────────────────────────
  DRAW_HIDDEN({ draft, actor }) {
    // BUGFIX: Return message instead of throwing error
    if (actor.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND) {
      return `${actor.name} tried to draw a hidden card, but their hand is already full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards).`;
    }

    if (!draft.deck.length) {
      return `${actor.name} tried to draw a hidden card, but the deck is empty.`;
    }

    const card = draft.deck.pop();
    // Mark the card as hidden so it won't be revealed to other players
    card.hidden = true;
    actor.hand.push(card);
    // Check Lucky 9 after drawing hidden card
    checkLucky9(draft, actor);
    return `${actor.name} drew a hidden card.`;
  },

  // ── SACRIFICE ────────────────────────────────────────────────────────────
  SACRIFICE_FOR_TRUMP({ draft, actor }) {
    // Cannot sacrifice if you have 1 or fewer lives remaining
    if (actor.lives <= 1) {
      return `${actor.name} tried to sacrifice lives, but they don't have enough lives (need more than 1).`;
    }

    // Lose 2 lives
    actor.lives -= 2;

    // Gain 2 trump cards
    actor.trumps.push(rollTrumpCard());
    actor.trumps.push(rollTrumpCard());

    return `${actor.name} sacrificed 2 lives and gained 2 trump cards!`;
  },

  // ── ODDS ─────────────────────────────────────────────────────────────────
  CHECK_NEXT_CARD_RANGE({ draft, actor }) {
    // Check if deck has cards
    if (draft.deck.length === 0) {
      return `${actor.name} tried to check the odds, but the deck is empty.`;
    }

    // Get the next card (last card in deck array - cards are popped from end)
    const nextCard = draft.deck[draft.deck.length - 1];

    // Get numeric value for comparison using the rank property
    const cardRank = nextCard.rank;
    let numericValue;

    // Convert card rank to number for comparison
    if (cardRank === "A") {
      numericValue = 1;
    } else if (["10", "J", "Q", "K"].includes(cardRank)) {
      numericValue = 0;
    } else {
      numericValue = parseInt(cardRank, 10);
    }

    // Determine if card is above or below 5
    // Cards: A(1), 2, 3, 4 are LOW (≤5)
    // Cards: 6, 7, 8, 9 are HIGH (>5)
    // Cards: 10, J, Q, K are worth 0 in Lucky 9, so count as LOW
    const range = numericValue > 5 ? "high" : "low";

    // Store the result privately for this player
    if (!draft.oddsResults) draft.oddsResults = {};
    draft.oddsResults[actor.id] = {
      range: range, // "high" or "low"
      timestamp: Date.now(),
    };

    return `${actor.name} used Odds to check the next card range.`;
  },

  // ── FORTUNE TELLER ───────────────────────────────────────────────────────
  PEEK_DECK({ draft, actor }) {
    const peekCount = Math.min(3, draft.deck.length);

    // BUGFIX: Return message instead of throwing error
    if (peekCount === 0) {
      return `${actor.name} tried to peek at the deck, but it is empty.`;
    }

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

  // ── REBIRTH ──────────────────────────────────────────────────────────────
  REFRESH_TRUMP_CARDS({ actor, card }) {
    // NOTE: The played Rebirth card is still in actor.trumps at this point —
    // the engine removes it (at its original index) right after this executor
    // returns. So: count everything, rebuild with `count` fresh rolls, and
    // re-insert Rebirth at its old slot for the engine to consume.
    const playedIdx = actor.trumps.indexOf(card.id);
    const count = actor.trumps.length;

    if (count === 0) {
      return `${actor.name} tried to use Rebirth, but has no trump cards.`;
    }

    // Discard all held trumps and roll the same number of new ones.
    const fresh = [];
    for (let i = 0; i < count; i++) fresh.push(rollTrumpCard());

    // Re-insert Rebirth at its original index so the engine's post-execution
    // splice discards it, leaving exactly `count` new trump cards.
    let slot = playedIdx;
    if (slot === -1) {
      // Defensive fallback (engine always finds the played card, so this
      // shouldn't happen): park Rebirth last so the splice eats it anyway.
      slot = count - 1;
    }
    actor.trumps = [...fresh.slice(0, slot), card.id, ...fresh.slice(slot)];

    return `${actor.name} used Rebirth! Discarded ${count} trump card(s) and drew ${count} new one(s).`;
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
  // Validate that the trump card is enabled
  const enabledIds = ENABLED_TRUMP_CARDS || [];
  if (enabledIds && enabledIds.length > 0 && !enabledIds.includes(trumpId)) {
    throw new Error(`Trump card ${trumpId} is not enabled in this game.`);
  }

  const card = TRUMP_CARDS_CATALOG[trumpId];
  if (!card) throw new Error(`Unknown trump card: ${trumpId}`);
  const exec = EFFECT_EXECUTORS[card.effect.type];
  if (!exec)
    throw new Error(`No executor for effect type: ${card.effect.type}`);

  let target = null;
  if (card.targetType === "SINGLE_PLAYER") {
    // Allow self-targeting when reflected by MIRROR
    if (ctx.reflected && ctx.targetId === actor.id) {
      target = actor;
    } else {
      target = draft.players.find(
        (p) => p.id === ctx.targetId && p.id !== actor.id && !p.isEliminated,
      );
      if (!target) throw new Error("Choose a valid opponent.");
    }
  }

  // For SHATTER we record the bet delta of the last log entry before calling
  if (!draft.trumpLog) draft.trumpLog = [];

  const msg = exec({ draft, actor, target, card, effect: card.effect, ctx });

  // Record this trump in the log (used by SHATTER)
  const betDelta =
    card.effect.type === "MODIFY_BET" ? card.effect.amount : undefined;

  draft.trumpLog.push({
    playerId: actor.id,
    playerName: actor.name,
    cardId: trumpId,
    cardName: card.name,
    betDelta,
    timestamp: Date.now(), // Add timestamp for precise tracking
  });

  return msg;
}

// ---------------------------------------------------------------------------
// Rarity-weighted trump card roll
// ---------------------------------------------------------------------------

/**
 * Roll a random trump card ID based rarity probabilities.
 * Only draws from enabled trump cards specified in ENABLED_TRUMP_CARDS
 */
export function rollTrumpCard(rng = Math.random) {
  const enabledIds = ENABLED_TRUMP_CARDS || [];

  // Get all cards or filter by enabled IDs
  let cards = Object.values(TRUMP_CARDS_CATALOG);

  // If ENABLED_TRUMP_CARDS is specified and not empty, filter cards
  if (enabledIds && enabledIds.length > 0) {
    cards = cards.filter((c) => enabledIds.includes(c.id));

    // Safety check: if no enabled cards, fall back to all cards
    if (cards.length === 0) {
      console.warn(
        "[Lucky9] No enabled trump cards found, falling back to full catalog",
      );
      cards = Object.values(TRUMP_CARDS_CATALOG);
    }
  }

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

  // Filter enabled cards by rarity
  const pool = cards.filter((c) => c.rarity === rarity.id);

  // If no cards of this rarity are enabled, try another rarity
  if (pool.length === 0) {
    // Find any rarity that has enabled cards
    for (const r of rarities) {
      const fallbackPool = cards.filter((c) => c.rarity === r.id);
      if (fallbackPool.length > 0) {
        return fallbackPool[Math.floor(rng() * fallbackPool.length)].id;
      }
    }

    // Ultimate fallback: return any enabled card
    return cards[Math.floor(rng() * cards.length)].id;
  }

  return pool[Math.floor(rng() * pool.length)].id;
}
