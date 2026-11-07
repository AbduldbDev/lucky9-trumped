// Card creation, shuffling, and modulo-10 scoring.
// SRD §3.1: Ace=1, 2-9=face value, 10/J/Q/K=0. Hand total = sum mod 10.

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = [
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
];

// SRD §4.2 SELECT / CHECKER: "Ace through 10" (A, 2-9, 10).
export const SUMMONABLE_RANKS = [
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
];

// Ace=1, 2-9=face value, 10/J/Q/K=0.
export function cardValue(card) {
  if (!card) return 0;
  // NOTE: hidden flag is for display only, not calculation
  // Hidden cards still count toward hand total
  if (card.rank === "A") return 1;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 0;
  return parseInt(card.rank, 10);
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS)
    for (const rank of RANKS) deck.push({ id: `${rank}${suit}`, rank, suit });
  return deck;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle(deck, rng = Math.random) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const mod10 = (n) => ((n % 10) + 10) % 10;

/** Hand Score = sum(card values) mod 10. Max 3 cards. */
export function handScore(hand) {
  return mod10(hand.reduce((sum, c) => sum + cardValue(c), 0));
}

/** What opponents see: sum of exposed (face-up) cards only (index 1+). */
export function exposedSum(hand) {
  return mod10(hand.slice(1).reduce((sum, c) => sum + cardValue(c), 0));
}

/** A "natural" is a two-card hand totalling 8 or 9. */
export function isNatural(hand) {
  return hand.length === 2 && handScore(hand) >= 8;
}

export const isRed = (card) => card?.suit === "♥" || card?.suit === "♦";
