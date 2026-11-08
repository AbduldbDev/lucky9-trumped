import { useEffect, useRef } from "react";
import { useAudio } from "../../../contexts/AudioContext.jsx";

/** Full-screen 3-2-1 overlay shown while all players have stood. */
export default function ShowdownOverlay({ countdown }) {
  const audio = useAudio();
  const playedCountdownRef = useRef(new Set());
  const lastCountdownRef = useRef(null);
  const isInitializedRef = useRef(false);
  const audioRef = useRef(audio);

  // Keep audio ref updated without triggering re-renders
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  // Reset on mount and when countdown resets to 3
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      playedCountdownRef.current.clear();
      lastCountdownRef.current = null;
    }

    if (countdown === 3 && lastCountdownRef.current !== 3) {
      playedCountdownRef.current.clear();
    }

    lastCountdownRef.current = countdown;
  }, [countdown]);

  // Play audio only when countdown changes to a new valid value
  useEffect(() => {
    // Skip if already played or invalid countdown
    if (
      playedCountdownRef.current.has(countdown) ||
      countdown > 3 ||
      countdown < 0
    ) {
      return;
    }

    // Use a larger delay for countdown to prevent double-triggering
    // This accounts for rapid state updates and fallback audio issues
    const timeoutId = setTimeout(() => {
      // Double-check we haven't played this yet
      if (!playedCountdownRef.current.has(countdown)) {
        playedCountdownRef.current.add(countdown);

        if (countdown > 0 && countdown <= 3) {
          audioRef.current.playCountdownTick();
        } else if (countdown === 0) {
          audioRef.current.playCountdownGo();
        }
      }
    }, 150); // Increased from 50ms to 150ms to prevent doubles

    return () => clearTimeout(timeoutId);
  }, [countdown]); // Removed 'audio' dependency to prevent double-triggering

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
      playedCountdownRef.current.clear();
      lastCountdownRef.current = null;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
          bg-black/80 animate-fadeUp pointer-events-none"
    >
      <div className="text-[11px] text-gold-DEFAULT/60 font-serif uppercase tracking-[0.4em] mb-2">
        Showdown
      </div>
      <div
        key={countdown}
        className="text-gold-shimmer font-serif font-black text-8xl animate-countdownPop"
      >
        {countdown}
      </div>
      <div className="text-[11px] text-white/25 font-mono mt-3">
        All players stood — revealing winner…
      </div>
    </div>
  );
}
