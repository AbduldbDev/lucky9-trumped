import { useState } from "react";
import TrumpGuideModal from "./TrumpGuideModal.jsx";

export default function TopBar({ view, bet, onLeave }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <div
        className="flex-none flex items-center justify-between
          px-3 sm:px-4 h-11 bg-black/60 border-b border-white/5 z-20"
      >
        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 text-xs text-white/30
              hover:text-white transition px-2 py-1 rounded hover:bg-white/5"
        >
          <i className="fa-solid fa-arrow-left-long" />
          Leave
        </button>
        <div className="text-center">
          <span className="text-gold-shimmer font-serif font-bold text-sm tracking-widest">
            LUCKY 9
          </span>
          {/* <span className="ml-2 text-[10px] text-white/20 font-mono">
            R{view.round} ·{view.partyCode}
          </span> */}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
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
    </>
  );
}
