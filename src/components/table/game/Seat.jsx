import Card from "../../cards/Card.jsx";
import FogBadge from "../../cards/FogBadge.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { useState } from "react";

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
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (targetable) onTarget?.(player);
  };

  const handSize = player.hand.length;
  const shouldFan = handSize >= 2;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`player-seat group relative flex flex-col items-center select-none
          gap-1.5 sm:gap-2 rounded-xl border p-1.5 sm:p-2.5
          backdrop-blur-sm transition-all duration-300
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
          ${
            isTurn && !isOut
              ? "active-turn border-gold/50 bg-ink/70"
              : "border-white/[0.07] bg-ink/50"
          }
          ${targetable ? "targetable cursor-pointer border-red-400/40 hover:border-red-300/70 hover:bg-red-950/30" : ""}
          ${isOut ? "opacity-40 grayscale" : ""}
          ${isMe && !(isTurn && !isOut) ? "border-gold/25" : ""}
        `}
        style={{
          boxShadow:
            isTurn && !isOut
              ? "0 0 22px -8px rgba(217,194,138,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        role={targetable ? "button" : undefined}
        tabIndex={targetable ? 0 : undefined}
        aria-label={`${player.name}${targetable ? " — click to target" : ""}`}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        {/* Active turn: top hairline + crown badge */}
        {isTurn && !isOut && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-0 h-px
                  bg-gradient-to-r from-transparent via-gold-light/80 to-transparent"
            />
            <span
              aria-hidden="true"
              title="Current turn"
              className="absolute left-1/2 top-0 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2
                  items-center justify-center rounded-full  bg-ink
                  sm:h-5 sm:w-5"
            >
              <i className="fa-solid fa-crown text-[7px] text-gold-light sm:text-[9px]" />
            </span>
          </>
        )}

        {/* Target crosshair */}
        {targetable && (
          <div
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center
                rounded-full border border-red-300/40 bg-red-500/90 shadow-lg animate-beat
                sm:h-5 sm:w-5"
          >
            <i className="fa-solid fa-crosshairs text-[8px] text-white sm:text-[9px]" />
          </div>
        )}

        {/* Name row */}
        <div className="flex w-full items-center justify-between gap-3 sm:gap-7">
          <div className="flex flex-col">
            <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              {player.id === player.hostId && (
                <i className="fa-solid fa-crown flex-none text-[8px] text-gold sm:text-[9px]" />
              )}
              <span
                className="max-w-[55px] truncate text-[9px] font-medium tracking-wide
                  text-ivory sm:max-w-[70px] sm:text-[11px]"
              >
                {player.name}
              </span>
              {isMe && (
                <span className="flex-none text-[7px] uppercase tracking-[0.15em] text-gold/60 sm:text-[8px]">
                  you
                </span>
              )}
            </div>
            {/* Lives bar */}
            <div className="flex w-full items-center gap-1.5 sm:gap-2">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10 sm:h-1">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400
              transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (lives / maxLives) * 100)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-[8px] tabular-nums text-ivory-dim/50 sm:text-[10px]">
                {lives}
              </span>
            </div>
          </div>

          {/* Score badge */}
          {!isOut && handSize > 0 && (
            <div className="flex-none">
              <FogBadge hand={player.hand} revealed={revealed} />
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        className={`flex justify-center transition-all duration-300 ${
          shouldFan && !isOut ? "pt-2 sm:pt-3" : ""
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded((v) => !v)}
      >
        {isOut ? (
          <div className="text-[9px] sm:text-[10px] text-red-400/70 font-medium">
            <i className="fa-solid fa-skull mr-0.5 sm:mr-1" />
            {player.isSpectator ? "Spectating" : "Out"}
          </div>
        ) : handSize === 0 ? (
          <div className="w-8 h-12 sm:w-11 sm:h-16 rounded opacity-20 border border-white/10" />
        ) : (
          player.hand.map((c, i) => {
            const fanned = shouldFan && !expanded;
            const mid = (handSize - 1) / 2;
            const offset = i - mid;

            return (
              <div
                key={i}
                className={`transition-all duration-300 ease-out ${
                  i === 0 ? "" : fanned ? "-ml-6 sm:-ml-8" : "ml-0.5"
                }`}
                style={{
                  // all cards pivot from the bottom centre, like holding a hand
                  transformOrigin: "50% 100%",
                  transform: fanned ? `rotate(${offset * 15}deg)` : "none",
                  // later cards sit on top
                  zIndex: i,
                }}
              >
                <Card card={c} size="xs" skinId={player.skinId} />
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center w-full mt-3">
        <div className="text-[9px] sm:text-[10px] text-white/30">
          {isTurn && !isOut && (
            <span className="text-gold-DEFAULT inline-flex items-center">
              <i
                className="fa-solid fa-hourglass-half mr-1
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
