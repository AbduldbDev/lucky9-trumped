import { GAME_CONFIG } from "../../../config/gameRules.config.js";

export default function GameOverPanel({
  winnerName,
  rematchLeft,
  isHost,
  actions,
}) {
  return (
    <div className="rounded-lg border border-gold/30 bg-gold-faint/20 p-3 text-center space-y-3">
      <div className="font-serif font-bold text-lg text-gold-light">
        <i className="fa-solid fa-trophy mr-2" />
        {winnerName} wins
      </div>

      {GAME_CONFIG.ENABLE_REMATCH && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span>
              <i className="fa-solid fa-rotate-right mr-1" />
              Rematch vote
            </span>
            <span
              className={`font-mono ${rematchLeft <= 10 ? "text-red-400 animate-beat" : "text-gold"}`}
            >
              {rematchLeft}s
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={rematchLeft === 0}
              onClick={() => actions.rematchVote(true)}
              className="min-h-[44px] rounded-md text-xs font-semibold uppercase tracking-widest
                        bg-emerald-900/50 border border-emerald-700/40 text-emerald-300
                        hover:bg-emerald-900/70 disabled:cursor-not-allowed disabled:opacity-30 transition touch-manipulation"
            >
              <i className="fa-solid fa-check mr-1" />
              Accept
            </button>
            <button
              disabled={rematchLeft === 0}
              onClick={() => actions.rematchVote(false)}
              className="min-h-[44px] rounded-md text-xs font-semibold uppercase tracking-widest
                        bg-black/30 border border-white/10 text-white/50
                        hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-30 hover:text-white/70 transition touch-manipulation"
            >
              <i className="fa-solid fa-xmark mr-1" />
              Decline
            </button>
          </div>
        </div>
      )}

      {isHost && (
        <button
          onClick={actions.reset}
          className="w-full min-h-[40px] rounded-md border border-white/10 bg-white/5
                    text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70
                    transition touch-manipulation"
        >
          <i className="fa-solid fa-house mr-1" />
          Back to Lobby
        </button>
      )}
    </div>
  );
}
