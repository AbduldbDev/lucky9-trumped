import { useState } from "react";
import { GAME_CONFIG } from "../../config/gameRules.config.js";
import { TRUMP_CARDS_CATALOG } from "../../config/trumpCards.config.js";
import { SUMMONABLE_RANKS } from "../../utils/deckEngine.js";

/* FontAwesome icons per trump card */
const TRUMP_ICONS = {
  BET_UP: "fa-arrow-trend-up",
  BET_DOWN: "fa-arrow-trend-down",
  DOUBLE_BET_UP: "fa-angles-up",
  DOUBLE_BET_DOWN: "fa-angles-down",
  SHUTTER: "fa-ban",
  RETURN: "fa-rotate-left",
  DISCARD: "fa-trash-can",
  REFRESH: "fa-arrows-rotate",
  EXCHANGE: "fa-right-left",
  TARGET: "fa-location-crosshairs",
  SELECT: "fa-hand-pointer",
  DISABLE: "fa-eye-slash",
  CHECKER: "fa-magnifying-glass",
  FRIENDSHIP_CARD: "fa-people-group",
  ANGEL_CARD: "fa-shield-halved",
};

const RARITY_COLOR = {
  COMMON: "#8d99a8",
  UNCOMMON: "#5fbf86",
  RARE: "#6a9fd8",
  LEGENDARY: "#b89b5e",
  MYTHIC: "#a98bd6",
};

const TAP =
  "touch-manipulation select-none transition-all duration-150 active:scale-[0.97] " +
  "disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100";
const CAN_HOVER = "[@media(hover:hover)]:hover";

export function ActionBar({ me, isMyTurn, actions }) {
  const max = GAME_CONFIG.MAX_CARDS_IN_HAND;
  const handFull = me.hand.length >= max;
  const canHit = isMyTurn && !me.stood && !handFull;
  const canStand = isMyTurn && !me.stood;

  return (
    <div className="controls flex flex-col gap-1">
      <div className="ctl-actions">
        <button
          disabled={!canHit}
          onClick={actions.hit}
          className={`ctl-btn ${TAP} flex items-center justify-center gap-1 rounded-md
          bg-felt-light/80 border border-gold/15 text-ivory font-semibold tracking-wide
          text-xs py-1.5 px-2
          ${CAN_HOVER}:bg-felt-light ${CAN_HOVER}:border-gold/40`}
          title={
            handFull
              ? "Hand full — Stand or play a Trump"
              : `Draw a card (${me.hand.length}/${max})`
          }
          aria-label={`Hit, ${me.hand.length} of ${max} cards`}
        >
          <i className="fa-solid fa-plus text-[9px]" />
          <span>Hit</span>
          <span className="ctl-count text-ivory-dim/50 text-[10px] font-normal font-mono">
            {me.hand.length}/{max}
          </span>
        </button>

        <button
          disabled={!canStand}
          onClick={actions.stand}
          className={`ctl-btn ${TAP} flex items-center justify-center gap-1 rounded-md
          bg-gold-faint border border-gold-dim/50 text-gold-light font-semibold tracking-wide
          text-xs py-1.5 px-2
          ${CAN_HOVER}:border-gold/70 ${CAN_HOVER}:shadow-gold`}
          title="Lock your hand — you will not draw again this round"
        >
          <i className="fa-solid fa-hand text-[9px]" />
          <span>Stand</span>
        </button>
      </div>

      {handFull && isMyTurn && !me.stood && (
        <p className="ctl-hint text-[10px] text-ivory-dim/60 text-center leading-snug">
          Hand full — play a Trump Card or Stand
        </p>
      )}
    </div>
  );
}

export function TrumpTray({
  me,
  isMyTurn,
  actions,
  aiming,
  onAim,
  onCancelAim,
}) {
  const [rank, setRank] = useState("A");
  const aimCfg = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;

  const pick = (id) => {
    if (!isMyTurn || me.stood) return;
    const cfg = TRUMP_CARDS_CATALOG[id];
    if (!cfg) return;
    if (cfg.targetType === "SINGLE_PLAYER" || cfg.targetType === "RANK_CHOICE")
      onAim(id);
    else actions.playTrump(id);
  };

  if (me.trumps.length === 0 && !aimCfg) return null;

  return (
    <div className="controls flex flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
      {/* Targeting banner */}
      {aimCfg?.targetType === "SINGLE_PLAYER" && (
        <div
          role="status"
          className="flex items-center gap-1.5 rounded-md bg-red-950/60 border border-red-700/40
            pl-2 pr-0.5 py-0.5 animate-fadeUp"
        >
          <i className="fa-solid fa-crosshairs text-red-300 text-[11px] shrink-0" />
          <p className="flex-1 min-w-0 text-[11px] text-red-200 leading-tight">
            <span className="font-semibold text-white">{aimCfg.name}</span>
            <span className="text-red-200/80"> — tap a seat</span>
          </p>
          <button
            onClick={onCancelAim}
            aria-label="Cancel targeting"
            className={`${TAP} shrink-0 w-10 h-10 flex items-center justify-center rounded
              text-ivory-dim/60 ${CAN_HOVER}:text-white`}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Rank picker */}
      {aimCfg?.targetType === "RANK_CHOICE" && (
        <div className="rounded-md bg-ink/80 border border-gold/20 p-2 animate-fadeUp">
          <p className="text-[11px] text-ivory-dim/80 mb-2 text-center leading-tight">
            <span className="text-white font-semibold">{aimCfg.name}</span> —
            choose rank
          </p>

          <div className="ctl-ranks no-scrollbar">
            {SUMMONABLE_RANKS.map((r) => (
              <button
                key={r}
                onClick={() => setRank(r)}
                aria-pressed={rank === r}
                className={`ctl-rank ${TAP} rounded text-sm font-bold font-mono
                  ${
                    rank === r
                      ? "bg-gold/20 border border-gold/70 text-gold-light"
                      : `bg-white/5 border border-white/10 text-ivory-dim/70 ${CAN_HOVER}:text-white`
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={onCancelAim}
              className={`${TAP} min-h-[40px] rounded border border-white/10 bg-white/5
                text-[11px] font-medium uppercase tracking-widest text-ivory-dim/70`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                actions.playTrump(aiming, { rank });
                onCancelAim();
              }}
              className={`${TAP} min-h-[40px] rounded bg-gold/20 border border-gold/60
                text-[11px] font-semibold uppercase tracking-widest text-gold-light`}
            >
              Play {rank}
            </button>
          </div>
        </div>
      )}

      {/* Trump cards */}
      {me.trumps.length > 0 && (
        <section aria-label="Trump cards" className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <i className="fa-solid fa-bolt-lightning text-gold text-[9px]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold/70 truncate">
              Trump Cards
            </span>
            <span className="ml-auto text-[10px] text-ivory-dim/40 font-mono">
              {me.trumps.length}
            </span>
          </div>

          <div className="ctl-trumps no-scrollbar">
            {me.trumps.map((id, i) => {
              const cfg = TRUMP_CARDS_CATALOG[id];
              if (!cfg) return null;
              const color = RARITY_COLOR[cfg.rarity] ?? RARITY_COLOR.COMMON;
              const icon = TRUMP_ICONS[id] ?? "fa-wand-magic-sparkles";
              const isAiming = aiming === id;
              const rarity = cfg.rarity[0] + cfg.rarity.slice(1).toLowerCase();

              return (
                <button
                  key={`${id}-${i}`}
                  disabled={!isMyTurn || me.stood}
                  onClick={() => pick(id)}
                  title={`${cfg.name} (${rarity}) — ${cfg.description ?? ""}`}
                  aria-label={`${cfg.name}, ${rarity}. ${cfg.description ?? ""}`}
                  aria-pressed={isAiming}
                  className={`ctl-trump trump-btn touch-manipulation shrink-0
                    flex flex-col items-center justify-center text-center
                    rounded-md border bg-ink/70 ${CAN_HOVER}:bg-ink
                    ${isAiming ? "targeting" : ""}`}
                  style={{
                    borderColor: isAiming ? "#fff" : `${color}44`,
                    boxShadow: isAiming ? undefined : `inset 0 2px 0 ${color}`,
                  }}
                >
                  <i
                    className={`ctl-trump-icon fa-solid ${icon}`}
                    style={{ color }}
                  />
                  <span className="ctl-trump-name w-full font-semibold text-ivory leading-tight break-words line-clamp-2">
                    {cfg.name}
                  </span>
                  <span
                    className="ctl-trump-rarity text-[9px] font-medium uppercase tracking-wider"
                    style={{ color: `${color}cc` }}
                  >
                    {rarity}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function Controls(props) {
  return (
    <div
      className="flex flex-col gap-2.5 w-full min-w-0 px-3 pt-2.5 pb-1
        border-t border-gold/15 bg-ink/60 backdrop-blur-md"
    >
      {/* Top: Hit / Stand (full width) */}
      <ActionBar {...props} />

      {/* Bottom: Trump cards (full width) */}
      <TrumpTray {...props} />
    </div>
  );
}
