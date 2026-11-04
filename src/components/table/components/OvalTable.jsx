import Seat from "./Seat.jsx";
import TimerRing from "../Timerring.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { PHASES } from "../../../utils/gameEngine.js";
import { useElementSize } from "../../../hooks/useElementSize.js";
import {
  computeSeatLayout,
  SEAT_W,
  SEAT_H,
} from "../../../utils/seatLayout.js";
import { getActivePlayers } from "../../../utils/tableHelpers.js";

/**
 * The felt oval, centre info, opponent seats and the turn timer.
 * The oval always fills the available area (so it shrinks when the bottom
 * panel is expanded) and seats are scaled/positioned from its real size.
 */
export default function OvalTable({
  view,
  allPlayers,
  opponents,
  turnPlayer,
  isMyTurn,
  revealed,
  bet,
  targeting,
  onTarget,
  secondsLeft,
}) {
  const [areaRef, { width, height }] = useElementSize();
  const { scale, cy, seats } = computeSeatLayout(
    opponents.length,
    width,
    height,
  );

  const active = getActivePlayers(allPlayers);
  const stood = active.filter((p) => p.stood).length;

  return (
    <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden pt-7">
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Stage: capped size, centred. Everything below is positioned inside it */}
      <div
        ref={areaRef}
        className="relative w-full h-full"
        style={{ maxWidth: 820, maxHeight: 540 }}
      >
        {/* Oval felt surface */}
        <div
          className="absolute pointer-events-none"
          style={{ left: 12, right: 12, top: 12, bottom: 12 }}
        >
          <div
            className="felt-surface table-border w-full h-full"
            style={{ borderRadius: "50%" }}
          />
        </div>
        {/* Turn timer (my turn only) */}

        {/* Centre info cluster */}
        <div
          className="absolute left-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
          style={{ top: cy - 2, transform: "translate(-50%, 0)" }}
        >
          <div className=" z-20 pointer-events-none ">
            {view.phase === PHASES.PLAYING && isMyTurn && (
              <TimerRing
                s={secondsLeft}
                max={GAME_CONFIG.TURN_TIMER}
                warn={GAME_CONFIG.TIMER_WARNING}
              />
            )}
          </div>
          <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
            <i className="fa-solid fa-heart text-red-500/60 text-[10px]" />
            <span className="text-xs font-semibold text-gold-DEFAULT tabular-nums">
              {bet}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-white/25 font-mono">
            <i className="fa-solid fa-layer-group mr-1" />
            {view.deckCount} · Round {view.round}
          </span>

          {view.phase === PHASES.PLAYING && (
            <div className="text-[10px] text-white/30 text-center leading-tight">
              {isMyTurn ? (
                <span className="text-gold-DEFAULT font-semibold">
                  Your turn
                </span>
              ) : (
                <span>{turnPlayer?.name}</span>
              )}
              {active.length > 0 && (
                <div className="text-white/20">
                  {stood}/{active.length} stood
                </div>
              )}
            </div>
          )}
        </div>

        {/* Opponent seats (pixel-positioned, scaled to fit) */}
        {opponents.map((opp, idx) => {
          const pos = seats[idx];
          if (!pos) return null;
          return (
            <div
              key={opp.id}
              className="absolute z-10"
              style={{
                left: pos.x,
                top: pos.y,
                minHeight: SEAT_H,
                transform: `translate(-50%,-50%) scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <Seat
                player={opp}
                isTurn={turnPlayer?.id === opp.id}
                revealed={revealed}
                targetable={targeting && !opp.isEliminated && !opp.isSpectator}
                onTarget={onTarget}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
