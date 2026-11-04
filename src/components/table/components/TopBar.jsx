export default function TopBar({ view, bet, onLeave }) {
  return (
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
        <span className="ml-2 text-[10px] text-white/20 font-mono">
          R{view.round} · {view.partyCode}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/30">
        <span>
          <i className="fa-solid fa-layer-group mr-1" />
          {view.deckCount}
        </span>
        <span className="text-gold-DEFAULT font-semibold">
          <i className="fa-solid fa-heart mr-1 text-red-500/70" />
          {bet}
        </span>
      </div>
    </div>
  );
}
