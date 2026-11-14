import { useNavigate } from "react-router-dom";
import AuthLayout from "../common/AuthLayout.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLeaderboard } from "../../hooks/useLeaderboard.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import LeaderboardPanel from "./LeaderboardPanel.jsx";

/**
 * Compact leaderboard, styled to match the Lobby and Profile pages.
 * Mobile-first: base = phones, `sm:` = tablets and up.
 * The list scrolls inside the panel.
 */
export default function Leaderboard() {
  usePageTitle("Leaderboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, loading, error, reload } = useLeaderboard(10);

  return (
    <AuthLayout showTagline={true} showRules={true}>
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
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain p-2.5 [scrollbar-color:rgba(212,175,55,0.35)_transparent] [scrollbar-width:thin] sm:max-h-[45vh] sm:p-4">
          <LeaderboardPanel
            entries={entries}
            loading={loading}
            error={error}
            onRetry={reload}
            selfId={user?.id}
          />
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
