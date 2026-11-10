import { getSkin } from "../../config/cardSkins.config.js";
import { isRed } from "../../utils/deckEngine.js";
import { useState } from "react";

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
  deck: {
    w: "w-11",
    h: "h-16",
    rank: "text-xs",
    suit: "text-[9px]",
    center: "text-xl",
  },
};

// Scales glow down on small cards so it doesn't turn into a blob
const GLOW_SIZE_FACTOR = { xs: 0.6, sm: 0.8, md: 1, lg: 1, xl: 1.1 };

export default function Card({
  card,
  faceDown = false,
  skinId = "classic_red",
  size = "md",
  dim = false,
  glow = true, // set false to disable the aura on a specific card
  glowStrength, // optional per-card override (beats the skin value)
}) {
  const skin = getSkin(skinId);
  const s = SIZES[size] ?? SIZES.md;
  const down = faceDown || !card || card.hidden;
  const [imgError, setImgError] = useState(false);

  const base = `playing-card relative z-[2] select-none overflow-hidden ${s.w} ${s.h}`;

  const strength =
    (glowStrength ?? skin.glowStrength ?? 1) * (GLOW_SIZE_FACTOR[size] ?? 1);

  // Wraps the card in the animated smoke aura (only if the skin defines `glow`)
  const withAura = (cardEl) => {
    if (!glow || !skin.glow) {
      return (
        <div className={`shrink-0 ${dim ? "opacity-40" : ""}`}>{cardEl}</div>
      );
    }
    return (
      <div
        className={`card-aura ${dim ? "opacity-40" : ""}`}
        style={{
          "--glow": skin.glow,
          "--glow-strength": strength,
          "--aura-speed": `${skin.auraSpeed ?? 4}s`,
        }}
      >
        <div className="card-aura__orbit" aria-hidden="true" />
        <div className="card-aura__smoke" aria-hidden="true">
          <span className="card-aura__blob card-aura__blob--a" />
          <span className="card-aura__blob card-aura__blob--b" />
        </div>
        {cardEl}
        <div className="card-aura__edge" aria-hidden="true" />
        <div className="card-aura__ring" aria-hidden="true" />
      </div>
    );
  };

  // Card back
  if (down) {
    if (skin.backSvg && !imgError) {
      return withAura(
        <div className={`${base} bg-gray-900 border border-white/10`}>
          <img
            src={skin.backSvg}
            alt="Card back"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>,
      );
    }

    return withAura(
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
      </div>,
    );
  }

  // Card face
  const red = isRed(card);
  const color = red ? "text-red-600" : "text-gray-900";

  if (skin.frontSvg && !imgError) {
    return withAura(
      <div className={`${base} bg-white border border-gray-200`}>
        <img
          src={skin.frontSvg}
          alt={`${card.rank}${card.suit}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>,
    );
  }

  return withAura(
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
    </div>,
  );
}
