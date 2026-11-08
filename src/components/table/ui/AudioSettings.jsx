import { useAudio } from "../../../contexts/AudioContext.jsx";

/**
 * Mobile-first sizing: base classes are compact, `sm:` restores roomier sizes.
 */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 flex-none rounded-full border transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
        sm:h-6 sm:w-11
        ${
          checked
            ? "border-gold-light/50 bg-gold/30"
            : "border-white/10 bg-white/[0.06]"
        }`}
    >
      <span
        className={`absolute left-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full
          shadow-md transition-all duration-200 sm:h-4 sm:w-4
          ${checked ? "ml-4 bg-gold-light sm:ml-[22px]" : "ml-0 bg-white/60"}`}
      />
    </button>
  );
}

export default function AudioSettings({ isOpen, onClose }) {
  const audio = useAudio();

  if (!isOpen) return null;

  const volumePct = Math.round(audio.sfxVolume * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Audio settings"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative mx-3 w-full max-w-sm overflow-hidden rounded-xl border border-gold/25
          bg-ink/95 animate-fadeUp sm:mx-4 sm:rounded-2xl"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.06] sm:h-10 sm:w-10">
              <i className="fa-solid fa-volume-high text-xs text-gold-light sm:text-sm" />
            </div>
            <div>
              <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
                Settings
              </span>
              <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-base">
                Audio
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/30
              transition-colors hover:bg-white/5 hover:text-white/80
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-2 sm:px-5 sm:py-3">
          {/* Master Toggle */}
          <div className="flex items-center justify-between gap-3 py-3 sm:py-3.5">
            <span className="text-[11px] font-medium tracking-wide text-ivory/90 sm:text-xs">
              Sound Effects
            </span>
            <Toggle
              checked={audio.sfxEnabled}
              onChange={() => audio.setSfxEnabled(!audio.sfxEnabled)}
              label="Sound effects"
            />
          </div>

          {/* SFX Volume */}
          {audio.sfxEnabled && (
            <div className="space-y-2 border-t border-white/[0.06] py-3 sm:py-3.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sfx-volume"
                  className="text-[11px] font-medium tracking-wide text-ivory/90 sm:text-xs"
                >
                  SFX Volume
                </label>
                <span className="font-mono text-[10px] tabular-nums text-gold-light sm:text-[11px]">
                  {volumePct}%
                </span>
              </div>
              <input
                id="sfx-volume"
                type="range"
                min="0"
                max="100"
                value={audio.sfxVolume * 100}
                onChange={(e) => audio.setSfxVolume(e.target.value / 100)}
                className="h-1 w-full cursor-pointer accent-gold"
              />
            </div>
          )}

          {/* Heartbeat Toggle */}
          {audio.sfxEnabled && (
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] py-3 sm:py-3.5">
              <div className="min-w-0">
                <span className="block text-[11px] font-medium tracking-wide text-ivory/90 sm:text-xs">
                  Heartbeat Sound
                </span>
                <span className="block text-[9px] text-ivory-dim/50 sm:text-[10px]">
                  Low time warning
                </span>
              </div>
              <Toggle
                checked={audio.heartbeatEnabled}
                onChange={() =>
                  audio.setHeartbeatEnabled(!audio.heartbeatEnabled)
                }
                label="Heartbeat sound"
              />
            </div>
          )}

          {/* Test Sound */}
          {audio.sfxEnabled && (
            <div className="border-t border-white/[0.06] pt-3.5 pb-2.5 sm:pt-4 sm:pb-3">
              <button
                onClick={() => audio.playSfx("ui_click")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold-light/50
                  bg-gradient-to-b from-gold/25 to-gold/10 py-2 text-[10px] font-semibold uppercase
                  tracking-[0.25em] text-gold-light transition-all duration-200
                  hover:border-gold-light/80 hover:from-gold/35
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                  active:scale-[0.98] sm:py-2.5 sm:text-[11px]"
              >
                <i className="fa-solid fa-play text-[8px] sm:text-[9px]" />
                Test Sound
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
