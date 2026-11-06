import { useState } from "react";
import { useAudio } from "../../../contexts/AudioContext.jsx";

export default function AudioSettings({ isOpen, onClose }) {
  const audio = useAudio();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeUp">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0a0a0b] to-[#050506] shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gold-light">
              <i className="fa-solid fa-volume-high mr-2" />
              Audio Settings
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 px-5 py-5">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70">
              Sound Effects
            </label>
            <button
              onClick={() => audio.setSfxEnabled(!audio.sfxEnabled)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                audio.sfxEnabled ? "bg-gold/40" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  audio.sfxEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* SFX Volume */}
          {audio.sfxEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">
                  SFX Volume
                </label>
                <span className="font-mono text-xs text-white/50">
                  {Math.round(audio.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audio.sfxVolume * 100}
                onChange={(e) => audio.setSfxVolume(e.target.value / 100)}
                className="w-full accent-gold"
              />
            </div>
          )}

          {/* Heartbeat Toggle */}
          {audio.sfxEnabled && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <label className="text-sm font-medium text-white/70">
                Heartbeat Sound
                <span className="ml-2 text-xs text-white/40">
                  (low time warning)
                </span>
              </label>
              <button
                onClick={() =>
                  audio.setHeartbeatEnabled(!audio.heartbeatEnabled)
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  audio.heartbeatEnabled ? "bg-gold/40" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    audio.heartbeatEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Test Sound */}
          {audio.sfxEnabled && (
            <button
              onClick={() => audio.playSfx("ui_click")}
              className="w-full rounded-lg border border-gold/20 bg-gold/10 py-2 text-sm font-medium text-gold-light transition-colors hover:bg-gold/20"
            >
              <i className="fa-solid fa-play mr-2" />
              Test Sound
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-3">
          <p className="text-center text-xs text-white/30">
            Add your own SFX files to <code className="text-gold/60">/public/sfx/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
