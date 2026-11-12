import { useState } from "react";
import { GAME_CONFIG } from "../../config/gameRules.config.js";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";
import WaitingRoomMenu from "./WaitingRoomMenu.jsx";

export default function WaitingRoom({
  partyCode,
  view,
  status,
  isHost,
  selfId,
  profile,
  onBuy,
  onEquip,
  onStart,
  onLeave,
  onReady,
  onUnready,
  onKick,
}) {
  const audio = useAudio();
  const [copied, setCopied] = useState(false);
  const players = view?.players ?? [];
  const me = players.find((p) => p.id === selfId);
  const isReady = me?.isReady ?? false;
  const allReady =
    players.length >= GAME_CONFIG.MIN_PLAYERS &&
    players.every((p) => p.isReady);
  const canStart = isHost && allReady;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(partyCode);
      setCopied(true);
      audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleStart = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.GAME_START);
    onStart();
  };

  const handleLeave = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    onLeave();
  };

  const handleReady = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    onReady();
  };

  const handleUnready = () => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    onUnready();
  };

  const handleKick = (playerId) => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    onKick(playerId);
  };

  const primaryBtn =
    "group relative flex-1 overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 py-3 text-sm font-bold tracking-wide text-gold-light shadow-[0_6px_16px_-10px_rgba(212,175,55,0.2)] transition-all hover:border-gold/80 hover:shadow-[0_8px_20px_-10px_rgba(212,175,55,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:py-4 sm:text-base";

  const shine = (
    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
  );

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto">
      {/* ── Ambient background ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-0">
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

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:flex-row lg:gap-20 lg:px-12">
        {/* ── Hero + Room code ─────────────────────────────── */}
        <header className="flex w-full max-w-md flex-col items-center text-center lg:max-w-none lg:flex-1 lg:items-start lg:text-left">
          <div className="mb-3 flex items-center gap-2.5 text-gold/60 text-base tracking-[0.5em] sm:mb-4 sm:gap-3 sm:text-xl sm:tracking-[0.6em]">
            <span>♠</span>
            <span className="text-red-500/60">♥</span>
            <span>♣</span>
            <span className="text-red-500/60">♦</span>
          </div>

          <h1 className="text-gold-shimmer font-serif font-black tracking-[0.12em] leading-none text-4xl sm:text-7xl sm:tracking-[0.15em] lg:text-8xl">
            LUCKY 9
          </h1>

          <div className="mt-4 flex w-full items-center gap-3 sm:mt-5 sm:gap-4 lg:max-w-sm">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40 lg:from-gold/40" />
            <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.35em] sm:tracking-[0.5em] text-gold-light/70 whitespace-nowrap">
              Waiting Room
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          {/* Room code card */}
          <button
            onClick={copy}
            className="group mt-5 w-full max-w-md overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all hover:border-gold/60 active:scale-[0.98] sm:mt-8 lg:max-w-sm"
          >
            <div className="border-b border-white/5 px-4 py-2 text-center sm:py-2.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35 sm:text-[10px] sm:tracking-[0.3em]">
                Room Code
              </span>
            </div>
            <div className="px-4 py-5 text-center sm:py-7">
              <div className="font-mono text-3xl font-black tracking-[0.3em] text-gold-light transition group-hover:text-gold sm:text-5xl sm:tracking-[0.35em]">
                {partyCode}
              </div>
              <div className="mt-2 h-4 text-[10px] text-white/30 sm:mt-3 sm:text-xs">
                {copied ? (
                  <span className="text-emerald-400">
                    <i className="fa-solid fa-check mr-1.5" />
                    Copied
                  </span>
                ) : (
                  <span>
                    <i className="fa-regular fa-copy mr-1.5" />
                    Tap to copy
                  </span>
                )}
              </div>
            </div>
          </button>
        </header>

        {/* ── Players + actions ────────────────────────────── */}
        <main className="w-full max-w-md space-y-3.5 sm:space-y-5 lg:flex-1 lg:max-w-md">
          {/* Player list */}
          <section className="overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-4 py-2.5 sm:px-6 sm:py-3.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-[10px] sm:tracking-[0.25em]">
                <i className="fa-solid fa-users mr-1.5 text-gold/70" />
                Players
              </span>
              <span className="font-mono text-[10px] text-white/35 sm:text-xs">
                <span className="font-semibold text-gold">
                  {players.length}
                </span>
                /{GAME_CONFIG.MAX_PLAYERS}
              </span>
            </div>

            <ul className="divide-y divide-white/5">
              {players.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] sm:h-9 sm:w-9 sm:text-xs ${
                        p.id === selfId
                          ? "border-gold/40 bg-gold-faint/30 text-gold-light"
                          : "border-white/10 bg-white/5 text-white/35"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`truncate text-xs font-semibold sm:text-sm ${
                        p.id === selfId ? "text-gold-light" : "text-ivory"
                      }`}
                    >
                      {p.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    {p.id === view?.hostId && (
                      <span className="text-[10px] text-gold/70 sm:text-xs">
                        <i className="fa-solid fa-crown" />
                      </span>
                    )}
                    {p.id === selfId && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/40 sm:text-[10px]">
                        you
                      </span>
                    )}
                    {p.isReady ? (
                      <span className="rounded-full border border-gold/40 bg-gold-faint/30 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold-light sm:text-[10px]">
                        <i className="fa-solid fa-check mr-1" />
                        Ready
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/30 sm:text-[10px]">
                        Not Ready
                      </span>
                    )}

                    {/* Host kick button */}
                    {isHost && p.id !== selfId && (
                      <button
                        onClick={() => handleKick(p.id)}
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-[10px] text-red-400/70 transition-all hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-400 active:scale-95 sm:h-7 sm:w-7 sm:text-xs"
                        title="Kick player"
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </div>
                </li>
              ))}

              {players.length === 0 && (
                <li className="py-6 text-center text-xs text-white/30 sm:py-8 sm:text-sm">
                  {status === "SUBSCRIBED" ? (
                    <span>
                      <i className="fa-solid fa-spinner fa-spin mr-1.5" />
                      Waiting for host…
                    </span>
                  ) : (
                    <span>Connecting… ({status})</span>
                  )}
                </li>
              )}
            </ul>

            <div className="border-t border-white/5 bg-black/30 px-4 py-2 text-center text-[10px] text-white/30 sm:py-3 sm:text-xs">
              Need at least {GAME_CONFIG.MIN_PLAYERS} players
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleLeave}
              className="flex-none rounded-2xl border border-gold/25 bg-black/30 px-4 py-3 text-xs font-semibold text-white/40 transition-all hover:border-gold/10 hover:bg-black/50 hover:text-white/70 active:scale-[0.98] sm:px-5 sm:py-4 sm:text-sm"
            >
              <i className="fa-solid fa-arrow-left-long mr-1.5 sm:mr-2" />
              Leave
            </button>

            {isHost ? (
              /* Host: gold primary, disabled until everyone is ready */
              <button
                disabled={!canStart}
                onClick={handleStart}
                className={primaryBtn}
              >
                {shine}
                <i className="fa-solid fa-play mr-2 text-xs sm:mr-2.5" />
                {allReady ? "Start Game" : "Waiting for players..."}
              </button>
            ) : isReady ? (
              /* Ready: subdued gold outline so the primary action reads as "done" */
              <button
                onClick={handleUnready}
                className="group relative flex-1 overflow-hidden rounded-2xl border border-gold/30 bg-gold-faint/10 py-3 text-sm font-semibold tracking-wide text-gold-light/80 transition-all hover:border-gold/50 hover:bg-gold-faint/20 hover:text-gold-light active:scale-[0.98] sm:py-4 sm:text-base"
              >
                {shine}
                <i className="fa-solid fa-check mr-2 text-xs sm:mr-2.5" />
                Ready · Waiting for host
                <i className="fa-solid fa-xmark ml-2 text-xs opacity-60" />
              </button>
            ) : (
              /* Not ready: gold primary call to action */
              <button onClick={handleReady} className={primaryBtn}>
                {shine}
                <i className="fa-solid fa-circle-check mr-2 text-xs sm:mr-2.5" />
                Ready Up
              </button>
            )}
          </div>

          {profile && (
            <WaitingRoomMenu
              profile={profile}
              onBuy={onBuy}
              onEquip={onEquip}
            />
          )}
        </main>
      </div>
    </div>
  );
}
