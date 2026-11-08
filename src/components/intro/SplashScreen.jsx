import { useEffect, useRef, useState } from "react";
import Backdrop from "./Backdrop.jsx";
import { preloadAllAssets } from "../../utils/assetCache.js";

const MIN_SHOW_MS = 2000; // Minimum time to show splash
const FADE_MS = 400;

const SUITS = [
  ["♠", ""],
  ["♥", "text-red-500/60"],
  ["♣", ""],
  ["♦", "text-red-500/60"],
];

export default function SplashScreen({ onDone }) {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Shuffling the deck");

  const doneRef = useRef(onDone);
  const startTime = useRef(Date.now());
  doneRef.current = onDone;

  useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      // Show entered state
      setTimeout(() => {
        if (mounted) setEntered(true);
      }, 50);

      try {
        await preloadAllAssets((loaded, total, currentAsset, phase) => {
          if (!mounted) return;

          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);

          // Update loading text based on phase
          if (phase === "images") {
            setLoadingText("Loading card skins");
          } else if (phase === "sounds") {
            setLoadingText("Loading sound effects");
          } else if (phase === "complete") {
            setLoadingText("Ready to play");
          }
        });

        // Ensure minimum show time
        const elapsed = Date.now() - startTime.current;
        const remaining = Math.max(0, MIN_SHOW_MS - elapsed);

        setTimeout(() => {
          if (!mounted) return;
          setLeaving(true);
          setTimeout(() => {
            if (mounted) doneRef.current?.();
          }, FADE_MS);
        }, remaining);
      } catch (error) {
        console.error("[SplashScreen] Asset loading failed:", error);
        // Continue anyway after a short delay
        setTimeout(() => {
          if (!mounted) return;
          setLeaving(true);
          setTimeout(() => {
            if (mounted) doneRef.current?.();
          }, FADE_MS);
        }, 1000);
      }
    };

    loadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className={`relative min-h-[100dvh] w-full overflow-hidden transition-opacity ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <Backdrop />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <div
          className={`flex flex-col items-center transition-all duration-700 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {/* Suits */}
          <div className="mb-3 flex items-center gap-3 text-base text-gold/60 sm:mb-4 sm:gap-4 sm:text-xl">
            {SUITS.map(([s, color], i) => (
              <span
                key={s}
                className={`transition-opacity duration-700 ${color} ${
                  entered ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: `${300 + i * 180}ms` }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Brand */}
          <h1 className="text-gold-shimmer font-serif font-black leading-none tracking-[0.12em] text-5xl sm:text-7xl sm:tracking-[0.15em]">
            LUCKY 9
          </h1>

          <div className="mt-4 flex w-full max-w-xs items-center gap-3 sm:mt-5 sm:gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.35em] text-gold-light/70 sm:text-xs sm:tracking-[0.5em]">
              Trump Card Edition
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          {/* Progress bar */}
          <div className="mt-8 w-56 space-y-2 sm:mt-10 sm:w-64">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/40 via-gold-light to-gold/40 transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <p className="uppercase tracking-[0.3em] text-white/25">
                {loadingText}
              </p>
              <p className="font-mono text-gold/50">{progress}%</p>
            </div>
          </div>
        </div>

        {/* Developer Credit */}
        <footer
          className={`absolute bottom-6 left-0 w-full text-center transition-opacity duration-1000 ${
            entered ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[9px] tracking-[0.2em] text-white/25">
            Developed by{" "}
            <span className="font-semibold text-gold/70">AbduldbDev</span>
          </p>
          <p className="mt-1 text-[9px] text-white/20">
            © 2026 AbduldbDev. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
