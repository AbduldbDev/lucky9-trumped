import { useState } from 'react';
import { GAME_CONFIG } from '../../config/gameRules.config.js';
import { TRUMP_CARDS_CATALOG, TRUMP_RARITIES } from '../../config/trumpCards.config.js';
import { SUMMONABLE_RANKS } from '../../utils/deckEngine.js';

/* FontAwesome icons per trump card */
const TRUMP_ICONS = {
  BET_UP:          'fa-arrow-trend-up',
  BET_DOWN:        'fa-arrow-trend-down',
  DOUBLE_BET_UP:   'fa-angles-up',
  DOUBLE_BET_DOWN: 'fa-angles-down',
  SHUTTER:         'fa-ban',
  RETURN:          'fa-rotate-left',
  DISCARD:         'fa-trash-can',
  REFRESH:         'fa-arrows-rotate',
  EXCHANGE:        'fa-right-left',
  TARGET:          'fa-location-crosshairs',
  SELECT:          'fa-hand-pointer',
  DISABLE:         'fa-eye-slash',
  CHECKER:         'fa-magnifying-glass',
  FRIENDSHIP_CARD: 'fa-people-group',
  ANGEL_CARD:      'fa-shield-halved',
};

const RARITY_COLOR = {
  COMMON:    '#94a3b8',
  UNCOMMON:  '#4ade80',
  RARE:      '#60a5fa',
  LEGENDARY: '#c9a84c',
  MYTHIC:    '#c084fc',
};

export default function Controls({ me, isMyTurn, actions, aiming, onAim, onCancelAim }) {
  const [rank, setRank] = useState('A');
  const canHit   = isMyTurn && !me.stood && me.hand.length < GAME_CONFIG.MAX_CARDS_IN_HAND;
  const canStand = isMyTurn && !me.stood;
  const aimCfg   = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;

  const pick = (id) => {
    if (!isMyTurn || me.stood) return;
    const cfg = TRUMP_CARDS_CATALOG[id];
    if (!cfg) return;
    if (cfg.targetType === 'SINGLE_PLAYER' || cfg.targetType === 'RANK_CHOICE') onAim(id);
    else actions.playTrump(id);
  };

  return (
    <div className="flex flex-col gap-2 w-full">

      {/* ── Hit / Stand ── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={!canHit}
          onClick={actions.hit}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5
            bg-felt-light/80 border border-white/10 text-ivory-DEFAULT font-semibold text-sm
            hover:bg-felt-light hover:border-white/20 active:scale-95
            disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title={me.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND
            ? `Hand full — Stand or play a Trump`
            : `Draw a card (turn passes to next player)`}
        >
          <i className="fa-solid fa-plus text-xs" />
          Hit
          <span className="text-white/30 text-xs font-normal ml-0.5">
            {me.hand.length}/{GAME_CONFIG.MAX_CARDS_IN_HAND}
          </span>
        </button>
        <button
          disabled={!canStand}
          onClick={actions.stand}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5
            bg-gold-faint/80 border border-gold-dim/40 text-gold-light font-semibold text-sm
            hover:bg-gold-faint hover:border-gold-DEFAULT/60 active:scale-95
            disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title="Lock your hand — you will not draw again this round"
        >
          <i className="fa-solid fa-hand text-xs" />
          Stand
        </button>
      </div>

      {/* Hint: full hand */}
      {me.hand.length >= GAME_CONFIG.MAX_CARDS_IN_HAND && isMyTurn && !me.stood && (
        <p className="text-[10px] text-white/30 text-center">
          <i className="fa-solid fa-hand-paper mr-1 text-gold-DEFAULT/50" />
          Hand full — play a Trump Card or Stand
        </p>
      )}

      {/* ── Targeting banner ── */}
      {aimCfg?.targetType === 'SINGLE_PLAYER' && (
        <div className="flex items-center justify-between rounded-lg
          bg-red-950/60 border border-red-700/40 px-3 py-2 animate-fadeUp">
          <div className="text-xs text-red-300">
            <i className="fa-solid fa-crosshairs mr-1.5" />
            <span className="font-semibold text-white">{aimCfg.name}</span> — tap a seat to target
          </div>
          <button onClick={onCancelAim} className="text-xs text-white/30 hover:text-white transition">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* ── Rank picker ── */}
      {aimCfg?.targetType === 'RANK_CHOICE' && (
        <div className="rounded-xl bg-black/40 border border-white/8 p-3 animate-fadeUp">
          <p className="text-xs text-white/50 mb-2 text-center">
            <i className="fa-solid fa-hand-pointer mr-1.5 text-gold-DEFAULT" />
            <span className="text-white font-semibold">{aimCfg.name}</span> — choose rank
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {SUMMONABLE_RANKS.map((r) => (
              <button
                key={r}
                onClick={() => setRank(r)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                  ${rank === r
                    ? 'bg-gold-DEFAULT/20 border border-gold-DEFAULT/60 text-gold-light'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
              >{r}</button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={onCancelAim}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/40 hover:text-white transition">
              Cancel
            </button>
            <button
              onClick={() => { actions.playTrump(aiming, { rank }); onCancelAim(); }}
              className="flex-1 rounded-lg bg-gold-DEFAULT/20 border border-gold-DEFAULT/50 py-1.5
                text-xs font-semibold text-gold-light hover:bg-gold-DEFAULT/30 transition">
              Confirm {rank}
            </button>
          </div>
        </div>
      )}

      {/* ── Trump hand ── */}
      {me.trumps.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <i className="fa-solid fa-bolt-lightning text-gold-DEFAULT text-[10px]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-DEFAULT/60">
              Trump Cards
            </span>
            <span className="ml-auto text-[10px] text-white/20 font-mono">{me.trumps.length}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {me.trumps.map((id, i) => {
              const cfg   = TRUMP_CARDS_CATALOG[id];
              if (!cfg) return null;
              const color = RARITY_COLOR[cfg.rarity] ?? '#94a3b8';
              const icon  = TRUMP_ICONS[id] ?? 'fa-wand-magic-sparkles';
              const isAiming = aiming === id;

              return (
                <button
                  key={`${id}-${i}`}
                  disabled={!isMyTurn || me.stood}
                  onClick={() => pick(id)}
                  title={cfg.description}
                  className={`trump-btn shrink-0 flex flex-col items-center gap-1
                    w-[72px] rounded-xl border py-2 px-1.5 text-center
                    bg-black/40 hover:bg-black/60
                    ${isAiming ? 'targeting' : ''}`}
                  style={{ borderColor: isAiming ? '#fff' : `${color}40` }}
                  aria-pressed={isAiming}
                >
                  <i
                    className={`fa-solid ${icon} text-sm`}
                    style={{ color }}
                  />
                  <span className="text-[10px] font-semibold text-ivory-DEFAULT leading-tight line-clamp-1">
                    {cfg.name}
                  </span>
                  <span className="text-[8px] font-medium uppercase tracking-wider"
                    style={{ color: `${color}aa` }}>
                    {cfg.rarity[0] + cfg.rarity.slice(1).toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
