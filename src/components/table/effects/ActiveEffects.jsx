import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TRUMP_CARDS_CATALOG } from "../../../config/trumpCards.config.js";
import {
  RARITY_COLOR,
  TRUMP_ICONS,
} from "../../../config/trumpCards.config.js";

const MAX_VISIBLE = 3;
const GRID_CLASS =
  "grid grid-cols-1 auto-rows-[34px] gap-1 " +
  "sm:grid-cols-1 sm:auto-rows-[44px] sm:gap-1.5";

const TILE_SIZE_CLASS = "w-[84px] h-[34px] sm:w-[112px] sm:h-[44px]";

export default function ActiveEffects({ effects = [] }) {
  const [open, setOpen] = useState(false);
  const total = effects?.length ?? 0;
  const hasOverflow = total > MAX_VISIBLE;

  // Close the modal if effects get cleared (Shatter / new round)
  useEffect(() => {
    if (open && !hasOverflow) setOpen(false);
  }, [open, hasOverflow]);

  if (total === 0) return null;

  // Effects are stored oldest -> newest. Attach the placement number first.
  const numbered = effects.map((effect, i) => ({ effect, order: i + 1 }));
  const recent = numbered.slice(-MAX_VISIBLE).reverse(); // newest first
  const hiddenCount = total - recent.length;

  return (
    <>
      <div className={`${GRID_CLASS} mt-1 sm:mt-2`}>
        {recent.map(({ effect, order }, i) => (
          <ActiveEffectBadge
            key={effect.id}
            effect={effect}
            order={order}
            isLatest={i === 0}
          />
        ))}

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            // Parent cluster is pointer-events-none, so re-enable it here
            className="pointer-events-auto flex flex-col items-center justify-center
              rounded-md border border-dashed border-white/30 bg-black/50
              text-white/70 hover:text-white hover:bg-black/70
              hover:border-white/60 transition-colors"
            title={`Show all ${total} placed effects`}
          >
            <span className="text-[10px] sm:text-[12px] font-bold leading-none">
              +{hiddenCount} more
            </span>
            <span className="text-[8px] sm:text-[9px] leading-none mt-0.5 sm:mt-1 text-white/50">
              <i className="fa-solid fa-table-cells-large mr-1" />
              View all
            </span>
          </button>
        )}
      </div>

      {open && (
        <AllEffectsModal effects={numbered} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ActiveEffectBadge({ effect, order, isLatest }) {
  const card = TRUMP_CARDS_CATALOG[effect.trumpId];
  if (!card) return <div />;

  const icon = TRUMP_ICONS[effect.trumpId] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      className={`relative flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 rounded-md
        bg-black/70 border backdrop-blur-sm overflow-visible
        animate-[fadeIn_0.3s_ease-out] ${TILE_SIZE_CLASS}`}
      style={{
        borderColor: `${color}80`,
        boxShadow: `0 0 8px ${color}30`,
      }}
      title={`#${order} · ${card.name} by ${effect.playerName}${
        isLatest ? " (latest)" : ""
      }`}
    >
      {/* Placement number: #1 = placed first */}
      <span
        className="absolute -top-1.5 -left-1.5 min-w-[13px] sm:min-w-[16px] h-[13px] sm:h-4 px-0.5 sm:px-1 rounded-full
          bg-neutral-800 border border-white/30 text-[8px] sm:text-[9px] font-bold
          text-white/80 flex items-center justify-center tabular-nums"
      >
        {order}
      </span>

      {/* Most recent marker */}
      {isLatest && (
        <span
          className="absolute -top-1.5 -right-1.5 px-1 sm:px-1.5 h-[13px] sm:h-4 rounded-full
            bg-gold text-black text-[7px] sm:text-[8px] font-extrabold tracking-wide
            flex items-center justify-center"
        >
          NEW
        </span>
      )}

      <div
        className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <i
          className={`fa-solid ${icon} text-[10px] sm:text-xs`}
          style={{ color }}
        />
      </div>

      <div className="flex flex-col leading-none min-w-0">
        <span
          className="text-[8px] sm:text-[9px] font-bold truncate"
          style={{ color }}
        >
          {card.name}
        </span>
        <span className="text-[7px] sm:text-[8px] text-white/50 truncate mt-0.5">
          {effect.playerName}
        </span>
      </div>
    </div>
  );
}

function AllEffectsModal({ effects, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lastOrder = effects.length;
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center
        bg-black/70 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="All active effects"
    >
      <div
        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl
          bg-neutral-900/95 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-white/50 text-sm" />
            <h2 className="text-sm font-bold text-white">Active Effects</h2>
            <span className="text-[11px] text-white/40 tabular-nums">
              {effects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-full
              text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Explainer so the numbering is obvious */}
        <p className="px-4 pt-3 text-[11px] text-white/50 leading-snug">
          Numbered in the order they were played.{" "}
          <span className="text-white/80 font-semibold">#1</span> was placed
          first, <span className="text-gold font-semibold">#{lastOrder}</span>{" "}
          is the latest.
        </p>

        {/* Balanced grid: equal-sized cells, 2 cols on mobile, 3 on wider */}
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-fr">
            {effects.toReversed().map(({ effect, order }) => (
              <EffectGridCard
                key={effect.id}
                effect={effect}
                order={order}
                isFirst={order === 1}
                isLatest={order === lastOrder}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function EffectGridCard({ effect, order, isFirst, isLatest }) {
  const card = TRUMP_CARDS_CATALOG[effect.trumpId];
  if (!card) return <div />;

  const icon = TRUMP_ICONS[effect.trumpId] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      className="relative flex flex-col items-center justify-center text-center
        gap-2 p-3 pt-5 rounded-xl bg-black/50 border h-full min-h-[110px]"
      style={{
        borderColor: `${color}80`,
        boxShadow: `0 0 10px ${color}25`,
      }}
      title={`#${order} · ${card.name} by ${effect.playerName}`}
    >
      {/* Order number */}
      <span
        className="absolute top-1.5 left-1.5 min-w-[20px] h-5 px-1.5 rounded-full
          bg-neutral-800 border border-white/30 text-[10px] font-bold
          text-white/80 flex items-center justify-center tabular-nums"
      >
        #{order}
      </span>

      {/* First / latest tag */}
      {(isFirst || isLatest) && (
        <span
          className={`absolute top-1.5 right-1.5 px-1.5 h-5 rounded-full text-[9px]
            font-extrabold tracking-wide flex items-center justify-center ${
              isLatest ? "bg-gold text-black" : "bg-white/15 text-white/80"
            }`}
        >
          {isLatest ? "LATEST" : "FIRST"}
        </span>
      )}

      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <i className={`fa-solid ${icon} text-base`} style={{ color }} />
      </div>
      <div className="flex flex-col gap-0.5 leading-tight min-w-0 w-full">
        <span className="text-[11px] font-bold truncate" style={{ color }}>
          {card.name}
        </span>
        <span className="text-[10px] text-white/50 truncate">
          {effect.playerName}
        </span>
      </div>
    </div>
  );
}
