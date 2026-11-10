import Seat from "./Seat.jsx";
import TimerRing from "./Timerring.jsx";
import ActiveEffects from "../effects/ActiveEffects.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { PHASES } from "../../../utils/gameEngine.js";
import { useElementSize } from "../../../hooks/useElementSize.js";
import {
  computeSeatLayout,
  SEAT_W,
  SEAT_H,
} from "../../../utils/seatLayout.js";
import { getActivePlayers } from "../../../utils/tableHelpers.js";

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
  displayedTrumps = [],
  aimCfg = null,
  zoom = 1,
  panX = 0,
  panY = 0,
  tableColor = "blue", // Player's preferred table color
  onShowStats,
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
      {/* Stage: capped size, centred. Everything below is positioned inside it */}
      <div
        ref={areaRef}
        className="relative w-full h-full"
        style={{
          height: "100%",
          maxHeight: 740,
          minHeight: 500,
          maxWidth: "min(100%, 700px)",
          aspectRatio: "1.7 / 1", // widest the oval is allowed to get
        }}
      >
        {/* Zoom wrapper - everything inside scales together */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Oval felt surface - semi-transparent to blend with background */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <div
              className={`felt-surface felt-${tableColor} table-border w-full h-full`}
              style={{
                borderRadius: "50%",
                // Semi-transparent green felt
                backdropFilter: "blur(4px)",
                // Inner shadow for depth
              }}
            />
          </div>

          {/* Centre info cluster */}
          <div
            className="absolute  left-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
            style={{
              top: cy - 1,
              transform: "translate(-50%, 0)",
            }}
          >
            <div className=" z-20 pointer-events-none ">
              {view.phase === PHASES.PLAYING && isMyTurn && (
                <TimerRing
                  s={secondsLeft}
                  max={GAME_CONFIG.TURN_TIMER}
                  warn={GAME_CONFIG.TIMER_WARNING}
                  paused={view.pausedForCounter}
                />
              )}
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
              <i className="fa-solid fa-heart text-red-500/60 text-[10px]" />
              <span className="text-xs font-semibold text-white/60 tabular-nums">
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
                  <span className="text-gold font-semibold">Your turn</span>
                ) : (
                  <span>{turnPlayer?.name}</span>
                )}
                {active.length > 0 && (
                  <div className="text-white/20 mt-1">
                    {stood}/{active.length} stood
                  </div>
                )}
              </div>
            )}

            {/* Active trump effects */}
            <ActiveEffects effects={view.activeTrumpEffects} />
          </div>

          {/* Opponent seats (pixel-positioned, now scale with zoom) */}
          {opponents.map((opp, idx) => {
            const pos = seats[idx];
            if (!pos) return null;
            const isLeftHalf = pos.x < width / 2;
            const isLower = pos.y > cy; // below the table's vertical centre
            const ringSide = isLower
              ? isLeftHalf
                ? "left"
                : "right"
              : isLeftHalf
                ? "right"
                : "left";

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
                  ringSide={ringSide}
                  isTurn={turnPlayer?.id === opp.id}
                  revealed={revealed}
                  targetable={
                    targeting &&
                    !opp.isEliminated &&
                    !opp.isSpectator &&
                    // BUGFIX: Can't target players with full hands for cards that add cards
                    !(
                      aimCfg?.id === "TARGET" && // FORCE_DRAW
                      opp.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND
                    )
                  }
                  onTarget={onTarget}
                  onShowStats={onShowStats}
                  turnStartTime={
                    turnPlayer?.id === opp.id ? view.turnStartTime : null
                  }
                  totalPauseTime={
                    turnPlayer?.id === opp.id ? view.totalPauseTime : 0
                  }
                  paused={
                    turnPlayer?.id === opp.id ? view.pausedForCounter : false
                  }
                  turnKey={
                    turnPlayer?.id === opp.id
                      ? `${view.round}-${view.turnIndex}`
                      : null
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
