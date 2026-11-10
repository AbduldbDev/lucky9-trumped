import { useEffect, useRef } from "react";
import { useAudio } from "../../../contexts/AudioContext.jsx";

let audio = null;
const DEFAULT_VOLUME = 0.7;

function startCountdownAudio(volume = DEFAULT_VOLUME) {
  if (!audio) {
    audio = new Audio("/sfx/countdown_tick.mp3");
    audio.preload = "auto";
  }

  if (!audio.paused && !audio.ended) return;

  audio.currentTime = 0;
  audio.volume = volume;
  audio.play().catch((e) => {
    if (e.name !== "AbortError") {
      console.warn("Countdown audio failed:", e);
    }
  });
}

function stopCountdownAudio() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

// Safe volume: handles missing values, 0-100 or 0-1 scales, clamps to [0, 1]
function resolveVolume(audioManager) {
  if (audioManager?.sfxEnabled === false) return 0;

  const raw = Number(audioManager?.sfxVolume);
  if (!Number.isFinite(raw)) return DEFAULT_VOLUME;

  const normalized = raw > 1 ? raw / 100 : raw;
  return Math.min(1, Math.max(0, normalized));
}

export default function ShowdownOverlay({ countdown }) {
  const audioManager = useAudio();
  const volumeRef = useRef(DEFAULT_VOLUME);
  volumeRef.current = resolveVolume(audioManager);

  useEffect(() => {
    startCountdownAudio(volumeRef.current);
    return () => stopCountdownAudio();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Showdown in ${countdown}`}
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(10,10,11,0.88) 0%, rgba(0,0,0,0.96) 78%)",
        contain: "layout paint",
      }}
    >
      {/* Eyebrow */}
      <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60 sm:w-14" />
        <span className="font-serif text-[10px] uppercase tracking-[0.5em] text-gold/80 sm:text-xs">
          Showdown
        </span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/60 sm:w-14" />
      </div>

      {/* Countdown medallion (static layers, never repainted) */}
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-52 sm:w-52">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(217,194,138,0.14) 0%, transparent 68%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-gold/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-3 rounded-full border border-gold/45 sm:inset-4"
        />

        {/* One-shot pulse ring per tick (transform + opacity only) */}
        <span
          key={`ring-${countdown}`}
          aria-hidden="true"
          className="absolute inset-3 rounded-full border border-gold-light/60 animate-ping sm:inset-4"
          style={{
            animationIterationCount: 1,
            animationDuration: "0.9s",
            willChange: "transform, opacity",
          }}
        />

        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            key={countdown}
            className="font-serif text-7xl font-medium leading-none text-gold-light animate-countdownPop sm:text-9xl"
            style={{
              transformOrigin: "center center",
              fontVariantNumeric: "lining-nums tabular-nums",
              paddingTop: "0.08em",
              textShadow: "0 0 28px rgba(217,194,138,0.35)",
              willChange: "transform, opacity",
            }}
          >
            {countdown}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 flex flex-col items-center gap-1.5 sm:mt-8">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-ivory/70 sm:text-[11px]">
          All players stood
        </span>
        <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-ivory-dim/50 sm:text-[10px]">
          <span className="h-1 w-1 rounded-full bg-gold/80" />
          Revealing winner
        </span>
      </div>
    </div>
  );
}
