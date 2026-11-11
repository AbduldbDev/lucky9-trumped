import Card from "../../cards/Card.jsx";
import FogBadge from "../../cards/FogBadge.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { useState } from "react";
import SeatTimerRing from "./SeatTimerRing.jsx";
import useTurnCountdown from "../../../hooks/useTurnCountdown.js";

export default function Seat({
  player,
  isTurn,
  revealed,
  targetable,
  onTarget,
  isMe = false,
  turnStartTime = null,
  totalPauseTime = 0,
  paused = false,
  turnKey = null,
  ringSide = "left",
  onShowStats,
}) {
  const isOut = player.isEliminated || player.isSpectator;
  const lives = player.lives;
  const maxLives = GAME_CONFIG.STARTING_LIVES;
  const [expanded, setExpanded] = useState(false);

  const myTurn = isTurn && !isOut;

  // Countdown for this player's turn (logic lives in the hook)
  const secondsLeft = useTurnCountdown({
    active: myTurn,
    turnStartTime,
    totalPauseTime,
    paused,
    turnKey,
  });

  const handleClick = () => {
    if (targetable) {
      onTarget?.(player);
    }
  };

  const handleAvatarClick = (e) => {
    // Only show stats if not targetable (targeting takes priority)
    if (!targetable && !isMe && onShowStats) {
      e.stopPropagation();
      onShowStats(player);
    }
  };

  const handSize = player.hand.length;
  const shouldFan = handSize >= 2;
  const livesPct = Math.min(100, (lives / maxLives) * 100);

  return (
    <div className="relative flex flex-col items-center">
      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="player-seat group relative select-none focus-visible:outline-none">
        {/* Timer ring: hangs off the left edge, doesn't affect centering */}
        <div
          className={`absolute  ${
            ringSide === "right" ? "left-full ml-1.5" : "right-full mr-1.5"
          }`}
        >
          <SeatTimerRing
            active={myTurn}
            secondsLeft={secondsLeft}
            paused={paused}
            name={player.name}
            onClick={
              !targetable && !isMe && onShowStats ? handleAvatarClick : null
            }
          />
        </div>

        {/* Avatar circle (clickable for stats) */}
        {/* {!isMe && onShowStats && (
          <button
            onClick={handleAvatarClick}
            disabled={targetable}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold-faint/50 to-black/50 font-serif text-sm font-bold text-gold-light shadow-[0_0_12px_-6px_rgba(212,175,55,0.3)] transition-all sm:h-8 sm:w-8 ${
              targetable
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-gold/50 hover:shadow-[0_0_16px_-4px_rgba(212,175,55,0.5)] cursor-pointer active:scale-95"
            }`}
            title={targetable ? "" : "View player stats"}
            aria-label={`View ${player.name}'s statistics`}
          >
            {(player.name[0] || "?").toUpperCase()}
          </button>
        )} */}

        {/* Name panel */}
        <div
          onClick={handleClick}
          role={targetable ? "button" : undefined}
          tabIndex={targetable ? 0 : undefined}
          onKeyDown={(e) => e.key === "Enter" && handleClick()}
          className={`relative isolate flex min-w-[84px] items-center gap-2 rounded-md border px-2 py-1
        backdrop-blur-sm transition-all duration-300
        group-focus-visible:ring-1 group-focus-visible:ring-gold/60
        sm:min-w-[100px] sm:gap-2 sm:px-2 sm:py-1
        ${isOut ? "opacity-40 grayscale" : ""}
        ${
          myTurn
            ? "active-turn border-gold/50 bg-ink/70"
            : "border-white/[0.07] bg-ink/50"
        }
        ${targetable ? "targetable-panel border-red-400/60 cursor-pointer" : ""}
        ${isMe && !myTurn && !targetable ? "border-gold/25" : ""}
      `}
          style={{
            boxShadow: myTurn
              ? "0 0 18px -8px rgba(217,194,138,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
              : targetable
                ? "0 0 12px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
                : "inset 0 1px 0 rgba(255,255,255,0.04)",
            backgroundColor: "rgba(11, 15, 13, 0.82)",
          }}
        >
          {/* Circulating targeting glow (border only, see .targetable-glow CSS) */}
          {targetable && (
            <span
              aria-hidden="true"
              className="targetable-glow pointer-events-none absolute -inset-[1px] -z-10 rounded-md"
            />
          )}

          {/* Active turn: top hairline */}
          {myTurn && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-0 h-px
            bg-gradient-to-r from-transparent via-gold-light/80 to-transparent"
            />
          )}

          {/* Target crosshair */}
          {targetable && (
            <div
              className="absolute -right-1 -top-1 z-20 flex h-4 w-4 items-center justify-center
            rounded-full border border-red-300/40 bg-red-500/90 shadow-lg animate-beat"
            >
              <i className="fa-solid fa-crosshairs text-[8px] text-white" />
            </div>
          )}

          {/* Name + lives */}
          <div
            className={`flex min-w-0 flex-1 flex-col gap-0.5 sm:gap-[3px] px-[4px] py-[1px]
          ${targetable ? "targetable cursor-pointer" : ""}`}
            aria-label={`${player.name}${targetable ? " — click to target" : ""}`}
          >
            <div className="flex min-w-0 items-center gap-1">
              {player.id === player.hostId && (
                <i
                  className="fa-solid fa-crown flex-none text-[7px] text-gold sm:text-[8px]"
                  title="Host"
                />
              )}

              <span
                className="max-w-[60px] truncate text-[9px] font-medium leading-none tracking-wide
              text-ivory sm:max-w-[72px] sm:text-[10px]"
              >
                {player.name}
              </span>

              {isMe && (
                <span
                  className="flex-none rounded-sm border border-gold/30 px-0.5 py-px
              text-[5px] font-semibold uppercase leading-none tracking-[0.12em]
              text-gold/70 sm:text-[6px]"
                >
                  you
                </span>
              )}
            </div>

            {/* Lives */}
            <div className="flex items-center gap-1">
              <div
                className="h-[3px] min-w-[32px] flex-1 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={maxLives}
                aria-valuenow={lives}
                aria-label="Lives"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400
                transition-all duration-500"
                  style={{ width: `${livesPct}%` }}
                />
              </div>

              <span
                className="flex flex-none items-center gap-0.5 font-mono
            text-[7px] tabular-nums text-ivory-dim/60 sm:text-[8px]"
              >
                <i className="fa-solid fa-heart text-[5px] text-red-400/70 sm:text-[6px]" />
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

      {/* ── Cards ──────────────────────────────────────────────── */}
      <div
        className={`flex justify-center transition-all duration-300 ${
          shouldFan && !isOut ? "pt-1.5 sm:pt-2" : "pt-1"
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
                  transformOrigin: "50% 100%",
                  transform: fanned ? `rotate(${offset * 15}deg)` : "none",
                  zIndex: i,
                }}
              >
                <Card card={c} size="xs" skinId={player.skinId} />
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer status ──────────────────────────────────────── */}
      <div className="mt-1.5 flex w-full items-center justify-center sm:mt-2">
        <div className="flex flex-col items-center gap-0.3 pt-2 text-[8px] text-white/30 sm:text-[9px] h-[5px]">
          {player.disabled && (
            <div className="text-red-600 font-semibold">
              <i className="fa-solid fa-ban mr-0.5 sm:mr-1" />
              Disabled
            </div>
          )}

          {player.trumpsDisabled && (
            <span className="flex-1 text-red-600 font-semibold">
              <i className="fa-solid fa-lock mr-1 sm:mr-1" />
              Locked Down
            </span>
          )}
          <div className="flex items-center gap-1">
            {myTurn && (
              <span className="inline-flex items-center text-gold">
                <i className="fa-solid fa-hourglass-half mr-1 animate-[spin_2s_linear_infinite]" />
                Playing
              </span>
            )}

            {player.stood && !isOut && !isTurn && !player.disabled && (
              <span className="text-green-500 font-semibold">
                <i className="fa-solid fa-hand mr-0.5 sm:mr-1" />
                Stood
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
    </div>
  );
}
