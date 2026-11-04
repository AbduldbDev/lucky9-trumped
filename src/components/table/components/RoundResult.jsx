/** Scoreboard for the last round + auto next-round countdown. */
export default function RoundResult({
  result,
  allPlayers,
  bet,
  showNextRound,
  nextRoundLeft,
}) {
  return (
    <div className="rounded-lg border border-gold/15 bg-ink/70 overflow-hidden">
      <div className="px-3 py-2 bg-gold-faint/60 border-b border-white/5 flex items-center gap-2">
        <i className="fa-solid fa-trophy text-gold text-xs" />
        <span className="text-xs font-semibold text-gold">
          Round {result.round} · {bet}♥ bet
          {result.draw && <span className="text-white/40 ml-1">· Draw</span>}
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {allPlayers
          .filter((p) => result.scores?.[p.id] !== undefined)
          .sort(
            (a, b) => (result.scores[b.id] ?? 0) - (result.scores[a.id] ?? 0),
          )
          .map((p) => {
            const win = result.winnerIds?.includes(p.id);
            const elim = result.eliminatedIds?.includes(p.id);
            const nat = result.naturalIds?.includes(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-1.5 text-xs min-w-0">
                  {win && (
                    <i className="fa-solid fa-trophy text-gold text-[10px]" />
                  )}
                  {elim && (
                    <i className="fa-solid fa-skull text-red-400 text-[10px]" />
                  )}
                  <span
                    className={`truncate ${win ? "text-gold-light font-semibold" : "text-white/50"}`}
                  >
                    {p.name}
                  </span>
                  {nat && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-900/30 rounded px-1">
                      Nat
                    </span>
                  )}
                </div>
                <span
                  className={`font-mono font-bold text-sm ${win ? "text-gold" : "text-white/40"}`}
                >
                  {result.scores[p.id]}
                </span>
              </li>
            );
          })}
      </ul>

      {showNextRound && (
        <div className="flex items-center justify-center gap-2 py-3 border-t border-white/5 text-xs text-white/50">
          <i className="fa-solid fa-forward-step text-gold/70" />
          <span>Next round starts in</span>
          <span
            key={nextRoundLeft}
            className={`font-mono font-bold text-sm tabular-nums animate-countdownPop ${
              nextRoundLeft <= 2 ? "text-red-400" : "text-gold"
            }`}
          >
            {nextRoundLeft}
          </span>
        </div>
      )}
    </div>
  );
}
