import { useState } from 'react';
import { isSupabaseConfigured } from '../../services/supabaseClient.js';
import { isValidPartyCode, normalizePartyCode } from '../../utils/partyCode.js';
import { GAME_CONFIG } from '../../config/gameRules.config.js';

export default function Lobby({ profile, onRename, onCreate, onJoin, onOpenShop }) {
  const [name, setName]   = useState(profile.username);
  const [code, setCode]   = useState('');
  const [mode, setMode]   = useState('create'); // 'create' | 'join'
  const [error, setError] = useState('');

  const submit = async (fn) => {
    setError('');
    try {
      if (name.trim() !== profile.username) await onRename(name);
      fn();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Subtle corner suit watermarks */}
      {['♠','♥','♣','♦'].map((s,i) => (
        <div key={i} className="absolute text-8xl text-white/[0.025] select-none pointer-events-none font-serif"
          style={{ [i < 2 ? 'top' : 'bottom']: '2rem', [i % 2 === 0 ? 'left' : 'right']: '2rem' }}>
          {s}
        </div>
      ))}

      <div className="w-full max-w-[340px] px-4 space-y-5">
        {/* Logo */}
        <header className="text-center space-y-1">
          <h1 className="text-gold-shimmer font-serif text-5xl font-black tracking-widest">
            LUCKY 9
          </h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-semibold">
            Trump Card Edition
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/30 to-transparent mt-2" />
        </header>

        {/* Supabase warning */}
        {!isSupabaseConfigured && (
          <div className="rounded-xl border border-red-700/30 bg-red-950/40 px-3 py-2.5 text-xs text-red-300/80">
            <i className="fa-solid fa-triangle-exclamation mr-1.5" />
            Multiplayer needs <code className="font-mono text-red-400">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono text-red-400">VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>
          </div>
        )}

        {/* Profile */}
        <div className="rounded-2xl border border-white/8 bg-black/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5">
              Display Name
            </label>
            <input
              value={name} maxLength={20}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent text-ivory-DEFAULT font-semibold text-sm
                outline-none border-b border-white/10 pb-1
                focus:border-gold-DEFAULT/50 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-xs">
            <div className="text-white/30 space-x-2">
              <span>
                <span className="text-gold-DEFAULT font-semibold">{profile.stats.totalWins}</span>
                <span className="text-white/15">/{profile.stats.totalMatches}</span>
                <span className="ml-1">wins</span>
              </span>
              {profile.stats.highestWinStreak > 0 && (
                <span className="text-white/20">
                  <i className="fa-solid fa-fire-flame-curved text-orange-500/50 mr-0.5" />
                  {profile.stats.highestWinStreak}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold-DEFAULT font-mono font-semibold">
                <i className="fa-solid fa-coins mr-1 text-gold-DEFAULT/60" />{profile.chips}
              </span>
              <button onClick={onOpenShop}
                className="text-white/30 hover:text-gold-DEFAULT transition text-xs">
                <i className="fa-solid fa-store" />
              </button>
            </div>
          </div>
        </div>

        {/* Room */}
        <div className="rounded-2xl border border-white/8 bg-black/40 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5">
            {[['create','fa-plus','Create'],['join','fa-right-to-bracket','Join']].map(([t,ic,lb]) => (
              <button key={t} onClick={() => setMode(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold
                  transition-colors
                  ${mode === t
                    ? 'text-gold-light border-b-2 border-gold-DEFAULT bg-gold-faint/20'
                    : 'text-white/25 hover:text-white/50 border-b-2 border-transparent'
                  }`}>
                <i className={`fa-solid ${ic} text-[10px]`} />
                {lb}
              </button>
            ))}
          </div>
          <div className="p-4">
            {mode === 'create' ? (
              <button
                disabled={!isSupabaseConfigured || !name.trim()}
                onClick={() => submit(onCreate)}
                className="w-full rounded-xl py-3 text-sm font-semibold
                  bg-gold-faint/40 border border-gold-DEFAULT/30 text-gold-light
                  hover:bg-gold-faint/60 hover:border-gold-DEFAULT/50
                  active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                <i className="fa-solid fa-circle-plus mr-2" />
                Create Private Room
              </button>
            ) : (
              <div className="space-y-2.5">
                <input
                  value={code}
                  onChange={e => setCode(normalizePartyCode(e.target.value))}
                  placeholder="ROOM CODE"
                  maxLength={GAME_CONFIG.PARTY_CODE_LENGTH}
                  className="w-full rounded-xl bg-black/30 border border-white/8 px-3 py-2.5
                    text-center font-mono text-xl tracking-[0.4em] text-gold-light font-bold
                    placeholder:text-white/15 placeholder:text-sm placeholder:tracking-[0.2em]
                    focus:outline-none focus:border-gold-DEFAULT/40 transition"
                />
                <button
                  disabled={!isSupabaseConfigured || !isValidPartyCode(code) || !name.trim()}
                  onClick={() => submit(() => onJoin(code))}
                  className="w-full rounded-xl py-3 text-sm font-semibold
                    bg-felt-light/40 border border-white/10 text-ivory-DEFAULT
                    hover:bg-felt-light/60 hover:border-white/20
                    active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                  <i className="fa-solid fa-arrow-right-to-bracket mr-2" />
                  Join Table
                </button>
              </div>
            )}
            {error && (
              <p className="mt-2 text-xs text-red-400/80 text-center">
                <i className="fa-solid fa-circle-exclamation mr-1" />{error}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-white/15">
          {GAME_CONFIG.MIN_PLAYERS}–{GAME_CONFIG.MAX_PLAYERS} players ·
          {GAME_CONFIG.STARTING_LIVES} lives ·
          up to {GAME_CONFIG.MAX_CARDS_IN_HAND} cards
        </p>
      </div>
    </div>
  );
}
