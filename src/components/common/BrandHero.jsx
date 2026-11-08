import { GAME_CONFIG } from "../../config/gameRules.config.js";

/**
 * Reusable Lucky 9 hero / logo block.
 * Props:
 *  - showTagline: show the "Take a seat..." paragraph on large screens (default true)
 *  - showRules:   show the players / lives / cards badges (default true)
 */
export default function BrandHero({ showTagline = true, showRules = true }) {
  const rules = [
    [
      "fa-users",
      `${GAME_CONFIG.MIN_PLAYERS}–${GAME_CONFIG.MAX_PLAYERS} Players`,
    ],
    ["fa-heart", `${GAME_CONFIG.STARTING_LIVES} Lives`],
    ["fa-clone", `Up to ${GAME_CONFIG.MAX_CARDS_IN_HAND} Cards`],
  ];

  return (
    <header className="flex w-full max-w-md flex-col items-center text-center lg:max-w-none lg:flex-1 lg:items-start lg:text-left">
      <div className="mb-3 flex items-center gap-2.5 text-gold-DEFAULT/60 text-base tracking-[0.5em] sm:mb-4 sm:gap-3 sm:text-xl sm:tracking-[0.6em]">
        <span>♠</span>
        <span className="text-red-500/60">♥</span>
        <span>♣</span>
        <span className="text-red-500/60">♦</span>
      </div>

      <h1 className="text-gold-shimmer font-serif font-black tracking-[0.12em] leading-none text-4xl sm:text-7xl sm:tracking-[0.15em] lg:text-8xl">
        LUCKY 9
      </h1>

      <div className="mt-4 flex w-full items-center gap-3 sm:mt-5 sm:gap-4 lg:max-w-sm">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-DEFAULT/40 lg:from-gold-DEFAULT/40" />
        <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.35em] sm:tracking-[0.5em] text-gold-light/70 whitespace-nowrap">
          Trump Card Edition
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-DEFAULT/40" />
      </div>

      <p className="mt-6 hidden max-w-sm text-sm leading-relaxed text-white/40 lg:block">
        Take a seat at the private table. Bring your friends, play your cards
        wisely, and outlast the house.
      </p>

      {/* Rules summary */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:mt-6 sm:gap-2 lg:justify-start">
        {[
          [
            "fa-users",
            `${GAME_CONFIG.MIN_PLAYERS}–${GAME_CONFIG.MAX_PLAYERS} Players`,
          ],
          ["fa-heart", `${GAME_CONFIG.STARTING_LIVES} Lives`],
          ["fa-clone", `Up to ${GAME_CONFIG.MAX_CARDS_IN_HAND} Cards`],
        ].map(([ic, lb]) => (
          <span
            key={lb}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-black/30 px-2.5 py-1 text-[10px] text-white/60 backdrop-blur sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            <i
              className={`fa-solid ${ic} text-[9px] text-gold/70 sm:text-[10px]`}
            />
            {lb}
          </span>
        ))}
      </div>
    </header>
  );
}
