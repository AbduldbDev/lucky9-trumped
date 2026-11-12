// Pure, framework-free game engine.
// HOST runs gameReducer; guests render masked state + their own private secrets.
// SRD §3, §5, §8 edge-case rules are all implemented here.

import { GAME_CONFIG } from "../config/gameRules.config.js";
import {
  TRUMP_CARDS_CATALOG,
  ENABLED_TRUMP_CARDS,
} from "../config/trumpCards.config.js";
import { createDeck, shuffle, handScore, isNatural } from "./deckEngine.js";
import { executeTrump, rollTrumpCard } from "./trumpExecutors.js";

export const PHASES = {
  LOBBY: "lobby",
  PLAYING: "playing",
  COUNTDOWN: "countdown",
  SHOWDOWN: "showdown",
  GAMEOVER: "gameover",
};

const clone = (o) => JSON.parse(JSON.stringify(o));

// ---------------------------------------------------------------------------
// Bet calculation
// The base bet increments every round: round 1 = bet 1, round 2 = bet 2, etc.
// Trump modifiers accumulate on top of the round number.
// Min bet is MIN_BET (0).
// ---------------------------------------------------------------------------
export function computeBetTotal(betModifiers, round = 1) {
  return Math.max(GAME_CONFIG.MIN_BET, round + betModifiers);
}

// ---------------------------------------------------------------------------
// Player factory
// SRD §3.2: 12 lives, STARTING_TRUMP_CARDS trump cards on match start.
// ---------------------------------------------------------------------------
export function createPlayer({ id, name, skinId = "classic_red" }) {
  return {
    id,
    name: String(name || "Player").slice(0, 20),
    skinId,
    lives: GAME_CONFIG.STARTING_LIVES,
    score: 0, // chips accumulated this match
    isEliminated: false,
    isSpectator: false,
    timeoutEliminated: false, // eliminated by timeout (temporary, only current round)
    isReady: false, // ready status in waiting room
    hand: [], // hand[0] = hole card
    trumps: [], // trump card IDs in inventory
    stood: false,
    disabled: false, // DISABLE trump effect — skipped this round
    angelProtected: false, // ANGEL_CARD protection active
    aegisActive: false, // AEGIS shield active (halves life loss this round)
    consecutiveTimeouts: 0, // Track consecutive timeout rounds
    lucky9Awarded: false, // flag: bonus trump card already given this round
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
  // Ensure host is ready when room is created
  hostPlayer.isReady = true;

  return {
    partyCode,
    hostId: hostPlayer.id,
    phase: PHASES.LOBBY,
    round: 0,
    deck: [],
    players: [hostPlayer],
    turnIndex: -1,
    turnStartTime: null, // timestamp when current turn started (for timer abuse prevention)
    pausedForCounter: false, // true when waiting for counter responses
    pauseStartTime: null, // timestamp when pause started (to calculate pause duration)
    totalPauseTime: 0, // accumulated pause time in milliseconds for current turn
    betModifiers: 0,
    trumpLog: [], // for SHATTER tracking
    trumpPlays: [], // recent trump card plays for display (id, trumpId, playerName, timestamp)
    activeTrumpEffects: [], // persistent trump effects (bet modifiers, angel, etc.)
    personalNotifications: {}, // per-player notifications (playerId -> array of notifications)
    checkerResults: {}, // CHECKER results per playerId (private)
    fortuneResults: {}, // FORTUNE_TELLER results per playerId (private)
    oddsResults: {}, // ODDS results per playerId (private)
    counterRequests: {}, // pending counter requests per playerId (playerId -> { attackerId, trumpId, ... })
    counterResponses: {}, // collected counter responses (requestId -> { playerId, accepted })
    rematchVotes: {}, // playerId → boolean (REMATCH_VOTE)
    rematchTimerEnd: null, // epoch ms when rematch vote expires
    intentionalLeavers: [], // track players who intentionally left (so they rejoin as spectators)
    lastResult: null,
    winnerId: null,
    showdownAt: null, // epoch ms when countdown ends → showdown
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
  if (d.phase !== PHASES.PLAYING) throw new Error("Not in a round.");
  const p = d.players[d.turnIndex];
  if (!p || p.id !== by) throw new Error("Not your turn.");
  if (p.isEliminated) throw new Error("You are eliminated.");
  return p;
}

function assertHost(d, by) {
  if (d.hostId !== by) throw new Error("Host only.");
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
  d.trumpPlays = []; // Clear trump card displays for new round
  d.activeTrumpEffects = []; // Clear persistent trump effects for new round
  d.checkerResults = {};
  d.fortuneResults = {}; // Clear fortune teller results for new round
  d.oddsResults = {}; // Clear odds results for new round
  d.personalNotifications = {}; // Clear personal notifications for new round
  d.rematchVotes = {};
  d.rematchTimerEnd = null;
  d.pausedForCounter = false; // Clear counter pause for new round
  d.counterRequests = {}; // Clear any pending counter requests
  d.totalPauseTime = 0; // Reset pause time
  d.pauseStartTime = null;
  d.deck = shuffle(createDeck());
  d.phase = PHASES.PLAYING;

  const activePlayers = d.players.filter(
    (p) => !p.isEliminated && !p.isSpectator,
  );

  for (const p of d.players) {
    p.hand = [];
    p.stood = p.isEliminated || p.isSpectator;
    p.disabled = false;
    p.trumpsDisabled = false; // Clear trump lockdown at start of each round
    p.mirrorActive = false; // Clear mirror shield at start of each round
    p.lucky9Awarded = false;

    // Clear Angel Card protection at the start of each round (only lasts 1 round)
    p.angelProtected = false;
    // Clear Aegis shield at the start of each round (only lasts 1 round)
    p.aegisActive = false;

    // Re-enable timeout-eliminated players (temporary elimination only for previous round)
    if (p.timeoutEliminated && !p.isEliminated) {
      p.timeoutEliminated = false;
      p.isSpectator = false;
      p.stood = false; // They can play this round
    }

    if (p.isEliminated || p.isSpectator) continue;
    // Deal 2 cards: [hole card, up card]
    p.hand.push(d.deck.pop(), d.deck.pop());
    // Check for Lucky 9 with initial cards
    checkLucky9(d, p);
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
  d.turnStartTime = Date.now(); // Set initial turn start time

  // If the designated starter has already stood (shouldn't happen normally), advance
  if (d.players[d.turnIndex]?.stood) advanceTurn(d);

  pushLog(d, `━━ Round ${d.round} · bet ${computeBetTotal(0, d.round)} ━━`);
}

function advanceTurn(d) {
  // Clear counter pause when turn advances
  d.pausedForCounter = false;
  d.counterRequests = {}; // Clear any pending counter requests
  d.totalPauseTime = 0; // Reset pause time for new turn
  d.pauseStartTime = null;

  // Clear odds results when turn advances (banner disappears)
  if (d.oddsResults) {
    d.oddsResults = {};
  }

  const n = d.players.length;
  for (let k = 1; k <= n; k++) {
    const idx = (d.turnIndex + k) % n;
    const p = d.players[idx];
    if (!p.isEliminated && !p.stood && !p.isSpectator) {
      d.turnIndex = idx;
      d.turnStartTime = Date.now(); // Set turn start time for timer
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
  pushLog(
    d,
    `All players stood — revealing in ${GAME_CONFIG.ROUND_RESULT_COUNTDOWN}…`,
  );
}

// SRD §8.7: if only one active player remains mid-round, they win immediately.
function checkSingleActiveRemaining(d) {
  if (d.phase !== PHASES.PLAYING) return;
  const active = d.players.filter(
    (p) => !p.isEliminated && !p.isSpectator && !p.stood,
  );
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

  // Include timeout-eliminated players in showdown (they compete but are eliminated for the round)
  // Only exclude permanently eliminated players
  const active = d.players.filter((p) => !p.isEliminated);

  if (active.length === 0) {
    d.phase = PHASES.SHOWDOWN;
    d.lastResult = {
      round: d.round,
      bet: 0,
      scores: {},
      winnerIds: [],
      loserIds: [],
      eliminatedIds: [],
      naturalIds: [],
      payoutEach: 0,
      draw: true,
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

  // Check if it's a draw among the winners
  // When 2+ winners have same score AND same card count, they draw
  // Losers still lose lives, but winners don't gain lives when tied
  const isDraw =
    winners.length > 1 &&
    winners.every((w) => w.hand.length === winners[0].hand.length);
  const losers = active.filter((p) => !winners.some((w) => w.id === p.id));
  const bet = computeBetTotal(d.betModifiers, d.round);
  const naturalIds = active.filter((p) => isNatural(p.hand)).map((p) => p.id);

  active.forEach((p) => {
    if (naturalIds.includes(p.id)) p.stats.naturals += 1;
  });

  const eliminatedIds = [];

  // Process losers - they always lose lives (even in a winners' draw)
  for (const l of losers) {
    let loss = Math.min(bet, l.lives);

    // Aegis halves the life penalty (odd deductions round up), once per round
    if (l.aegisActive && loss > 0) {
      loss = Math.ceil(loss / 2);
      l.aegisActive = false; // shield consumed
      pushLog(d, `${l.name}'s Aegis halved the life penalty!`);
    }

    l.lives -= loss;

    // SRD §3.3 / §8.6: Angel Card protects from life-loss elimination (not timer)
    if (l.lives <= 0) {
      if (l.angelProtected) {
        l.lives = 0; // stays at 0 but not eliminated yet
        l.angelProtected = false; // protection consumed
        pushLog(d, `${l.name}'s Angel Card saved them from elimination!`);
      } else {
        // Permanent elimination due to running out of lives
        l.isEliminated = true;
        l.isSpectator = true;
        l.stood = true;
        l.timeoutEliminated = false; // Clear timeout flag
        eliminatedIds.push(l.id);
      }
    }
  }

  // Winners only gain lives if it's NOT a draw among winners
  // On a draw: winners get no lives, but losers still lose lives
  const payoutEach =
    !isDraw && winners.length && losers.length
      ? Math.floor((bet * losers.length) / winners.length)
      : 0;
  let livesLostTotal = 0;

  if (!isDraw) {
    for (const l of losers)
      livesLostTotal += Math.min(bet, GAME_CONFIG.STARTING_LIVES);
    for (const w of winners) {
      w.lives += bet; // Winners gain lives
      w.score += payoutEach;
      w.stats.livesTaken += Math.floor(livesLostTotal / winners.length);
    }
  } else {
    // Winners don't gain lives on draw, but still get score from losers if any
    for (const l of losers)
      livesLostTotal += Math.min(bet, GAME_CONFIG.STARTING_LIVES);
    if (losers.length > 0) {
      const scorePerWinner = Math.floor((bet * losers.length) / winners.length);
      for (const w of winners) {
        w.score += scorePerWinner;
      }
    }
  }

  d.lastResult = {
    round: d.round,
    bet,
    scores,
    winnerIds: winners.map((w) => w.id),
    loserIds: losers.map((l) => l.id),
    eliminatedIds,
    naturalIds,
    payoutEach: isDraw ? 0 : payoutEach,
    draw: isDraw, // Draw when winners are tied
  };

  // Award trump cards after round resolution
  // Winners get TRUMP_CARDS_FOR_WINNER, losers get TRUMP_CARDS_FOR_LOSER
  for (const w of winners) {
    for (let i = 0; i < GAME_CONFIG.TRUMP_CARDS_FOR_WINNER; i++) {
      grantTrump(w);
    }
  }

  for (const l of losers) {
    // Only award trump cards to losers who are still in the game (not eliminated)
    if (!l.isEliminated) {
      for (let i = 0; i < GAME_CONFIG.TRUMP_CARDS_FOR_LOSER; i++) {
        grantTrump(l);
      }
    }
  }

  d.turnIndex = -1;
  d.pausedForCounter = false; // Clear counter pause when showdown starts
  d.counterRequests = {}; // Clear any pending counter requests
  d.betModifiers = 0;
  d.phase = PHASES.SHOWDOWN;

  const wNames = winners.map((w) => w.name).join(" & ");

  if (isDraw && losers.length > 0) {
    // Partial draw: winners tied, but there are losers
    pushLog(
      d,
      `${wNames} tied on ${best} (${losers.length} loser(s) lost ${bet}♥)`,
    );
    pushLog(
      d,
      `Winners: +${GAME_CONFIG.TRUMP_CARDS_FOR_WINNER} Trump Cards | Losers: +${GAME_CONFIG.TRUMP_CARDS_FOR_LOSER} Trump Card`,
    );
  } else if (isDraw) {
    // Full draw: everyone tied
    pushLog(d, `Round ${d.round}: Everyone tied on ${best} — no lives lost.`);
    pushLog(
      d,
      `All players: +${GAME_CONFIG.TRUMP_CARDS_FOR_WINNER} Trump Cards`,
    );
  } else {
    // Clear winner(s)
    pushLog(
      d,
      `${wNames} won round ${d.round} with ${best}. Winners +${bet}♥, losers -${bet}♥.`,
    );
    const loserNotEliminated = losers.filter((l) => !l.isEliminated);
    if (loserNotEliminated.length > 0) {
      pushLog(
        d,
        `Winners: +${GAME_CONFIG.TRUMP_CARDS_FOR_WINNER} Trump Cards | Losers: +${GAME_CONFIG.TRUMP_CARDS_FOR_LOSER} Trump Card`,
      );
    } else {
      pushLog(d, `Winners: +${GAME_CONFIG.TRUMP_CARDS_FOR_WINNER} Trump Cards`);
    }
  }

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
    pushLog(d, `🏆 ${remaining[0]?.name ?? "Nobody"} wins the match!`);
    // Start rematch voting timer
    if (GAME_CONFIG.ENABLE_REMATCH) {
      d.rematchTimerEnd = Date.now() + GAME_CONFIG.REMATCH_VOTING_TIMER * 1000;
    }
  }
}

// ---------------------------------------------------------------------------
// Lucky 9 check — award bonus trump when hand first reaches 9 this round
// SRD §8.3: only ONCE per round per player.
// Also creates a personal notification for the player.
// ---------------------------------------------------------------------------
export function checkLucky9(d, player) {
  if (!GAME_CONFIG.TRUMP_CARD_ON_TOTAL_NINE) return;
  if (player.lucky9Awarded) return;

  const score = handScore(player.hand);

  if (score === 9) {
    player.lucky9Awarded = true;
    grantTrump(player);
    pushLog(d, `⭐ ${player.name} hit 9! Bonus Trump Card awarded.`);

    // Create personal notification for the player
    if (!d.personalNotifications) d.personalNotifications = {};
    if (!d.personalNotifications[player.id])
      d.personalNotifications[player.id] = [];

    d.personalNotifications[player.id].push({
      id: `lucky9-${player.id}-${Date.now()}`,
      type: "LUCKY_9",
      title: "Lucky 9!",
      message: "Your hand totals 9! You earned a bonus Trump Card!",
      bonus: "+1 Trump Card",
      timestamp: Date.now(),
    });
  }
}

// ---------------------------------------------------------------------------
// Execute trump with counter responses
// ---------------------------------------------------------------------------
function executeCounteredTrump(d, request) {
  const attacker = d.players.find((p) => p.id === request.attackerId);
  if (!attacker) return;

  const card = TRUMP_CARDS_CATALOG[request.trumpId];
  if (!card) return;

  // Collect who countered with SHATTER
  const countered = Object.keys(request.responses).filter(
    (playerId) => request.responses[playerId]?.useShatter === true,
  );

  // Collect who reflected with MIRROR
  const reflected = Object.keys(request.responses).filter(
    (playerId) => request.responses[playerId]?.useMirror === true,
  );

  // If someone used MIRROR, reflect the trump back to the attacker
  if (reflected.length > 0 && card.targetType === "SINGLE_PLAYER") {
    const reflector = d.players.find((p) => p.id === reflected[0]);

    // Remove the trump card from attacker's inventory (they used it)
    const idx = attacker.trumps.indexOf(request.trumpId);
    if (idx !== -1) {
      attacker.trumps.splice(idx, 1);
      attacker.stats.trumpsPlayed += 1;
    }

    // The trump is now reflected - execute on the original attacker as the target
    const msg = executeTrump(d, attacker, request.trumpId, {
      targetId: request.attackerId, // Reflected back to attacker
      rank: request.rank,
      countered: [], // No longer countered, but reflected
      reflected: true, // Special flag to allow self-targeting
    });

    pushLog(
      d,
      `${reflector.name} countered ${attacker.name} with MIRROR! ${card.name} reflected back!`,
    );
    pushLog(d, msg);

    // Check if attacker was disabled and it's their turn - advance turn to prevent stuck
    const isAttackerTurn = d.players[d.turnIndex]?.id === request.attackerId;
    if (isAttackerTurn && attacker.disabled) {
      pushLog(d, `${attacker.name}'s turn ended (disabled by reflection).`);
      advanceTurn(d);
    }

    // Update the original trump play notification to show it was reflected
    if (d.trumpPlays) {
      const originalPlay = d.trumpPlays.find(
        (tp) =>
          tp.trumpId === request.trumpId &&
          tp.playerId === request.attackerId &&
          !tp.reflected,
      );
      if (originalPlay) {
        originalPlay.reflected = true;
      }
    }

    // Record reflection notification
    d.trumpPlays.push({
      id: `MIRROR-${Date.now()}-${Math.random()}`,
      trumpId: "MIRROR",
      playerId: reflected[0],
      playerName: reflector.name,
      targetId: request.attackerId,
      targetName: attacker.name,
      timestamp: Date.now() + 50,
      countered: false,
      reflected: true,
    });

    // Keep only recent plays
    const now = Date.now();
    d.trumpPlays = d.trumpPlays.filter((tp) => now - tp.timestamp < 10000);

    return;
  }

  // Normal execution (no reflection)
  // Execute the trump with counter information
  const msg = executeTrump(d, attacker, request.trumpId, {
    targetId: request.targetId,
    rank: request.rank,
    countered, // Pass list of players who countered with SHATTER
  });

  // Remove the trump card from attacker's inventory (if not already done in TRUMP handler)
  const idx = attacker.trumps.indexOf(request.trumpId);
  if (idx !== -1) {
    attacker.trumps.splice(idx, 1);
    attacker.stats.trumpsPlayed += 1;
  }

  pushLog(d, msg);

  // Record this trump play for display on table
  if (!d.trumpPlays) d.trumpPlays = [];

  // Don't add the initial trump play notification here - it was already added
  // when the counter request was created. Only add counter notifications.

  // If there were counters, add a SINGLE combined notification for all counters
  if (countered && countered.length > 0) {
    const counterPlayerNames = countered
      .map((counteredPlayerId) => {
        const counterPlayer = d.players.find((p) => p.id === counteredPlayerId);
        return counterPlayer?.name;
      })
      .filter(Boolean); // Remove any undefined names

    if (counterPlayerNames.length > 0) {
      // Create natural language list: "Player1", "Player1 and Player2", or "Player1, Player2 and Player3"
      let playerListText;
      if (counterPlayerNames.length === 1) {
        playerListText = counterPlayerNames[0];
      } else if (counterPlayerNames.length === 2) {
        playerListText = counterPlayerNames.join(" and ");
      } else {
        // 3 or more: "Player1, Player2 and Player3"
        const lastPlayer = counterPlayerNames[counterPlayerNames.length - 1];
        const otherPlayers = counterPlayerNames.slice(0, -1);
        playerListText = `${otherPlayers.join(", ")} and ${lastPlayer}`;
      }

      d.trumpPlays.push({
        id: `COUNTER-${Date.now()}-${Math.random()}`,
        trumpId: "SHATTER",
        playerId: countered[0], // Use first counter's ID for consistency
        playerName: playerListText, // "Player 2 and Player 3"
        targetId: request.attackerId,
        targetName: request.attackerName,
        timestamp: Date.now() + 100, // Slightly later to show after original
        countered: true, // This is a counter notification
        multipleCounters: countered.length > 1, // Flag for multiple counters
      });
    }
  }

  // Keep only recent plays
  const now = Date.now();
  d.trumpPlays = d.trumpPlays.filter((tp) => now - tp.timestamp < 10000);

  // Track persistent effects
  if (!d.activeTrumpEffects) d.activeTrumpEffects = [];
  const persistentEffects = [
    "BET_UP",
    "BET_DOWN",
    "DOUBLE_BET_UP",
    "DOUBLE_BET_DOWN",
    "ANGEL_CARD",
    "AEGIS",
  ];

  if (persistentEffects.includes(request.trumpId)) {
    d.activeTrumpEffects.push({
      id: `${request.attackerId}-${request.trumpId}-${Date.now()}`,
      trumpId: request.trumpId,
      playerId: request.attackerId,
      playerName: request.attackerName,
      targetId: request.targetId || null,
      timestamp: Date.now(),
    });
  }

  // Reset all stood flags
  for (const pl of d.players) {
    if (!pl.isEliminated && !pl.isSpectator && !pl.disabled) {
      pl.stood = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------
const HANDLERS = {
  JOIN(d, { player }) {
    // Check if player was kicked - prevent rejoin
    // if (d.kickedPlayers?.includes(player.id)) {
    //   throw new Error("You have been kicked from this room.");
    // }

    const existingIdx = d.players.findIndex((p) => p.id === player.id);

    // Player already exists - this is a reconnect/refresh
    if (existingIdx !== -1) {
      const existing = d.players[existingIdx];

      // Check if they intentionally left before (tracked in intentionalLeavers)
      if (d.intentionalLeavers?.includes(player.id)) {
        // They left intentionally, now rejoining as spectator
        if (!existing.isSpectator) {
          existing.isSpectator = true;
          existing.isEliminated = true;
          existing.lives = 0;
          existing.stood = true;
          pushLog(d, `${player.name} rejoined as spectator.`);
        }
        return false; // reconnect, state unchanged except for spectator flag
      }

      // Regular reconnect (browser refresh) - welcome them back
      // Ensure host is always ready
      if (player.id === d.hostId && d.phase === PHASES.LOBBY) {
        existing.isReady = true;
      }
      return false; // reconnect, no state change needed
    }

    // New player joining
    if (d.phase !== PHASES.LOBBY) {
      // Game already started - join as spectator
      const spectator = createPlayer(player);
      spectator.isSpectator = true;
      spectator.isEliminated = true;
      spectator.lives = 0;
      d.players.push(spectator);
      pushLog(d, `${player.name} joined as spectator.`);
      return;
    }

    // New player joining in lobby
    if (d.players.length >= GAME_CONFIG.MAX_PLAYERS)
      throw new Error("Room is full.");
    const newPlayer = createPlayer(player);
    // Host is automatically ready
    if (player.id === d.hostId) {
      newPlayer.isReady = true;
    }
    d.players.push(newPlayer);
    pushLog(d, `${player.name} joined.`);
  },

  READY(d, { by }) {
    if (d.phase !== PHASES.LOBBY) throw new Error("Not in lobby.");
    const p = d.players.find((player) => player.id === by);
    if (!p) throw new Error("Player not found.");
    if (p.isReady) return false; // Already ready
    p.isReady = true;
    pushLog(d, `${p.name} is ready.`);
  },

  UNREADY(d, { by }) {
    if (d.phase !== PHASES.LOBBY) throw new Error("Not in lobby.");
    if (by === d.hostId) throw new Error("Host cannot unready.");
    const p = d.players.find((player) => player.id === by);
    if (!p) throw new Error("Player not found.");
    if (!p.isReady) return false; // Already not ready
    p.isReady = false;
    pushLog(d, `${p.name} is not ready.`);
  },

  KICK(d, { by, targetId }) {
    // Only host can kick players
    assertHost(d, by);

    // Can only kick in lobby phase
    if (d.phase !== PHASES.LOBBY) {
      throw new Error("Can only kick players in the lobby.");
    }

    const targetIdx = d.players.findIndex((p) => p.id === targetId);
    if (targetIdx === -1) {
      throw new Error("Player not found.");
    }

    // Cannot kick yourself
    if (targetId === by) {
      throw new Error("Cannot kick yourself.");
    }

    // Cannot kick the host
    if (targetId === d.hostId) {
      throw new Error("Cannot kick the host.");
    }

    const kickedPlayer = d.players[targetIdx];
    pushLog(d, `${kickedPlayer.name} was kicked from the lobby.`);

    // Mark as kicked (so they know they were kicked, not just disconnected)
    if (!d.kickedPlayers) d.kickedPlayers = [];
    d.kickedPlayers.push(targetId);

    // Remove player from the game
    d.players.splice(targetIdx, 1);
  },

  LEAVE(d, { id, intentional }) {
    const idx = d.players.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const p = d.players[idx];

    if (d.phase === PHASES.LOBBY) {
      // In lobby, always remove the player completely
      d.players.splice(idx, 1);
      // Transfer host if the host left
      if (id === d.hostId && d.players.length > 0) {
        d.hostId = d.players[0].id;
        pushLog(d, `${d.players[0].name} is now the host.`);
      }
    } else {
      // During game
      if (intentional) {
        // Track intentional leavers so they rejoin as spectators
        if (!d.intentionalLeavers) d.intentionalLeavers = [];
        if (!d.intentionalLeavers.includes(id)) {
          d.intentionalLeavers.push(id);
        }

        // Mark as spectator/eliminated
        p.isEliminated = true;
        p.isSpectator = true;
        p.lives = 0;
        p.stood = true;
        pushLog(d, `${p.name} left the game.`);

        // Advance turn if it was their turn
        if (d.phase === PHASES.PLAYING) {
          if (d.players[d.turnIndex]?.id === id) advanceTurn(d);
          else checkSingleActiveRemaining(d);
        }
      }
      // If not intentional (shouldn't happen anymore), do nothing - allow reconnect
    }
  },

  START(d, { by }) {
    assertHost(d, by);
    if (d.phase !== PHASES.LOBBY) throw new Error("Already started.");
    if (d.players.length < GAME_CONFIG.MIN_PLAYERS)
      throw new Error("Need more players.");

    // Check if all players are ready
    const notReady = d.players.filter((p) => !p.isReady && !p.isSpectator);
    if (notReady.length > 0) {
      throw new Error(
        `Waiting for players: ${notReady.map((p) => p.name).join(", ")}`,
      );
    }

    // SRD §3.2: grant STARTING_TRUMP_CARDS at match start
    // Clear existing trump cards first (in case of rematch)
    for (const p of d.players) {
      p.trumps = []; // Clear existing trump cards
      for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++) grantTrump(p);
    }
    startRound(d);
  },

  NEXT_ROUND(d, { by, winnerId }) {
    assertHost(d, by);
    if (d.phase !== PHASES.SHOWDOWN)
      throw new Error("Round still in progress.");
    // SRD §3.2: winner goes first next round
    startRound(d, GAME_CONFIG.WINNER_FIRST_NEXT_ROUND ? winnerId : null);
  },

  // SRD §5.2: Rematch — unanimous vote required within 30s timer
  REMATCH_VOTE(d, { by, accept }) {
    if (d.phase !== PHASES.GAMEOVER)
      throw new Error("Match must be over to vote.");
    if (!GAME_CONFIG.ENABLE_REMATCH) return false;
    d.rematchVotes[by] = Boolean(accept);
    const allPlayers = d.players; // all players (not just active) vote
    const yesCount = Object.values(d.rematchVotes).filter(Boolean).length;
    const noCount = Object.values(d.rematchVotes).filter((v) => !v).length;

    const playerName = d.players.find((p) => p.id === by)?.name;

    if (noCount > 0) {
      pushLog(
        d,
        `${playerName} declined rematch. Voting failed — returning to lobby.`,
      );
      // Set flag to destroy room and return all players to lobby
      d.rematchFailed = true;
      d.rematchTimerEnd = null; // Stop timer
      return;
    }
    if (yesCount === allPlayers.length) {
      // Unanimous — reset for rematch
      // SRD §8.10: retain stats, chips, room config; reset match state
      for (const p of d.players) {
        p.lives = GAME_CONFIG.STARTING_LIVES;
        p.isEliminated = false;
        p.isSpectator = false;
        p.stood = false;
        p.timeoutEliminated = false;
        p.hand = [];
        p.disabled = false;
        p.angelProtected = false;
        p.aegisActive = false;
        p.lucky9Awarded = false;
        p.trumps = [];
        for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++)
          grantTrump(p);
      }
      Object.assign(d, {
        phase: PHASES.LOBBY,
        round: 0,
        deck: [],
        turnIndex: -1,
        turnStartTime: null,
        betModifiers: 0,
        trumpLog: [],
        trumpPlays: [],
        activeTrumpEffects: [],
        checkerResults: {},
        fortuneResults: {},
        oddsResults: {},
        personalNotifications: {},
        rematchVotes: {},
        rematchTimerEnd: null,
        rematchFailed: false,
        lastResult: null,
        winnerId: null,
        log: [],
        intentionalLeavers: [], // Clear intentional leavers on rematch
      });
      pushLog(d, "Rematch accepted! Room reset — waiting for host to start.");
    } else {
      pushLog(
        d,
        `${playerName} ${accept ? "accepted" : "declined"} rematch (${yesCount}/${allPlayers.length}).`,
      );
    }
  },

  // Check rematch timer expiration (called by host)
  CHECK_REMATCH_TIMER(d, { by }) {
    assertHost(d, by);
    if (d.phase !== PHASES.GAMEOVER) return false;
    if (!d.rematchTimerEnd) return false;
    if (Date.now() < d.rematchTimerEnd) return false; // Timer not expired yet

    const allPlayers = d.players;
    const yesCount = Object.values(d.rematchVotes).filter(Boolean).length;

    // Timer expired without unanimous vote
    if (yesCount < allPlayers.length) {
      pushLog(d, "Rematch voting timed out — returning to lobby.");
      d.rematchFailed = true;
      d.rematchTimerEnd = null;
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
      p.timeoutEliminated = false;
      p.hand = [];
      p.disabled = false;
      p.angelProtected = false;
      p.aegisActive = false;
      p.lucky9Awarded = false;
      p.trumps = [];
      for (let i = 0; i < GAME_CONFIG.STARTING_TRUMP_CARDS; i++) grantTrump(p);
    }
    Object.assign(d, {
      phase: PHASES.LOBBY,
      round: 0,
      deck: [],
      turnIndex: -1,
      turnStartTime: null,
      betModifiers: 0,
      trumpLog: [],
      trumpPlays: [],
      activeTrumpEffects: [],
      checkerResults: {},
      fortuneResults: {},
      oddsResults: {},
      personalNotifications: {},
      rematchVotes: {},
      rematchTimerEnd: null,
      rematchFailed: false,
      intentionalLeavers: [], // Clear intentional leavers on reset
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
      throw new Error(
        `Hand is full (${GAME_CONFIG.MAX_CARDS_IN_HAND} cards max). Stand or play a Trump Card.`,
      );
    if (!d.deck.length) throw new Error("Deck is empty.");
    p.hand.push(d.deck.pop());
    pushLog(d, `${p.name} drew a card.`);
    checkLucky9(d, p);

    // Reset consecutive timeout counter on successful action
    p.consecutiveTimeouts = 0;

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

    // Reset consecutive timeout counter on successful action
    p.consecutiveTimeouts = 0;

    pushLog(d, `${p.name} stands.`);
    advanceTurn(d);
  },

  // SRD §3.2: timeout → eliminate for current round only (temporary elimination)
  // Angel Card does NOT protect against timeout
  // 2 consecutive timeouts → permanent elimination
  TIMEOUT(d, { by }) {
    const p = d.players.find((x) => x.id === by);
    if (!p || p.isEliminated || p.isSpectator || p.stood) return false;
    if (d.phase !== PHASES.PLAYING) return false;
    if (d.players[d.turnIndex]?.id !== by) return false;

    // Increment consecutive timeout counter
    p.consecutiveTimeouts = (p.consecutiveTimeouts || 0) + 1;

    // Check if this is the 2nd consecutive timeout
    if (p.consecutiveTimeouts >= 2) {
      // Permanent elimination
      p.isEliminated = true;
      p.stood = true;
      p.isSpectator = true;
      pushLog(
        d,
        `${p.name} timed out for the 2nd consecutive round and was permanently eliminated!`,
      );
    } else {
      // Temporary elimination (first timeout)
      p.stood = true;
      p.timeoutEliminated = true;
      p.isSpectator = true; // Temporarily a spectator for this round
      pushLog(
        d,
        `${p.name} timed out and was eliminated from this round! (Warning: 1/2)`,
      );
    }

    // SRD §8.8: track timeout eliminations this round for potential draw
    if (!d.timeoutEliminatedIds) d.timeoutEliminatedIds = [];
    d.timeoutEliminatedIds.push(p.id);

    // Advance to next player's turn
    advanceTurn(d);

    // Explicitly return to commit state changes
    return;
  },

  TRUMP(d, { by, trumpId, targetId, rank }) {
    const p = assertTurn(d, by);
    const idx = p.trumps.indexOf(trumpId);
    if (idx === -1) throw new Error("You don't hold that Trump Card.");

    // Check if player's trump cards are locked down
    if (p.trumpsDisabled) {
      throw new Error("Your trump cards are locked down for this round.");
    }

    // Validate that this trump card is enabled in the game configuration
    const enabledIds = ENABLED_TRUMP_CARDS || [];
    if (enabledIds && enabledIds.length > 0 && !enabledIds.includes(trumpId)) {
      throw new Error(`Trump card ${trumpId} is not enabled in this game.`);
    }

    // Import is at the top of the file, we can access TRUMP_CARDS_CATALOG directly
    const card = TRUMP_CARDS_CATALOG[trumpId];

    if (!card) {
      throw new Error(`Unknown trump card: ${trumpId}`);
    }

    // Check if this trump is counterable
    if (card.counterable) {
      // Determine who can counter based on target type
      const counterTargets = [];

      if (card.targetType === "SINGLE_PLAYER" && targetId) {
        // Single target can counter
        const target = d.players.find((pl) => pl.id === targetId);
        if (target && !target.isEliminated && !target.isSpectator) {
          counterTargets.push(targetId);
        }
      } else if (card.targetType === "ALL_PLAYERS") {
        // All players except actor can counter
        d.players.forEach((pl) => {
          if (pl.id !== by && !pl.isEliminated && !pl.isSpectator) {
            counterTargets.push(pl.id);
          }
        });
      }

      if (counterTargets.length > 0) {
        // Create counter request
        const requestId = `counter-${Date.now()}-${by}-${trumpId}`;
        if (!d.counterRequests) d.counterRequests = {};

        d.counterRequests[requestId] = {
          requestId,
          attackerId: by,
          attackerName: p.name,
          trumpId,
          trumpName: card.name,
          targetId,
          rank,
          counterTargets, // List of player IDs who can counter
          responses: {}, // Will collect responses here
          createdAt: Date.now(),
          expiresAt: Date.now() + 10000, // 10 second timeout
        };

        // Pause timer while waiting for counter responses
        d.pausedForCounter = true;
        d.pauseStartTime = Date.now(); // Record when pause started

        // Show notification immediately when trump is played (before counter responses)
        if (!d.trumpPlays) d.trumpPlays = [];
        const targetPlayer = targetId
          ? d.players.find((pl) => pl.id === targetId)
          : null;

        d.trumpPlays.push({
          id: `${by}-${trumpId}-${Date.now()}`,
          trumpId,
          playerId: by,
          playerName: p.name,
          targetId: targetId || null,
          targetName: targetPlayer?.name || null,
          timestamp: Date.now(),
          countered: false,
        });

        // Don't execute the trump yet - wait for responses
        pushLog(d, `${p.name} played ${card.name}. Waiting for counters...`);
        return;
      }
    }

    // Not counterable or no valid targets - execute immediately
    const msg = executeTrump(d, p, trumpId, { targetId, rank });
    p.trumps.splice(idx, 1);
    p.stats.trumpsPlayed += 1;
    pushLog(d, msg);

    // Record this trump play for display on table
    if (!d.trumpPlays) d.trumpPlays = [];

    // Get target player name if targetId exists
    const targetPlayer = targetId
      ? d.players.find((pl) => pl.id === targetId)
      : null;

    d.trumpPlays.push({
      id: `${by}-${trumpId}-${Date.now()}`,
      trumpId,
      playerId: by,
      playerName: p.name,
      targetId: targetId || null,
      targetName: targetPlayer?.name || null,
      timestamp: Date.now(),
    });

    // Keep only recent plays (last 10 seconds)
    const now = Date.now();
    d.trumpPlays = d.trumpPlays.filter((tp) => now - tp.timestamp < 10000);

    // Track persistent effects (bet modifiers, angel card, etc.)
    if (!d.activeTrumpEffects) d.activeTrumpEffects = [];
    const persistentEffects = [
      "BET_UP",
      "BET_DOWN",
      "DOUBLE_BET_UP",
      "DOUBLE_BET_DOWN",
      "ANGEL_CARD",
      "AEGIS",
    ];

    if (persistentEffects.includes(trumpId)) {
      d.activeTrumpEffects.push({
        id: `${by}-${trumpId}-${Date.now()}`,
        trumpId,
        playerId: by,
        playerName: p.name,
        targetId: targetId || null,
        timestamp: Date.now(),
      });
    }

    // Reset all stood flags when a trump card is played
    // This gives all players another chance to act after trump effects
    for (const pl of d.players) {
      if (!pl.isEliminated && !pl.isSpectator && !pl.disabled) {
        pl.stood = false;
      }
    }
  },

  // Host dispatches this after the 3-second COUNTDOWN overlay expires.
  RESOLVE_SHOWDOWN(d) {
    if (d.phase !== PHASES.COUNTDOWN) throw new Error("Not in countdown.");
    resolveShowdown(d);
  },

  // Player responds to a counter request
  RESPOND_COUNTER(d, { by, requestId, useShatter, useMirror }) {
    if (!d.counterRequests || !d.counterRequests[requestId]) {
      throw new Error("Invalid counter request.");
    }

    const request = d.counterRequests[requestId];

    // Check if this player can respond
    if (!request.counterTargets.includes(by)) {
      throw new Error("You are not a target of this trump card.");
    }

    // Check if already responded
    if (request.responses[by] !== undefined) {
      throw new Error("You have already responded.");
    }

    const responder = d.players.find((p) => p.id === by);

    // Cannot use both SHATTER and MIRROR
    if (useShatter && useMirror) {
      throw new Error("Cannot use both SHATTER and MIRROR.");
    }

    // If using shatter, check if they have it
    if (useShatter) {
      const shatterIdx = responder.trumps.indexOf("SHATTER");
      if (shatterIdx === -1) {
        throw new Error("You don't have a SHATTER card.");
      }

      // Remove SHATTER from their inventory
      responder.trumps.splice(shatterIdx, 1);
      responder.stats.trumpsPlayed += 1;
    }

    // If using mirror, check if they have it in hand
    if (useMirror) {
      // MIRROR cannot counter cards flagged mirrorable: false
      if (TRUMP_CARDS_CATALOG[request.trumpId]?.mirrorable === false) {
        throw new Error("MIRROR cannot counter this Trump Card.");
      }

      const mirrorIdx = responder.trumps.indexOf("MIRROR");
      if (mirrorIdx === -1) {
        throw new Error("You don't have a MIRROR card.");
      }

      // Remove MIRROR from their inventory
      responder.trumps.splice(mirrorIdx, 1);
      responder.stats.trumpsPlayed += 1;
    }

    // Record response (now tracks both shatter and mirror)
    request.responses[by] = { useShatter, useMirror };

    const responseMsg = useMirror
      ? "reflected with MIRROR"
      : useShatter
        ? "used SHATTER to counter"
        : "declined to counter";

    pushLog(d, `${responder.name} ${responseMsg}.`);

    // Check if all responses are in
    const allResponded = request.counterTargets.every(
      (targetId) => request.responses[targetId] !== undefined,
    );

    if (allResponded) {
      // Execute the trump with counter information
      executeCounteredTrump(d, request);
      // Clean up
      delete d.counterRequests[requestId];

      // Calculate and accumulate pause duration
      if (d.pauseStartTime) {
        const pauseDuration = Date.now() - d.pauseStartTime;
        d.totalPauseTime += pauseDuration;
        d.pauseStartTime = null;
      }

      // Resume timer if no more counter requests pending
      if (Object.keys(d.counterRequests).length === 0) {
        d.pausedForCounter = false;
      } else {
        // If there are more counter requests, update pause start time for the next one
        d.pauseStartTime = Date.now();
      }
    }
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
  phase === PHASES.COUNTDOWN ||
  phase === PHASES.SHOWDOWN ||
  phase === PHASES.GAMEOVER;

/**
 * Public state broadcast to all clients.
 * Deck omitted; hole cards hidden from active opponents; trump inventories hidden.
 * HUSH cards (card.hidden) are visible to spectators but hidden from active players.
 */
export function maskState(state) {
  const reveal = isRevealPhase(state.phase);
  const { deck, checkerResults, fortuneResults, oddsResults, ...rest } = state; // strip secrets

  return {
    ...rest,
    deckCount: deck.length,
    checkerResults: {}, // sent via private channel only
    fortuneResults: {}, // sent via private channel only
    oddsResults: {}, // sent via private channel only
    players: state.players.map((p) => ({
      ...p,
      trumpCount: p.trumps.length,
      trumps: [],
      hand: p.hand.map((c, i) => {
        // Hide hole card (index 0) unless in reveal phase
        if (i === 0 && !reveal) return { hidden: true };

        // During reveal phase (showdown/gameover), remove hidden flag from HUSH cards
        if (reveal && c.hidden) {
          const { hidden, ...revealedCard } = c;
          return revealedCard;
        }

        return c;
      }),
    })),
  };
}

/**
 * Private packet for a single player.
 * Spectators get all hole cards + all trump inventories.
 * Active players get their own full hand (no hidden cards) + their own trumps + any CHECKER/FORTUNE result.
 */
export function getPrivate(state, playerId) {
  const me = state.players.find((x) => x.id === playerId);
  if (!me) return { toId: playerId };

  // Get personal notifications for this player
  const personalNotifications = state.personalNotifications?.[playerId] ?? [];

  // Helper to reveal hidden cards (remove hidden flag) for the owner
  const revealHiddenCards = (hand) =>
    hand.map((card) => {
      if (card.hidden) {
        // Remove the hidden flag so the owner can see the card
        const { hidden, ...revealedCard } = card;
        return revealedCard;
      }
      return card;
    });

  // Spectators see everything
  if (me.isSpectator || me.isEliminated) {
    return {
      toId: playerId,
      isSpectator: true,
      hole: me.hand[0] ?? null,
      trumps: me.trumps,
      fullHand: revealHiddenCards(me.hand), // Reveal hidden cards for spectators
      allHands: state.players.map((p) => ({
        id: p.id,
        hand: revealHiddenCards(p.hand), // BUGFIX: Spectators see all cards including HUSH
        trumps: p.trumps,
      })),
      checkerResult: state.checkerResults?.[playerId] ?? null,
      fortuneResult: state.fortuneResults?.[playerId] ?? null,
      oddsResult: state.oddsResults?.[playerId] ?? null,
      oddsResult: state.oddsResults?.[playerId] ?? null,
      personalNotifications,
      waitingForCounterResponse: false, // Spectators don't need this
    };
  }

  return {
    toId: playerId,
    isSpectator: false,
    hole: me.hand[0] ?? null,
    trumps: me.trumps,
    fullHand: revealHiddenCards(me.hand), // Reveal hidden cards (remove hidden flag) for the owner
    allHands: null,
    checkerResult: state.checkerResults?.[playerId] ?? null,
    fortuneResult: state.fortuneResults?.[playerId] ?? null,
    oddsResult: state.oddsResults?.[playerId] ?? null,
    personalNotifications,
    counterRequest: getCounterRequestForPlayer(state, playerId),
    waitingForCounterResponse: isWaitingForCounterResponse(state, playerId),
  };
}

// Helper to get counter request for a specific player
function getCounterRequestForPlayer(state, playerId) {
  if (!state.counterRequests) return null;

  // Find any counter request where this player is a target
  for (const requestId in state.counterRequests) {
    const request = state.counterRequests[requestId];
    if (request.counterTargets.includes(playerId)) {
      // Check if they already responded
      if (request.responses[playerId] !== undefined) continue;

      // Check if they have SHATTER
      const player = state.players.find((p) => p.id === playerId);
      const hasShatter = player && player.trumps.includes("SHATTER");

      // MIRROR cannot counter cards flagged mirrorable: false
      // (e.g. EXCHANGE, FRIENDSHIP_CARD)
      const canMirror =
        TRUMP_CARDS_CATALOG[request.trumpId]?.mirrorable !== false;
      const hasMirror = player && player.trumps.includes("MIRROR") && canMirror;

      // Check if targeted directly
      const isTargeted = request.targetId === playerId;

      return {
        requestId,
        attackerId: request.attackerId,
        attackerName: request.attackerName,
        trumpId: request.trumpId,
        trumpName: request.trumpName,
        hasShatter,
        hasMirror,
        isTargeted,
        expiresAt: request.expiresAt,
      };
    }
  }

  return null;
}

// Helper to check if player is waiting for counter responses
function isWaitingForCounterResponse(state, playerId) {
  if (!state.counterRequests) return false;

  // Check if there's any counter request where this player is the attacker
  for (const requestId in state.counterRequests) {
    const request = state.counterRequests[requestId];
    if (request.attackerId === playerId) {
      return true;
    }
  }

  return false;
}

/** Merge private packet into the public (masked) state. */
export function applyPrivate(pub, priv, selfId) {
  if (!pub || !priv || priv.toId !== selfId) return pub;

  // Spectator: reveal all hands and all trump inventories
  if (priv.isSpectator && priv.allHands) {
    return {
      ...pub,
      checkerResult: priv.checkerResult,
      fortuneResult: priv.fortuneResult,
      oddsResult: priv.oddsResult,
      personalNotifications: priv.personalNotifications,
      counterRequest: priv.counterRequest,
      waitingForCounterResponse: priv.waitingForCounterResponse,
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

  // Active player: reveal own hole card and own hidden cards
  return {
    ...pub,
    checkerResult: priv.checkerResult,
    fortuneResult: priv.fortuneResult,
    oddsResult: priv.oddsResult,
    personalNotifications: priv.personalNotifications,
    counterRequest: priv.counterRequest,
    waitingForCounterResponse: priv.waitingForCounterResponse,
    players: pub.players.map((p) =>
      p.id !== selfId
        ? p
        : {
            ...p,
            trumps: priv.trumps,
            hand: priv.fullHand || p.hand, // Use full hand from private packet
          },
    ),
  };
}

export const viewFor = (state, selfId) =>
  applyPrivate(maskState(state), getPrivate(state, selfId), selfId);
