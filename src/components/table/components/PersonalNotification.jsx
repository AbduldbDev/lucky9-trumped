import { useEffect, useRef, useState } from "react";

const SHOW_MS = 3000; // how long the notification stays visible
const FADE_MS = 300; // matches the duration-300 fade-out

/**
 * Personal notification that only the player sees.
 * Used for private events like getting a Lucky 9 bonus trump card.
 * Shows when `notification` arrives, auto-hides after 3 seconds,
 * and stays gone until a new notification is triggered.
 */
export default function PersonalNotification({ notification, onDismiss }) {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  // Latest onDismiss in a ref so a new function identity on each parent
  // render doesn't restart the timers.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const manualTimer = useRef(null);

  // Runs ONLY when a different notification arrives (or it is cleared).
  // Setting local state below can no longer re-run this effect, so the
  // timers are never cancelled by their own setup.
  useEffect(() => {
    clearTimeout(manualTimer.current);

    // Cleared by the parent: fade out, then unmount.
    if (!notification) {
      setVisible(false);
      const clearTimer = setTimeout(() => setCurrent(null), FADE_MS);
      return () => clearTimeout(clearTimer);
    }

    setCurrent(notification);
    // Next frame, so the fade/scale-in transition actually plays.
    const raf = requestAnimationFrame(() => setVisible(true));

    const hideTimer = setTimeout(() => setVisible(false), SHOW_MS);
    const removeTimer = setTimeout(() => {
      setCurrent(null);
      onDismissRef.current?.(); // parent sets notification -> null
    }, SHOW_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id]);

  // Clean up the manual-dismiss timer on unmount.
  useEffect(() => () => clearTimeout(manualTimer.current), []);

  const handleManualDismiss = () => {
    setVisible(false);
    clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => {
      setCurrent(null);
      onDismissRef.current?.();
    }, FADE_MS);
  };

  if (!current) return null;

  return (
    <div
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-[60]
        transition-all duration-300
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
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
        {/* Close button */}
        <button
          onClick={handleManualDismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center
            rounded-full bg-black/20 hover:bg-black/40 transition-colors
            text-white/60 hover:text-white/90 pointer-events-auto"
          aria-label="Close notification"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-50 blur-xl pointer-events-none"
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
            {current.title}
          </h3>

          {/* Message */}
          <p className="text-white text-sm max-w-xs leading-relaxed">
            {current.message}
          </p>

          {/* Bonus indicator */}
          {current.bonus && (
            <div
              className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full
              bg-gold/15 border border-gold/40"
            >
              <i className="fa-solid fa-bolt-lightning text-gold text-sm" />
              <span className="text-gold font-bold text-sm">
                {current.bonus}
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
