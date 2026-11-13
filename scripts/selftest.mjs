// Headless self-test: plays full randomized matches and checks invariants.
// Run with `npm test`.

import assert from "node:assert/strict";
import {
  cardValue,
  handScore,
  createDeck,
  exposedSum,
  isNatural,
} from "../src/utils/deckEngine.js";
import {
  createInitialState,
  createPlayer,
  gameReducer,
  maskState,
  viewFor,
  computeBetTotal,
  PHASES,
} from "../src/utils/gameEngine.js";
import {
  TRUMP_CARDS_CATALOG,
  TRUMP_RARITIES,
} from "../src/config/trumpCards.config.js";
import { GAME_CONFIG } from "../src/config/gameRules.config.js";
import { rollTrumpCard } from "../src/utils/trumpExecutors.js";
import { getShopItem } from "../src/config/trumpShop.config.js";

const MAX_HAND = GAME_CONFIG.MAX_CARDS_IN_HAND; // 5

// ─── Card scoring ────────────────────────────────────────────────────────────
const c = (rank, suit = "♠") => ({ id: rank + suit, rank, suit });
assert.equal(cardValue(c("A")), 1);
assert.equal(cardValue(c("9")), 9);
for (const r of ["10", "J", "Q", "K"])
  assert.equal(cardValue(c(r)), 0, `${r}=0`);
assert.equal(handScore([c("7"), c("8")]), 5);
assert.equal(handScore([c("K"), c("9")]), 9);
assert.equal(handScore([c("9"), c("9"), c("9")]), 7);
assert.equal(exposedSum([c("7"), c("8"), c("4")]), 2);
assert.ok(isNatural([c("4"), c("5")]));
assert.ok(!isNatural([c("2"), c("3"), c("4")]));
assert.equal(createDeck().length, 52);

// ─── Bet computation ─────────────────────────────────────────────────────────
assert.equal(computeBetTotal(0), 1);
assert.equal(computeBetTotal(2), 3);
assert.equal(computeBetTotal(-1), 0);
assert.equal(computeBetTotal(-9), 0);

// ─── Starting lives = 12 ─────────────────────────────────────────────────────
{
  const p = createPlayer({ id: "x", name: "X" });
  assert.equal(p.lives, 12);
  assert.equal(p.lives, GAME_CONFIG.STARTING_LIVES);
}

// ─── MAX_CARDS_IN_HAND from config ───────────────────────────────────────────
assert.equal(GAME_CONFIG.MAX_CARDS_IN_HAND, 5, "MAX_CARDS_IN_HAND = 5");

// ─── Trump catalog — all enabled cards ──────────────────────────────────────
const EXPECTED = [
  // COMMON
  "BET_UP",
  "BET_DOWN",
  "SHATTER",
  "SACRIFICE",
  "ODDS",
  // UNCOMMON
  "DOUBLE_BET_UP",
  "DOUBLE_BET_DOWN",
  "RETURN",
  "DISCARD",
  "HUSH",
  // RARE
  "REFRESH",
  "EXCHANGE",
  "TARGET",
  "CHECKER",
  "MIRROR",
  // LEGENDARY
  "SELECT",
  "DISABLE",
  "LOCKDOWN",
  "AEGIS",
  // MYTHIC
  "FRIENDSHIP_CARD",
  "DEVOUR",
  "ANGEL_CARD",
  "FORTUNE_TELLER",
  "REBIRTH",
  "BOND",
];
for (const id of EXPECTED) assert.ok(TRUMP_CARDS_CATALOG[id], `missing: ${id}`);
assert.equal(Object.keys(TRUMP_CARDS_CATALOG).length, 25);

// ─── Rarity total = 100 ──────────────────────────────────────────────────────
const totalChance = Object.values(TRUMP_RARITIES).reduce(
  (s, r) => s + r.chance,
  0,
);
assert.equal(totalChance, 100);

// ─── Trump roll always valid ──────────────────────────────────────────────────
const trumpIds = Object.keys(TRUMP_CARDS_CATALOG);
for (let i = 0; i < 500; i++) assert.ok(trumpIds.includes(rollTrumpCard()));

// ─── Fog of war ──────────────────────────────────────────────────────────────
{
  let s = createInitialState({
    partyCode: "TEST22",
    hostPlayer: createPlayer({ id: "a", name: "A" }),
  });
  s = gameReducer(s, { type: "JOIN", player: { id: "b", name: "B" } });
  s = gameReducer(s, { type: "READY", by: "b" });
  s = gameReducer(s, { type: "START", by: "a" });
  assert.equal(s.phase, PHASES.PLAYING);
  const pub = maskState(s);
  assert.ok(!("deck" in pub));
  for (const p of pub.players) {
    assert.ok(p.hand[0]?.hidden);
    assert.ok(!p.hand[1]?.hidden);
    assert.deepEqual(p.trumps, []);
  }
  const mine = viewFor(s, "a");
  assert.ok(!mine.players[0].hand[0]?.hidden);
  assert.ok(mine.players[1].hand[0]?.hidden);
  const other = s.players[s.turnIndex].id === "a" ? "b" : "a";
  assert.equal(gameReducer(s, { type: "STAND", by: other }), s);
}

// ─── Bet resets each round ────────────────────────────────────────────────────
{
  let s = createInitialState({
    partyCode: "BETRST",
    hostPlayer: createPlayer({ id: "a", name: "A" }),
  });
  s = gameReducer(s, { type: "JOIN", player: { id: "b", name: "B" } });
  s = gameReducer(s, { type: "READY", by: "b" });
  s = gameReducer(s, { type: "START", by: "a" });
  s = gameReducer(s, { type: "STAND", by: s.players[s.turnIndex].id });
  const nextTurn = s.players.find((p) => !p.stood && !p.isEliminated);
  if (nextTurn) s = gameReducer(s, { type: "STAND", by: nextTurn.id });
  if (s.phase === PHASES.COUNTDOWN) {
    s = gameReducer(s, { type: "RESOLVE_SHOWDOWN" });
  }
  if (s.phase === PHASES.SHOWDOWN) {
    s = gameReducer(s, { type: "NEXT_ROUND", by: "a" });
    assert.equal(s.betModifiers, 0, "betModifiers reset each round");
  }
}

// ─── GRANT_TRUMPS (Trump Shop purchases) ─────────────────────────────────────
{
  // Fresh match with two players, both holding STARTING_TRUMP_CARDS cards.
  let s = createInitialState({
    partyCode: "SHOP01",
    hostPlayer: createPlayer({ id: "a", name: "A" }),
  });
  s = gameReducer(s, { type: "JOIN", player: { id: "b", name: "B" } });
  s = gameReducer(s, { type: "READY", by: "b" });
  s = gameReducer(s, { type: "START", by: "a" });
  assert.equal(s.phase, PHASES.PLAYING);
  const buyer = s.players.find((p) => p.id === "b");
  const before = buyer.trumps.length;

  // Shop config sanity: bundles come from config, not hardcoded values.
  const duo = getShopItem("duo");
  assert.ok(duo && duo.quantity === 2 && duo.price === 280);
  assert.ok(!getShopItem("nonexistent"));

  // Valid grant: +2 cards, global shop notification, private reward packet.
  const cards = [rollTrumpCard(), rollTrumpCard()];
  const s2 = gameReducer(s, {
    type: "GRANT_TRUMPS",
    by: "b",
    cards,
    purchaseId: "shop-test-1",
    bundleId: "duo",
  });
  assert.notEqual(s2, s, "grant must change state");
  const buyer2 = s2.players.find((p) => p.id === "b");
  assert.equal(buyer2.trumps.length, before + 2);
  assert.equal(buyer2.trumps[before], cards[0]);
  assert.equal(buyer2.trumps[before + 1], cards[1]);
  const play = s2.trumpPlays.find((tp) => tp.isShopNotification);
  assert.ok(play, "global shop notification pushed");
  assert.equal(play.playerId, "b");
  assert.equal(play.quantity, 2);
  const note = s2.personalNotifications.b.find(
    (n) => n.type === "TRUMP_SHOP" && n.purchaseId === "shop-test-1",
  );
  assert.ok(note, "buyer private reward packet");
  assert.deepEqual(
    note.cards.map((x) => x.id),
    cards,
  );

  // Duplicate purchaseId: exactly-once, state unchanged (same reference).
  const s3 = gameReducer(s2, {
    type: "GRANT_TRUMPS",
    by: "b",
    cards,
    purchaseId: "shop-test-1",
    bundleId: "duo",
  });
  assert.equal(s3, s2, "duplicate purchaseId must not double-grant");

  // Card count mismatch (bundle says 2): rejected, state unchanged.
  assert.equal(
    gameReducer(s2, {
      type: "GRANT_TRUMPS",
      by: "b",
      cards: [rollTrumpCard()],
      purchaseId: "shop-test-2",
      bundleId: "duo",
    }),
    s2,
    "wrong card count rejected",
  );

  // Unknown card id in grant: rejected.
  assert.equal(
    gameReducer(s2, {
      type: "GRANT_TRUMPS",
      by: "b",
      cards: ["NOT_A_TRUMP", rollTrumpCard()],
      purchaseId: "shop-test-3",
      bundleId: "duo",
    }),
    s2,
    "unknown card id rejected",
  );

  // Grants are refused after the match ends.
  const over = { ...s2, phase: PHASES.GAMEOVER };
  assert.equal(
    gameReducer(over, {
      type: "GRANT_TRUMPS",
      by: "b",
      cards,
      purchaseId: "shop-test-4",
      bundleId: "duo",
    }),
    over,
    "GAMEOVER rejects purchases",
  );
}

// ─── LOCKDOWN blocks counters (SHATTER/MIRROR unusable, prompt hides them) ───
{
  let s = createInitialState({
    partyCode: "LOCK01",
    hostPlayer: createPlayer({ id: "a", name: "A" }),
  });
  s = gameReducer(s, { type: "JOIN", player: { id: "b", name: "B" } });
  s = gameReducer(s, { type: "READY", by: "b" });
  s = gameReducer(s, { type: "START", by: "a" });

  // Inject a counter request: A played LOCKDOWN targeting B, who holds both
  // counter cards but is locked down (trumpsDisabled) for this round.
  s = {
    ...s,
    counterRequests: {
      c1: {
        requestId: "c1",
        attackerId: "a",
        attackerName: "A",
        trumpId: "LOCKDOWN",
        trumpName: "Lockdown",
        targetId: "b",
        target2Id: null,
        rank: null,
        counterTargets: ["b"],
        responses: {},
        createdAt: Date.now(),
        expiresAt: Date.now() + 10000,
      },
    },
  };
  const victim = s.players.find((p) => p.id === "b");
  victim.trumps.push("SHATTER", "MIRROR");
  victim.trumpsDisabled = true;

  // The prompt must NOT offer SHATTER/MIRROR — only "Accept Fate".
  const view = viewFor(s, "b");
  assert.ok(view.counterRequest, "counter request visible to target");
  assert.equal(view.counterRequest.hasShatter, false, "shatter hidden");
  assert.equal(view.counterRequest.hasMirror, false, "mirror hidden");

  // Engine rejects the counters even if a client bypasses the UI.
  assert.equal(
    gameReducer(s, {
      type: "RESPOND_COUNTER",
      by: "b",
      requestId: "c1",
      useShatter: true,
      useMirror: false,
    }),
    s,
    "locked-down player cannot SHATTER",
  );
  assert.equal(
    gameReducer(s, {
      type: "RESPOND_COUNTER",
      by: "b",
      requestId: "c1",
      useShatter: false,
      useMirror: true,
    }),
    s,
    "locked-down player cannot MIRROR",
  );

  // Accepting fate (decline) is still allowed.
  const declined = gameReducer(s, {
    type: "RESPOND_COUNTER",
    by: "b",
    requestId: "c1",
    useShatter: false,
    useMirror: false,
  });
  assert.notEqual(declined, s, "decline still allowed");
  assert.ok(
    declined.players.find((p) => p.id === "b").trumps.includes("SHATTER"),
    "SHATTER not consumed on decline",
  );
}

// ─── 300 randomized full matches ─────────────────────────────────────────────
for (let game = 0; game < 300; game++) {
  const n = 2 + (game % 5);
  let s = createInitialState({
    partyCode: "SIM" + game,
    hostPlayer: createPlayer({ id: "p0", name: "P0" }),
  });
  for (let i = 1; i < n; i++)
    s = gameReducer(s, {
      type: "JOIN",
      player: { id: `p${i}`, name: `P${i}` },
    });
  for (let i = 1; i < n; i++)
    s = gameReducer(s, { type: "READY", by: `p${i}` });
  s = gameReducer(s, { type: "START", by: "p0" });

  let guard = 0;
  while (s.phase !== PHASES.GAMEOVER && guard++ < 50000) {
    if (s.phase === PHASES.COUNTDOWN) {
      s = gameReducer(s, { type: "RESOLVE_SHOWDOWN" });
      continue;
    }
    if (s.phase === PHASES.SHOWDOWN) {
      s = gameReducer(s, {
        type: "NEXT_ROUND",
        by: "p0",
        winnerId: s.lastResult?.winnerIds?.[0] ?? null,
      });
      continue;
    }
    if (s.phase !== PHASES.PLAYING) break;
    const me = s.players[s.turnIndex];
    if (!me || me.isEliminated || me.stood) break;

    const roll = Math.random();
    if (roll < 0.25 && me.trumps.length) {
      const tid = me.trumps[Math.floor(Math.random() * me.trumps.length)];
      const opp = s.players.filter(
        (p) => p.id !== me.id && !p.isEliminated && !p.isSpectator,
      );
      const targetId = opp[Math.floor(Math.random() * opp.length)]?.id;
      const rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"][
        Math.floor(Math.random() * 10)
      ];
      s = gameReducer(s, {
        type: "TRUMP",
        by: me.id,
        trumpId: tid,
        targetId,
        rank,
      });
    } else if (roll < 0.55 && me.hand.length < MAX_HAND) {
      s = gameReducer(s, { type: "HIT", by: me.id });
    } else {
      s = gameReducer(s, { type: "STAND", by: me.id });
    }

    for (const p of s.players) {
      assert.ok(
        p.hand.length <= MAX_HAND,
        `hand ≤ ${MAX_HAND} (got ${p.hand.length} for ${p.id}, phase=${s.phase})`,
      );
      assert.ok(p.lives >= 0, `lives ≥ 0`);
      assert.ok(Array.isArray(p.trumps), "trumps is array");
    }
    const ids = new Set();
    for (const card of [...s.deck, ...s.players.flatMap((p) => p.hand)]) {
      assert.ok(!ids.has(card.id), `duplicate card ${card.id}`);
      ids.add(card.id);
    }
  }

  assert.equal(s.phase, PHASES.GAMEOVER, `game ${game}: should finish`);
  const survivors = s.players.filter((p) => !p.isEliminated);
  assert.equal(survivors.length, 1, `game ${game}: 1 survivor`);
  assert.equal(s.winnerId, survivors[0].id);
}

console.log(
  `✔ All tests passed — MAX_CARDS_IN_HAND=${MAX_HAND}, 300 matches, ${EXPECTED.length} trump cards.`,
);
