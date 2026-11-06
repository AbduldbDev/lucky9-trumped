import { useEffect, useState } from "react";
import { TRUMP_CARDS_CATALOG } from "../../../config/trumpCards.config.js";
import {
  RARITY_COLOR,
  TRUMP_ICONS,
} from "../../../config/trumpCards.config.js";

/**
 * Displays a trump card on the table (center area).
 * Shows recently played trump cards that fade out after a few seconds.
 */
export default function TrumpCardDisplay({ trumpCards }) {
  if (!trumpCards || trumpCards.length === 0) return null;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <div className="flex flex-wrap gap-2 justify-center items-center max-w-[300px]">
        {trumpCards.map((item, idx) => (
          <TrumpCardItem key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}

function TrumpCardItem({ item, index }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Stagger entrance
    const enterTimer = setTimeout(() => setVisible(true), index * 100);

    // Auto fade out after 5 seconds
    const exitTimer = setTimeout(() => setVisible(false), 5000 + index * 100);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [index]);

  const card = TRUMP_CARDS_CATALOG[item.trumpId];
  if (!card) return null;

  const icon = TRUMP_ICONS[item.trumpId] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-4 py-3
        rounded-lg bg-black/95 border-2 backdrop-blur-sm
        transition-all duration-500 shadow-2xl
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      style={{
        borderColor: color,
        boxShadow: `0 0 25px ${color}50, 0 8px 30px rgba(0,0,0,0.7)`,
        minWidth: "100px",
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-lg"
        style={{
          backgroundColor: `${color}25`,
          boxShadow: `inset 0 3px 0 ${color}`,
        }}
      >
        <i className={`fa-solid ${icon} text-3xl`} style={{ color }} />
      </div>

      {/* Card name */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-bold text-sm text-center leading-tight"
          style={{ color }}
        >
          {card.name}
        </span>
        <span className="text-[9px] text-white/60 text-center leading-tight">
          by {item.playerName}
        </span>
      </div>
    </div>
  );
}
