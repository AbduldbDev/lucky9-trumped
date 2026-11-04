import { getSkin } from "../../config/cardSkins.config.js";
import { isRed } from "../../utils/deckEngine.js";

const SIZES = {
  xs: {
    w: "w-9",
    h: "h-12",
    rank: "text-[10px]",
    suit: "text-[8px]",
    center: "text-lg",
  },
  sm: {
    w: "w-11",
    h: "h-16",
    rank: "text-xs",
    suit: "text-[9px]",
    center: "text-xl",
  },
  md: {
    w: "w-14",
    h: "h-20",
    rank: "text-sm",
    suit: "text-xs",
    center: "text-2xl",
  },
  lg: {
    w: "w-16",
    h: "h-24",
    rank: "text-base",
    suit: "text-xs",
    center: "text-3xl",
  },
  xl: {
    w: "w-20",
    h: "h-28",
    rank: "text-lg",
    suit: "text-sm",
    center: "text-4xl",
  },
};

export default function Card({
  card,
  faceDown = false,
  skinId = "classic_red",
  size = "md",
  dim = false,
}) {
  const skin = getSkin(skinId);
  const s = SIZES[size] ?? SIZES.md;
  const down = faceDown || !card || card.hidden;

  const base = `playing-card relative shrink-0 select-none overflow-hidden
    ${s.w} ${s.h} ${dim ? "opacity-40" : ""}`;

  if (down) {
    return (
      <div
        className={`${base} bg-gradient-to-br ${skin.previewColor} border border-white/10`}
      >
        {/* Diamond trellis pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "8px 8px",
          }}
        />
        {/* Center pip */}
        <div className="absolute inset-0 flex items-center justify-center">
          {card?.hidden ? (
            <i className="fa-solid fa-question text-white/30 text-lg" />
          ) : (
            <i className="fa-solid fa-diamond text-white/20 text-lg" />
          )}
        </div>
        {/* Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      </div>
    );
  }

  const red = isRed(card);
  const color = red ? "text-red-600" : "text-gray-900";

  return (
    <div className={`${base} bg-white border border-gray-200 ${color}`}>
      {/* Top-left */}
      <div className="absolute top-0.5 left-1 leading-none">
        <div className={`${s.rank} font-black`}>{card.rank}</div>
        <div className={`${s.suit} leading-none`}>{card.suit}</div>
      </div>
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${s.center} opacity-75`}>{card.suit}</span>
      </div>
      {/* Bottom-right (rotated) */}
      <div className="absolute bottom-0.5 right-1 leading-none rotate-180">
        <div className={`${s.rank} font-black`}>{card.rank}</div>
        <div className={`${s.suit} leading-none`}>{card.suit}</div>
      </div>
    </div>
  );
}
