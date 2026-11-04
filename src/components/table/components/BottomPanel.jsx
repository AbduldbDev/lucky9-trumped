/**
 * Collapsible bottom panel shell.
 * - Always shows a slim handle bar with an arrow (and `summary` while collapsed).
 * - Clicking the handle slides the body up/down.
 */
export default function BottomPanel({
  collapsed,
  onToggle,
  isMyTurn,
  summary,
  children,
}) {
  return (
    <div
      className={`flex-none flex flex-col border-t z-20 backdrop-blur-md transition-colors
      ${
        isMyTurn
          ? "border-gold/40 bg-gradient-to-t from-black to-ink/90"
          : "border-white/5 bg-ink/90"
      }`}
    >
      {/* Handle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        className={`flex-none w-full flex items-center gap-2 px-3 h-9 text-white/40
          hover:text-white/70 transition touch-manipulation
          ${collapsed && isMyTurn ? "animate-beat" : ""}`}
      >
        <div className="flex-1 min-w-0 text-left text-[11px] truncate">
          {collapsed ? (
            summary
          ) : (
            <span className="uppercase tracking-widest text-[10px] text-white/25">
              My seat
            </span>
          )}
        </div>
        <i
          className={`fa-solid fa-chevron-${collapsed ? "up" : "down"} text-xs`}
        />
      </button>

      {/* Body: animated collapse via grid rows */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out
        ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-h-[58dvh] sm:max-h-[52dvh] overflow-y-auto no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
