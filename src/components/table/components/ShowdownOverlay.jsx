import { useEffect } from "react";
import { useAudio } from "../../../contexts/AudioContext.jsx";

/** Full-screen 3-2-1 overlay shown while all players have stood. */
export default function ShowdownOverlay({ countdown }) {
  const audio = useAudio();

  useEffect(() => {
    if (countdown > 0) {
      audio.playCountdownTick();
    } else if (countdown === 0) {
      audio.playCountdownGo();
    }
  }, [countdown, audio]);

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
