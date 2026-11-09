export default function KickedOverlay() {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Kicked from room"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-sm animate-fadeIn"
    >
      {/* ── Ambient background ───────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_60%)]" />
        <div className="absolute inset-3 sm:inset-5 rounded-[1.75rem]" />
        <div className="absolute inset-4 sm:inset-6 rounded-[1.5rem]" />
        {["♠", "♥", "♣", "♦"].map((s, i) => (
          <div
            key={i}
            className="absolute select-none font-serif text-[5rem] sm:text-[11rem] leading-none text-white/[0.03]"
            style={{
              [i < 2 ? "top" : "bottom"]: "2.5rem",
              [i % 2 === 0 ? "left" : "right"]: "2.5rem",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-white/[0.05] to-black/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] animate-fadeUp sm:max-w-sm sm:rounded-3xl">
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header strip */}
        <div className="flex items-center justify-center gap-2 border-b border-white/5 bg-black/30 px-4 py-2.5 sm:py-3">
          <i className="fa-solid fa-user-slash text-[10px] text-red-400/80 sm:text-xs" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold/80 sm:text-[10px]">
            Kicked from Room
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center px-5 pb-5 pt-6 text-center sm:px-7 sm:pb-6 sm:pt-8">
          {/* Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border border-red-400/40 bg-red-500/[0.08] sm:h-14 sm:w-14"
            style={{ boxShadow: "0 0 24px -8px rgba(239,68,68,0.5)" }}
          >
            <i className="fa-solid fa-ban text-xl text-red-400 sm:text-2xl" />
          </div>

          <h2 className="mt-4 font-serif text-base font-medium tracking-wide text-ivory sm:mt-5 sm:text-lg">
            You've been removed
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-ivory-dim/70 sm:text-sm">
            You were kicked from the room by the host.
          </p>

          {/* Redirect indicator */}
          <div className="mt-5 w-full sm:mt-6">
            <div className="relative h-px w-full overflow-hidden bg-white/10">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-[kickedSlide_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-gold-light to-transparent" />
            </div>
            <p className="mt-2.5 text-[9px] uppercase tracking-[0.25em] text-ivory-dim/50 sm:text-[10px]">
              Returning to lobby
            </p>
          </div>
        </div>

        {/* Local keyframes for the sliding bar (transform only, cheap) */}
        <style>{`
          @keyframes kickedSlide {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </div>
  );
}
