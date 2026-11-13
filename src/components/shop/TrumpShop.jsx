import { useState } from "react";
import { RARITY_COLOR, TRUMP_ICONS } from "../../config/trumpCards.config.js";
import { quantityLabel } from "../../config/trumpShop.config.js";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";

const FALLBACK_COLOR = RARITY_COLOR.COMMON;

/**
 * In-game Trump Shop: buy bundles of random Trump Cards with Chips.
 * Renders inside the Table (PLAYING phase). `shop` comes from useTrumpShop.
 */
export default function TrumpShop({ shop, profile, onClose }) {
  const audio = useAudio();
  const { bundles, busyId, error, result, purchase, clearResult } = shop;
  const [confirmItem, setConfirmItem] = useState(null);
  const chips = profile?.chips ?? 0;

  const handleConfirm = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    const item = confirmItem;
    setConfirmItem(null);
    if (item) purchase(item.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trump shop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        if (!confirmItem && !busyId) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-ink/95 animate-fadeUp"
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
              Trump Shop
            </span>
            <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-base">
              {result ? "Purchase Complete!" : "Random Trump Cards"}
            </h2>
            <p className="mt-0.5 text-[9px] text-ivory-dim/50 sm:text-[10px]">
              {result
                ? "New cards added to your inventory"
                : "Spend Chips on random Trumps"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.06]
                px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-gold-light sm:px-3 sm:text-xs"
            >
              <i className="fa-solid fa-coins text-[9px] text-gold/70 sm:text-[10px]" />
              {chips}
            </span>
            <button
              onClick={onClose}
              disabled={Boolean(busyId) && !result}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/30
                transition-colors hover:bg-white/5 hover:text-white/80
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close trump shop"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {result ? (
          <RewardReveal result={result} onContinue={clearResult} />
        ) : confirmItem ? (
          <ConfirmPurchase
            item={confirmItem}
            chips={chips}
            onCancel={() => setConfirmItem(null)}
            onConfirm={handleConfirm}
          />
        ) : (
          <BundleList
            bundles={bundles}
            chips={chips}
            busyId={busyId}
            onBuy={setConfirmItem}
          />
        )}

        {error && !result && (
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

/* ── Bundles list ─────────────────────────────────────────────────────────── */

function BundleList({ bundles, chips, busyId, onBuy }) {
  return (
    <ul className="max-h-[58dvh] space-y-2 overflow-y-auto overscroll-contain p-3 sm:space-y-2.5 sm:p-4">
      {bundles.map((item) => {
        const affordable = chips >= item.price;
        const isBusy = busyId === item.id;
        const busyOther = Boolean(busyId) && !isBusy;

        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-gold/15 bg-black/30 px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-sm text-gold sm:h-10 sm:w-10">
              <i className="fa-solid fa-gift" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-ivory sm:text-sm">
                {item.name}
              </div>
              <div className="mt-0.5 text-[10px] text-white/40 sm:text-[11px]">
                {quantityLabel(item.quantity)}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span
                className={`flex items-center gap-1 font-mono text-xs font-medium tabular-nums sm:text-sm ${
                  affordable ? "text-gold-light" : "text-red-400/70"
                }`}
              >
                <i className="fa-solid fa-coins text-[9px] text-gold/60" />
                {item.price}
              </span>
              <button
                disabled={!affordable || busyOther || isBusy}
                onClick={() => onBuy(item)}
                title={
                  affordable
                    ? `Buy ${quantityLabel(item.quantity)}`
                    : "Not enough chips"
                }
                className="rounded-lg border border-gold-light/50 bg-gradient-to-b from-gold/25 to-gold/10
                  px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-light
                  transition-all hover:border-gold-light/80 hover:from-gold/35
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                  disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98] sm:text-[11px]"
              >
                {isBusy ? <i className="fa-solid fa-spinner fa-spin" /> : "Buy"}
              </button>
            </div>
          </li>
        );
      })}
      <li className="pt-1 text-center text-[9px] text-white/30 sm:text-[10px]">
        <i className="fa-solid fa-dice mr-1.5 text-gold/50" />
        Cards are rolled from the standard rarity pool on purchase
      </li>
    </ul>
  );
}

/* ── Confirm dialog ───────────────────────────────────────────────────────── */

function ConfirmPurchase({ item, chips, onCancel, onConfirm }) {
  const affordable = chips >= item.price;

  return (
    <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold-faint/20 text-lg text-gold">
          <i className="fa-solid fa-gift" />
        </span>
        <p className="mt-3 text-sm font-semibold text-ivory sm:text-base">
          Buy {quantityLabel(item.quantity)}?
        </p>
        <p className="mt-1.5 text-[11px] text-white/45 sm:text-xs">
          <i className="fa-solid fa-coins mr-1 text-gold/60" />
          <span className="font-mono tabular-nums">{item.price}</span> Chips
          <span className="mx-1.5 text-white/20">·</span>
          Balance after:{" "}
          <span className="font-mono tabular-nums">{chips - item.price}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onCancel}
          className="min-h-[40px] rounded-xl border border-white/10 bg-transparent
            text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50
            transition-colors hover:border-white/25 hover:text-white/90
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:text-[11px]"
        >
          Cancel
        </button>
        <button
          disabled={!affordable}
          onClick={onConfirm}
          className="min-h-[40px] rounded-xl border border-gold-light/50 bg-gradient-to-b from-gold/25 to-gold/10
            text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light
            transition-all hover:border-gold-light/80 hover:from-gold/35
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
            disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98] sm:text-[11px]"
        >
          Confirm
        </button>
      </div>
      {!affordable && (
        <p className="text-center text-[10px] text-red-400/80 sm:text-[11px]">
          <i className="fa-solid fa-circle-exclamation mr-1.5" />
          Not enough chips
        </p>
      )}
    </div>
  );
}

/* ── Reward reveal ────────────────────────────────────────────────────────── */

function RewardReveal({ result, onContinue }) {
  return (
    <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-center text-[11px] text-white/45 sm:text-xs">
        {result.bundleName} · {result.cards.length} Trump
        {result.cards.length === 1 ? "" : "s"} received
      </p>

      <ul
        className={`grid gap-2 ${
          result.cards.length <= 2
            ? "grid-cols-2"
            : "grid-cols-3 sm:grid-cols-4"
        }`}
      >
        {result.cards.map((card, i) => {
          const color = RARITY_COLOR[card.rarity] ?? FALLBACK_COLOR;
          const icon = TRUMP_ICONS[card.id] ?? "fa-wand-magic-sparkles";
          return (
            <li
              key={`${card.id}-${i}`}
              className="relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border
                bg-black/40 px-2 py-3 text-center animate-fadeUp"
              style={{
                borderColor: `${color}55`,
                boxShadow: `0 0 22px -10px ${color}88`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
              />
              <i
                className={`fa-solid ${icon} text-base sm:text-lg`}
                style={{ color }}
              />
              <span className="line-clamp-2 min-h-[2em] text-[10px] font-medium leading-tight text-ivory sm:text-[11px]">
                {card.name}
              </span>
              <span
                className="rounded-sm border px-1 py-px text-[7px] font-medium uppercase tracking-[0.14em] sm:text-[8px]"
                style={{
                  color: `${color}d9`,
                  borderColor: `${color}33`,
                }}
              >
                {card.rarity}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onContinue}
        className="w-full min-h-[40px] rounded-xl border border-gold/40 bg-gradient-to-b from-gold-faint/60
          to-gold-faint/25 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-light
          transition-all hover:border-gold/70 focus-visible:outline-none focus-visible:ring-1
          focus-visible:ring-gold/60 active:scale-[0.98] sm:text-[11px]"
      >
        <i className="fa-solid fa-gift mr-1.5" />
        Buy More
      </button>
    </div>
  );
}
