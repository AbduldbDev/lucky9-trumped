import { useState, useEffect, useRef } from "react";
import { preloadAllAssets, getCacheStats } from "../../utils/assetCache.js";

// Progress ring geometry (matches the 120x120 viewBox)
const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

/**
 * AssetLoader - Preloads all game assets before starting.
 * Shows a loading screen with a progress ring, using the centralized asset cache.
 *
 * `selectedSkinId` is kept for API compatibility; it no longer re-triggers loading.
 */
export default function AssetLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentAsset, setCurrentAsset] = useState("");
  const [error, setError] = useState(null);

  // Animated 0-100 value shown in the ring and the number.
  // `progress` is the real target; `display` eases toward it every frame.
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (reduceMotion) {
      displayRef.current = progress;
      setDisplay(progress);
      return;
    }

    let raf;
    const tick = () => {
      const diff = progress - displayRef.current;
      if (Math.abs(diff) < 0.1) {
        displayRef.current = progress;
        setDisplay(progress);
        return;
      }
      // Ease out, but never slower than 0.25% per frame so it always finishes
      const step = Math.sign(diff) * Math.max(Math.abs(diff) * 0.1, 0.25);
      displayRef.current += Math.abs(step) > Math.abs(diff) ? diff : step;
      setDisplay(displayRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  // Keep the latest onComplete without re-running the loading effect
  // when the parent passes a new function on every render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let finished = false;
    const timers = [];

    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      onCompleteRef.current?.();
    };

    const loadAssets = async () => {
      try {
        // Already cached: show 100% briefly and continue
        const stats = getCacheStats();
        if (stats.isFullyLoaded) {
          setProgress(100);
          setLoadedCount(stats.totalLoaded);
          setTotalCount(stats.totalLoaded);
          setCurrentAsset("Ready");
          await wait(1100); // let the 0 -> 100 animation play
          finish();
          return;
        }

        await preloadAllAssets((loaded, total, currentUrl, phase) => {
          if (cancelled) return;

          setLoadedCount(loaded);
          setTotalCount(total);
          setProgress(total > 0 ? Math.round((loaded / total) * 100) : 0);

          if (currentUrl) {
            setCurrentAsset(currentUrl.split("/").pop());
          } else if (phase === "complete") {
            setCurrentAsset("Ready");
          }
        });

        if (cancelled) return;
        setProgress(100);
        await wait(600); // let the ring finish easing to 100
        finish();
      } catch (err) {
        if (cancelled) return;
        console.error("[AssetLoader] Asset loading failed:", err);
        setError(err.message || "Unknown error");
        await wait(1500);
        finish();
      }
    };

    loadAssets();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, #0c2a1a 0%, #061510 55%, #030a07 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Static suit decoration (no animation, so no extra paint cost) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
      >
        {["♠", "♥", "♣", "♦"].map((suit, i) => (
          <span
            key={suit}
            className="absolute text-[6rem] leading-none text-gold/[0.04] sm:text-[9rem]"
            style={{
              [i < 2 ? "top" : "bottom"]: "8%",
              [i % 2 === 0 ? "left" : "right"]: "8%",
            }}
          >
            {suit}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-5 px-6 text-center sm:max-w-sm sm:gap-6">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60 sm:w-12" />
          <span className="font-serif text-[10px] uppercase tracking-[0.5em] text-gold/80 sm:text-xs">
            Lucky 9
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/60 sm:w-12" />
        </div>

        {/* Progress ring */}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Loading game assets"
          className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40"
        >
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="rgba(201,168,76,0.15)"
              strokeWidth="1"
            />
            {/* Inner hairline */}
            <circle
              cx="60"
              cy="60"
              r={RING_R - 7}
              fill="none"
              stroke="rgba(201,168,76,0.12)"
              strokeWidth="1"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="#e2c97e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - display / 100)}
            />
          </svg>

          {/* Soft glow behind the number */}
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center leading-none">
            <span className="font-serif text-3xl font-medium tabular-nums text-gold-light sm:text-4xl">
              {Math.round(display)}
              <span className="text-base text-gold/70 sm:text-lg">%</span>
            </span>
            <span className="mt-1.5 font-mono text-[9px] tabular-nums tracking-wider text-ivory-dim/60 sm:text-[10px]">
              {loadedCount} / {totalCount}
            </span>
          </div>
        </div>

        {/* Title + current asset */}
        <div className="space-y-1.5">
          <h2 className="font-serif text-lg font-medium tracking-wide text-ivory sm:text-2xl">
            Preparing the table
          </h2>
          <div className="flex h-4 items-center justify-center">
            {currentAsset && (
              <p className="max-w-full truncate text-[10px] tracking-wide text-ivory-dim/50 sm:text-xs">
                {currentAsset}
              </p>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="status"
            className="rounded-lg border border-chip-red/40 bg-chip-red/10 px-3 py-2 animate-fadeUp"
          >
            <p className="text-[10px] tracking-wide text-red-300/90 sm:text-xs">
              <i className="fa-solid fa-triangle-exclamation mr-2" />
              Some assets failed to load, but the game will continue
            </p>
          </div>
        )}

        {/* Suits */}
        <div className="flex items-center gap-3 text-xs text-gold/50">
          <span>♠</span>
          <span className="text-chip-red/60">♥</span>
          <span>♣</span>
          <span className="text-chip-red/60">♦</span>
        </div>

        <p className="text-[9px] uppercase tracking-[0.3em] text-ivory-dim/40 sm:text-[10px]">
          Preparing your cards and trump deck
        </p>
      </div>
    </div>
  );
}
