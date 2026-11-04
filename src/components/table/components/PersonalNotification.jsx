import { useEffect, useRef, useState } from "react";

const SHOW_MS = 3000; // how long the notification stays visible
const FADE_MS = 300; // matches the duration-300 fade-out

/**
 * Personal notification that only the player sees.
 * Used for private events like getting a Lucky 9 bonus trump card.
 * Auto-hides after 3 seconds.
 */
export default function PersonalNotification({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Keep the latest onDismiss in a ref so a new function identity on each
  // parent render doesn't restart the timers.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Restarts only when a different notification arrives (or it is cleared).
  useEffect(() => {
    // Cleared by the parent: fade out, then unmount.
    if (!notification) {
      setVisible(false);
      const clearTimer = setTimeout(
        () => setCurrentNotification(null),
        FADE_MS,
      );
      return () => clearTimeout(clearTimer);
    }

    setCurrentNotification(notification);
    setVisible(true);

    const hideTimer = setTimeout(() => setVisible(false), SHOW_MS);

    // Remove after the fade-out animation completes
    const removeTimer = setTimeout(() => {
      setCurrentNotification(null);
      onDismissRef.current?.();
    }, SHOW_MS + FADE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [notification]);

  if (!currentNotification) return null;

  return (
    <div
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-[60]
        transition-all duration-300 pointer-events-none
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <div
        className="relative flex flex-col items-center gap-3 px-6 py-4 rounded-xl
          bg-gradient-to-b from-gold/20 to-gold/10
          border-2 border-gold shadow-2xl backdrop-blur-md
          animate-[slideDown_0.4s_ease-out]"
        style={{
          boxShadow: `0 0 40px rgba(184, 155, 94, 0.5), 0 20px 60px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-50 blur-xl"
          style={{
            background: `radial-gradient(circle, rgba(184, 155, 94, 0.4) 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-2 text-center">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full
              bg-gold/20 border-2 border-gold shadow-lg
              animate-[pulse_2s_ease-in-out_infinite]"
          >
            <i className="fa-solid fa-star text-gold text-3xl" />
          </div>

          {/* Title */}
          <h3 className="text-gold-shimmer font-serif font-bold text-2xl tracking-wide">
            {currentNotification.title}
          </h3>

          {/* Message */}
          <p className="text-white text-sm max-w-xs leading-relaxed">
            {currentNotification.message}
          </p>

          {/* Bonus indicator */}
          {currentNotification.bonus && (
            <div
              className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full
              bg-gold/15 border border-gold/40"
            >
              <i className="fa-solid fa-bolt-lightning text-gold text-sm" />
              <span className="text-gold font-bold text-sm">
                {currentNotification.bonus}
              </span>
            </div>
          )}
        </div>

        {/* Sparkle decorations */}
        <div className="absolute -top-2 -right-2 text-gold/60 text-xl animate-[spin_3s_linear_infinite]">
          ✨
        </div>
        <div className="absolute -bottom-2 -left-2 text-gold/60 text-xl animate-[spin_3s_linear_infinite_reverse]">
          ✨
        </div>
      </div>
    </div>
  );
}
