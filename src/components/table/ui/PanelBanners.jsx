export function SpectatorBanner() {
  return (
    <div className="flex-none px-4 py-1.5 bg-purple-950/60 border-b border-purple-700/20 text-center">
      <span className="text-xs text-purple-300/70">
        <i className="fa-solid fa-eye mr-1.5" />
        Spectating — All cards are visible
      </span>
    </div>
  );
}

export function CheckerBanner({ result }) {
  return (
    <div className="flex-none px-4 py-1.5 bg-blue-950/40 border-b border-blue-700/20 text-center">
      <span className="text-xs text-blue-300/70">
        <i className="fa-solid fa-magnifying-glass mr-1.5" />
        Checker: <b className="text-white">{result.count}</b>{" "}
        <span className="font-mono">{result.rank}</span>s left
      </span>
    </div>
  );
}

export function FortuneBanner({ result, deckCount }) {
  if (!result?.cards || result.cards.length === 0) return null;

  // Filter out cards that have already been drawn
  // If we have cardIds, check them against remaining deck count
  // Once all revealed cards are drawn, hide the banner
  const remainingCards = result.cards.filter((card, index) => {
    // If deck count has decreased by more than the card's position,
    // that card has been drawn
    const initialDeckCount = result.initialDeckCount || 52;
    const cardPosition = index; // 0 = next card, 1 = second card, 2 = third card
    const cardsDrawnSinceReveal = initialDeckCount - deckCount;
    return cardsDrawnSinceReveal <= cardPosition;
  });

  // Hide banner if all cards have been drawn
  if (remainingCards.length === 0) return null;

  return (
    <div className="flex-none px-4 py-2 bg-purple-900/40 border-b border-purple-600/20">
      <div className="text-center">
        <div className="text-xs text-purple-300/70 mb-2">
          <i className="fa-solid fa-crystal-ball mr-1.5" />
          Fortune Teller — Next {remainingCards.length} card
          {remainingCards.length !== 1 ? "s" : ""} in deck:
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {remainingCards.map((card, idx) => (
            <div
              key={idx}
              className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-md bg-black/40 border border-white/20"
            >
              <span
                className={`text-sm font-bold ${
                  card.suit === "♥" || card.suit === "♦"
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                {card.rank}
                <span className="ml-0.5">{card.suit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OddsBanner({ result }) {
  if (!result?.range) return null;

  const isHigh = result.range === "high";

  return (
    <div className="flex-none px-4 py-1.5 bg-teal-900/40 border-b border-teal-600/20 text-center">
      <span className="text-xs text-teal-300/70">
        <i className="fa-solid fa-dice mr-1.5" />
        Odds — Next card:{" "}
        <b className={isHigh ? "text-amber-400" : "text-sky-400"}>
          <i
            className={`fa-solid ${
              isHigh ? "fa-arrow-up" : "fa-arrow-down"
            } mr-1`}
          />
          {isHigh ? "Above 5" : "5 or below"}
        </b>
      </span>
    </div>
  );
}
