import { useEffect, useState } from "react";

const COUNTER_PROMPT_TIME_MS = 5000; // 5 seconds to respond

/**
 * Mobile-first sizing: the base classes are the compact phone layout,
 * and the `sm:` classes restore the roomier desktop sizes.
 */
export default function CounterPrompt({ counterRequest, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(COUNTER_PROMPT_TIME_MS / 1000);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    if (!counterRequest || responded) return;

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          if (!responded) {
            setResponded(true);
            onDecline();
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [counterRequest, responded, onDecline]);

  // Reset when new request comes in
  useEffect(() => {
    if (counterRequest) {
      setTimeLeft(COUNTER_PROMPT_TIME_MS / 1000);
      setResponded(false);
    }
  }, [counterRequest]);

  if (!counterRequest) return null;

  const handleAccept = () => {
    if (responded) return;
    setResponded(true);
    onAccept();
  };

  const handleDecline = () => {
    if (responded) return;
    setResponded(true);
    onDecline();
  };

  const progress = (timeLeft / (COUNTER_PROMPT_TIME_MS / 1000)) * 100;
  const isUrgent = timeLeft <= 2;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Counter trump card"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div
        className={`relative mx-3 flex w-full max-w-[18.5rem] flex-col items-center
          gap-3 overflow-hidden rounded-xl border bg-ink/90 px-4 pt-5 pb-4 backdrop-blur-xl
          transition-colors duration-300 animate-fadeUp
          max-h-[92dvh] overflow-y-auto
          sm:mx-4 sm:max-w-sm sm:gap-5 sm:rounded-2xl sm:px-7 sm:pt-8 sm:pb-6
          ${isUrgent ? "border-red-400/50" : "border-gold/30"}`}
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top hairline accent */}
        <div
          className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent transition-colors duration-300 sm:inset-x-10
            ${isUrgent ? "via-red-300/80" : "via-gold-light/80"}`}
        />

        {/* Icon */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 sm:h-12 sm:w-12
            ${
              isUrgent
                ? "border-red-400/50 bg-red-400/[0.07] text-red-300"
                : "border-gold/50 bg-gold/[0.06] text-gold-light"
            }`}
        >
          <i className="fa-solid fa-shield-halved text-xs sm:text-base" />
        </div>

        {/* Title */}
        <div className="text-center">
          <span
            className={`text-[8px] font-medium uppercase tracking-[0.3em] transition-colors duration-300 sm:text-[10px] sm:tracking-[0.35em]
              ${isUrgent ? "text-red-300/80" : "text-gold/80"}`}
          >
            Incoming
          </span>
          <h3 className="mt-1 font-serif text-sm font-medium tracking-wide text-ivory sm:mt-1.5 sm:text-xl">
            Counter Trump Card?
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-ivory-dim/70 sm:mt-2 sm:text-[13px] sm:leading-relaxed">
            <span className="text-ivory">{counterRequest.attackerName}</span>
            {" used "}
            <span className="text-gold-light">{counterRequest.trumpName}</span>
          </p>
          {counterRequest.isTargeted && (
            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-red-300/80 sm:mt-1.5 sm:text-[10px] sm:tracking-[0.25em]">
              You are the target
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="w-full">
          <div className="mb-1.5 flex items-center justify-between sm:mb-2">
            <span className="text-[8px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[10px] sm:tracking-[0.25em]">
              Time to respond
            </span>
            <span
              className={`font-mono text-[10px] tabular-nums transition-colors duration-300 sm:text-xs
                ${isUrgent ? "text-red-300" : "text-gold-light"}`}
            >
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="h-px w-full bg-white/10">
            <div
              className={`h-full transition-all duration-100 ease-linear
                ${
                  isUrgent
                    ? "bg-gradient-to-r from-red-500 to-red-300"
                    : "bg-gradient-to-r from-gold to-gold-light"
                }`}
              style={{
                width: `${progress}%`,
                height: "2px",
                marginTop: "-0.5px",
              }}
            />
          </div>
        </div>

        {/* Shutter card indicator */}
        {counterRequest.hasShutter && (
          <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.06] px-2.5 py-1 sm:gap-2 sm:px-3.5 sm:py-1.5">
            <i className="fa-solid fa-ban text-[8px] text-gold-light sm:text-[10px]" />
            <span className="text-[8px] font-medium uppercase tracking-[0.15em] text-gold-light sm:text-[10px] sm:tracking-[0.2em]">
              Shutter blocks this effect
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid w-full grid-cols-2 gap-2 sm:gap-2.5">
          <button
            onClick={handleDecline}
            disabled={responded}
            className="rounded-md border border-white/10 bg-transparent px-2 py-2
              text-[9px] font-medium uppercase tracking-[0.2em] text-ivory-dim/70
              transition-all duration-200
              hover:border-white/25 hover:text-ivory
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
              disabled:cursor-not-allowed disabled:opacity-40
              active:scale-[0.98]
              sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-[0.25em]"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={responded || !counterRequest.hasShutter}
            className="flex items-center justify-center gap-1.5 rounded-md border border-gold-light/50
              bg-gradient-to-b from-gold/25 to-gold/10 px-2 py-2
              text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-light
              transition-all duration-200
              hover:border-gold-light/80 hover:from-gold/35
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
              disabled:cursor-not-allowed disabled:opacity-35
              active:scale-[0.98]
              sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-[0.25em]"
            style={{
              boxShadow: counterRequest.hasShutter
                ? "0 0 24px -8px rgba(217, 194, 138, 0.5)"
                : "none",
            }}
          >
            <i className="fa-solid fa-shield text-[8px] sm:text-[10px]" />
            Use Shutter
          </button>
        </div>

        {!counterRequest.hasShutter && (
          <p className="text-center text-[8px] uppercase tracking-[0.15em] text-ivory-dim/40 sm:text-[10px] sm:tracking-[0.2em]">
            No Shutter card available
          </p>
        )}
      </div>
    </div>
  );
}
