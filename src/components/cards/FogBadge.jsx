import { exposedSum, handScore } from '../../utils/deckEngine.js';

export default function FogBadge({ hand, revealed = false, isSelf = false }) {
  const known  = revealed || isSelf;
  const score  = known ? handScore(hand) : null;
  const exp    = known ? null : exposedSum(hand);
  const isNine = known && score === 9;

  if (known) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums
          ${isNine
            ? 'bg-gold-DEFAULT/20 text-gold-light border border-gold-DEFAULT/50'
            : 'bg-black/30 text-ivory-dim border border-white/10'
          }`}
        aria-label={`Score: ${score}`}
      >
        {isNine && <i className="fa-solid fa-star text-[9px] text-gold-DEFAULT" />}
        {score}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5
        text-xs text-white/40 border border-white/8"
      aria-label={`Exposed: ${exp}`}
    >
      <i className="fa-solid fa-eye-slash text-[9px]" />
      {exp}
    </span>
  );
}
