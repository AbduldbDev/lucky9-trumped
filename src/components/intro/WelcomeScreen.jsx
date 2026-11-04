import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../../config/gameRules.config.js";
import Backdrop from "./Backdrop.jsx";

const FADE_MS = 350;

export default function WelcomeScreen({ profile, isFirstVisit, onEnter }) {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => {
      clearTimeout(t);
      clearTimeout(timer.current);
    };
  }, []);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    timer.current = setTimeout(onEnter, FADE_MS);
  };

  const rules = [
    [
      "fa-users",
      `${GAME_CONFIG.MIN_PLAYERS}–${GAME_CONFIG.MAX_PLAYERS}`,
      "Players",
    ],
    ["fa-heart", `${GAME_CONFIG.STARTING_LIVES}`, "Lives"],
    ["fa-clone", `${GAME_CONFIG.MAX_CARDS_IN_HAND}`, "Max Cards"],
  ];

  return (
    <div
      className={`relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-8 transition-opacity sm:px-8 sm:py-12 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <Backdrop />

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${
          entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {/* Brand */}
        <header className="mb-5 text-center sm:mb-8">
          <h1 className="text-gold-shimmer font-serif font-black leading-none tracking-[0.12em] text-4xl sm:text-5xl sm:tracking-[0.15em]">
            LUCKY 9
          </h1>
          <div className="mt-3 flex items-center gap-3 sm:mt-4 sm:gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.35em] text-gold-light/70 sm:text-xs sm:tracking-[0.5em]">
              Trump Card Edition
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
          {/* Greeting */}
          <div className="px-5 pb-4 pt-6 text-center sm:px-8 sm:pb-6 sm:pt-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/35 sm:text-[10px]">
              {isFirstVisit ? "Welcome" : "Welcome back"}
            </p>
            <h2 className="mt-2 break-words font-serif text-2xl font-bold text-gold-light sm:mt-3 sm:text-3xl">
              {profile.username || "Player"}
            </h2>
            <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/40 sm:mt-4 sm:text-sm">
              {isFirstVisit
                ? "Your seat is ready. Host a private table or join your friends with a room code."
                : `${profile.stats.totalWins} ${
                    profile.stats.totalWins === 1 ? "win" : "wins"
                  } in ${profile.stats.totalMatches} ${
                    profile.stats.totalMatches === 1 ? "match" : "matches"
                  }. The table is waiting for you.`}
            </p>
          </div>

          {/* House rules */}
          <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-black/30">
            {rules.map(([ic, value, label]) => (
              <div
                key={label}
                className="px-2 py-3 text-center sm:px-3 sm:py-4"
              >
                <div className="font-mono text-sm font-semibold text-gold sm:text-lg">
                  <i
                    className={`fa-solid ${ic} mr-1.5 text-xs text-gold/70 sm:text-sm`}
                  />
                  {value}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px] sm:tracking-widest">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Chips + CTA */}
          <div className="space-y-3 px-5 pb-5 pt-4 sm:space-y-4 sm:px-8 sm:pb-8 sm:pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-gold/25 bg-black/30 px-3.5 py-2.5 sm:px-4 sm:py-3.5">
              <span className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-xs text-gold sm:h-9 sm:w-9 sm:text-sm">
                  <i className="fa-solid fa-coins" />
                </span>
                <span className="text-xs font-semibold text-ivory sm:text-sm">
                  {isFirstVisit ? "Starting stack" : "Your stack"}
                </span>
              </span>
              <span className="font-mono text-sm font-semibold text-gold-light sm:text-lg">
                {profile.chips}
              </span>
            </div>

            <button
              onClick={enter}
              className="group relative w-full overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 py-3 text-sm font-bold tracking-wide text-gold-light shadow-[0_6px_16px_-10px_rgba(212,175,55,0.2)] transition-all hover:border-gold/80 hover:shadow-[0_8px_20px_-10px_rgba(212,175,55,0.3)] active:scale-[0.98] sm:py-4 sm:text-base"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Enter the Casino
              <i className="fa-solid fa-arrow-right-long ml-2.5 text-xs" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
