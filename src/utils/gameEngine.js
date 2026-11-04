// Pure, framework-free game engine.
// HOST runs gameReducer; guests render masked state + their own private secrets.
// SRD §3, §5, §8 edge-case rules are all implemented here.

import { GAME_CONFIG } from '../config/gameRules.config.js';
import { createDeck, shuffle, handScore, isNatural } from './deckEngine.js';
import { executeTrump, rollTrumpCard } from './trumpExecutors.js';

export const PHASES = {
  LOBBY:     'lobby',
  PLAYING:   'playing',
  COUNTDOWN: 'countdown',
  SHOWDOWN:  'showdown',
  GAMEOVER:  'gameover',
};

const clone = (o) => JSON.parse(JSON.stringify(o));

// ---------------------------------------------------------------------------
// Bet calculation
// The base bet increments every round: round 1 = bet 1, round 2 = bet 2, etc.
// Trump modifiers accumulate on top of the round number.
// Min bet is MIN_BET (0).
// ---------------------------------------------------------------------------
export function computeBetTotal(betModifiers, round = 1) {
  return Math.max(
    GAME_CONFIG.MIN_BET,
    round + betModifiers,
  );
}

// ---------------------------------------------------------------------------
// Player factory
// SRD §3.2: 12 lives, STARTING_TRUMP_CARDS trump cards on match start.
// ---------------------------------------------------------------------------
export function createPlayer({ id, name, skinId = 'classic_red' }) {
  return {
    id,
    name: String(name || 'Player').slice(0, 20),
    skinId,
    lives: GAME_CONFIG.STARTING_LIVES,
    score: 0,          // chips accumulated this match
    isEliminated: false,
    isSpectator: false,
    hand: [],          // hand[0] = hole card
    trumps: [],        // trump card IDs in inventory
    stood: false,
    disabled: false,   // DISABLE trump effect — skipped this round
    angelProtected: false, // ANGEL_CARD protection active
    lucky9Awarded: false,  // flag: bonus trump card already given this round
    stats: {
      livesTaken: 0,
      trumpsPlayed: 0,
      naturals: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------
export function createInitialState({ partyCode, hostPlayer }) {
  return {
    partyCode,
    hostId: hostPlayer.id,
    phase: PHASES.LOBBY,
    round: 0,
    deck: [],
    players: [hostPlayer],
    turnIndex: -1,
    betModifiers: 0,
    trumpLog: [],          // for SHUTTER tracking
    checkerResults: {},    // CHECKER results per playerId (private)
    rematchVotes: {},      // playerId → boolean (REMATCH_VOTE)
    rematchTimerEnd: null, // epoch ms when rematch vote expires
    lastResult: null,
    winnerId: null,
    showdownAt: null,    // epoch ms when countdown ends → showdown
    log: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const pushLog = (d, msg) => {
  d.log.push(msg);
  if (d.log.length > 60) d.log.shift();
};

function assertTurn(d, by) {
  if (d.phase !== PHASES.PLAYING) throw new Error('Not in a round.');
  const p = d.players[d.turnIndex];
  if (!p || p.id !== by) throw new Error('Not your turn.');
  if (p.isEliminated) throw new Error('You are eliminated.');
  return p;
}

function assertHost(d, by) {
  if (d.hostId !== by) throw new Error('Host only.');
}

/** Grant a trump card to a player — unlimited inventory. */
function grantTrump(player) {
  player.trumps.push(rollTrumpCard());
}

// ---------------------------------------------------------------------------
// Round lifecycle
// ---------------------------------------------------------------------------
function startRound(d, firstPlayerOverride = null) {
  d.round += 1;
  d.betModifiers = 0;
  d.lastResult = null;
  d.trumpLog = [];
  d.checkerResults = {};
  d.rematchVotes = {};
  d.rematchTimerEnd = null;
  d.deck = shuffle(createDeck());
  d.phase = PHASES.PLAYING;

  const activePlayers = d.players.filter((p) => !p.isEliminated && !p.isSpectator);

  for (const p of d.players) {
    p.hand = [];
    p.stood = p.isEliminated || p.isSpectator;
    p.disabled = false;
    p.lucky9Awarded = false;
    if (p.isEliminated || p.isSpectator) continue;
    // Deal 2 cards: [hole card, up card]
    p.hand.push(d.deck.pop(), d.deck.pop());
    // SRD §3.2: 1 trump card per round (TRUMP_CARDS_PER_ROUND)
    for (let i = 0; i < GAME_CONFIG.TRUMP_CARDS_PER_ROUND; i++) grantTrump(p);
  }

  // Determine first player
  let startIdx = -1;
  if (firstPlayerOverride) {
    startIdx = d.players.findIndex((p) => p.id === firstPlayerOverride);
  }
  if (startIdx === -1) {
    // SRD §3.2: random first player on round 1; winner starts next rounds
    if (GAME_CONFIG.RANDOM_FIRST_PLAYER && d.round === 1) {
      const eligible = d.players
        .map((p, i) => ({ i, p }))
        .filter(({ p }) => !p.isEliminated && !p.isSpectator);
      startIdx = eligible[Math.floor(Math.random() * eligible.length)]?.i ?? 0;
    } else {
      startIdx = d.players.findIndex((p) => !p.isEliminated && !p.isSpectator);
    }
  }

  d.turnIndex = startIdx;
  // If the designated starter has already stood (shouldn't happen normally), advance
  if (d.players[d.turnIndex]?.stood) advanceTurn(d);

  pushLog(d, `━━ Round ${d.round} · bet ${computeBetTotal(0, d.round)} ━━`);
}

function advanceTurn(d) {
  const n = d.players.length;
  for (let k = 1; k <= n; k++) {
    const idx = (d.turnIndex + k) % n;
    const p = d.players[idx];
    if (!p.isEliminated && !p.stood && !p.isSpectator) {
      d.turnIndex = idx;
      return;
    }
  }
  // No eligible players left → countdown then showdown
  triggerShowdown(d);
}

// All active players have stood — start a 3-second countdown overlay
// before the showdown is resolved.  The host owns the timer and
// dispatches RESOLVE_SHOWDOWN when it expires.
function triggerShowdown(d) {
  d.phase = PHASES.COUNTDOWN;
  d.showdownAt = Date.now() + GAME_CONFIG.ROUND_RESULT_COUNTDOWN * 1000;
  pushLog(d, `All players stood — revealing in ${GAME_CONFIG.ROUND_RESULT_COUNTDOWN}…`);
}

// SRD §8.7: if only one active player remains mid-round, they win immediately.
function checkSingleActiveRemaining(d) {
  if (d.phase !== PHASES.PLAYING) return;
  const active = d.players.filter((p) => !p.isEliminated && !p.isSpectator && !p.stood);
  const notElim = d.players.filter((p) => !p.isEliminated && !p.isSpectator);
  if (notElim.length === 1) {
    // Walkover — only one player left, resolve immediately
    resolveShowdown(d);
  } else if (active.length === 0) {
    // Everyone stood → 3-second countdown then showdown
    triggerShowdown(d);
  }
}

// ---------------------------------------------------------------------------
// Showdown / round resolution
// SRD §3.3
// ---------------------------------------------------------------------------
function resolveShowdown(d) {
  d.showdownAt = null;
  const active = d.players.filter((p) => !p.isEliminated && !p.isSpectator);
  if (active.length === 0) {
    d.phase = PHASES.SHOWDOWN;
    d.lastResult = {
      round: d.round, bet: 0, scores: {}, winnerIds: [], loserIds: [],
      eliminatedIds: [], naturalIds: [], payoutEach: 0, draw: true,
    };
    pushLog(d, `Round ${d.round}: No active players — Draw.`);
    checkMatchOver(d);
    return;
  }

  const scores = {};
  active.forEach((p) => (scores[p.id] = handScore(p.hand)));
  const best = Math.max(...Object.values(scores));

  // SRD §3.3 tie-break: highest score → fewer cards → draw
  const withBest = active.filter((p) => scores[p.id] === best);
  const minCards = Math.min(...withBest.map((p) => p.hand.length));
  const winners = withBest.filter((p) => p.hand.length === minCards);
  const losers = active.filter((p) => !winners.some((w) => w.id === p.id));

  const bet = computeBetTotal(d.betModifiers, d.round);
  const naturalIds = active.filter((p) => isNatural(p.hand)).map((p) => p.id);

  active.forEach((p) => {
    if (naturalIds.includes(p.id)) p.stats.naturals += 1;
  });

  const eliminatedIds = [];
  // SRD §8.8: if ALL active players are timer-eliminated → draw, no life loss
  // (handled upstream via TIMEOUT action; here we check if everyone stood already)
  for (const l of losers) {
    const loss = Math.min(bet, l.lives);
    l.lives -= loss;
    // SRD §3.3 / §8.6: Angel Card protects from life-loss elimination (not timer)
    if (l.lives <= 0) {
      if (l.angelProtected) {
        l.lives = 0;         // stays at 0 but not eliminated yet
        l.angelProtected = false; // protection consumed
        pushLog(d, `${l.name}'s Angel Card saved them from elimination!`);
      } else {
        l.isEliminated = true;
        l.isSpectator = true;
        l.stood = true;
        eliminatedIds.push(l.id);
      }
    }
  }

  // SRD §3.2: winner receives chips 100–120 per win
  // The bet is also added to the winner's hearts (can exceed STARTING_LIVES).
  // On a draw (no losers) no lives are exchanged.
  const payoutEach =
    winners.length && losers.length
      ? Math.floor((bet * losers.length) / winners.length)
      : 0;
  let livesLostTotal = 0;
  for (const l of losers) livesLostTotal += Math.min(bet, GAME_CONFIG.STARTING_LIVES);
  for (const w of winners) {
    if (losers.length > 0) w.lives += bet;
    w.score += payoutEach;
    w.stats.livesTaken += Math.floor(livesLostTotal / winners.length);
  }

  d.lastResult = {
    round: d.round,
    bet,
    scores,
    winnerIds: winners.map((w) => w.id),
    loserIds: losers.map((l) => l.id),
    eliminatedIds,
    naturalIds,
    payoutEach,
    draw: winners.length === active.length, // full tie
  };

  d.turnIndex = -1;
  d.betModifiers = 0;
  d.phase = PHASES.SHOWDOWN;

  const wNames = winners.map((w) => w.name).join(' & ');
  pushLog(
    d,
    losers.length
      ? `${wNames} won round ${d.round} with ${best}. Winners +${bet}♥, losers -${bet}♥.`
      : `Round ${d.round}: Everyone tied on ${best} — no lives lost.`,
  );
  eliminatedIds.forEach((id) =>
    pushLog(d, `${d.players.find((p) => p.id === id)?.name} was eliminated!`),
  );

  checkMatchOver(d);
}

function checkMatchOver(d) {
  const remaining = d.players.filter((p) => !p.isEliminated);
  if (remaining.length <= 1) {
    d.phase = PHASES.GAMEOVER;
    d.winnerId = remaining[0]?.id ?? null;
    pushLog(d, `🏆 ${remaining[0]?.name ?? 'Nobody'} wins the match!`);
    // Start rematch voting timer
    if (GAME_CONFIG.ENABLE_REMATCH) {
      d.rematchTimerEnd = Date.now() + GAME_CONFIG.REMATCH_VOTING_TIMER * 1000;
    }
  }
}

// ---------------------------------------------------------------------------
// Lucky 9 check — award bonus trump when hand first reaches 9 this round
// SRD §8.3: only ONCE per round per player.
// ---------------------------------------------------------------------------
function checkLucky9(d, player) {
  if (!GAME_CONFIG.TRUMP_CARD_ON_TOTAL_NINE) return;
  if (player.lucky9Awarded) return;
  if (handScore(player.hand) === 9) {
    player.lucky9Awarded = true;
    grantTrump(player);
    pushLog(d, `⭐ ${player.name} hit 9! Bonus Trump Card awarded.`);
  }
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------
const HANDLERS = {
  JOIN(d, { player }) {
    if (d.players.some((p) => p.id === player.id)) return false; // reconnect
    if (d.phase !== PHASES.LOBBY) throw new Error('Game already started.');
    if (d.players.length >= GAME_CONFIG.MAX_PLAYERS) throw new Error('Room is full.');
    d.players.push(createPlayer(player));
    pushLog(d, `${player.name} joined.`);
  },

  LEAVE(d, { id }) {
    const idx = d.players.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const p = d.players[idx];
    if (d.phase === PHASES.LOBBY) {
      d.players.splice(idx, 1);
      // Transfer host if the host left
      if (id === d.hostId && d.players.length > 0) {
        d.hostId = d.players[0].id;
        pushLog(d, `${d.players[0].name} is now the host.`);
      }
    } else {
      p.isEliminated = true;
      p.isSpectator = true;
      p.lives = 0;
      p.stood = true;
      pushLog(d, `${p.name} left the game.`);
      if (d.phase === PHASES.PLAYING) {
        if (d.players[d.turnIndex]?.id === id) advanceTurn(d);
        else checkSingleActiveRemaining(d);
      }
    }
  },

  START(d, { by }) {
    assertHost(d, by);
    if (d.phase !== PHASES.LOBBY) throw new Error('Already started.');
    if (d.players.length < GAME_CONFIG.MIN_PLAYERS) throw new Error('Need more players.');

    // SRD §3.2: grant STARTING_TRUMP_CARDS at match start
    for (const p of d.players) {
      for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++) grantTrump(p);
    }
    startRound(d);
  },

  NEXT_ROUND(d, { by, winnerId }) {
    assertHost(d, by);
    if (d.phase !== PHASES.SHOWDOWN) throw new Error('Round still in progress.');
    // SRD §3.2: winner goes first next round
    startRound(d, GAME_CONFIG.WINNER_FIRST_NEXT_ROUND ? winnerId : null);
  },

  // SRD §5.2: Rematch — unanimous vote required within 30s timer
  REMATCH_VOTE(d, { by, accept }) {
    if (d.phase !== PHASES.GAMEOVER) throw new Error('Match must be over to vote.');
    if (!GAME_CONFIG.ENABLE_REMATCH) return false;
    d.rematchVotes[by] = Boolean(accept);
    const allPlayers = d.players; // all players (not just active) vote
    const yesCount = Object.values(d.rematchVotes).filter(Boolean).length;
    const noCount = Object.values(d.rematchVotes).filter((v) => !v).length;
    if (noCount > 0) {
      pushLog(d, 'Rematch rejected — a player declined.');
      return; // leave as gameover
    }
    if (yesCount === allPlayers.length) {
      // Unanimous — reset for rematch
      // SRD §8.10: retain stats, chips, room config; reset match state
      for (const p of d.players) {
        p.lives = GAME_CONFIG.STARTING_LIVES;
        p.isEliminated = false;
        p.isSpectator = false;
        p.stood = false;
        p.hand = [];
        p.disabled = false;
        p.angelProtected = false;
        p.lucky9Awarded = false;
        p.trumps = [];
        for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++) grantTrump(p);
      }
      Object.assign(d, {
        phase: PHASES.LOBBY,
        round: 0,
        deck: [],
        turnIndex: -1,
        betModifiers: 0,
        trumpLog: [],
        checkerResults: {},
        rematchVotes: {},
        rematchTimerEnd: null,
        lastResult: null,
        winnerId: null,
        log: [],
      });
      pushLog(d, 'Rematch! Room reset — waiting for host to start.');
    } else {
      pushLog(d, `${d.players.find((p) => p.id === by)?.name} accepted rematch (${yesCount}/${allPlayers.length}).`);
    }
  },

  // Legacy RESET (host forces back to lobby without vote)
  RESET(d, { by }) {
    assertHost(d, by);
    for (const p of d.players) {
      p.lives = GAME_CONFIG.STARTING_LIVES;
      p.isEliminated = false;
      p.isSpectator = false;
      p.stood = false;
      p.hand = [];
      p.disabled = false;
      p.angelProtected = false;
      p.lucky9Awarded = false;
      p.trumps = [];
      for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++) grantTrump(p);
    }
    Object.assign(d, {
      phase: PHASES.LOBBY,
      round: 0,
      deck: [],
      turnIndex: -1,
      betModifiers: 0,
      trumpLog: [],
      checkerResults: {},
      rematchVotes: {},
      rematchTimerEnd: null,
      lastResult: null,
      winnerId: null,
      log: [],
    });
  },

  // HIT: draw one card then immediately pass the turn.
  // At MAX_CARDS_IN_HAND the player cannot hit — they must Stand or play a Trump.
  // The round continues (cycling) until ALL active players have stood.
  HIT(d, { by }) {
    const p = assertTurn(d, by);
    if (p.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND)
      throw new Error(`Hand is full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards max). Stand or play a Trump Card.`);
    if (!d.deck.length) throw new Error('Deck is empty.');
    p.hand.push(d.deck.pop());
    pushLog(d, `${p.name} drew a card.`);
    checkLucky9(d, p);
    // A Hit means someone is still playing — reset all stood flags so
    // stood players get another turn when the cycle comes back.
    // The round only ends when ALL players stand in a single cycle.
    for (const pl of d.players) {
      if (!pl.isEliminated && !pl.isSpectator && !pl.disabled) pl.stood = false;
    }
    advanceTurn(d);
  },

  // STAND: pass the turn.  Standing is temporary — if another player
  // hits later, stood flags reset and you get another turn.
  // The round ends when all players stand in a single cycle.
  STAND(d, { by }) {
    const p = assertTurn(d, by);
    p.stood = true;
    pushLog(d, `${p.name} stands.`);
    advanceTurn(d);
  },

  // SRD §3.2: timeout → eliminate for current round (Angel Card does NOT protect)
  TIMEOUT(d, { by }) {
    const p = d.players.find((x) => x.id === by);
    if (!p || p.isEliminated || p.isSpectator || p.stood) return false;
    if (d.phase !== PHASES.PLAYING) return false;
    if (d.players[d.turnIndex]?.id !== by) return false;
    p.stood = true;
    p.isEliminated = true;
    p.isSpectator = true;
    pushLog(d, `${p.name} timed out and was eliminated!`);
    // SRD §8.8: track timeout eliminations this round for potential draw
    if (!d.timeoutEliminatedIds) d.timeoutEliminatedIds = [];
    d.timeoutEliminatedIds.push(p.id);
    advanceTurn(d);
  },

  TRUMP(d, { by, trumpId, targetId, rank }) {
    const p = assertTurn(d, by);
    // SRD §8.5: no trump plays after standing
    if (p.stood) throw new Error('You have already stood — cannot play Trump Cards.');
    const idx = p.trumps.indexOf(trumpId);
    if (idx === -1) throw new Error("You don't hold that Trump Card.");
    const msg = executeTrump(d, p, trumpId, { targetId, rank });
    p.trumps.splice(idx, 1);
    p.stats.trumpsPlayed += 1;
    pushLog(d, msg);
  },

  // Host dispatches this after the 3-second COUNTDOWN overlay expires.
  RESOLVE_SHOWDOWN(d) {
    if (d.phase !== PHASES.COUNTDOWN) throw new Error('Not in countdown.');
    resolveShowdown(d);
  },
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export function gameReducer(state, action) {
  if (!state) return state;
  const handler = HANDLERS[action?.type];
  if (!handler) return state;
  const draft = clone(state);
  try {
    const result = handler(draft, action);
    return result === false ? state : draft;
  } catch {
    return state;
  }
}

// ---------------------------------------------------------------------------
// Fog-of-war helpers
// SRD §1: hole card (hand[0]) hidden from opponents until showdown.
// SRD §5.1: spectators see all hole cards and all trump inventories.
// ---------------------------------------------------------------------------
const isRevealPhase = (phase) =>
  phase === PHASES.SHOWDOWN || phase === PHASES.GAMEOVER;

/**
 * Public state broadcast to all clients.
 * Deck omitted; hole cards hidden from active opponents; trump inventories hidden.
 */
export function maskState(state) {
  const reveal = isRevealPhase(state.phase);
  const { deck, checkerResults, ...rest } = state; // strip secrets
  return {
    ...rest,
    deckCount: deck.length,
    checkerResults: {}, // sent via private channel only
    players: state.players.map((p) => ({
      ...p,
      trumpCount: p.trumps.length,
      trumps: [],
      hand: p.hand.map((c, i) => (i === 0 && !reveal ? { hidden: true } : c)),
    })),
  };
}

/**
 * Private packet for a single player.
 * Spectators get all hole cards + all trump inventories.
 * Active players get their own hole card + their own trumps + any CHECKER result.
 */
export function getPrivate(state, playerId) {
  const me = state.players.find((x) => x.id === playerId);
  if (!me) return { toId: playerId };

  // Spectators see everything
  if (me.isSpectator || me.isEliminated) {
    return {
      toId: playerId,
      isSpectator: true,
      hole: me.hand[0] ?? null,
      trumps: me.trumps,
      allHands: state.players.map((p) => ({ id: p.id, hand: p.hand, trumps: p.trumps })),
      checkerResult: state.checkerResults?.[playerId] ?? null,
    };
  }

  return {
    toId: playerId,
    isSpectator: false,
    hole: me.hand[0] ?? null,
    trumps: me.trumps,
    allHands: null,
    checkerResult: state.checkerResults?.[playerId] ?? null,
  };
}

/** Merge private packet into the public (masked) state. */
export function applyPrivate(pub, priv, selfId) {
  if (!pub || !priv || priv.toId !== selfId) return pub;

  // Spectator: reveal all hands and all trump inventories
  if (priv.isSpectator && priv.allHands) {
    return {
      ...pub,
      checkerResult: priv.checkerResult,
      players: pub.players.map((p) => {
        const full = priv.allHands.find((h) => h.id === p.id);
        if (!full) return p;
        return {
          ...p,
          trumps: full.trumps,
          hand: full.hand,
        };
      }),
    };
  }

  // Active player: reveal own hole card
  return {
    ...pub,
    checkerResult: priv.checkerResult,
    players: pub.players.map((p) =>
      p.id !== selfId
        ? p
        : {
            ...p,
            trumps: priv.trumps,
            hand: p.hand.map((c, i) =>
              i === 0 && c.hidden && priv.hole ? priv.hole : c,
            ),
          },
    ),
  };
}

export const viewFor = (state, selfId) =>
  applyPrivate(maskState(state), getPrivate(state, selfId), selfId);
