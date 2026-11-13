import { useState } from "react";
import { getSkin } from "../../config/cardSkins.config";
import { RARITY_COLOR } from "../../config/trumpCards.config.js";
import { EmptyState } from "./ProfileWidgets.jsx";

const FALLBACK_HEX = "#9ca3af";

/**
 * Card-back preview. Uses the skin's image (backSvg); if it is missing or fails
 * to load, falls back to the skin's gradient (previewColor).
 */
function SkinSwatch({ skin }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(skin.backSvg) && !imgError;

  const base =
    "relative h-12 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.9)] sm:h-14 sm:w-10";

  if (showImage) {
    return (
      <div className={`${base} bg-gray-900`}>
        <img
          src={skin.backSvg}
          alt={`${skin.name} card back`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-gradient-to-br ${skin.previewColor ?? "from-gray-700 to-gray-900"}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-diamond text-sm text-white/20 sm:text-base" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </div>
  );
}

/** Card Skins tab body: owned count, equipped skin, scrollable skin list. */
export default function SkinInventoryList({ profile, ownedSkins, onEquip, equipping }) {
  const equippedSkin = getSkin(profile.equippedSkinId);

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35 sm:text-[11px]">
          {ownedSkins.length} skin
          {ownedSkins.length !== 1 ? "s" : ""} owned
        </p>
        <p className="truncate text-[9px] uppercase tracking-[0.2em] text-white/30 sm:text-[11px]">
          Using <span className="text-gold-light/80">{equippedSkin.name}</span>
        </p>
      </div>

      <div className="overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.35)_transparent] max-h-[45vh] sm:max-h-[400px]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {ownedSkins.map((skin) => {
            const equipped = profile.equippedSkinId === skin.id;
            const isEquipping = equipping === skin.id;
            const color =
              RARITY_COLOR[String(skin.rarity).toUpperCase()] ?? FALLBACK_HEX;
            return (
              <div
                key={skin.id}
                className={`rounded-xl border px-2.5 py-2 sm:rounded-2xl sm:px-3.5 sm:py-3 ${
                  equipped
                    ? "border-gold/50 bg-gradient-to-br from-gold-faint/30 to-black/30"
                    : "border-gold/20 bg-black/30"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <SkinSwatch skin={skin} />

                  <div className="min-w-0 flex-1 basis-20">
                    <p className="truncate text-[11px] font-semibold text-ivory sm:text-xs">
                      {skin.name}
                    </p>
                    <p
                      className="mt-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-wider sm:text-[10px]"
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
                    </p>
                  </div>

                  {equipped ? (
                    <span className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold sm:text-[10px]">
                      Equipped
                    </span>
                  ) : (
                    <button
                      onClick={() => onEquip(skin.id)}
                      disabled={isEquipping}
                      className="min-w-[56px] shrink-0 rounded-lg border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 px-2.5 py-1 text-[10px] font-bold tracking-wide text-gold-light transition-all hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:py-1.5 sm:text-[11px]"
                    >
                      {isEquipping ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        "Equip"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {ownedSkins.length === 0 && (
          <EmptyState
            icon="fa-bag-shopping"
            text="No skins owned yet"
            sub="Visit the shop to purchase skins"
          />
        )}
      </div>
    </div>
  );
}
