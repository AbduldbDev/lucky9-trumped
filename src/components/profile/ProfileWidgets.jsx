/** Small display atoms shared by the profile page sections. */

export function HeaderStat({ label, value, icon, valueClass }) {
  return (
    <div className="px-1.5 py-2 text-center sm:px-3 sm:py-3">
      <div
        className={`font-mono text-[11px] font-semibold tabular-nums sm:text-base ${valueClass}`}
      >
        {icon && (
          <i
            className={`fa-solid ${icon} mr-1 text-[9px] text-gold/70 sm:mr-1.5 sm:text-xs`}
          />
        )}
        {value}
      </div>
      <div className="mt-0.5 text-[7px] uppercase tracking-wider text-white/35 sm:text-[9px] sm:tracking-widest">
        {label}
      </div>
    </div>
  );
}

export function StatTile({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-gold/20 bg-black/30 px-2.5 py-2.5 sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-3.5">
      <div className="min-w-0">
        <p className="truncate text-[8px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-[9px] sm:tracking-[0.25em]">
          {label}
        </p>
        <p className="mt-1 font-mono text-lg font-semibold leading-none tabular-nums text-ivory sm:text-2xl">
          {value}
        </p>
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-[10px] text-gold sm:h-9 sm:w-9 sm:text-sm">
        <i className={`fa-solid ${icon}`} />
      </span>
    </div>
  );
}

export function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center py-7 text-center sm:py-10">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-xs text-gold sm:h-11 sm:w-11 sm:text-sm">
        <i className={`fa-solid ${icon}`} />
      </span>
      <p className="mt-2.5 text-[11px] text-white/50 sm:mt-3 sm:text-xs">
        {text}
      </p>
      {sub && (
        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/30 sm:text-[10px]">
          {sub}
        </p>
      )}
    </div>
  );
}
