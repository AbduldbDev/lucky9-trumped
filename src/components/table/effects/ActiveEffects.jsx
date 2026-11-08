import { TRUMP_CARDS_CATALOG } from "../../../config/trumpCards.config.js";
import {
  RARITY_COLOR,
  TRUMP_ICONS,
} from "../../../config/trumpCards.config.js";

/**
 * Displays active persistent trump effects (bet modifiers, angel cards)
 * in the center info cluster. These remain until cancelled by Shatter.
 */
export default function ActiveEffects({ effects = [] }) {
  if (!effects || effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 justify-center items-center max-w-[240px] mt-2">
      {effects.map((effect) => (
        <ActiveEffectBadge key={effect.id} effect={effect} />
      ))}
    </div>
  );
}

function ActiveEffectBadge({ effect }) {
  const card = TRUMP_CARDS_CATALOG[effect.trumpId];
  if (!card) return null;

  const icon = TRUMP_ICONS[effect.trumpId] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md
        bg-black/70 border backdrop-blur-sm
        animate-[fadeIn_0.3s_ease-out]"
      style={{
        borderColor: `${color}80`,
        boxShadow: `0 0 8px ${color}30`,
      }}
      title={`${card.name} by ${effect.playerName}`}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-6 h-6 rounded"
        style={{
          backgroundColor: `${color}20`,
        }}
      >
        <i className={`fa-solid ${icon} text-xs`} style={{ color }} />
      </div>

      {/* Info */}
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-bold" style={{ color }}>
          {card.name}
        </span>
        <span className="text-[8px] text-white/50">{effect.playerName}</span>
      </div>
    </div>
  );
}
