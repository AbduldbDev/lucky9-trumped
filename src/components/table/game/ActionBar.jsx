import { GAME_CONFIG } from "../../../config/gameRules.config.js";
import { useAudio } from "../../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../../config/audio.config.js";
import { TAP, CAN_HOVER } from "./controlsStyles.js";

/** Hit / Stand row with dealing + counter-wait indicators. */
export default function ActionBar({
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
