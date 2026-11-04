import { useEffect } from "react";
import { TRUMP_CARDS_CATALOG, TRUMP_RARITIES } from "../../../config/trumpCards.config.js";

const TRUMP_ICONS = {
  BET_UP: "fa-arrow-trend-up",
  BET_DOWN: "fa-arrow-trend-down",
  DOUBLE_BET_UP: "fa-angles-up",
  DOUBLE_BET_DOWN: "fa-angles-down",
  SHUTTER: "fa-ban",
  RETURN: "fa-rotate-left",
  DISCARD: "fa-trash-can",
  REFRESH: "fa-arrows-rotate",
  EXCHANGE: "fa-right-left",
  TARGET: "fa-location-crosshairs",
  SELECT: "fa-hand-pointer",
  DISABLE: "fa-eye-slash",
  CHECKER: "fa-magnifying-glass",
  FRIENDSHIP_CARD: "fa-people-group",
  ANGEL_CARD: "fa-shield-halved",
};

const RARITY_COLOR = {
  COMMON: "#8d99a8",
  UNCOMMON: "#5fbf86",
  RARE: "#6a9fd8",
  LEGENDARY: "#b89b5e",
  MYTHIC: "#a98bd6",
};

/**
 * Modal displaying all trump cards as a reference guide.
 * Shows icon, name, rarity, and description for each card.
 */
export default function TrumpGuideModal({ isOpen, onClose }) {
  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group cards by rarity
  const cardsByRarity = {};
  Object.values(TRUMP_CARDS_CATALOG).forEach(card => {
    if (!cardsByRarity[card.rarity]) {
      cardsByRarity[card.rarity] = [];
    }
    cardsByRarity[card.rarity].push(card);
  });

  // Sort rarities by their order (Common to Mythic)
  const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY', 'MYTHIC'];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center
        bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] m-4
          bg-gradient-to-b from-[#0a1a0f] to-[#040a06]
          border border-gold/20 rounded-lg shadow-2xl
          flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex-none flex items-center justify-between
            px-4 sm:px-6 py-3 sm:py-4
            border-b border-gold/20 bg-black/40"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg
                bg-gold/10 border border-gold/30"
            >
              <i className="fa-solid fa-bolt-lightning text-gold text-lg" />
            </div>
            <div>
              <h2 className="text-gold-shimmer font-serif font-bold text-lg sm:text-xl">
                Trump Cards Guide
              </h2>
              <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
                All {Object.keys(TRUMP_CARDS_CATALOG).length} trump cards and their effects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg
              text-white/40 hover:text-white hover:bg-white/5
              transition-colors"
            aria-label="Close guide"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {rarityOrder.map(rarityId => {
            const cards = cardsByRarity[rarityId] || [];
            if (cards.length === 0) return null;

            const rarity = TRUMP_RARITIES[rarityId];
            const color = rarity.color;

            return (
              <div key={rarityId} className="space-y-3">
                {/* Rarity Header */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full
                      border bg-black/40"
                    style={{
                      borderColor: `${color}40`,
                      boxShadow: `0 0 12px ${color}20`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {rarity.name}
                    </span>
                    <span className="text-xs text-white/30 font-mono">
                      {rarity.chance}%
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cards.map(card => (
                    <TrumpCardItem key={card.id} card={card} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex-none px-4 sm:px-6 py-3
            border-t border-white/5 bg-black/40"
        >
          <p className="text-xs text-white/30 text-center leading-relaxed">
            <i className="fa-solid fa-lightbulb mr-1.5 text-gold/50" />
            Trump cards are randomly awarded each round. Use them strategically to gain an advantage!
          </p>
        </div>
      </div>
    </div>
  );
}

function TrumpCardItem({ card }) {
  const icon = TRUMP_ICONS[card.id] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      className="flex gap-3 p-3 rounded-lg border bg-black/30
        hover:bg-black/50 transition-colors"
      style={{
        borderColor: `${color}20`,
      }}
    >
      {/* Icon */}
      <div
        className="flex-none flex items-center justify-center
          w-12 h-12 rounded-lg border"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}40`,
          boxShadow: `inset 0 2px 0 ${color}30`,
        }}
      >
        <i
          className={`fa-solid ${icon} text-xl`}
          style={{ color }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-sm leading-tight"
            style={{ color }}
          >
            {card.name}
          </h3>
          <span
            className="flex-none text-[9px] font-medium uppercase tracking-wider
              px-1.5 py-0.5 rounded border"
            style={{
              color: `${color}cc`,
              borderColor: `${color}30`,
              backgroundColor: `${color}10`,
            }}
          >
            {card.rarity}
          </span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          {card.description}
        </p>
      </div>
    </div>
  );
}
