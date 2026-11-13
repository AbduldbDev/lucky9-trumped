import { EmptyState } from "./ProfileWidgets.jsx";

/** Match History tab body: loading / empty / scrollable result rows. */
export default function MatchHistoryList({ matchHistory, loading }) {
  return (
    <div className="overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.35)_transparent] max-h-[48dvh] space-y-1.5 sm:max-h-[420px] sm:space-y-2">
      {loading ? (
        <EmptyState
          icon="fa-spinner fa-spin"
          text="Loading match history…"
        />
      ) : matchHistory.length === 0 ? (
        <EmptyState icon="fa-inbox" text="No matches played yet" />
      ) : (
        matchHistory.map((match) => (
          <div
            key={match.match_id}
            className={`rounded-xl border px-2.5 py-2 sm:rounded-2xl sm:px-3.5 sm:py-3 ${
              match.won
                ? "border-emerald-500/25 bg-emerald-950/20"
                : "border-red-500/25 bg-red-950/20"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border sm:h-9 sm:w-9 ${
                    match.won
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  <i
                    className={`fa-solid ${match.won ? "fa-trophy" : "fa-xmark"} text-[10px] sm:text-xs`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-ivory sm:text-xs">
                    {match.won ? "Victory" : "Defeat"}
                  </p>
                  <p className="truncate text-[9px] text-white/35 sm:text-[11px]">
                    Room: {match.match_code}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[11px] font-semibold text-gold sm:text-xs">
                  {match.won ? `+${match.chips_rewarded}` : "0"} chips
                </p>
                <p className="text-[9px] text-white/35 sm:text-[11px]">
                  {match.total_rounds} rounds ·{" "}
                  {Math.floor(match.duration_seconds / 60)}m
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
