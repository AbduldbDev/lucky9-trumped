import { useEffect, useRef, useState } from "react";

const SHOW_MS = 2000;
const FADE_MS = 300;

export default function PersonalNotification({ notification, onDismiss }) {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [counting, setCounting] = useState(false);

  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const manualTimer = useRef(null);

  useEffect(() => {
    clearTimeout(manualTimer.current);

    if (!notification) {
      setVisible(false);
      const clearTimer = setTimeout(() => setCurrent(null), FADE_MS);
      return () => clearTimeout(clearTimer);
    }

    setCurrent(notification);
    setCounting(false);
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      setCounting(true);
    });

    const hideTimer = setTimeout(() => setVisible(false), SHOW_MS);
    const removeTimer = setTimeout(() => {
      setCurrent(null);
      onDismissRef.current?.();
    }, SHOW_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [notification?.id]);

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
      role="status"
      aria-live="polite"
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm
        transition-all duration-300 ease-out
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
    >
      <div
        className="relative overflow-hidden rounded-2xl
          bg-[#020903]/60 backdrop-blur-xl
          border border-[#b89b5e]/40"
        style={{
          boxShadow:
            "0 24px 60px -12px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c28a] to-transparent" />

        {}
        <button
          onClick={handleManualDismiss}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center
            rounded-full text-white/30 hover:text-white/80 transition-colors"
          aria-label="Close notification"
        >
          <i className="fa-solid fa-xmark text-[11px]" />
        </button>

        {}
        <div className="flex flex-col items-center gap-4 px-8 pt-7 pb-6 text-center">
          {}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full
              border border-[#b89b5e]/50 bg-[#b89b5e]/[0.06]"
          >
            <i className="fa-solid fa-star text-[#d9c28a] text-base" />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            {}
            <h3 className="font-serif text-xl font-medium tracking-wide text-[#f1e6c8]">
              {current.title}
            </h3>

            {}
            <p className="max-w-[16rem] text-[13px] leading-relaxed text-white/60">
              {current.message}
            </p>
          </div>

          {}
          {current.bonus && (
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full
                border border-[#b89b5e]/30 bg-[#b89b5e]/[0.07]"
            >
              <i className="fa-solid fa-bolt-lightning text-[#d9c28a] text-[11px]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#d9c28a]">
                {current.bonus}
              </span>
            </div>
          )}
        </div>

        {}
        <div className="h-px w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#b89b5e] to-[#d9c28a] ease-linear"
            style={{
              width: counting ? "0%" : "100%",
              transition: counting ? `width ${SHOW_MS}ms linear` : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
