import { useEffect, useRef, useState } from 'react';
import Card from '../cards/Card.jsx';
import FogBadge from '../cards/FogBadge.jsx';
import Seat from './Seat.jsx';
import Controls from './Controls.jsx';
import { GAME_CONFIG } from '../../config/gameRules.config.js';
import { TRUMP_CARDS_CATALOG } from '../../config/trumpCards.config.js';
import { PHASES, computeBetTotal } from '../../utils/gameEngine.js';
import { useTurnTimer } from '../../hooks/useTurnTimer.js';

/* ── Timer SVG ring ─────────────────────────────────────────────────────── */
function TimerRing({ s, max, warn }) {
  const r    = 18;
  const circ = 2 * Math.PI * r;
  const pct  = s / max;
  const isW  = s <= warn;
  const clr  = isW ? '#ef4444' : '#c9a84c';
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className={isW ? 'animate-beat' : ''}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
      <circle cx="24" cy="24" r={r} fill="none"
        stroke={clr} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 24 24)"
        className="timer-circle"
        style={{ filter: `drop-shadow(0 0 4px ${clr})` }}
      />
      <text x="24" y="28" textAnchor="middle" fill={clr}
        fontSize="11" fontWeight="700" fontFamily="'JetBrains Mono',monospace">
        {s}
      </text>
    </svg>
  );
}

/* ── Seat positions for the oval table ─────────────────────────────────── */
// Opponents are spread across the TOP arc of the oval.
// The bottom is always left empty — it is the player's own seat area
// (rendered in the fixed bottom panel, not on the oval).
function getSeatStyle(index, total) {
  // Angles measured clockwise from 3 o'clock (0°=right, 90°=down in CSS).
  // Upper half = 180°–360° (sin negative → y < 50% → top of container).
  const angleMap = {
    1: [270],
    2: [225, 315],
    3: [210, 270, 330],
    4: [200, 250, 290, 340],
    5: [195, 230, 270, 310, 345],
  };
  const opponentCount = total - 1;
  const angles = angleMap[opponentCount] ?? [270];
  const angleDeg = index === 0 ? 90 : (angles[index - 1] ?? 270);
  const angleRad = (angleDeg * Math.PI) / 180;
  // Oval radii (percentage of container)
  const rx = 42, ry = 36;
  const x = 50 + rx * Math.cos(angleRad);
  const y = 50 + ry * Math.sin(angleRad);
  return { left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' };
}

export default function Table({ game, onLeave }) {
  const { view, me, isMyTurn, isHost, turnKey, actions } = game;
  const [aiming, setAiming]                 = useState(null);
  const [rematchLeft, setRematchLeft]       = useState(GAME_CONFIG.REMATCH_VOTING_TIMER);
  const [countdown, setCountdown]           = useState(GAME_CONFIG.ROUND_RESULT_COUNTDOWN);
  const [logOpen, setLogOpen]               = useState(false);
  const logRef = useRef(null);

  const { secondsLeft, isWarning } = useTurnTimer({
    active: isMyTurn, phase: view?.phase, turnKey, onTimeout: actions.timeout,
  });

  useEffect(() => { if (!isMyTurn) setAiming(null); }, [isMyTurn]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [view?.log?.length]);
  useEffect(() => {
    if (view?.phase !== PHASES.GAMEOVER) return;
    setRematchLeft(GAME_CONFIG.REMATCH_VOTING_TIMER);
    const id = setInterval(() => setRematchLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [view?.phase]);

  // ── Showdown countdown ── All players have stood → 3-2-1 overlay ──
  // Every client tracks the countdown number from showdownAt.
  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN) return;
    const tick = () => {
      const ms = (view.showdownAt ?? Date.now()) - Date.now();
      setCountdown(Math.max(1, Math.ceil(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [view?.phase, view?.showdownAt]);

  // Host only: when the countdown expires, resolve the showdown.
  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN || !isHost) return;
    const ms = Math.max(0, (view.showdownAt ?? Date.now()) - Date.now());
    const id = setTimeout(() => actions.resolveShowdown(), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.showdownAt, isHost]);

  if (!view || !me) return null;

  const allPlayers  = view.players;
  const opponents   = allPlayers.filter(p => p.id !== me.id);
  const turnPlayer  = allPlayers[view.turnIndex];
  const revealed    = view.phase === PHASES.SHOWDOWN || view.phase === PHASES.GAMEOVER;
  const bet         = computeBetTotal(view.betModifiers ?? 0, view.round ?? 1);
  const aimCfg      = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;
  const targeting   = aimCfg?.targetType === 'SINGLE_PLAYER';
  const result      = view.lastResult;
  const nameOf      = id => allPlayers.find(p => p.id === id)?.name ?? '?';
  const amSpectator = me.isSpectator || me.isEliminated;

  // All players as ordered array (me first) for seat positioning
  const seatOrder = [me, ...opponents]; // index 0 = self, 1..n = opponents

  const onTarget = (p) => {
    if (!targeting || p.isEliminated || p.isSpectator) return;
    actions.playTrump(aiming, { targetId: p.id });
    setAiming(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#040e06]">

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between
        px-4 h-11 bg-black/60 border-b border-white/5 z-20">
        <button onClick={onLeave}
          className="flex items-center gap-1.5 text-xs text-white/30
            hover:text-white transition px-2 py-1 rounded hover:bg-white/5">
          <i className="fa-solid fa-arrow-left-long" />
          Leave
        </button>
        <div className="text-center">
          <span className="text-gold-shimmer font-serif font-bold text-sm tracking-widest">
            LUCKY 9
          </span>
          <span className="ml-2 text-[10px] text-white/20 font-mono">
            R{view.round} · {view.partyCode}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>
            <i className="fa-solid fa-layer-group mr-1" />{view.deckCount}
          </span>
          <span className="text-gold-DEFAULT font-semibold">
            <i className="fa-solid fa-heart mr-1 text-red-500/70" />{bet}
          </span>
        </div>
      </div>

      {/* ── OVAL TABLE ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">

        {/* Outer glow vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

        {/* ── Oval felt surface ── */}
        <div className="absolute felt-surface table-border"
          style={{ width: '88vw', maxWidth: '820px', height: '72vh', maxHeight: '540px',
            borderRadius: '50%' }} />

        {/* ── Center info cluster ── */}
        <div className="absolute flex flex-col items-center gap-1 z-10 pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          {/* Deck stack icon */}
          <div className="flex flex-col items-center gap-0.5">
            <i className="fa-solid fa-cards-blank text-white/10 text-2xl" />
            <span className="text-[10px] text-white/20 font-mono">{view.deckCount}</span>
          </div>
          {/* Round */}
          <span className="text-[11px] text-white/20 font-mono">Round {view.round}</span>
          {/* Bet */}
          <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
            <i className="fa-solid fa-heart text-red-500/60 text-[10px]" />
            <span className="text-xs font-semibold text-gold-DEFAULT tabular-nums">{bet}</span>
          </div>
          {/* Turn status */}
          {view.phase === PHASES.PLAYING && (
            <div className="text-[10px] text-white/25 text-center space-y-0.5">
              {isMyTurn ? (
                <span className="text-gold-DEFAULT font-semibold">Your turn</span>
              ) : (
                <span>{turnPlayer?.name}</span>
              )}
              {/* Standing progress */}
              {(() => {
                const active = allPlayers.filter(p => !p.isEliminated && !p.isSpectator);
                const stood  = active.filter(p => p.stood).length;
                return active.length > 0 && (
                  <div className="text-white/15">
                    {stood}/{active.length} stood
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Player seats positioned around oval ── */}
        <div className="absolute"
          style={{ width: '88vw', maxWidth: '820px', height: '72vh', maxHeight: '540px',
            borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>

          {/* Opponents */}
          {opponents.map((opp, idx) => {
            const seatIdx = idx + 1; // 1..n
            const style   = getSeatStyle(seatIdx, seatOrder.length);
            return (
              <div key={opp.id} className="absolute z-10" style={style}>
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

        {/* ── Timer (shows only on my turn) ── */}
        {view.phase === PHASES.PLAYING && isMyTurn && (
          <div className="absolute z-20 pointer-events-none"
            style={{ bottom: 'calc(50% - 36vh + 64px)', left: '50%', transform: 'translateX(-50%)' }}>
            <TimerRing s={secondsLeft} max={GAME_CONFIG.TURN_TIMER} warn={GAME_CONFIG.TIMER_WARNING} />
          </div>
        )}
      </div>

      {/* ── MY SEAT (bottom panel) ─────────────────────────────────────── */}
      <div className={`flex-none border-t z-20 transition-all
        ${isMyTurn
          ? 'border-gold-DEFAULT/30 bg-gradient-to-t from-black to-black/80'
          : 'border-white/5 bg-black/80'
        }`}>

        {/* Spectator banner */}
        {amSpectator && (
          <div className="px-4 py-1.5 bg-purple-950/60 border-b border-purple-700/20 text-center">
            <span className="text-xs text-purple-300/70">
              <i className="fa-solid fa-eye mr-1.5" />Spectating — All cards are visible
            </span>
          </div>
        )}

        {/* Checker result */}
        {view.checkerResult && (
          <div className="px-4 py-1.5 bg-blue-950/40 border-b border-blue-700/20 text-center">
            <span className="text-xs text-blue-300/70">
              <i className="fa-solid fa-magnifying-glass mr-1.5" />
              Checker: <b className="text-white">{view.checkerResult.count}</b>{' '}
              <span className="font-mono">{view.checkerResult.rank}</span>s left
            </span>
          </div>
        )}

        <div className="flex items-stretch gap-0 max-h-[38vh] overflow-hidden">

          {/* Left: my info */}
          <div className="flex-none w-[130px] border-r border-white/5 flex flex-col p-3 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ivory-DEFAULT truncate max-w-[80px]">
                {me.name}
              </span>
              {me.angelProtected && <i className="fa-solid fa-shield-halved text-purple-400 text-xs" />}
            </div>

            {/* Lives */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span><i className="fa-solid fa-heart text-red-500/50 mr-1" />Lives</span>
                <span className="font-mono text-white/50">{me.lives}/{GAME_CONFIG.STARTING_LIVES}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
                  style={{ width: `${(me.lives / GAME_CONFIG.STARTING_LIVES) * 100}%` }} />
              </div>
            </div>

            {/* My hand score */}
            {me.hand.length > 0 && (
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span><i className="fa-solid fa-hashtag mr-1" />Score</span>
                <FogBadge hand={me.hand} isSelf revealed />
              </div>
            )}

            {/* Hand card count */}
            <div className="text-[10px] text-white/20">
              <i className="fa-regular fa-clone mr-1" />
              {me.hand.length} / {GAME_CONFIG.MAX_CARDS_IN_HAND} cards
            </div>

            {/* Phase label */}
            {view.phase === PHASES.PLAYING && me.stood && !amSpectator && (
              <div className="text-[10px] text-gold-DEFAULT/60">
                <i className="fa-solid fa-hand mr-1" />Stood
              </div>
            )}
          </div>

          {/* Center: my cards */}
          <div className="flex-none flex flex-col justify-center px-3 py-2 gap-1 border-r border-white/5">
            <div className="text-[9px] text-white/20 uppercase tracking-widest text-center mb-0.5">
              Hand
            </div>
            <div className="flex gap-1 justify-center flex-wrap">
              {amSpectator ? (
                <div className="text-xs text-red-400/50 self-center">
                  <i className="fa-solid fa-skull mr-1" />Out
                </div>
              ) : me.hand.length === 0 ? (
                <div className="w-14 h-20 rounded-lg border border-white/5 bg-white/3" />
              ) : (
                me.hand.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <Card card={c} size="md" skinId={me.skinId} />
                    {i === 0 && (
                      <span className="text-[8px] uppercase text-white/20">Hole</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3">
            {!amSpectator && view.phase === PHASES.PLAYING ? (
              me.stood ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                  <i className="fa-solid fa-hand text-gold-DEFAULT/40 text-xl" />
                  <p className="text-xs text-white/30 font-medium">You stood</p>
                  {(() => {
                    const active   = allPlayers.filter(p => !p.isEliminated && !p.isSpectator);
                    const waiting  = active.filter(p => !p.stood);
                    return waiting.length > 0 ? (
                      <p className="text-[10px] text-white/20">
                        Waiting for{' '}
                        <span className="text-gold-DEFAULT/60">
                          {waiting.map(p => p.name).join(', ')}
                        </span>
                      </p>
                    ) : null;
                  })()}
                </div>
              ) : (
                <Controls
                  me={me}
                  isMyTurn={isMyTurn}
                  actions={actions}
                  aiming={aiming}
                  onAim={setAiming}
                  onCancelAim={() => setAiming(null)}
                />
              )
            ) : (
              /* Showdown / gameover panel */
              <div className="space-y-2">
                {view.phase === PHASES.COUNTDOWN && (
                  <div className="text-center text-white/40 text-xs py-4 animate-fadeUp">
                    <i className="fa-solid fa-hourglass-half mr-1.5 text-gold-DEFAULT/60 animate-beat" />
                    Revealing winner…
                  </div>
                )}
                {result && view.phase !== PHASES.PLAYING && (
                  <div className="rounded-xl border border-white/8 bg-black/30 overflow-hidden">
                    <div className="px-3 py-1.5 bg-gold-faint/50 border-b border-white/5 flex items-center gap-2">
                      <i className="fa-solid fa-trophy text-gold-DEFAULT text-xs" />
                      <span className="text-xs font-semibold text-gold-DEFAULT">
                        Round {result.round} · {bet}♥ bet
                        {result.draw && <span className="text-white/30 ml-1">· Draw</span>}
                      </span>
                    </div>
                    <ul className="divide-y divide-white/5">
                      {allPlayers
                        .filter(p => result.scores?.[p.id] !== undefined)
                        .sort((a, b) => (result.scores[b.id] ?? 0) - (result.scores[a.id] ?? 0))
                        .map(p => {
                          const win  = result.winnerIds?.includes(p.id);
                          const elim = result.eliminatedIds?.includes(p.id);
                          const nat  = result.naturalIds?.includes(p.id);
                          return (
                            <li key={p.id} className="flex items-center justify-between px-3 py-1.5">
                              <div className="flex items-center gap-1.5 text-xs">
                                {win  && <i className="fa-solid fa-trophy text-gold-DEFAULT text-[10px]" />}
                                {elim && <i className="fa-solid fa-skull text-red-400 text-[10px]" />}
                                <span className={win ? 'text-gold-light font-semibold' : 'text-white/40'}>{p.name}</span>
                                {nat && <span className="text-[9px] text-emerald-400 bg-emerald-900/30 rounded-full px-1">Nat</span>}
                              </div>
                              <span className={`font-mono font-bold text-sm ${win ? 'text-gold-DEFAULT' : 'text-white/30'}`}>
                                {result.scores[p.id]}
                              </span>
                            </li>
                          );
                        })}
                    </ul>
                    {view.phase === PHASES.SHOWDOWN && (
                      isHost
                        ? <button onClick={actions.nextRound}
                            className="w-full py-2 text-xs font-semibold text-gold-light
                              bg-gold-faint/30 hover:bg-gold-faint/50 border-t border-white/5 transition">
                            <i className="fa-solid fa-forward-step mr-1.5" />Next Round
                          </button>
                        : <p className="text-center text-[10px] text-white/20 py-2">
                            Waiting for host…
                          </p>
                    )}
                  </div>
                )}

                {view.phase === PHASES.GAMEOVER && (
                  <div className="rounded-xl border border-gold-DEFAULT/30 bg-gold-faint/20 p-3 text-center space-y-2">
                    <div className="font-serif font-bold text-base text-gold-light">
                      <i className="fa-solid fa-trophy mr-2" />{nameOf(view.winnerId)} wins
                    </div>
                    {GAME_CONFIG.ENABLE_REMATCH && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-white/30">
                          <span><i className="fa-solid fa-rotate-right mr-1" />Rematch vote</span>
                          <span className={`font-mono ${rematchLeft <= 10 ? 'text-red-400 animate-beat' : 'text-gold-DEFAULT'}`}>
                            {rematchLeft}s
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button disabled={rematchLeft === 0}
                            onClick={() => actions.rematchVote(true)}
                            className="rounded-lg py-1.5 text-xs font-semibold bg-emerald-900/50
                              border border-emerald-700/30 text-emerald-300
                              hover:bg-emerald-900/70 disabled:opacity-30 transition">
                            <i className="fa-solid fa-check mr-1" />Accept
                          </button>
                          <button onClick={() => actions.rematchVote(false)}
                            className="rounded-lg py-1.5 text-xs font-semibold bg-black/30
                              border border-white/8 text-white/40
                              hover:border-white/20 hover:text-white/60 transition">
                            <i className="fa-solid fa-xmark mr-1" />Decline
                          </button>
                        </div>
                      </div>
                    )}
                    {isHost && (
                      <button onClick={actions.reset}
                        className="w-full rounded-lg border border-white/8 bg-white/5 py-1.5
                          text-[10px] text-white/30 hover:text-white/50 transition">
                        <i className="fa-solid fa-house mr-1" />Back to Lobby
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Log drawer ─────────────────────────────────────────────────── */}
      <div className="flex-none border-t border-white/5 bg-black/50 z-20">
        <button onClick={() => setLogOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-1.5
            text-[10px] text-white/20 hover:text-white/40 transition">
          <span className="uppercase tracking-widest">
            <i className="fa-solid fa-list-ul mr-1.5" />Log
          </span>
          <i className={`fa-solid fa-chevron-${logOpen ? 'down' : 'up'} text-[8px]`} />
        </button>
        {logOpen && (
          <div ref={logRef}
            className="h-24 overflow-y-auto no-scrollbar px-4 pb-2 space-y-0.5"
            aria-live="polite">
            {view.log.slice(-30).map((l, i) => (
              <div key={i} className="text-[10px] text-white/25 leading-relaxed">
                <span className="text-white/10 mr-1.5">›</span>{l}
              </div>
            ))}
            {view.log.length === 0 && (
              <p className="text-[10px] text-white/15 text-center pt-4">No events yet</p>
            )}
          </div>
        )}
      </div>

      {/* ── Showdown countdown overlay ────────────────────────────────── */}
      {view.phase === PHASES.COUNTDOWN && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center
          bg-black/80 animate-fadeUp pointer-events-none">
          <div className="text-[11px] text-gold-DEFAULT/60 font-serif uppercase tracking-[0.4em] mb-2">
            Showdown
          </div>
          <div key={countdown}
            className="text-gold-shimmer font-serif font-black text-8xl animate-countdownPop">
            {countdown}
          </div>
          <div className="text-[11px] text-white/25 font-mono mt-3">
            All players stood — revealing winner…
          </div>
        </div>
      )}
    </div>
  );
}
