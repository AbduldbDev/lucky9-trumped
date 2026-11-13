import { useState } from "react";
import TrumpGuideModal from "../modals/TrumpGuideModal.jsx";
import AudioSettings from "./AudioSettings.jsx";
import { PHASES } from "../../../utils/gameEngine.js";

export default function TopBar({ view, bet, onLeave, onOpenShop }) {
  const [showGuide, setShowGuide] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // During the showdown countdown the ShowdownOverlay (z-[80]) covers
  // everything; the topbar must stay above it. Outside the countdown the
  // topbar keeps its normal layer so full-screen modals cover it as usual.
  const aboveOverlay = view?.phase === PHASES.COUNTDOWN;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(view.partyCode);
    } catch {
      // Fallback for browsers/contexts without the Clipboard API
      const el = document.createElement("textarea");
      el.value = view.partyCode;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div
        className={`flex-none grid grid-cols-[1fr_auto_1fr] items-center
          px-3 sm:px-4 h-11 bg-black/60 border-b border-white/5 ${
            aboveOverlay ? "z-[90]" : "z-20"
          }`}
      >
        <button
          onClick={onLeave}
          className="justify-self-start flex items-center gap-1.5 text-xs text-white/30
              hover:text-white transition px-2 py-1 rounded hover:bg-white/5"
        >
          <i className="fa-solid fa-arrow-left-long" />
          Leave
        </button>

        <div className="text-center">
          <div>
            <span className="text-gold-shimmer font-serif font-bold text-sm tracking-widest">
              LUCKY 9
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Click to copy party code"
            className="mt-0.5 text-[10px] font-mono text-white/30 hover:text-white/60 active:scale-95 transition cursor-pointer"
          >
            {copied ? "Copied!" : view.partyCode}
          </button>
        </div>

        <div className="justify-self-end flex items-center gap-3 text-xs text-white/30">
          {/* Audio Settings button */}
          <button
            onClick={() => setShowAudioSettings(true)}
            className="flex items-center justify-center w-7 h-7 rounded-full
              text-white/40 hover:text-white/80 hover:bg-white/10
              transition-all"
            title="Audio Settings"
            aria-label="Open audio settings"
          >
            <i className="fa-solid fa-volume-high text-xs" />
          </button>

          {/* Trump Shop button (in-game purchases, during play only) */}
          {onOpenShop && view?.phase === PHASES.PLAYING && (
            <button
              onClick={onOpenShop}
              className="flex items-center justify-center w-7 h-7 rounded-full
                text-gold/60 hover:text-gold hover:bg-gold/10
                border border-gold/20 hover:border-gold/40
                transition-all"
              title="Trump Shop"
              aria-label="Open Trump Shop"
            >
              <i className="fa-solid fa-shopping-cart text-xs" />
            </button>
          )}

          {/* Help button */}
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center justify-center w-7 h-7 rounded-full
              text-gold/60 hover:text-gold hover:bg-gold/10
              border border-gold/20 hover:border-gold/40
              transition-all"
            title="Trump Cards Guide"
            aria-label="Open trump cards guide"
          >
            <i className="fa-solid fa-question text-xs" />
          </button>

          {/* <span>
            <i className="fa-solid fa-layer-group mr-1" />
            {view.deckCount}
          </span>
          <span className="text-gold-DEFAULT font-semibold">
            <i className="fa-solid fa-heart mr-1 text-red-500/70" />
            {bet}
          </span> */}
        </div>
      </div>

      {/* Trump Guide Modal */}
      <TrumpGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Audio Settings Modal */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />
    </>
  );
}
