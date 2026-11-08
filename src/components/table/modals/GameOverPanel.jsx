import { GAME_CONFIG } from "../../../config/gameRules.config.js";

/**
 * Compact layout: winner is one inline row, vote header + timer share a line,
 * and the host's lobby button sits on the same row as the vote buttons.
 * Voting logic is unchanged.
 */
export default function GameOverPanel({
  winnerName,
  rematchLeft,
  isHost,
  actions,
  view,
  me,
}) {
  const allPlayers = view?.players || [];
  const rematchVotes = view?.rematchVotes || {};
  const myVote = rematchVotes[me?.id];
  const hasVoted = myVote !== undefined;

  // Count votes
  const yesCount = Object.values(rematchVotes).filter(Boolean).length;
  const totalPlayers = allPlayers.length;

  // Get list of players who voted
  const votedPlayerIds = Object.keys(rematchVotes);
  const votedPlayers = votedPlayerIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter(Boolean);

  const urgent = rematchLeft <= 10;

  return (
    <div
      className="relative space-y-2 overflow-hidden rounded-xl border border-gold/30 bg-ink/90 p-2.5
        backdrop-blur-sm sm:space-y-2.5 sm:p-3"
      style={{
        boxShadow:
          "0 16px 40px -16px rgba(0,0,0,0.85), 0 0 24px -14px rgba(217,194,138,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Top hairline accent */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/80 to-transparent" />

      {/* Winner: single inline row */}
      <div className="flex items-center justify-center gap-2.5">
        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-gold/50
            bg-gold/[0.07] sm:h-8 sm:w-8"
          style={{ boxShadow: "0 0 18px -6px rgba(217,194,138,0.55)" }}
        >
          <i className="fa-solid fa-trophy text-[10px] text-gold-light sm:text-xs" />
        </div>
        <div className="min-w-0 text-left leading-tight">
          <span className="block text-[7px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[8px]">
            Match complete
          </span>
          <div className="truncate font-serif text-sm font-medium tracking-wide text-ivory sm:text-base">
            <span className="text-gold-light">{winnerName}</span> wins
          </div>
        </div>
      </div>

      {GAME_CONFIG.ENABLE_REMATCH && (
        <div className="space-y-1.5 border-t border-white/[0.06] pt-2">
          {/* Vote header */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.22em] text-ivory-dim/60 sm:text-[9px]">
              <i className="fa-solid fa-rotate-right text-[7px] text-gold/70" />
              Rematch
              {votedPlayerIds.length > 0 && (
                <span className="font-mono tracking-normal tabular-nums text-gold-light">
                  {yesCount}/{totalPlayers}
                </span>
              )}
            </span>
            <span
              className={`rounded-full border px-1.5 py-px font-mono text-[9px] tabular-nums sm:text-[10px] ${
                urgent
                  ? "border-red-400/40 bg-red-400/[0.07] text-red-300 animate-beat"
                  : "border-gold/30 bg-gold/[0.05] text-gold-light"
              }`}
            >
              {rematchLeft}s
            </span>
          </div>

          {/* Who has voted */}
          {votedPlayers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {votedPlayers.map((p) => {
                const vote = rematchVotes[p.id];
                return (
                  <span
                    key={p.id}
                    className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03]
                      px-2 py-0.5 text-[8px] tracking-wide text-ivory-dim/80 sm:text-[9px]"
                  >
                    <span className="max-w-[80px] truncate">{p.name}</span>
                    {vote ? (
                      <i className="fa-solid fa-check text-[7px] text-emerald-400" />
                    ) : (
                      <i className="fa-solid fa-xmark text-[7px] text-red-300" />
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions: vote buttons + host lobby button share one row */}
      {(GAME_CONFIG.ENABLE_REMATCH || isHost) && (
        <div
          className={`grid gap-1.5 ${
            GAME_CONFIG.ENABLE_REMATCH && isHost
              ? "grid-cols-[1fr_1fr_auto]"
              : GAME_CONFIG.ENABLE_REMATCH
                ? "grid-cols-2"
                : "grid-cols-1"
          }`}
        >
          {GAME_CONFIG.ENABLE_REMATCH && (
            <>
              <button
                disabled={rematchLeft === 0 || hasVoted}
                onClick={() => actions.rematchVote(true)}
                className={`flex min-h-[38px] touch-manipulation items-center justify-center gap-1.5 rounded-lg border
                  border-gold-light/50 bg-gradient-to-b from-gold/25 to-gold/10
                  text-[9px] font-semibold uppercase tracking-[0.22em] text-gold-light
                  transition-all duration-200 hover:border-gold-light/80 hover:from-gold/35
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                  active:scale-[0.98]
                  disabled:cursor-not-allowed disabled:opacity-35
                  sm:text-[10px]
                  ${hasVoted && myVote ? "ring-1 ring-gold-light/70 disabled:opacity-100" : ""}`}
              >
                <i className="fa-solid fa-check text-[8px]" />
                Accept
              </button>
              <button
                disabled={rematchLeft === 0 || hasVoted}
                onClick={() => actions.rematchVote(false)}
                className={`flex min-h-[38px] touch-manipulation items-center justify-center gap-1.5 rounded-lg border
                  border-white/10 bg-transparent text-[9px] font-semibold uppercase tracking-[0.22em]
                  text-ivory-dim/70 transition-all duration-200 hover:border-white/25 hover:text-ivory
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                  active:scale-[0.98]
                  disabled:cursor-not-allowed disabled:opacity-35
                  sm:text-[10px]
                  ${hasVoted && !myVote ? "ring-1 ring-red-400/50 disabled:opacity-100" : ""}`}
              >
                <i className="fa-solid fa-xmark text-[8px]" />
                Decline
              </button>
            </>
          )}

          {isHost && (
            <button
              onClick={actions.reset}
              title="Back to Lobby"
              aria-label="Back to Lobby"
              className="flex min-h-[38px] touch-manipulation items-center justify-center gap-1.5 rounded-lg border
                border-white/[0.08] bg-transparent px-3 text-[9px] uppercase tracking-[0.22em] text-ivory-dim/60
                transition-colors duration-200 hover:border-white/20 hover:text-ivory
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:text-[10px]"
            >
              <i className="fa-solid fa-house text-[9px]" />
              <span className="hidden sm:inline">Lobby</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
