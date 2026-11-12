import { useEffect } from "react";
import {
  TRUMP_CARDS_CATALOG,
  TRUMP_RARITIES,
  RARITY_COLOR,
  TRUMP_ICONS,
  NEW_RELEASE_TRUMP_CARDS,
  ENABLED_TRUMP_CARDS,
} from "../../../config/trumpCards.config.js";

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
  Object.values(TRUMP_CARDS_CATALOG).forEach((card) => {
    if (!ENABLED_TRUMP_CARDS.includes(card.id)) return;

    if (!cardsByRarity[card.rarity]) {
      cardsByRarity[card.rarity] = [];
    }
    cardsByRarity[card.rarity].push(card);
  });

  // Sort rarities by their order (Common to Mythic)
  const rarityOrder = [
    "COMMON",
    "UNCOMMON",
    "RARE",
    "LEGENDARY",
    "MYTHIC",
    "SECRET",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trump cards guide"
      className="fixed inset-0 z-[100] flex items-center justify-center
        bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative m-3 flex max-h-[88dvh] w-full max-w-3xl flex-col
          overflow-hidden rounded-xl border border-gold/25 bg-ink/95
          sm:m-4 sm:rounded-2xl"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div
          className="flex flex-none items-center justify-between
            border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full
                border border-gold/40 bg-gold/[0.06] sm:h-10 sm:w-10"
            >
              <i className="fa-solid fa-bolt-lightning text-xs text-gold-light sm:text-sm" />
            </div>
            <div>
              <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
                Reference
              </span>
              <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-base">
                Trump Cards Guide
              </h2>
              <p className="mt-0.5 text-[9px] text-ivory-dim/50 sm:text-[10px]">
                {Object.keys(TRUMP_CARDS_CATALOG).length} cards and their
                effects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full
              text-white/30 transition-colors hover:bg-white/5 hover:text-white/80
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            aria-label="Close guide"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:space-y-6 sm:p-6">
          {rarityOrder.map((rarityId) => {
            const cards = cardsByRarity[rarityId] || [];
            if (cards.length === 0) return null;

            const rarity = TRUMP_RARITIES[rarityId];
            const color = rarity.color;

            return (
              <section key={rarityId} className="space-y-2.5">
                {/* Rarity Header */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-[11px]"
                    style={{ color }}
                  >
                    {rarity.name}
                  </span>
                  <span className="font-mono text-[9px] tabular-nums text-ivory-dim/40 sm:text-[10px]">
                    {rarity.chance}%
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{
                      background: `linear-gradient(90deg, ${color}40, transparent)`,
                    }}
                  />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                  {cards.map((card) => (
                    <TrumpCardItem key={card.id} card={card} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-white/[0.06] px-4 py-2.5 sm:px-6 sm:py-3">
          <p className="text-center text-[9px] leading-relaxed tracking-wide text-ivory-dim/40 sm:text-[10px]">
            <i className="fa-solid fa-lightbulb mr-1.5 text-gold/50" />
            Trump cards are randomly awarded each round. Use them strategically
            to gain an advantage.
          </p>
        </div>
      </div>
    </div>
  );
}
function TrumpCardItem({ card }) {
  const icon = TRUMP_ICONS[card.id] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;
  const isNew = NEW_RELEASE_TRUMP_CARDS.includes(card.id);

  return (
    <div
      className="group relative flex gap-2.5 overflow-hidden rounded-lg border p-2.5
        transition-all duration-200 hover:brightness-125 sm:gap-3 sm:p-3"
      style={{
        background: `linear-gradient(180deg, ${color}14 0%, rgba(11,11,12,0.7) 60%)`,
        borderColor: isNew ? `${color}60` : "rgba(255,255,255,0.07)",
      }}
    >
      {/* Rarity hairline along the top edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}99, transparent)`,
        }}
      />

      {/* New badge */}
      {isNew && (
        <span
          className="absolute right-2 top-2 rounded-full px-1.5 py-0.5
            text-[8px] font-semibold uppercase tracking-[0.15em] sm:text-[9px]"
          style={{
            color: "#0b0b0c",
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}80`,
          }}
        >
          New
        </span>
      )}

      {/* Icon */}
      <div
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border sm:h-10 sm:w-10"
        style={{
          color,
          borderColor: `${color}50`,
          background: `radial-gradient(circle at 50% 35%, ${color}26, ${color}0a 70%)`,
        }}
      >
        <i className={`fa-solid ${icon} text-xs sm:text-sm`} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <h3
          className={`text-[11px] font-medium leading-tight tracking-wide text-ivory sm:text-xs ${
            isNew ? "pr-9" : ""
          }`}
        >
          {card.name}
        </h3>
        <p className="text-[10px] leading-snug text-ivory-dim/60 sm:text-[11px] sm:leading-relaxed">
          {card.description}
        </p>
      </div>
    </div>
  );
}
