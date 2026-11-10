import { useState } from "react";
import Controls from "./game/Controls.jsx";
import TopBar from "./ui/TopBar.jsx";
import OvalTable from "./game/OvalTable.jsx";
import BottomPanel from "./ui/BottomPanel.jsx";
import {
  SpectatorBanner,
  CheckerBanner,
  FortuneBanner,
  OddsBanner,
} from "./ui/PanelBanners.jsx";
import PlayerInfo from "./ui/PlayerInfo.jsx";
import PlayerHand from "./game/PlayerHand.jsx";
import StoodStatus from "./ui/StoodStatus.jsx";
import RoundResult from "./ui/RoundResult.jsx";
import GameOverPanel from "./modals/GameOverPanel.jsx";
import ShowdownOverlay from "./effects/ShowdownOverlay.jsx";
import TrumpNotification from "./effects/TrumpNotification.jsx";
import PersonalNotification from "./effects/PersonalNotification.jsx";
import CounterPrompt from "./modals/CounterPrompt.jsx";
import OpponentStatsModal from "./modals/OpponentStatsModal.jsx";
import { PHASES } from "../../utils/gameEngine.js";
import { useTurnTimer } from "../../hooks/useTurnTimer.js";
import { useRematchTimer } from "../../hooks/useRematchTimer.js";
import { useShowdownCountdown } from "../../hooks/useShowdownCountdown.js";
import { useAutoNextRound } from "../../hooks/useAutoNextRound.js";
import { useViewControls } from "../../hooks/useViewControls.js";
import { usePersonalNotifications } from "../../hooks/usePersonalNotifications.js";
import { useGameAudio } from "../../hooks/useGameAudio.js";
import { useTrumpTargeting } from "../../hooks/useTrumpTargeting.js";
import { useTrumpNotifications } from "../../hooks/useTrumpNotifications.js";
import { useTableDerived } from "../../hooks/useTableDerived.js";

export default function Table({ game, onLeave, tableColor = "blue" }) {
  const { view, me, isMyTurn, isHost, turnKey, actions } = game;
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [cardsFlipped, setCardsFlipped] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState(null);

  // Custom hooks for separated concerns
  const viewControls = useViewControls();
  const {
    allPlayers,
    opponents,
    turnPlayer,
    revealed,
    bet,
    result,
    nameOf,
    amSpectator,
    showControls,
    showStood,
  } = useTableDerived({ view, me });
  const { personalNotification, dismissPersonalNotification } =
    usePersonalNotifications({ view });
  useGameAudio({ view, me });
  const { aiming, aimCfg, targeting, setAiming, onTarget, cancelAim } =
    useTrumpTargeting({ isMyTurn, actions });
  const { notification, displayedTrumps, dismissNotification } =
    useTrumpNotifications({ view });

  // Existing timer hooks
  const { secondsLeft } = useTurnTimer({
    active: isMyTurn,
    phase: view?.phase,
    turnKey,
    turnStartTime: view?.turnStartTime,
    totalPauseTime: view?.totalPauseTime ?? 0,
    paused: view?.pausedForCounter ?? false,
    onTimeout: actions.timeout,
  });
  const rematchLeft = useRematchTimer(
    view?.phase,
    isHost,
    actions.checkRematchTimer,
  );
  const countdown = useShowdownCountdown({
    view,
    isHost,
    resolveShowdown: actions.resolveShowdown,
  });
  const nextRoundLeft = useAutoNextRound({
    view,
    isHost,
    nextRound: actions.nextRound,
  });

  const handleShowOpponentStats = (player) => {
    setSelectedOpponent(player);
  };

  const handleCloseStatsModal = () => {
    setSelectedOpponent(null);
  };

  if (!view || !me) return null;

  // Destructure view controls
  const {
    zoom,
    panX,
    panY,
    showViewControls,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handlePanUp,
    handlePanDown,
    handlePanLeft,
    handlePanRight,
    handlePanReset,
    toggleViewControls,
  } = viewControls;

  // Control button styles
  const ctrlBtn =
    "border border-gold/20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-gold/40 hover:text-gold-light active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:text-white/60 sm:h-9 sm:w-9";

  // Slim summary shown in the handle while the panel is collapsed
  const summary = (
    <span className="flex items-center gap-2">
      <span className="font-semibold text-white/60 truncate max-w-[110px]">
        {me.name}
      </span>
      <span className="font-mono">
        <i className="fa-solid fa-heart text-red-500/60 mr-1" />
        {me.lives}
      </span>
      <span className="font-mono">
        <i className="fa-regular fa-clone mr-1" />
        {me.hand.length}
      </span>
      {isMyTurn && !amSpectator && view.phase === PHASES.PLAYING && (
        <span className="text-gold font-semibold">Your turn</span>
      )}
    </span>
  );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#040e06]">
      <TopBar view={view} bet={bet} onLeave={onLeave} />

      {/* View Controls: toggle + floating pan/zoom */}
      <div
        role="group"
        aria-label="View controls"
        className="absolute right-3 top-[55px] z-30 flex flex-col items-end gap-2 sm:right-4 sm:top-20"
      >
        {/* Toggle */}
        <button
          onClick={toggleViewControls}
          aria-label={
            showViewControls ? "Hide view controls" : "Show view controls"
          }
          aria-expanded={showViewControls}
          title={showViewControls ? "Hide Controls" : "View Controls"}
          className={`${ctrlBtn} ${showViewControls ? "border-gold/40 text-gold-light" : ""}`}
        >
          <i
            className={`fa-solid ${showViewControls ? "fa-xmark" : "fa-up-down-left-right"} text-[10px] sm:text-xs`}
          />
        </button>

        {showViewControls && (
          <div className="flex flex-col items-center gap-2 animate-fadeIn">
            {/* Pan pad (inverted: each arrow moves the view the opposite way) */}
            <div className="grid grid-cols-3 gap-1">
              <span />
              <button
                onClick={handlePanDown}
                aria-label="Pan up"
                title="Pan Up"
                className={ctrlBtn}
              >
                <i className="fa-solid fa-chevron-up text-[10px] sm:text-xs" />
              </button>
              <span />

              <button
                onClick={handlePanRight}
                aria-label="Pan left"
                title="Pan Left"
                className={ctrlBtn}
              >
                <i className="fa-solid fa-chevron-left text-[10px] sm:text-xs" />
              </button>
              <button
                onClick={handlePanReset}
                disabled={panX === 0 && panY === 0}
                aria-label="Center view"
                title="Center View"
                className={`${ctrlBtn} text-gold-light/80`}
              >
                <i className="fa-solid fa-crosshairs text-[10px] sm:text-xs" />
              </button>
              <button
                onClick={handlePanLeft}
                aria-label="Pan right"
                title="Pan Right"
                className={ctrlBtn}
              >
                <i className="fa-solid fa-chevron-right text-[10px] sm:text-xs" />
              </button>

              <span />
              <button
                onClick={handlePanUp}
                aria-label="Pan down"
                title="Pan Down"
                className={ctrlBtn}
              >
                <i className="fa-solid fa-chevron-down text-[10px] sm:text-xs " />
              </button>
              <span />
            </div>

            {/* Zoom pill */}
            <div
              role="group"
              aria-label="Zoom controls"
              className="flex items-center rounded-full border border-gold/25 bg-black/50 p-0.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-1"
            >
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                aria-label="Zoom out"
                title="Zoom Out"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/5 hover:text-gold-light active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/60 sm:h-9 sm:w-9"
              >
                <i className="fa-solid fa-minus text-[10px] sm:text-xs" />
              </button>

              <span className="h-4 w-px bg-white/10 sm:h-5" />

              <button
                onClick={handleZoomReset}
                disabled={zoom === 1 && panX === 0 && panY === 0}
                aria-label="Reset zoom and pan"
                title="Reset Zoom & Pan"
                className="flex h-7 min-w-[2rem] items-center justify-center rounded-full px-1 font-mono text-[8px] tabular-nums text-gold-light/80 transition-all hover:bg-white/5 hover:text-gold-light active:scale-90 disabled:cursor-default disabled:text-white/35 disabled:hover:bg-transparent sm:h-9 sm:min-w-[2.5rem] sm:text-[10px]"
              >
                {Math.round(zoom * 100)}%
              </button>

              <span className="h-4 w-px bg-white/10 sm:h-5" />

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 1.5}
                aria-label="Zoom in"
                title="Zoom In"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/5 hover:text-gold-light active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/60 sm:h-9 sm:w-9"
              >
                <i className="fa-solid fa-plus text-[10px] sm:text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <OvalTable
        view={view}
        allPlayers={allPlayers}
        opponents={opponents}
        turnPlayer={turnPlayer}
        isMyTurn={isMyTurn}
        revealed={revealed}
        bet={bet}
        targeting={targeting}
        onTarget={onTarget}
        onShowStats={handleShowOpponentStats}
        secondsLeft={secondsLeft}
        displayedTrumps={displayedTrumps}
        aimCfg={aimCfg}
        zoom={zoom}
        panX={panX}
        panY={panY}
        tableColor={tableColor}
      />

      <BottomPanel
        collapsed={panelCollapsed}
        onToggle={() => setPanelCollapsed((v) => !v)}
        isMyTurn={isMyTurn}
        summary={summary}
      >
        {amSpectator && <SpectatorBanner />}
        {view.checkerResult && <CheckerBanner result={view.checkerResult} />}
        {view.fortuneResult && (
          <FortuneBanner
            result={view.fortuneResult}
            deckCount={view.deckCount}
          />
        )}
        {view.oddsResult && <OddsBanner result={view.oddsResult} />}

        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <PlayerInfo
            me={me}
            phase={view.phase}
            amSpectator={amSpectator}
            cardsFlipped={cardsFlipped}
          />
          <PlayerHand
            me={me}
            amSpectator={amSpectator}
            flipped={cardsFlipped}
            onToggleFlip={() => setCardsFlipped((prev) => !prev)}
          />
        </div>

        {showControls ? (
          <Controls
            me={me}
            view={view}
            isMyTurn={isMyTurn}
            actions={actions}
            aiming={aiming}
            onAim={setAiming}
            onCancelAim={cancelAim}
          />
        ) : showStood ? (
          <StoodStatus allPlayers={allPlayers} />
        ) : (
          <div className="border-t border-white/5 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="space-y-2 w-full max-w-xl mx-auto">
              {view.phase === PHASES.COUNTDOWN && (
                <div className="text-center text-white/40 text-xs py-4 animate-fadeUp">
                  <i className="fa-solid fa-hourglass-half mr-1.5 text-gold/60 animate-beat" />
                  Revealing winner…
                </div>
              )}

              {result && view.phase !== PHASES.PLAYING && (
                <RoundResult
                  result={result}
                  allPlayers={allPlayers}
                  bet={bet}
                  showNextRound={view.phase === PHASES.SHOWDOWN}
                  nextRoundLeft={nextRoundLeft}
                />
              )}

              {view.phase === PHASES.GAMEOVER && (
                <GameOverPanel
                  winnerName={nameOf(view.winnerId)}
                  rematchLeft={rematchLeft}
                  isHost={isHost}
                  actions={actions}
                  view={view}
                  me={me}
                />
              )}
            </div>
          </div>
        )}
      </BottomPanel>

      {view.phase === PHASES.COUNTDOWN && (
        <ShowdownOverlay countdown={countdown} />
      )}

      {/* Trump card notification */}
      <TrumpNotification
        notification={notification}
        onDismiss={dismissNotification}
      />

      {/* Personal notification (Lucky 9, etc.) */}
      <PersonalNotification
        notification={personalNotification}
        onDismiss={dismissPersonalNotification}
      />

      {/* Counter prompt (SHATTER/MIRROR response) */}
      {view.counterRequest && (
        <CounterPrompt
          counterRequest={view.counterRequest}
          onAccept={() => {
            actions.respondCounter(view.counterRequest.requestId, true, false);
          }}
          onMirror={() => {
            actions.respondCounter(view.counterRequest.requestId, false, true);
          }}
          onDecline={() => {
            actions.respondCounter(view.counterRequest.requestId, false, false);
          }}
        />
      )}

      {/* Opponent stats modal */}
      {selectedOpponent && (
        <OpponentStatsModal
          playerId={selectedOpponent.id}
          playerName={selectedOpponent.name}
          onClose={handleCloseStatsModal}
        />
      )}
    </div>
  );
}
