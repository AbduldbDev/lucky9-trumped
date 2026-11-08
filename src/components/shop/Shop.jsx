import { useState } from "react";
import { CARD_SKINS_SHOP } from "../../config/cardSkins.config.js";
import Card from "../cards/Card.jsx";
import { RARITY_COLOR } from "../../config/trumpCards.config.js";

const FALLBACK_HEX = "#9ca3af";

export default function Shop({ profile, onBuy, onEquip, onClose }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const run = async (id, fn) => {
    setBusy(id);
    setError("");
    try {
      await fn(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Card shop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md
        animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25
          bg-ink/95 animate-fadeUp"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
              Collection
            </span>
            <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-base">
              Card Shop
            </h2>
            <p className="mt-0.5 text-[9px] text-ivory-dim/50 sm:text-[10px]">
              Win matches to earn chips
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.06]
                px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-gold-light sm:px-3 sm:text-xs"
            >
              <i className="fa-solid fa-coins text-[9px] text-gold/70 sm:text-[10px]" />
              {profile.chips}
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/30
                transition-colors hover:bg-white/5 hover:text-white/80
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              aria-label="Close shop"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Skins grid */}
        <ul className="grid max-h-[62dvh] grid-cols-2 gap-2.5 overflow-y-auto overscroll-contain p-3 sm:gap-3 sm:p-4">
          {CARD_SKINS_SHOP.map((skin) => {
            const owned = profile.owned.includes(skin.id);
            const equipped = profile.equippedSkinId === skin.id;
            const isBusy = busy === skin.id;
            const color =
              RARITY_COLOR[String(skin.rarity).toUpperCase()] ?? FALLBACK_HEX;

            return (
              <li
                key={skin.id}
                className="relative flex flex-col overflow-hidden rounded-xl border transition-colors duration-200"
                style={{
                  borderColor: equipped
                    ? "rgba(217,194,138,0.55)"
                    : "rgba(255,255,255,0.07)",
                  background: "rgba(11,11,12,0.7)",
                  boxShadow: equipped
                    ? "0 0 22px -10px rgba(217,194,138,0.6)"
                    : "none",
                }}
              >
                {/* Rarity hairline */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}99, transparent)`,
                  }}
                />

                {/* Equipped marker */}
                {equipped && (
                  <span
                    className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center
                      rounded-full border border-gold-light/60 bg-ink"
                    title="Equipped"
                  >
                    <i className="fa-solid fa-check text-[7px] text-gold-light" />
                  </span>
                )}

                {/* Preview with spotlight */}
                <div
                  className="flex items-center justify-center py-4 sm:py-5"
                  style={{
                    background: `radial-gradient(ellipse at 50% 55%, ${color}22 0%, transparent 70%)`,
                  }}
                >
                  <Card faceDown skinId={skin.id} size="md" />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2.5 border-t border-white/[0.05] p-2.5 sm:p-3">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-medium tracking-wide text-ivory sm:text-xs">
                      {skin.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span
                        className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] sm:text-[9px]"
                        style={{ color: `${color}cc` }}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{
                            background: color,
                            boxShadow: `0 0 6px ${color}`,
                          }}
                        />
                        {skin.rarity}
                      </span>
                      <span className="text-[10px] font-medium sm:text-[11px]">
                        {owned ? (
                          <span className="uppercase tracking-[0.15em] text-ivory-dim/50">
                            Owned
                          </span>
                        ) : skin.price === 0 ? (
                          <span className="uppercase tracking-[0.15em] text-emerald-400/80">
                            Free
                          </span>
                        ) : (
                          <span className="font-mono tabular-nums text-gold-light">
                            <i className="fa-solid fa-coins mr-1 text-[8px] text-gold/60" />
                            {skin.price}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {equipped ? (
                      <span
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gold/30
                          bg-gold/[0.06] py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-light sm:text-[10px]"
                      >
                        Equipped
                      </span>
                    ) : owned ? (
                      <button
                        disabled={isBusy}
                        onClick={() => run(skin.id, onEquip)}
                        className="flex w-full items-center justify-center rounded-lg border border-white/10
                          bg-transparent py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em]
                          text-ivory-dim/70 transition-all duration-200
                          hover:border-white/25 hover:text-ivory
                          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                          disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] sm:text-[10px]"
                      >
                        {isBusy ? (
                          <i className="fa-solid fa-spinner fa-spin text-[9px]" />
                        ) : (
                          "Equip"
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={isBusy || profile.chips < skin.price}
                        onClick={() => run(skin.id, onBuy)}
                        className="flex w-full items-center justify-center rounded-lg border border-gold-light/50
                          bg-gradient-to-b from-gold/25 to-gold/10 py-1.5 text-[9px] font-semibold
                          uppercase tracking-[0.2em] text-gold-light transition-all duration-200
                          hover:border-gold-light/80 hover:from-gold/35
                          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                          disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98] sm:text-[10px]"
                      >
                        {isBusy ? (
                          <i className="fa-solid fa-spinner fa-spin text-[9px]" />
                        ) : (
                          "Buy"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {error && (
          <p
            role="alert"
            className="border-t border-white/[0.06] px-4 py-2.5 text-[10px] tracking-wide text-red-300/80 sm:px-5 sm:text-[11px]"
          >
            <i className="fa-solid fa-circle-exclamation mr-1.5" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
