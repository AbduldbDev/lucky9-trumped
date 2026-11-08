import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../common/AuthLayout.jsx";
import { supabase } from "../../services/supabaseClient.js";

/**
 * Compact leaderboard, styled to match the Lobby and Profile pages.
 * Mobile-first: base = phones, `sm:` = tablets and up.
 * Data loading is unchanged. The list scrolls inside the panel.
 */
export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc(
        "get_leaderboard",
        {
          p_limit: 10,
        },
      );

      if (fetchError) throw fetchError;

      setLeaderboard(data || []);
    } catch (err) {
      console.error("[Lucky9] Failed to load leaderboard:", err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showTagline={false} showRules={false}>
      <div className="w-full overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <span className="block text-[8px] font-semibold uppercase tracking-[0.3em] text-gold/70 sm:text-[9px]">
              Hall of Fame
            </span>
            <h1 className="font-serif text-base font-medium leading-tight tracking-wide text-ivory sm:text-xl">
              Leaderboard
            </h1>
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[10px]">
              Top players by win rate
            </p>
          </div>
          <button
            onClick={() => navigate("/lobby")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold-faint/20 text-gold-light transition-all hover:border-gold/50 hover:bg-gold-faint/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-95 sm:h-9 sm:w-9"
            aria-label="Back to Lobby"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Content (scrolls inside the panel) */}
        <div className="max-h-[62dvh] overflow-y-auto overscroll-contain p-2.5 [scrollbar-color:rgba(212,175,55,0.35)_transparent] [scrollbar-width:thin] sm:max-h-[520px] sm:p-4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={loadLeaderboard} />
          ) : leaderboard.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {leaderboard.map((player, index) => (
                <LeaderboardCard
                  key={player.user_id}
                  player={player}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-3.5 py-2.5 sm:px-5 sm:py-3">
          <p className="text-center text-[9px] tracking-wide text-ivory-dim/40 sm:text-[11px]">
            Minimum 5 matches required to appear on leaderboard
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

const RANK_STYLES = {
  1: { grad: "from-yellow-400 to-yellow-600", icon: "fa-crown" },
  2: { grad: "from-gray-300 to-gray-500", icon: "fa-medal" },
  3: { grad: "from-amber-600 to-amber-800", icon: "fa-award" },
};

function LeaderboardCard({ player, rank }) {
  const isTopThree = rank <= 3;
  const style = RANK_STYLES[rank];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border px-2.5 py-2 transition-colors sm:px-3.5 sm:py-2.5 ${
        isTopThree
          ? "border-gold/40 bg-gradient-to-br from-gold-faint/30 to-black/40 hover:border-gold/60"
          : "border-gold/15 bg-black/30 hover:border-gold/30"
      }`}
    >
      {isTopThree && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
      )}

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Rank badge */}
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

        {/* Player info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-serif text-xs font-medium tracking-wide text-ivory sm:text-sm">
              {player.username}
            </h3>
            {isTopThree && (
              <i className="fa-solid fa-star text-[8px] text-gold-light/80 sm:text-[9px]" />
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-ivory-dim/60 sm:text-[11px]">
            <span>
              {player.total_wins}W / {player.total_losses}L
            </span>
            {isTopThree && player.highest_win_streak > 0 && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-fire-flame-curved text-[8px] text-orange-400/80" />
                <span className="font-semibold text-ivory/90">
                  {player.highest_win_streak}
                </span>
                <span className="hidden text-ivory-dim/40 sm:inline">
                  best streak
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="shrink-0 text-right">
          <div
            className={`font-mono text-base font-semibold leading-none tabular-nums sm:text-xl ${
              isTopThree ? "text-gold-light" : "text-ivory"
            }`}
          >
            {player.win_rate}%
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
