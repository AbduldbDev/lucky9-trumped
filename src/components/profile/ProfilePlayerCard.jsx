import { useNavigate } from "react-router-dom";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";
import { USERNAME_MAX_LENGTH } from "../../hooks/useUsernameEditor.js";
import { HeaderStat } from "./ProfileWidgets.jsx";

/**
 * Player header card: avatar, username (with inline rename), rank/level,
 * logout, and the four headline stats.
 */
export default function ProfilePlayerCard({
  profile,
  nameEditor,
  children,
}) {
  const navigate = useNavigate();
  const audio = useAudio();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    await signOut();
    navigate("/auth");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3.5 sm:gap-4 sm:px-5 sm:pb-3.5 sm:pt-4">
        {/* Avatar */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold-faint/60 to-black/60 font-serif text-lg font-bold text-gold-light shadow-[0_0_16px_-8px_rgba(212,175,55,0.2)] sm:h-14 sm:w-14 sm:text-2xl">
          {(profile.username[0] || "?").toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-[9px] sm:tracking-[0.25em]">
            Player
          </span>
          {nameEditor.editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nameEditor.save();
              }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameEditor.draft}
                  maxLength={USERNAME_MAX_LENGTH}
                  onChange={(e) => nameEditor.setDraft(e.target.value)}
                  aria-label="New username"
                  placeholder="New username"
                  className="min-w-0 flex-1 rounded-lg border border-gold/40 bg-black/40 px-2.5 py-1
                    font-serif text-sm font-bold text-ivory outline-none
                    focus:border-gold/70 sm:text-base"
                />
                <button
                  type="submit"
                  disabled={nameEditor.saving}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                    border border-gold/40 bg-gold-faint/25 text-gold-light transition-all
                    hover:border-gold/70 disabled:opacity-40 sm:h-8 sm:w-8"
                  title="Save username"
                  aria-label="Save username"
                >
                  <i
                    className={
                      nameEditor.saving
                        ? "fa-solid fa-spinner fa-spin text-[10px] sm:text-xs"
                        : "fa-solid fa-check text-[10px] sm:text-xs"
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={nameEditor.cancel}
                  disabled={nameEditor.saving}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                    border border-white/10 text-white/40 transition-all
                    hover:border-white/25 hover:text-white/80 disabled:opacity-40 sm:h-8 sm:w-8"
                  title="Cancel"
                  aria-label="Cancel username change"
                >
                  <i className="fa-solid fa-xmark text-[10px] sm:text-xs" />
                </button>
              </div>
              <span className="text-[9px] text-white/30 sm:text-[10px]">
                Up to {USERNAME_MAX_LENGTH} characters
              </span>
              {nameEditor.error && (
                <span
                  role="alert"
                  className="text-[10px] text-red-400/90 sm:text-[11px]"
                >
                  <i className="fa-solid fa-circle-exclamation mr-1.5" />
                  {nameEditor.error}
                </span>
              )}
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <h2 className="truncate font-serif text-sm font-bold leading-tight text-ivory sm:text-xl">
                {profile.username}
              </h2>
              {nameEditor.enabled && (
                <button
                  onClick={nameEditor.start}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                    text-white/30 transition-all hover:bg-white/5 hover:text-gold-light
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
                  title="Change username"
                  aria-label="Change username"
                >
                  <i className="fa-solid fa-pen text-[9px] sm:text-[10px]" />
                </button>
              )}
            </div>
          )}
          <p className="mt-0.5 truncate text-[9px] uppercase tracking-wider text-white/40 sm:text-[11px] sm:tracking-widest">
            {profile.currentRank} · Level {profile.level}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-950/20 text-red-400 transition-all hover:border-red-500/50 hover:bg-red-950/40 active:scale-95"
          title="Logout"
        >
          <i className="fa-solid fa-right-from-bracket text-xs" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-black/30">
        {children}
      </div>
    </section>
  );
}
