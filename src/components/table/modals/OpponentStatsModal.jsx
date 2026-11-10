import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient";
import { getSkin } from "../../../config/cardSkins.config";
import { RARITY_COLOR } from "../../../config/trumpCards.config";

const FALLBACK_HEX = "#9ca3af";

export default function OpponentStatsModal({ playerId, playerName, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    loadOpponentStats();
  }, [playerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOpponentStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc("get_public_player_stats", { p_user_id: playerId })
        .maybeSingle();

      if (rpcError) throw rpcError;

      if (!data) {
        setStats(null);
        setError("Player profile not found");
        return;
      }

      const totalMatches = data.total_matches ?? 0;
      const totalWins = data.total_wins ?? 0;

      setStats({
        username: data.username,
        chips: data.chips,
        level: data.level ?? 1,
        currentRank: data.current_rank ?? "Rookie",
        equippedSkinId: data.equipped_skin_id,
        totalMatches,
        totalWins,
        totalLosses: data.total_losses ?? 0,
        winRate:
          totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
        currentWinStreak: data.current_win_streak ?? 0,
        highestWinStreak: data.highest_win_streak ?? 0,
      });
    } catch (err) {
      console.error("[Lucky9] Failed to load opponent stats:", err);
      setError("Failed to load player stats");
    } finally {
      setLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!playerId) return null;

  const equippedSkin = stats?.equippedSkinId
    ? getSkin(stats.equippedSkinId)
    : null;
  const skinColor = equippedSkin
    ? (RARITY_COLOR[String(equippedSkin.rarity).toUpperCase()] ?? FALLBACK_HEX)
    : FALLBACK_HEX;

  const name = stats?.username || playerName || "Player";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} statistics`}
    >
      <div
        className={`relative max-h-[94dvh] w-full max-w-xl animate-fadeUp overflow-y-auto overscroll-contain rounded-xl sm:rounded-2xl border  bg-gradient-to-b from-white/[0.05] to-black/85 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] [scrollbar-color:rgba(212,175,55,0.35)_transparent] [scrollbar-width:thin]`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(180deg, ${skinColor}1f 0%, rgba(11,11,12,0.88) 20%)`,
          borderColor: skinColor,
          borderColor: `${skinColor}3D`,
        }}
      >
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-gold/20 px-3.5 py-3 sm:px-5 sm:py-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${skinColor}, transparent)`,
            }}
          />

          <button
            onClick={onClose}
            className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 transition-all hover:border-gold/40 hover:text-gold-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-95"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-xs sm:text-sm" />
          </button>

          <div className="relative flex items-center gap-2.5 sm:gap-3.5 pr-9">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gradient-to-br from-gold-faint/70 to-black/70 pb-1 font-serif text-xl sm:text-2xl font-bold text-gold-light shadow-[0_0_24px_-10px_rgba(212,175,55,0.5)]">
              {(name[0] || "?").toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
                Opponent Profile
              </p>
              <h2 className="truncate font-serif text-sm sm:text-base font-bold text-ivory">
                {name}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center py-8 text-center">
              <i className="fa-solid fa-spinner fa-spin mb-2 text-2xl text-gold/60" />
              <p className="text-xs text-white/50">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <i className="fa-solid fa-exclamation-triangle text-lg" />
              </div>
              <p className="text-xs text-red-400">{error}</p>
              <button
                onClick={onClose}
                className="mt-3 rounded-lg border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 px-3.5 py-1.5 text-xs font-semibold text-gold-light transition-all hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              >
                Close
              </button>
            </div>
          ) : stats ? (
            <div className="space-y-2.5 sm:space-y-3">
              {/* Chips banner */}
              <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gradient-to-r from-gold-faint/30 to-black/30 px-3 py-2 sm:px-3.5 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-gold/30 bg-black/40 text-gold">
                    <i className="fa-solid fa-coins text-xs" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">
                    Chip Balance
                  </span>
                </div>
                <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-gold-light">
                  {Number(stats.chips ?? 0).toLocaleString()}
                </span>
              </div>

              {/* Win-rate ring + record */}
              <div className="grid grid-cols-[auto_1fr] items-center gap-2.5 sm:gap-3 rounded-xl border border-gold/15 bg-black/30 p-3 sm:p-3.5">
                <WinRing percent={stats.winRate} />

                <div className="min-w-0 space-y-2">
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
                        Record
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs tabular-nums text-white/60">
                        {stats.totalMatches} matches
                      </span>
                    </div>

                    <RecordBar
                      wins={stats.totalWins}
                      losses={stats.totalLosses}
                    />

                    <div className="mt-1 flex justify-between font-mono text-xs sm:text-sm tabular-nums">
                      <span className="text-emerald-400">
                        {stats.totalWins}W
                      </span>
                      <span className="text-red-400">{stats.totalLosses}L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-2">
                <Streak
                  icon="fa-fire-flame-curved"
                  label="Current Streak"
                  value={stats.currentWinStreak}
                  color="text-orange-400"
                />
                <Streak
                  icon="fa-trophy"
                  label="Best Streak"
                  value={stats.highestWinStreak}
                  color="text-yellow-400"
                />
              </div>

              {/* Equipped skin */}
              {equippedSkin && (
                <div
                  className="relative flex items-center gap-2.5 sm:gap-3 overflow-hidden rounded-xl border bg-black/30 p-2.5 sm:p-3"
                  style={{ borderColor: `${skinColor}40` }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at left, ${skinColor}22, transparent 65%)`,
                    }}
                  />

                  <SkinSwatch skin={equippedSkin} />

                  <div className="relative min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
                      Equipped Skin
                    </p>
                    <p className="mt-0.5 truncate text-xs sm:text-sm font-semibold text-ivory">
                      {equippedSkin.name}
                    </p>
                    <p
                      className="mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider"
                      style={{ color: `${skinColor}cc` }}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{
                          background: skinColor,
                          boxShadow: `0 0 6px ${skinColor}`,
                        }}
                      />
                      {equippedSkin.rarity}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ──────────────────────────────────── */

function WinRing({ percent }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));

  return (
    <div
      className="relative h-24 w-24 shrink-0"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Win rate"
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#d4af37"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-semibold leading-none tabular-nums text-gold-light">
          {pct}%
        </span>
        <span className="mt-1 text-[8px] uppercase tracking-wider text-white/35">
          Win Rate
        </span>
      </div>
    </div>
  );
}

function RecordBar({ wins, losses }) {
  const total = wins + losses;
  const winPct = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="flex h-2 overflow-hidden rounded-lg bg-white/5">
      {total > 0 && (
        <>
          <div className="bg-emerald-500/80" style={{ width: `${winPct}%` }} />
          <div className="flex-1 bg-red-500/70" />
        </>
      )}
    </div>
  );
}

function Streak({ icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-black/30 px-3 py-3">
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${icon} text-sm ${color}`} />
        <span
          className={`font-mono text-lg font-semibold tabular-nums ${color}`}
        >
          {value}
        </span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}

function SkinSwatch({ skin }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(skin.backSvg) && !imgError;

  const base =
    "relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-[0_8px_18px_-6px_rgba(0,0,0,0.9)]";

  if (showImage) {
    return (
      <div className={`${base} bg-gray-900`}>
        <img
          src={skin.backSvg}
          alt={`${skin.name} card back`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-gradient-to-br ${skin.previewColor ?? "from-gray-700 to-gray-900"}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-diamond text-base text-white/20" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </div>
  );
}
