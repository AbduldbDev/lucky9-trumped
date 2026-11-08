import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured } from "../../services/supabaseClient.js";
import { isValidPartyCode, normalizePartyCode } from "../../utils/partyCode.js";
import { GAME_CONFIG } from "../../config/gameRules.config.js";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import HowToPlayModal from "./HowToPlayModal.jsx";

export default function Lobby({
  profile,
  onCreate,
  onJoin,
  onOpenShop,
  onEquipSkin,
}) {
  const audio = useAudio();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("create"); // 'create' | 'join'
  const [error, setError] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const submit = async (fn) => {
    setError("");
    try {
      fn();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCreate = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    submit(onCreate);
  };

  const handleJoin = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    submit(() => onJoin(code));
  };

  const handleOpenShop = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    onOpenShop();
  };

  const handleOpenHowToPlay = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    setShowHowToPlay(true);
  };

  const handleLogout = async () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    await signOut();
    navigate("/auth");
  };

  const handleOpenProfile = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    navigate("/profile");
  };

  const winRate = profile.stats.totalMatches
    ? Math.round((profile.stats.totalWins / profile.stats.totalMatches) * 100)
    : 0;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto">
      {/* ── Ambient background ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_60%)]" />
        {/* inner gold frame */}
        <div className="absolute inset-3 sm:inset-5 rounded-[1.75rem] " />
        <div className="absolute inset-4 sm:inset-6 rounded-[1.5rem] " />
        {/* suit watermarks */}
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

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:flex-row lg:gap-20 lg:px-12">
        {/* ── Hero / Logo ─────────────────────────────────── */}
        <header className="flex w-full max-w-md flex-col items-center text-center lg:max-w-none lg:flex-1 lg:items-start lg:text-left">
          <div className="mb-3 flex items-center gap-2.5 text-gold-DEFAULT/60 text-base tracking-[0.5em] sm:mb-4 sm:gap-3 sm:text-xl sm:tracking-[0.6em]">
            <span>♠</span>
            <span className="text-red-500/60">♥</span>
            <span>♣</span>
            <span className="text-red-500/60">♦</span>
          </div>

          <h1 className="text-gold-shimmer font-serif font-black tracking-[0.12em] leading-none text-4xl sm:text-7xl sm:tracking-[0.15em] lg:text-8xl">
            LUCKY 9
          </h1>

          <div className="mt-4 flex w-full items-center gap-3 sm:mt-5 sm:gap-4 lg:max-w-sm">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-DEFAULT/40 lg:from-gold-DEFAULT/40" />
            <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.35em] sm:tracking-[0.5em] text-gold-light/70 whitespace-nowrap">
              Trump Card Edition
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-DEFAULT/40" />
          </div>

          <p className="mt-6 hidden max-w-sm text-sm leading-relaxed text-white/40 lg:block">
            Take a seat at the private table. Bring your friends, play your
            cards wisely, and outlast the house.
          </p>

          {/* Rules summary */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:mt-6 sm:gap-2 lg:justify-start">
            {[
              [
                "fa-users",
                `${GAME_CONFIG.MIN_PLAYERS}–${GAME_CONFIG.MAX_PLAYERS} Players`,
              ],
              ["fa-heart", `${GAME_CONFIG.STARTING_LIVES} Lives`],
              ["fa-clone", `Up to ${GAME_CONFIG.MAX_CARDS_IN_HAND} Cards`],
            ].map(([ic, lb]) => (
              <span
                key={lb}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-black/30 px-2.5 py-1 text-[10px] text-white/60 backdrop-blur sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <i
                  className={`fa-solid ${ic} text-[9px] text-gold/70 sm:text-[10px]`}
                />
                {lb}
              </span>
            ))}
          </div>
        </header>

        {/* ── Main menu panel ─────────────────────────────── */}
        <main className="w-full max-w-md space-y-3.5 sm:space-y-5 lg:flex-1 lg:max-w-md">
          {/* Supabase warning */}
          {!isSupabaseConfigured && (
            <div className="rounded-2xl border border-red-700/30 bg-red-950/40 px-3.5 py-2.5 text-[11px] sm:px-4 sm:py-3 sm:text-sm leading-relaxed text-red-300/80">
              <i className="fa-solid fa-triangle-exclamation mr-2" />
              Multiplayer needs{" "}
              <code className="font-mono text-red-400">
                VITE_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="font-mono text-red-400">
                VITE_SUPABASE_ANON_KEY
              </code>{" "}
              in <code>.env</code>
            </div>
          )}

          {/* Player card */}
          <section className="overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 sm:gap-4 sm:px-6 sm:pt-5 sm:pb-4">
              {/* Avatar */}
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold-faint/60 to-black/60 font-serif text-xl font-bold text-gold-light shadow-[0_0_16px_-8px_rgba(212,175,55,0.2)] sm:h-14 sm:w-14 sm:text-2xl">
                {(profile.username[0] || "?").toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:mb-1 sm:text-[10px] sm:tracking-[0.25em]">
                  Username
                </label>
                <button
                  onClick={handleOpenProfile}
                  className="pb-1 text-left text-sm font-semibold text-ivory-DEFAULT transition-colors hover:text-gold-light sm:pb-1.5 sm:text-base"
                >
                  {profile.username}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-950/20 text-red-400 transition-all hover:border-red-500/50 hover:bg-red-950/40 active:scale-95"
                title="Logout"
              >
                <i className="fa-solid fa-right-from-bracket text-sm" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-black/30">
              <div className="px-2 py-2.5 text-center sm:px-3 sm:py-3.5">
                <div className="font-mono text-sm font-semibold text-gold-DEFAULT sm:text-lg">
                  {profile.stats.totalWins}
                  <span className="text-[10px] text-white/25 sm:text-xs">
                    /{profile.stats.totalMatches}
                  </span>
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px] sm:tracking-widest">
                  Wins · {winRate}%
                </div>
              </div>
              <div className="px-2 py-2.5 text-center sm:px-3 sm:py-3.5">
                <div className="font-mono text-sm font-semibold text-orange-400/80 sm:text-lg">
                  <i className="fa-solid fa-fire-flame-curved mr-1 text-xs sm:mr-1.5 sm:text-sm" />
                  {profile.stats.highestWinStreak}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px] sm:tracking-widest">
                  Best Streak
                </div>
              </div>
              <div className="px-2 py-2.5 text-center sm:px-3 sm:py-3.5">
                <div className="font-mono text-sm font-semibold text-gold-light sm:text-lg">
                  <i className="fa-solid fa-coins mr-1 text-xs text-gold-DEFAULT/70 sm:mr-1.5 sm:text-sm" />
                  {profile.chips}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px] sm:tracking-widest">
                  Chips
                </div>
              </div>
            </div>
          </section>

          {/* Game menu */}
          <section className="overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
            {/* Segmented tabs */}
            <div className="p-1.5 sm:p-2">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/40 p-1">
                {[
                  ["create", "fa-plus", "Create"],
                  ["join", "fa-right-to-bracket", "Join"],
                ].map(([t, ic, lb]) => (
                  <button
                    key={t}
                    onClick={() => setMode(t)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold tracking-wide transition-all sm:gap-2 sm:py-3 sm:text-sm
                    ${
                      mode === t
                        ? "bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 text-gold-light shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]"
                        : "text-white/35 hover:text-white/70"
                    }`}
                  >
                    <i className={`fa-solid ${ic} text-[10px] sm:text-xs`} />
                    {lb}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 px-4 pb-4 pt-2 sm:space-y-4 sm:px-6 sm:pb-6 sm:pt-3">
              {mode === "create" ? (
                <>
                  <p className="text-center text-xs leading-relaxed text-white/40 sm:text-sm">
                    Host a private table and share the room code with your
                    friends.
                  </p>
                  <button
                    disabled={!isSupabaseConfigured}
                    onClick={handleCreate}
                    className="group relative w-full overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 py-3 text-sm font-bold tracking-wide text-gold-light shadow-[0_6px_16px_-10px_rgba(212,175,55,0.2)] transition-all hover:border-gold/80 hover:shadow-[0_8px_20px_-10px_rgba(212,175,55,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:py-4 sm:text-base"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <i className="fa-solid fa-circle-plus mr-2 sm:mr-2.5" />
                    Create Private Room
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35 sm:mb-2 sm:text-[10px] sm:tracking-[0.3em]">
                      Enter Room Code
                    </label>
                    <input
                      value={code}
                      onChange={(e) =>
                        setCode(normalizePartyCode(e.target.value))
                      }
                      placeholder="• • • • • •"
                      maxLength={GAME_CONFIG.PARTY_CODE_LENGTH}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-center font-mono text-xl font-bold tracking-[0.4em] text-gold-light outline-none transition placeholder:text-sm placeholder:tracking-[0.3em] placeholder:text-white/15 focus:border-gold-DEFAULT/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.04)] sm:px-4 sm:py-4 sm:text-2xl sm:tracking-[0.45em] sm:placeholder:text-base"
                    />
                  </div>
                  <button
                    disabled={!isSupabaseConfigured || !isValidPartyCode(code)}
                    onClick={handleJoin}
                    className="w-full rounded-2xl border border-white/15 bg-gradient-to-b from-felt-light/60 to-felt-light/30 py-3 text-sm font-bold tracking-wide text-ivory-DEFAULT transition-all hover:border-gold-DEFAULT/40 hover:from-felt-light/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 sm:py-4 sm:text-base"
                  >
                    <i className="fa-solid fa-arrow-right-to-bracket mr-2 sm:mr-2.5" />
                    Join Table
                  </button>
                </>
              )}

              {error && (
                <p className="rounded-xl border border-red-700/20 bg-red-950/30 px-3 py-2 text-center text-[11px] text-red-400/90 sm:text-xs">
                  <i className="fa-solid fa-circle-exclamation mr-1.5" />
                  {error}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 pt-0.5 sm:pt-1">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/20 sm:text-[10px] sm:tracking-[0.3em]">
                  More
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Secondary menu item: Shop */}
              <button
                onClick={handleOpenShop}
                className="group flex w-full items-center justify-between rounded-2xl border border-gold/25 bg-black/30 px-3.5 py-2.5 text-left transition-all hover:border-gold/10 hover:bg-black/50 active:scale-[0.98] sm:px-4 sm:py-3.5"
              >
                <span className="flex items-center gap-2.5 sm:gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-xs text-gold sm:h-9 sm:w-9 sm:text-sm">
                    <i className="fa-solid fa-store" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-ivory sm:text-sm">
                      Casino Shop
                    </span>
                    <span className="block text-[11px] text-white/35 sm:text-xs">
                      Spend chips on upgrades
                    </span>
                  </span>
                </span>
                <i className="fa-solid fa-chevron-right text-[10px] text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-gold-DEFAULT sm:text-xs" />
              </button>

              {/* How to Play button */}
              <button
                onClick={handleOpenHowToPlay}
                className="group flex w-full items-center justify-between rounded-2xl border border-blue-500/25 bg-black/30 px-3.5 py-2.5 text-left transition-all hover:border-blue-500/40 hover:bg-black/50 active:scale-[0.98] sm:px-4 sm:py-3.5"
              >
                <span className="flex items-center gap-2.5 sm:gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 text-xs text-blue-400 sm:h-9 sm:w-9 sm:text-sm">
                    <i className="fa-solid fa-book-open" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-ivory sm:text-sm">
                      How to Play?
                    </span>
                    <span className="block text-[11px] text-white/35 sm:text-xs">
                      Learn the rules & trump cards
                    </span>
                  </span>
                </span>
                <i className="fa-solid fa-chevron-right text-[10px] text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-blue-400 sm:text-xs" />
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}
