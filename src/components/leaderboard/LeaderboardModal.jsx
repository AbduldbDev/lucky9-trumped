import { useLeaderboard } from "../../hooks/useLeaderboard.js";
import LeaderboardPanel from "./LeaderboardPanel.jsx";

export default function LeaderboardModal({ selfId, onClose }) {
  const { entries, loading, error, reload } = useLeaderboard(10);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
      className="fixed   inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-ink/95 animate-fadeUp"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
              Hall of Fame
            </span>
            <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-base">
              Leaderboard
            </h2>
            <p className="mt-0.5 text-[9px] text-ivory-dim/50 sm:text-[10px]">
              Top players by win rate
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={reload}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/5 hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 disabled:opacity-40"
              aria-label="Refresh leaderboard"
            >
              <i
                className={`fa-solid fa-rotate-right text-xs ${loading ? "fa-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/5 hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              aria-label="Close leaderboard"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        <div className="max-h-[62dvh] overflow-y-auto overscroll-contain p-3 [scrollbar-color:rgba(212,175,55,0.35)_transparent] [scrollbar-width:thin] sm:p-4">
          <LeaderboardPanel
            entries={entries}
            loading={loading}
            error={error}
            onRetry={reload}
            selfId={selfId}
          />
        </div>

        <div className="border-t border-white/[0.06] px-4 py-2.5 sm:px-5 sm:py-3">
          <p className="text-center text-[9px] tracking-wide text-ivory-dim/40 sm:text-[11px]">
            Minimum 5 matches required to appear on the leaderboard
          </p>
        </div>
      </div>
    </div>
  );
}
