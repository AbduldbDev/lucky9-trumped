import { useEffect, useRef, useState } from "react";
import Controls from "./components/Controls.jsx";
import TopBar from "./components/TopBar.jsx";
import OvalTable from "./components/OvalTable.jsx";
import BottomPanel from "./components/BottomPanel.jsx";
import {
  SpectatorBanner,
  CheckerBanner,
  FortuneBanner,
} from "./components/PanelBanners.jsx";
import PlayerInfo from "./components/PlayerInfo.jsx";
import PlayerHand from "./components/PlayerHand.jsx";
import StoodStatus from "./components/StoodStatus.jsx";
import RoundResult from "./components/RoundResult.jsx";
import GameOverPanel from "./components/GameOverPanel.jsx";
import ShowdownOverlay from "./components/ShowdownOverlay.jsx";
import TrumpNotification from "./components/TrumpNotification.jsx";
import PersonalNotification from "./components/PersonalNotification.jsx";
import CounterPrompt from "./components/CounterPrompt.jsx";
import { TRUMP_CARDS_CATALOG } from "../../config/trumpCards.config.js";
import { PHASES, computeBetTotal } from "../../utils/gameEngine.js";
import { useTurnTimer } from "../../hooks/useTurnTimer.js";
import { useRematchTimer } from "../../hooks/useRematchTimer.js";
import { useShowdownCountdown } from "../../hooks/useShowdownCountdown.js";
import { useAutoNextRound } from "../../hooks/useAutoNextRound.js";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";

export default function Table({ game, onLeave }) {
  const { view, me, isMyTurn, isHost, turnKey, actions } = game;
  const audio = useAudio();
  const [aiming, setAiming] = useState(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [displayedTrumps, setDisplayedTrumps] = useState([]);
  const [shownNotificationIds, setShownNotificationIds] = useState(new Set());
  const [personalNotification, setPersonalNotification] = useState(null);
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 1.5
  const [panX, setPanX] = useState(0); // Pan X offset in pixels
  const [panY, setPanY] = useState(0); // Pan Y offset in pixels
  const [showViewControls, setShowViewControls] = useState(false);

  // Personal notifications: remember what has already been shown in a ref
  // (no re-render, no effect re-run). Keys include the round so ids that
  // restart each round can't collide, and nothing needs resetting.
  const shownPersonalKeys = useRef(new Set());
  const personalSeeded = useRef(false);
  const prevPhaseRef = useRef(null);
  const prevRoundRef = useRef(null);
  const prevTurnPlayerRef = useRef(null);

  const { secondsLeft } = useTurnTimer({
    active: isMyTurn,
    phase: view?.phase,
    turnKey,
    turnStartTime: view?.turnStartTime,
    paused: view?.waitingForCounterResponse ?? false,
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

  useEffect(() => {
    if (!isMyTurn) setAiming(null);
  }, [isMyTurn]);

  const handleZoomIn = () => {
    setZoom((prev) => {
      const newVal = Math.min(prev + 0.1, 1.5);
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newVal = Math.max(prev - 0.1, 0.5);
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanUp = () => {
    setPanY((prev) => {
      const newVal = prev - 30;
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanDown = () => {
    setPanY((prev) => {
      const newVal = prev + 30;
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanLeft = () => {
    setPanX((prev) => {
      const newVal = prev - 30;
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanRight = () => {
    setPanX((prev) => {
      const newVal = prev + 30;
      return newVal;
    });
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanReset = () => {
    setPanX(0);
    setPanY(0);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const ctrlBtn =
    "border border-gold/20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-gold/40 hover:text-gold-light active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:text-white/60 sm:h-9 sm:w-9";
  useEffect(() => {
    if (!view?.phase || prevPhaseRef.current === view.phase) return;
    prevPhaseRef.current = view.phase;

    switch (view.phase) {
      case PHASES.PLAYING:
        // Don't play GAME_START on first render, only on transitions back to PLAYING
        if (prevRoundRef.current !== null) {
          audio.playSfx(AUDIO_CONFIG.SFX.ROUND_START);
        }
        break;
      case PHASES.COUNTDOWN:
        // Play showdown audio only once when entering COUNTDOWN phase
        // The countdown ticks are handled by ShowdownOverlay component
        audio.playSfx(AUDIO_CONFIG.SFX.SHOWDOWN);
        break;
      case PHASES.SHOWDOWN:
        audio.playSfx(AUDIO_CONFIG.SFX.ROUND_END);
        break;
      case PHASES.GAMEOVER:
        // Determine if local player won
        const won = view.winnerId === me?.id;
        audio.playSfx(won ? AUDIO_CONFIG.SFX.VICTORY : AUDIO_CONFIG.SFX.DEFEAT);
        break;
    }
  }, [view?.phase, audio, me?.id]);

  // Audio: Round changes
  useEffect(() => {
    if (!view?.round || prevRoundRef.current === view.round) return;
    if (prevRoundRef.current !== null) {
      audio.playSfx(AUDIO_CONFIG.SFX.ROUND_START);
    }
    prevRoundRef.current = view.round;
  }, [view?.round, audio]);

  // Audio: Turn changes
  useEffect(() => {
    if (!view?.turnIndex || !view?.players) return;
    const currentTurnPlayer = view.players[view.turnIndex];
    if (
      !currentTurnPlayer ||
      prevTurnPlayerRef.current === currentTurnPlayer.id
    )
      return;

    prevTurnPlayerRef.current = currentTurnPlayer.id;

    // Play turn start sound only if it's my turn
    if (currentTurnPlayer.id === me?.id) {
      audio.playSfx(AUDIO_CONFIG.SFX.TURN_START);
    }
  }, [view?.turnIndex, view?.players, audio, me?.id]);

  // Handle trump card plays - show notification and update display
  useEffect(() => {
    if (!view?.trumpPlays || view.trumpPlays.length === 0) {
      setDisplayedTrumps([]);
      setNotification(null); // Clear notification when no trump plays
      return;
    }

    // Find all new trump plays that haven't been shown yet
    const newPlays = view.trumpPlays.filter(
      (play) => !shownNotificationIds.has(play.id),
    );

    const timeouts = [];

    if (newPlays.length > 0) {
      // Sort by timestamp to show in correct order
      newPlays.sort((a, b) => a.timestamp - b.timestamp);

      // Show notifications sequentially with delays
      newPlays.forEach((play, index) => {
        const timeoutId = setTimeout(() => {
          setNotification(play);
          setShownNotificationIds((prev) => new Set([...prev, play.id]));

          // Play trump card sound based on rarity
          const trumpCard = TRUMP_CARDS_CATALOG[play.trumpId];
          if (trumpCard) {
            audio.playTrumpSfx(trumpCard.rarity);
          }
        }, index * 4200); // Show each notification 4.2s apart (4s display + 0.2s gap)

        timeouts.push(timeoutId);
      });
    }

    // Update displayed trumps on table (filter out old ones)
    const now = Date.now();
    const recentTrumps = view.trumpPlays.filter(
      (tp) => now - tp.timestamp < 6000,
    );
    setDisplayedTrumps(recentTrumps);

    // Cleanup timeouts on unmount or dependency change
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [view?.trumpPlays, shownNotificationIds, audio]);

  // Clear notification IDs and notification state when round changes
  useEffect(() => {
    setShownNotificationIds(new Set());
    setNotification(null);
  }, [view?.round]);

  // Clear notification when phase changes (safety net)
  useEffect(() => {
    if (
      view?.phase === PHASES.COUNTDOWN ||
      view?.phase === PHASES.SHOWDOWN ||
      view?.phase === PHASES.GAMEOVER
    ) {
      setNotification(null);
    }
  }, [view?.phase]);

  // Personal notifications (Lucky 9, etc.): show ONLY when a new one is
  // triggered. The child hides it after 3s and calls onDismiss.
  useEffect(() => {
    if (!view) return;

    // Ensure personalNotifications is always an array
    const list = Array.isArray(view.personalNotifications)
      ? view.personalNotifications
      : [];

    // First view we ever see: mark whatever already exists as "seen" so a
    // reload/reconnect doesn't replay an old popup.
    if (!personalSeeded.current) {
      personalSeeded.current = true;
      list.forEach((n) =>
        shownPersonalKeys.current.add(`${view.round}:${n.id}`),
      );
      return;
    }

    // Clear notification if personalNotifications is empty (round reset)
    if (list.length === 0) {
      setPersonalNotification(null);
      return;
    }

    const latest = list[list.length - 1];
    // Guard against undefined latest
    if (!latest || !latest.id) return;

    const key = `${view.round}:${latest.id}`;
    if (shownPersonalKeys.current.has(key)) return;

    shownPersonalKeys.current.add(key);
    setPersonalNotification(latest);

    // Play audio for personal notifications
    if (latest.type === "NINE_HIT") {
      audio.playSfx(AUDIO_CONFIG.SFX.NINE_HIT);
    }
  }, [view?.personalNotifications, view?.round, audio]);

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

    // BUGFIX: Prevent targeting players with full hands for cards that would add cards
    const MAX_CARDS = 5; // GAME_CONFIG.MAX_CARDS_IN_HAND

    // List of trump cards that add cards to target's hand
    const cardsAddingToTarget = ["TARGET"]; // FORCE_DRAW

    if (cardsAddingToTarget.includes(aiming) && p.hand.length >= MAX_CARDS) {
      // Player has full hand, can't target them
      return;
    }

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

      {/* View Controls: toggle + floating pan/zoom */}
      <div
        role="group"
        aria-label="View controls"
        className="absolute right-3 top-[55px] z-30 flex flex-col items-end gap-2 sm:right-4 sm:top-20"
      >
        {/* Toggle */}
        <button
          onClick={() => {
            setShowViewControls((v) => !v);
            audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
          }}
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

            {/* Zoom row */}
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
        secondsLeft={secondsLeft}
        displayedTrumps={displayedTrumps}
        aimCfg={aimCfg}
        zoom={zoom}
        panX={panX}
        panY={panY}
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

        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <PlayerInfo me={me} phase={view.phase} amSpectator={amSpectator} />
          <PlayerHand me={me} amSpectator={amSpectator} />
        </div>

        {showControls ? (
          <Controls
            me={me}
            view={view}
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
        onDismiss={() => {
          setNotification(null);
        }}
      />

      {/* Personal notification (Lucky 9, etc.) */}
      <PersonalNotification
        notification={personalNotification}
        onDismiss={() => {
          setPersonalNotification(null);
        }}
      />

      {/* Counter prompt (SHATTER response) */}
      {view.counterRequest && (
        <CounterPrompt
          counterRequest={view.counterRequest}
          onAccept={() => {
            actions.respondCounter(view.counterRequest.requestId, true);
          }}
          onDecline={() => {
            actions.respondCounter(view.counterRequest.requestId, false);
          }}
        />
      )}
    </div>
  );
}
