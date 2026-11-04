import { useState } from 'react';
import { GAME_CONFIG } from '../../config/gameRules.config.js';

export default function WaitingRoom({ partyCode, view, status, isHost, selfId, onStart, onLeave }) {
  const [copied, setCopied] = useState(false);
  const players  = view?.players ?? [];
  const canStart = isHost && players.length >= GAME_CONFIG.MIN_PLAYERS;

  const copy = async () => {
    try { await navigator.clipboard.writeText(partyCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* unavailable */ }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {['♠','♥','♣','♦'].map((s,i) => (
        <div key={i} className="absolute text-8xl text-white/[0.025] select-none pointer-events-none font-serif"
          style={{ [i < 2 ? 'top' : 'bottom']: '2rem', [i % 2 === 0 ? 'left' : 'right']: '2rem' }}>
          {s}
        </div>
      ))}

      <div className="w-full max-w-[340px] px-4 space-y-4">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-gold-shimmer font-serif text-4xl font-black tracking-widest">LUCKY 9</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Waiting Room</p>
          <div className="h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/25 to-transparent mt-2" />
        </header>

        {/* Party code */}
        <div className="rounded-2xl border border-white/8 bg-black/40 overflow-hidden">
          <div className="px-4 py-2 border-b border-white/5 text-center">
            <span className="text-[10px] uppercase tracking-widest text-white/20">Room Code</span>
          </div>
          <button onClick={copy}
            className="w-full py-5 text-center group">
            <div className="font-mono text-4xl font-black tracking-[0.35em] text-gold-light
              group-hover:text-gold-DEFAULT transition">
              {partyCode}
            </div>
            <div className="mt-1.5 h-4 text-[10px] text-white/20">
              {copied
                ? <span className="text-emerald-400"><i className="fa-solid fa-check mr-1" />Copied</span>
                : <span><i className="fa-regular fa-copy mr-1" />Tap to copy</span>}
            </div>
          </button>
        </div>

        {/* Player list */}
        <div className="rounded-2xl border border-white/8 bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-white/20">
              <i className="fa-solid fa-users mr-1.5" />Players
            </span>
            <span className="text-[10px] font-mono text-white/20">
              {players.length}/{GAME_CONFIG.MAX_PLAYERS}
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {players.map((p, i) => (
              <li key={p.id}
                className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/8
                    flex items-center justify-center text-[10px] text-white/20 font-mono">
                    {i + 1}
                  </div>
                  <span className={`text-sm font-medium ${p.id === selfId ? 'text-gold-light' : 'text-ivory-DEFAULT'}`}>
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.id === view?.hostId && (
                    <span className="text-[10px] text-gold-DEFAULT/60">
                      <i className="fa-solid fa-crown" />
                    </span>
                  )}
                  {p.id === selfId && (
                    <span className="text-[9px] text-white/20 bg-white/5 rounded-full px-1.5 py-0.5">you</span>
                  )}
                </div>
              </li>
            ))}
            {players.length === 0 && (
              <li className="py-5 text-center text-xs text-white/20">
                {status === 'SUBSCRIBED'
                  ? <span><i className="fa-solid fa-spinner fa-spin mr-1.5" />Waiting for host…</span>
                  : <span>Connecting… ({status})</span>}
              </li>
            )}
          </ul>
          <div className="px-4 py-2 border-t border-white/5 text-center text-[10px] text-white/15">
            Need at least {GAME_CONFIG.MIN_PLAYERS} players
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onLeave}
            className="flex-none rounded-xl border border-white/8 bg-white/3 px-4 py-3
              text-xs text-white/30 hover:text-white/60 hover:border-white/15 transition">
            <i className="fa-solid fa-arrow-left-long mr-1.5" />Leave
          </button>
          {isHost ? (
            <button disabled={!canStart} onClick={onStart}
              className="flex-1 rounded-xl py-3 text-sm font-semibold
                bg-gold-faint/40 border border-gold-DEFAULT/30 text-gold-light
                hover:bg-gold-faint/60 hover:border-gold-DEFAULT/50
                active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
              <i className="fa-solid fa-play mr-2 text-xs" />
              Start Game
            </button>
          ) : (
            <div className="flex-1 rounded-xl border border-white/5 bg-white/3 py-3
              text-center text-xs text-white/20">
              <i className="fa-solid fa-hourglass-half mr-1.5 animate-spin" style={{ animationDuration: '3s' }} />
              Waiting for host
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
