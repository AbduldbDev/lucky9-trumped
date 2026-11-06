import { exposedSum, handScore } from "../../utils/deckEngine.js";

export default function FogBadge({ hand, revealed = false, isSelf = false }) {
  // Check if all cards in hand are visible (for spectators)
  const allCardsVisible = hand.every((card) => !card.hidden);

  // Known score: revealed phase, self, or all cards visible (spectator)
  const known = revealed || isSelf || allCardsVisible;
  const score = known ? handScore(hand) : null;
  const exp = known ? null : exposedSum(hand);
  const isNine = known && score === 9;

  const baseClass = `inline-flex items-center gap-0.5 sm:gap-1 rounded-full
    px-1.5 py-0 sm:px-2 sm:py-0.5
    text-[10px] sm:text-xs font-semibold tabular-nums`;

  if (known) {
    return (
      <span
        className={`${baseClass}
          ${
            isNine
              ? "bg-gold-DEFAULT/20 text-gold-light border border-gold/50"
              : "bg-black/30 text-ivory-dim border border-white/10"
          }`}
        aria-label={`Score: ${score}`}
      >
        {isNine && (
          <i className="fa-solid fa-star text-[7px] sm:text-[9px] text-gold" />
        )}
        {score}
      </span>
    );
  }

  return (
    <span
      className={`${baseClass} font-normal bg-black/40 text-white/40 border border-white/8`}
      aria-label={`Exposed: ${exp}`}
    >
      <i className="fa-solid fa-eye-slash text-[7px] sm:text-[9px]" />
      {exp}
    </span>
  );
}
