import FogBadge from "../../cards/FogBadge.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { PHASES } from "../../../utils/gameEngine.js";

export default function PlayerInfo({ me, phase, amSpectator, cardsFlipped }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 pt-2 pb-1
          sm:flex-col sm:flex-nowrap sm:items-stretch sm:flex-none sm:w-[168px]
          sm:gap-2 sm:p-3 sm:border-r border-white/5"
    >
      {/* Name */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm sm:text-xs font-semibold text-ivory truncate max-w-[120px]">
          {me.name}
        </span>
        {me.angelProtected && (
          <i className="fa-solid fa-shield-halved text-purple-400 text-xs" />
        )}
        {phase === PHASES.PLAYING && me.stood && !amSpectator && (
          <span className="text-[10px] uppercase tracking-wider text-gold/70">
            <i className="fa-solid fa-hand mr-1" />
            Stood
          </span>
        )}
      </div>

      {/* Lives */}
      <div className="flex-1 min-w-[110px] sm:flex-none space-y-1">
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <span>
            <i className="fa-solid fa-heart text-red-500/60 mr-1" />
            Lives
          </span>
          <span className="font-mono text-white/60">
            {me.lives}/{GAME_CONFIG.STARTING_LIVES}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
            style={{
              width: `${(me.lives / GAME_CONFIG.STARTING_LIVES) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Score + card count */}
      <div className="flex items-center gap-3 sm:justify-between text-[10px] text-white/40">
        {me.hand.length > 0 && (
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-hashtag" />
            <FogBadge
              hand={me.hand}
              isSelf
              revealed
              forceValue={cardsFlipped ? 0 : null}
            />
          </span>
        )}
        <span className="text-white/30">
          <i className="fa-regular fa-clone mr-1" />
          {me.hand.length}/{GAME_CONFIG.MAX_CARDS_IN_HAND}
        </span>
      </div>
    </div>
  );
}
