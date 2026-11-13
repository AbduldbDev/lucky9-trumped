import Seat from "./Seat.jsx";
import TimerRing from "./Timerring.jsx";
import ActiveEffects from "../effects/ActiveEffects.jsx";
import CentralDeck from "./CentralDeck.jsx";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { PHASES } from "../../../utils/gameEngine.js";
import { useElementSize } from "../../../hooks/useElementSize.js";
import { computeSeatLayout, SEAT_H } from "../../../utils/seatLayout.js";
import { getActivePlayers } from "../../../utils/tableHelpers.js";

// Largest the table is allowed to get (px)
const MAX_TABLE = 700;
// The circle may be up to this many times taller than the visible area.
const MAX_CROP = 1.4;
// Gap kept above the table (px). Was 28 (Tailwind top-7); smaller = seats sit higher.
const TABLE_TOP_GAP = 15;

export default function OvalTable({
  view,
  allPlayers,
  opponents,
  turnPlayer,
  isMyTurn,
  revealed,
  bet,
  targeting,
  twoPlayerTargeting,
  target1,
  onTarget,
  secondsLeft,
  displayedTrumps = [],
  aimCfg = null,
  zoom = 1,
  panX = 0,
  panY = 0,
  tableColor = "blue", // Player's preferred table color
  onShowStats,
  meSkinId = "classic_red", // Player's equipped skin for deck
  deckRef, // Ref for deck positioning
  seatRefs, // Refs for seat positioning
  isDealing = false, // Whether cards are currently being dealt
  dealingProgress = 0, // How many cards have been dealt so far
  bottomInset = 0, // Height of the floating bottom panel (px)
}) {
  // Full space behind the panel (the table box runs to the bottom edge)
  const [boxRef, { width: boxW, height: boxH }] = useElementSize();

  // The part of the box NOT covered by the panel: seats live here
  const visH = Math.max(0, boxH - bottomInset);

  // Circle diameter follows the WIDTH, capped by how much cropping we allow
  const side = Math.floor(Math.min(boxW, MAX_TABLE, visH * MAX_CROP));
  // Height of the seat area (never taller than the circle)
  const stageH = Math.floor(Math.min(side, visH));

  const { scale, centerScale, cy, seats } = computeSeatLayout(
    opponents.length,
    side,
    stageH,
  );

  const feltInset = Math.max(6, Math.round(side * 0.02));
  // On short screens the circle is taller than the stage. Instead of cropping
  // equally top and bottom, shift the felt down so its top edge stays visible
  // and only the bottom (under the panel) is cut. 0 when nothing is cropped.
  const feltDrop = Math.max(0, (side - stageH) / 10);
  // Vertical centre of the felt circle. The centre info cluster sticks to it.
  const tableCy = cy + feltDrop;
  const active = getActivePlayers(allPlayers);
  const stood = active.filter((p) => p.stood).length;

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      {/* Full-height box: runs underneath the floating panel */}
      <div
        ref={boxRef}
        className="absolute inset-x-0 bottom-0"
        style={{ top: TABLE_TOP_GAP }}
      >
        {/* Centres the stage inside the visible area above the panel */}
        <div
          className="flex items-center justify-center transition-[height] duration-300 ease-out"
          style={{ height: visH }}
        >
          {/* Stage: seat area. Not clipped, so the felt can run under the panel */}
          <div
            className="relative flex-none"
            style={{ width: side, height: stageH }}
          >
            {side > 0 && (
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              >
                {/* Felt: full circle, top edge kept visible, extends beneath the panel */}
                <div
                  className={`felt-surface felt-${tableColor} table-border pointer-events-none absolute left-1/2`}
                  style={{
                    top: tableCy,
                    width: side - feltInset * 2,
                    height: side - feltInset * 2,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    backdropFilter: "blur(4px)",
                  }}
                />

                {/* Centre info cluster: stuck to the felt centre, scales with the table */}
                <div
                  className="absolute left-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
                  style={{
                    top: tableCy,
                    transform: `translate(-50%, -50%) scale(${centerScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  {/* Bet */}
                  <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
                    <i className="fa-solid fa-heart text-red-500/60 text-[10px]" />
                    <span className="text-xs font-semibold text-white/60 tabular-nums">
                      {bet}
                    </span>
                  </div>

                  {/* Central deck */}
                  <div className="pointer-events-none mt-2 mb-2">
                    <CentralDeck
                      ref={deckRef}
                      deckCount={view.deckCount}
                      view={view}
                      skinId={meSkinId}
                    />
                  </div>

                  <div className="z-20 pointer-events-none">
                    {view.phase === PHASES.PLAYING && isMyTurn && (
                      <TimerRing
                        s={secondsLeft}
                        max={GAME_CONFIG.TURN_TIMER}
                        warn={GAME_CONFIG.TIMER_WARNING}
                        paused={view.pausedForCounter}
                      />
                    )}
                  </div>

                  <span className="text-[10px] mt-1 sm:text-[11px] text-white/25 font-mono">
                    <i className="fa-solid fa-layer-group mr-1" />
                    {view.deckCount} · Round {view.round}
                  </span>

                  {view.phase === PHASES.PLAYING && (
                    <div className="text-[10px] text-white/30 text-center leading-tight">
                      {isMyTurn ? (
                        <span className="text-gold font-semibold">
                          Your turn
                        </span>
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

                {/* Opponent seats */}
                {opponents.map((opp, idx) => {
                  const pos = seats[idx];
                  if (!pos) return null;

                  return (
                    <div
                      key={opp.id}
                      ref={(el) => {
                        if (seatRefs && el) seatRefs.current[opp.id] = el;
                      }}
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
                        allPlayers={allPlayers}
                        ringSide={pos.ringSide}
                        isTurn={turnPlayer?.id === opp.id}
                        revealed={revealed}
                        targetable={
                          (targeting || twoPlayerTargeting) &&
                          !opp.isEliminated &&
                          !opp.isSpectator &&
                          // For TWO_PLAYERS: can't target the same player twice
                          !(twoPlayerTargeting && target1 === opp.id) &&
                          // For BOND: can't target already bonded players
                          !(
                            twoPlayerTargeting &&
                            aimCfg?.id === "BOND" &&
                            opp.bondedWith
                          ) &&
                          // Can't target players with full hands for cards that add cards
                          !(
                            aimCfg?.id === "TARGET" &&
                            opp.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND
                          )
                        }
                        selected={twoPlayerTargeting && target1 === opp.id}
                        onTarget={onTarget}
                        onShowStats={onShowStats}
                        turnStartTime={
                          turnPlayer?.id === opp.id ? view.turnStartTime : null
                        }
                        totalPauseTime={
                          turnPlayer?.id === opp.id ? view.totalPauseTime : 0
                        }
                        paused={
                          turnPlayer?.id === opp.id
                            ? view.pausedForCounter
                            : false
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
