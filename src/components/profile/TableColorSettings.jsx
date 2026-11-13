import { TABLE_COLORS } from "../../config/profilePreferences.config.js";

/** Settings tab body: table felt color picker (local view preference). */
export default function TableColorSettings({ profile, onSetColor, changingColor }) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div>
        <h3 className="text-[11px] font-semibold text-ivory sm:text-xs">
          Table Color
        </h3>
        <p className="mt-1 text-[10px] leading-relaxed text-white/40 sm:text-xs">
          Choose your preferred table felt color. This setting only affects your
          view.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-5">
        {TABLE_COLORS.map((color) => {
          const selected = profile.tableColor === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSetColor(color.id)}
              disabled={changingColor}
              aria-pressed={selected}
              className={`relative overflow-hidden rounded-xl border p-1.5 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:p-2.5
                ${
                  selected
                    ? "border-gold/60 bg-gold-faint/20 shadow-[0_0_20px_-8px_rgba(212,175,55,0.4)]"
                    : "border-white/10 bg-black/30 hover:border-gold/30"
                }`}
            >
              <div
                className={`mb-1.5 h-10 rounded-lg bg-gradient-to-br sm:mb-2 sm:h-14 ${color.gradient}`}
              />
              <p className="truncate text-[10px] font-semibold text-ivory sm:text-[11px]">
                {color.name}
              </p>

              {selected && (
                <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-black sm:h-5 sm:w-5">
                  <i className="fa-solid fa-check text-[8px] sm:text-[10px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
