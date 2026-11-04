import { useEffect, useRef, useState } from "react";
import Backdrop from "./Backdrop.jsx";

const SHOW_MS = 1900;
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

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true), 50);
    const t2 = setTimeout(() => setLeaving(true), SHOW_MS);
    const t3 = setTimeout(() => doneRef.current?.(), SHOW_MS + FADE_MS);

    return () => [t1, t2, t3].forEach(clearTimeout);
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
          <div className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-white/10 sm:mt-10 sm:w-56">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/40 via-gold-light to-gold/40 ease-in-out"
              style={{
                width: entered ? "100%" : "0%",
                transitionProperty: "width",
                transitionDuration: `${SHOW_MS - 150}ms`,
              }}
            />
          </div>

          <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/25 sm:text-[10px]">
            Shuffling the deck
          </p>
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
