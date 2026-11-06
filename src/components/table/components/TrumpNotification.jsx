import { useEffect, useRef, useState } from "react";
import { TRUMP_CARDS_CATALOG } from "../../../config/trumpCards.config.js";
import {
  RARITY_COLOR,
  TRUMP_ICONS,
} from "../../../config/trumpCards.config.js";

/**
 * Floating notification that appears when a player uses a trump card.
 * Compact, minimal-luxury styling. Auto-dismisses after 4 seconds.
 */
export default function TrumpNotification({ notification, onDismiss }) {
  const [visible, setVisible] = useState(true);

  // Keep the latest onDismiss in a ref so a new function identity on each
  // parent render doesn't restart the timers (this caused the stuck card).
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Restart only when a different notification arrives.
  useEffect(() => {
    if (!notification) return;

    setVisible(true);
    let removeTimer;
    const hideTimer = setTimeout(() => {
      setVisible(false);
      removeTimer = setTimeout(() => onDismissRef.current?.(), 300); // wait for fade-out
    }, 4000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [notification]);

  if (!notification) return null;

  const card = TRUMP_CARDS_CATALOG[notification.trumpId];
  if (!card) return null;

  const icon = TRUMP_ICONS[notification.trumpId] || "fa-wand-magic-sparkles";
  const color = RARITY_COLOR[card.rarity] || RARITY_COLOR.COMMON;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 z-50
        max-w-[calc(100vw-1.5rem)]
        transition-all duration-300 ease-out pointer-events-none
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
    >
      <div
        className="relative flex items-center gap-2.5 sm:gap-3
          pl-2.5 pr-3.5 py-2 sm:pl-3 sm:pr-4 sm:py-2.5
          rounded-md overflow-hidden
          bg-[#0b0c0e]/85 backdrop-blur-xl border"
        style={{
          borderColor: `${color}40`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${color}14`,
        }}
      >
        {/* Hairline accent along the top edge */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        {/* Icon */}
        <div
          className="flex shrink-0 items-center justify-center
            w-7 h-7 sm:w-9 sm:h-9 rounded-full border"
          style={{
            borderColor: `${color}55`,
            backgroundColor: `${color}12`,
          }}
        >
          <i
            className={`fa-solid ${icon} text-[11px] sm:text-sm`}
            style={{ color }}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[9px] sm:text-[10px] text-white/45 tracking-wide truncate">
            <span className="text-white/75 font-medium">
              {notification.playerName}
            </span>{" "}
            played
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
            <span
              className="font-semibold text-[11px] sm:text-[13px] tracking-wide truncate"
              style={{ color }}
            >
              {card.name}
            </span>
            <span
              className="shrink-0 text-[7px] sm:text-[8px] font-medium uppercase
                tracking-[0.14em] px-1 py-px rounded-sm border"
              style={{
                color: `${color}d9`,
                borderColor: `${color}33`,
              }}
            >
              {card.rarity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
