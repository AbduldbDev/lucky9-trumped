const RANK_STYLES = {
  1: { grad: "from-yellow-400 to-yellow-600", icon: "fa-crown" },
  2: { grad: "from-gray-300 to-gray-500", icon: "fa-medal" },
  3: { grad: "from-amber-600 to-amber-800", icon: "fa-award" },
};

function formatRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2).replace(/\.?0+$/, "");
}

export default function LeaderboardPanel({
  entries,
  loading,
  error,
  onRetry,
  selfId,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!entries.length) return <EmptyState />;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {entries.map((player, index) => (
        <LeaderboardCard
          key={player.user_id}
          player={player}
          rank={index + 1}
          isYou={Boolean(selfId) && player.user_id === selfId}
        />
      ))}
    </div>
  );
}

function LeaderboardCard({ player, rank, isYou }) {
  const isTopThree = rank <= 3;
  const style = RANK_STYLES[rank];
  const streak = Number(player.highest_win_streak) || 0;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border px-2.5 py-2 transition-colors sm:px-3.5 sm:py-2.5 ${
        isYou
          ? "border-gold/55 bg-gradient-to-br from-gold-faint/40 to-black/40"
          : isTopThree
            ? "border-gold/40 bg-gradient-to-br from-gold-faint/30 to-black/40 hover:border-gold/60"
            : "border-gold/15 bg-black/30 hover:border-gold/30"
      }`}
    >
      {(isTopThree || isYou) && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
      )}

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="shrink-0">
          {isTopThree ? (
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br shadow-md sm:h-10 sm:w-10 ${style.grad}`}
            >
              <i
                className={`fa-solid ${style.icon} text-xs text-white drop-shadow sm:text-sm`}
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-xs font-semibold text-ivory-dim/70 sm:h-10 sm:w-10 sm:text-sm">
              {rank}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-serif text-xs font-medium tracking-wide text-ivory sm:text-sm">
              {player.username}
            </h3>
            {isYou && (
              <span className="rounded-full border border-gold/40 bg-gold-faint/30 px-1.5 py-px text-[8px] uppercase tracking-wider text-gold-light">
                You
              </span>
            )}
            {isTopThree && !isYou && (
              <i className="fa-solid fa-star text-[8px] text-gold-light/80 sm:text-[9px]" />
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-ivory-dim/60 sm:text-[11px]">
            <span>
              {player.total_wins}W / {player.total_losses}L
            </span>
            {player.level != null && (
              <span className="uppercase tracking-wider text-ivory-dim/45">
                Lv {player.level}
              </span>
            )}
            {player.current_rank && (
              <span className="truncate text-gold-light/70">
                {player.current_rank}
              </span>
            )}
            {streak > 0 && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-fire-flame-curved text-[8px] text-orange-400/80" />
                <span className="font-semibold text-ivory/90">{streak}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={`font-mono text-base font-semibold leading-none tabular-nums sm:text-xl ${
              isTopThree || isYou ? "text-gold-light" : "text-ivory"
            }`}
          >
            {formatRate(player.win_rate)}%
          </div>
          <div className="mt-1 text-[8px] uppercase tracking-wider text-ivory-dim/50 sm:text-[10px]">
            {player.total_matches} matches
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-sm text-gold sm:h-11 sm:w-11">
        <i className="fa-solid fa-spinner fa-spin" />
      </span>
      <p className="mt-3 text-[11px] tracking-wide text-ivory-dim/70 sm:text-xs">
        Loading leaderboard…
      </p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/30 bg-red-400/[0.06] text-sm text-red-400/80 sm:h-11 sm:w-11">
        <i className="fa-solid fa-triangle-exclamation" />
      </span>
      <p className="mt-3 text-[11px] tracking-wide text-ivory-dim/70 sm:text-xs">
        Failed to load leaderboard
      </p>
      <p className="mt-1 max-w-xs text-[10px] text-red-400/60 sm:text-[11px]">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="mt-3 rounded-lg border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-light transition-all hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-[0.97] sm:px-4 sm:text-[11px]"
      >
        <i className="fa-solid fa-rotate-right mr-1.5" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-sm text-gold sm:h-11 sm:w-11">
        <i className="fa-solid fa-trophy" />
      </span>
      <p className="mt-3 text-[11px] tracking-wide text-ivory-dim/70 sm:text-xs">
        No players on leaderboard yet
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/40 sm:text-[10px]">
        Play at least 5 matches to appear here
      </p>
    </div>
  );
}
