import { useEffect, useState } from "react";
import Controls from "./Controls.jsx";
import TopBar from "./components/TopBar.jsx";
import OvalTable from "./components/OvalTable.jsx";
import BottomPanel from "./components/BottomPanel.jsx";
import { SpectatorBanner, CheckerBanner } from "./components/PanelBanners.jsx";
import PlayerInfo from "./components/PlayerInfo.jsx";
import PlayerHand from "./components/PlayerHand.jsx";
import StoodStatus from "./components/StoodStatus.jsx";
import RoundResult from "./components/RoundResult.jsx";
import GameOverPanel from "./components/GameOverPanel.jsx";
import ShowdownOverlay from "./components/ShowdownOverlay.jsx";
import { TRUMP_CARDS_CATALOG } from "../../config/trumpCards.config.js";
import { PHASES, computeBetTotal } from "../../utils/gameEngine.js";
import { useTurnTimer } from "../../hooks/useTurnTimer.js";
import { useRematchTimer } from "../../hooks/useRematchTimer.js";
import { useShowdownCountdown } from "../../hooks/useShowdownCountdown.js";
import { useAutoNextRound } from "../../hooks/useAutoNextRound.js";

export default function Table({ game, onLeave }) {
  const { view, me, isMyTurn, isHost, turnKey, actions } = game;
  const [aiming, setAiming] = useState(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const { secondsLeft } = useTurnTimer({
    active: isMyTurn,
    phase: view?.phase,
    turnKey,
    onTimeout: actions.timeout,
  });
  const rematchLeft = useRematchTimer(view?.phase);
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

  useEffect(() => {
    if (!isMyTurn) setAiming(null);
  }, [isMyTurn]);

  if (!view || !me) return null;

  const allPlayers = view.players;
  const opponents = allPlayers.filter((p) => p.id !== me.id);
  const turnPlayer = allPlayers[view.turnIndex];
  const revealed =
    view.phase === PHASES.SHOWDOWN || view.phase === PHASES.GAMEOVER;
  const bet = computeBetTotal(view.betModifiers ?? 0, view.round ?? 1);
  const aimCfg = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;
  const targeting = aimCfg?.targetType === "SINGLE_PLAYER";
  const result = view.lastResult;
  const nameOf = (id) => allPlayers.find((p) => p.id === id)?.name ?? "?";
  const amSpectator = me.isSpectator || me.isEliminated;

  const onTarget = (p) => {
    if (!targeting || p.isEliminated || p.isSpectator) return;
    actions.playTrump(aiming, { targetId: p.id });
    setAiming(null);
  };

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

  const showControls =
    !amSpectator && view.phase === PHASES.PLAYING && !me.stood;
  const showStood = !amSpectator && view.phase === PHASES.PLAYING && me.stood;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#040e06]">
      <TopBar view={view} bet={bet} onLeave={onLeave} />

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
        secondsLeft={secondsLeft}
      />

      <BottomPanel
        collapsed={panelCollapsed}
        onToggle={() => setPanelCollapsed((v) => !v)}
        isMyTurn={isMyTurn}
        summary={summary}
      >
        {amSpectator && <SpectatorBanner />}
        {view.checkerResult && <CheckerBanner result={view.checkerResult} />}

        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <PlayerInfo me={me} phase={view.phase} amSpectator={amSpectator} />
          <PlayerHand me={me} amSpectator={amSpectator} />
        </div>

        {showControls ? (
          <Controls
            me={me}
            isMyTurn={isMyTurn}
            actions={actions}
            aiming={aiming}
            onAim={setAiming}
            onCancelAim={() => setAiming(null)}
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
                />
              )}
            </div>
          </div>
        )}
      </BottomPanel>

      {view.phase === PHASES.COUNTDOWN && (
        <ShowdownOverlay countdown={countdown} />
      )}
    </div>
  );
}
