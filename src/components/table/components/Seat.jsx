import Card from "../../cards/Card.jsx";
import FogBadge from "../../cards/FogBadge.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";

export default function Seat({
  player,
  isTurn,
  revealed,
  targetable,
  onTarget,
  isMe = false,
}) {
  const isOut = player.isEliminated || player.isSpectator;
  const lives = player.lives;
  const maxLives = GAME_CONFIG.STARTING_LIVES;

  const handleClick = () => {
    if (targetable) onTarget?.(player);
  };

  return (
    <div
      onClick={handleClick}
      className={`player-seat relative flex flex-col items-center
        gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl
        p-1 sm:p-2 select-none transition-all
        ${isTurn && !isOut ? "active-turn bg-black/40" : "bg-black/25"}
        ${targetable ? "targetable hover:bg-red-950/40" : ""}
        ${isOut ? "opacity-40" : ""}
        ${isMe ? "ring-1 ring-white/20" : ""}
      `}
      role={targetable ? "button" : undefined}
      tabIndex={targetable ? 0 : undefined}
      aria-label={`${player.name}${targetable ? " — click to target" : ""}`}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Active turn pip */}
      {isTurn && !isOut && (
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2
          w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
          bg-gold-DEFAULT shadow-gold animate-glow"
        />
      )}

      {/* Target crosshair */}
      {targetable && (
        <div
          className="absolute -top-1 -right-1
          w-4 h-4 sm:w-5 sm:h-5 rounded-full
          bg-red-600 flex items-center justify-center
          shadow-lg animate-beat"
        >
          <i className="fa-solid fa-crosshairs text-white text-[8px] sm:text-[9px]" />
        </div>
      )}

      {/* Name */}
      <div className="flex items-center gap-0.5 sm:gap-1 max-w-full">
        {player.id === player.hostId && (
          <i className="fa-solid fa-crown text-gold-DEFAULT text-[8px] sm:text-[9px]" />
        )}
        <span
          className="text-[9px] sm:text-[11px] font-semibold
          text-ivory-DEFAULT truncate max-w-[55px] sm:max-w-[70px]"
        >
          {player.name}
        </span>
        {isMe && (
          <span className="text-[8px] sm:text-[9px] text-white/30">(you)</span>
        )}
      </div>

      {/* Score badge */}
      {!isOut && player.hand.length > 0 && (
        <FogBadge hand={player.hand} revealed={revealed} />
      )}

      {/* Cards */}
      <div className="flex gap-0 justify-center">
        {isOut ? (
          <div className="text-[9px] sm:text-[10px] text-red-400/70 font-medium">
            <i className="fa-solid fa-skull mr-0.5 sm:mr-1" />
            {player.isSpectator ? "Spectating" : "Out"}
          </div>
        ) : player.hand.length === 0 ? (
          <div
            className="w-8 h-12 sm:w-11 sm:h-16 rounded
            opacity-20 border border-white/10"
          />
        ) : (
          player.hand.map((c, i) => (
            <Card key={i} card={c} size="xs" skinId={player.skinId} />
          ))
        )}
      </div>

      {/* Lives bar */}
      <div className="w-full flex items-center gap-1 sm:gap-1.5">
        <div
          className="flex-1 h-0.5 sm:h-1 rounded-full
          bg-white/10 overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400
              transition-all duration-500"
            style={{
              width: `${Math.min(100, (lives / maxLives) * 100)}%`,
            }}
          />
        </div>
        <span
          className="text-[8px] sm:text-[10px] text-white/40
          tabular-nums font-mono"
        >
          {lives}
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center w-full">
        <div className="text-[9px] sm:text-[10px] text-white/30">
          {isTurn && !isOut && (
            <span className="text-gold-DEFAULT inline-flex items-center">
              <i
                className="fa-solid fa-hourglass-half mr-0.5 sm:mr-1
                animate-[spin_2s_linear_infinite]"
              />
              Playing
            </span>
          )}

          {player.stood && !isOut && !isTurn && (
            <span>
              <i className="fa-solid fa-hand mr-0.5 sm:mr-1" />
              Stood
            </span>
          )}

          {player.disabled && (
            <span className="text-yellow-400">
              <i className="fa-solid fa-ban mr-0.5 sm:mr-1" />
              Off
            </span>
          )}

          {player.angelProtected && (
            <span className="text-purple-400">
              <i className="fa-solid fa-shield-halved" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
