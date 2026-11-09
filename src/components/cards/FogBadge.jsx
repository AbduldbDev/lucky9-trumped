import { exposedSum, handScore } from "../../utils/deckEngine.js";

export default function FogBadge({
  hand,
  revealed = false,
  isSelf = false,
  forceValue = null,
}) {
  // Guard against invalid hand
  if (!hand) {
    return 0;
  }

  // If forceValue is provided, use it
  if (forceValue !== null) {
    const isNine = forceValue === 9;
    const baseClass = `inline-flex items-center gap-0.5 sm:gap-1 rounded-full
      px-1.5 py-0 sm:px-2 sm:py-0.5
      text-[10px] sm:text-xs font-semibold tabular-nums`;

    return (
      <span
        className={`${baseClass}
          ${
            isNine
              ? "bg-gold-/20 text-gold-light border border-gold/50"
              : "bg-black/30 text-ivory-dim border border-white/10"
          }`}
        aria-label={`Score: ${forceValue}`}
      >
        {isNine && (
          <i className="fa-solid fa-star text-[7px] sm:text-[9px] text-gold" />
        )}
        {forceValue}
      </span>
    );
  }

  // Check if all cards in hand are visible (for spectators)
  const allCardsVisible = hand.every((card) => card && !card.hidden);

  // Known score: revealed phase, self, or all cards visible (spectator)
  const known = revealed || isSelf || allCardsVisible;
  const score = known ? handScore(hand) : null;
  const exp = known ? null : exposedSum(hand);
  const isNine = known && score === 9;

  // Guard against NaN or invalid values
  const displayScore = known ? (Number.isNaN(score) ? 0 : score) : null;
  const displayExp = known ? null : Number.isNaN(exp) ? 0 : exp;

  const baseClass = `inline-flex items-center gap-0.5 sm:gap-1 rounded-full
    px-1.5 py-0 sm:px-2 sm:py-0.5
    text-[10px] sm:text-xs font-semibold tabular-nums`;

  if (known) {
    return (
      <span
        className={`${baseClass}
          ${
            isNine
              ? "bg-gold-/20 text-gold-light border border-gold/50"
              : "bg-black/30 text-ivory-dim border border-white/10"
          }`}
        aria-label={`Score: ${displayScore}`}
      >
        {isNine && (
          <i className="fa-solid fa-star text-[7px] sm:text-[9px] text-gold" />
        )}
        {displayScore}
      </span>
    );
  }

  return (
    <div
      className={`${baseClass}
          ${
            isNine
              ? "bg-gold-/20 text-gold-light border border-gold/50"
              : "bg-black/30 text-ivory-dim border border-white/10"
          }`}
      aria-label={`Score: ${displayExp}`}
    >
      {displayExp}
    </div>
  );
}
