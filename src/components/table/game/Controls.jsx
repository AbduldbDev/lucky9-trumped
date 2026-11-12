import { useState } from "react";
import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import {
  TRUMP_CARDS_CATALOG,
  RARITY_COLOR,
  TRUMP_ICONS,
} from "../../../config/trumpCards.config.js";
import { SUMMONABLE_RANKS } from "../../../utils/deckEngine.js";
import { useAudio } from "../../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../../config/audio.config.js";

const TAP =
  "touch-manipulation select-none transition-all duration-150 active:scale-[0.97] " +
  "disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100";
const CAN_HOVER = "[@media(hover:hover)]:hover";

export function ActionBar({
  me,
  isMyTurn,
  actions,
  waitingForCounterResponse,
  isDealing = false,
}) {
  const audio = useAudio();
  const max = GAME_CONFIG.MAX_CARDS_IN_HAND;
  const handFull = me.hand.length >= max;

  const canHit =
    isMyTurn &&
    !me.stood &&
    !handFull &&
    !waitingForCounterResponse &&
    !isDealing;
  const canStand =
    isMyTurn && !me.stood && !waitingForCounterResponse && !isDealing;

  const handleHit = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.CARD_DRAW);
    actions.hit();
  };

  const handleStand = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    actions.stand();
  };

  return (
    <div className="controls flex flex-col gap-0.5 sm:gap-1">
      {/* Dealing animation indicator */}
      {isDealing && (
        <div className="flex items-center justify-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 mb-0.5 sm:mb-1 rounded-md sm:rounded-lg bg-blue-500/10 border border-blue-500/20">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-full w-full rounded-full bg-blue-500" />
          </span>
          <span className="text-[8px] sm:text-[10px] font-medium text-blue-200/90 uppercase tracking-wider">
            Dealing cards...
          </span>
        </div>
      )}

      {/* Waiting for counter indicator */}
      {waitingForCounterResponse && (
        <div className="flex items-center justify-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 mb-0.5 sm:mb-1 rounded-md sm:rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-full w-full rounded-full bg-yellow-500" />
          </span>
          <span className="text-[8px] sm:text-[10px] font-medium text-yellow-200/90 uppercase tracking-wider">
            Waiting for counter response...
          </span>
        </div>
      )}

      <div className="ctl-actions flex items-center gap-1 sm:gap-1.5">
        {/* Hit */}
        <button
          disabled={!canHit}
          onClick={handleHit}
          className={`ctl-btn ${TAP} group relative flex items-center justify-center gap-1 sm:gap-1.5
            rounded-xl sm:rounded-2xl border border-gold/20
            bg-felt-light/60 px-2 sm:px-2.5
            text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em]
            text-ivory/90
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-1
            focus-visible:ring-gold/50
            disabled:cursor-not-allowed disabled:opacity-35
            ${CAN_HOVER}:border-gold/40
            ${CAN_HOVER}:bg-felt-light/90`}
          title={
            isDealing
              ? "Cards are being dealt..."
              : waitingForCounterResponse
                ? "Waiting for counter response..."
                : handFull
                  ? "Hand full — Stand or play a Trump"
                  : `Draw a card (${me.hand.length}/${max})`
          }
          aria-label={`Hit, ${me.hand.length} of ${max} cards`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/50 to-transparent"
          />
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em]">
            Hit
          </span>

          <span className="ml-0.5 rounded-xl sm:rounded-2xl border border-gold/15 bg-black/10 px-1 py-px sm:py-0.5 font-mono text-[7px] sm:text-[8px] font-normal tracking-normal text-ivory-dim/60 tabular-nums">
            {me.hand.length}/{max}
          </span>
        </button>

        {/* Stand */}
        <button
          disabled={!canStand}
          onClick={handleStand}
          className={`ctl-btn ${TAP} group relative flex items-center justify-center gap-1 sm:gap-1.5
            overflow-hidden rounded-xl sm:rounded-2xl
            border border-gold/20
            bg-gradient-to-b from-gold/15 to-gold/5
            px-2 sm:px-3
            text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em]
            text-gold-light
            transition-all duration-200 ease-out
            active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-1
            focus-visible:ring-gold/60
            disabled:cursor-not-allowed disabled:opacity-35
            ${CAN_HOVER}:border-gold/70
            ${CAN_HOVER}:from-gold/25
            ${CAN_HOVER}:to-gold/10`}
          title={
            isDealing
              ? "Cards are being dealt..."
              : waitingForCounterResponse
                ? "Waiting for counter response..."
                : "Lock your hand — you will not draw again this round"
          }
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/50 to-transparent"
          />

          <i className="fa-solid fa-hand text-[7px] sm:text-[8px] opacity-80" />
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em]">
            Stand
          </span>
        </button>
      </div>

      {/* Hand limit hint */}
      {handFull && isMyTurn && !me.stood && !waitingForCounterResponse && (
        <p
          role="status"
          className="ctl-hint text-center text-[7px] sm:text-[8px] font-medium uppercase
            tracking-[0.12em] sm:tracking-[0.14em] text-gold/60"
        >
          Hand full <span className="mx-1 text-gold/30">·</span>
          Play a Trump or Stand
        </p>
      )}

      {/* Waiting for counter hint */}
      {waitingForCounterResponse && isMyTurn && (
        <p
          role="status"
          className="ctl-hint text-center text-[7px] sm:text-[8px] font-medium uppercase
            tracking-[0.12em] sm:tracking-[0.14em] text-yellow-400/70"
        >
          Target player deciding to counter...
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
  waitingForCounterResponse,
  isDealing = false,
}) {
  const audio = useAudio();
  const [rank, setRank] = useState("A");
  const aimCfg = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;

  const pick = (id) => {
    if (!isMyTurn || isDealing) return;
    const cfg = TRUMP_CARDS_CATALOG[id];
    if (!cfg) return;

    if (id === "SACRIFICE" && me.lives <= 1) {
      audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
      return;
    }

    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);

    if (cfg.targetType === "SINGLE_PLAYER" || cfg.targetType === "RANK_CHOICE")
      onAim(id);
    else {
      actions.playTrump(id);
    }
  };

  if (me.trumps.length === 0 && !aimCfg) return null;

  return (
    <div className="controls flex flex-col gap-1.5 sm:gap-2.5 pb-[env(safe-area-inset-bottom)]">
      {/* Targeting banner */}
      {aimCfg?.targetType === "SINGLE_PLAYER" && (
        <div
          role="status"
          className="flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-[#0b0b0c]/85 backdrop-blur-md
            border border-white/10 pl-2 sm:pl-3 pr-0.5 py-0 sm:py-0.5 animate-fadeUp"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d9c28a] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d9c28a]" />
          </span>
          <p className="flex-1 min-w-0 text-[10px] sm:text-[11px] leading-tight text-white/50">
            <span className="font-medium tracking-wide text-[#f1e6c8]">
              {aimCfg.name}
            </span>
            <span className="mx-1 sm:mx-1.5 text-white/20">/</span>
            Select a seat
          </p>
          <button
            onClick={onCancelAim}
            aria-label="Cancel targeting"
            className={`${TAP} shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded
              text-white/30 ${CAN_HOVER}:text-white/80 transition-colors`}
          >
            <i className="fa-solid fa-xmark text-[10px] sm:text-xs" />
          </button>
        </div>
      )}
      {/* Rank picker */}
      {aimCfg?.targetType === "RANK_CHOICE" && (
        <div
          className="relative rounded-lg sm:rounded-xl bg-[#0b0b0c]/85 backdrop-blur-md
            border border-[#b89b5e]/30 p-2 sm:p-3 animate-fadeUp"
        >
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c28a]/70 to-transparent" />

          <p className="mb-1.5 sm:mb-3 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/40">
            <span className="text-[#f1e6c8]">{aimCfg.name}</span>
            <span className="mx-1.5 sm:mx-2 text-white/20">·</span>
            Choose rank
          </p>

          <div className="ctl-ranks no-scrollbar">
            {SUMMONABLE_RANKS.map((r) => (
              <button
                key={r}
                onClick={() => setRank(r)}
                aria-pressed={rank === r}
                className={`ctl-rank ${TAP} rounded-md text-xs sm:text-sm font-medium font-mono transition-colors
                  ${
                    rank === r
                      ? "bg-[#b89b5e]/15 border border-[#d9c28a]/70 text-[#f1e6c8]"
                      : `bg-white/[0.03] border border-white/10 text-white/50 ${CAN_HOVER}:text-white/90`
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <button
              onClick={onCancelAim}
              className={`${TAP} min-h-[34px] sm:min-h-[40px] rounded-md border border-white/10 bg-transparent
                text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/50
                ${CAN_HOVER}:text-white/90 transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                actions.playTrump(aiming, { rank });
                onCancelAim();
              }}
              className={`${TAP} min-h-[34px] sm:min-h-[40px] rounded-md border border-[#d9c28a]/60
                bg-gradient-to-b from-[#b89b5e]/25 to-[#b89b5e]/10
                text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f1e6c8]
                ${CAN_HOVER}:from-[#b89b5e]/35 transition-colors`}
            >
              Play {rank}
            </button>
          </div>
        </div>
      )}
      {/* Trump cards */}
      {me.trumps.length > 0 && (
        <section aria-label="Trump cards" className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 px-0.5">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#b89b5e]/80 truncate">
              Trump Cards
            </span>
            {me.trumpsDisabled && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-px sm:py-0.5">
                <i className="fa-solid fa-lock text-[6px] sm:text-[7px] text-red-400" />
                <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider text-red-400">
                  Locked
                </span>
              </span>
            )}
            <span className="h-px flex-1 bg-gradient-to-r from-[#b89b5e]/25 to-transparent" />
            <span className="text-[9px] sm:text-[10px] text-white/30 font-mono tabular-nums">
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

              const isSacrificeDisabled = id === "SACRIFICE" && me.lives <= 1;
              const isMirror = id === "MIRROR";
              const isTrumpsLocked = me.trumpsDisabled === true;
              const isDisabled =
                !isMyTurn ||
                isSacrificeDisabled ||
                isTrumpsLocked ||
                isMirror ||
                isDealing;

              return (
                <button
                  key={`${id}-${i}`}
                  disabled={isDisabled}
                  onClick={() => pick(id)}
                  title={
                    isDealing
                      ? `${cfg.name} (${rarity}) — Cards are being dealt...`
                      : isTrumpsLocked
                        ? `${cfg.name} (${rarity}) — Locked down this round`
                        : isSacrificeDisabled
                          ? `${cfg.name} (${rarity}) — Cannot use: Need more than 1 life`
                          : `${cfg.name} (${rarity}) — ${cfg.description ?? ""}`
                  }
                  aria-label={
                    isTrumpsLocked
                      ? `${cfg.name}, ${rarity}. Locked down this round`
                      : isSacrificeDisabled
                        ? `${cfg.name}, ${rarity}. Cannot use: Need more than 1 life`
                        : `${cfg.name}, ${rarity}. ${cfg.description ?? ""}`
                  }
                  aria-pressed={isAiming}
                  className={`ctl-trump trump-btn group relative touch-manipulation shrink-0 overflow-hidden
                    flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1
                    rounded-lg sm:rounded-xl border
                    transition-all duration-200 ease-out
                    active:scale-[0.97]
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c28a]/70
                    disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-50
                    ${CAN_HOVER}:-translate-y-0.5 ${CAN_HOVER}:brightness-125
                    ${isAiming ? "targeting -translate-y-1" : ""}`}
                  style={{
                    background: `linear-gradient(180deg, ${color}1f 0%, rgba(11,11,12,0.88) 58%)`,
                    borderColor: isAiming
                      ? "#d9c28a"
                      : "rgba(255,255,255,0.08)",
                    boxShadow: isAiming
                      ? "0 0 0 1px rgba(217,194,138,0.35), 0 10px 28px -8px rgba(0,0,0,0.85), 0 0 24px -6px rgba(217,194,138,0.35)"
                      : "0 6px 16px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Rarity hairline along the top edge */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    }}
                  />

                  {/* Icon badge */}
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 text-xs sm:text-base"
                    style={{ color }}
                  >
                    <i className={`ctl-trump-icon fa-solid ${icon}`} />
                  </span>

                  {/* Name */}
                  <span className="ctl-trump-name w-full px-0.5 sm:px-1 text-[9px] sm:text-[11px] font-medium text-[#f1e6c8]/90 leading-tight tracking-wide break-words line-clamp-2">
                    {cfg.name}
                  </span>

                  {/* Rarity */}
                  <span
                    className="ctl-trump-rarity flex items-center gap-1 text-[6px] sm:text-[8px] font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em]"
                    style={{ color: `${color}cc` }}
                  >
                    <span
                      className="h-[3px] w-[3px] sm:h-1 sm:w-1 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                    {rarity}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}{" "}
    </div>
  );
}
export default function Controls(props) {
  const { view, actions, isDealing = false } = props;
  const waitingForCounterResponse = view?.waitingForCounterResponse ?? false;

  return (
    <div
      className="flex flex-col gap-1.5 sm:gap-2.5 w-full min-w-0 px-2 sm:px-3 pt-1.5 sm:pt-2.5 pb-0.5 sm:pb-1
        border-t border-gold/15 bg-ink/60 backdrop-blur-md"
    >
      {/* Top: Hit / Stand (full width) */}
      <ActionBar
        {...props}
        waitingForCounterResponse={waitingForCounterResponse}
        isDealing={isDealing}
      />

      {/* Bottom: Trump cards (full width) */}
      <TrumpTray
        {...props}
        waitingForCounterResponse={waitingForCounterResponse}
        isDealing={isDealing}
      />
    </div>
  );
}
