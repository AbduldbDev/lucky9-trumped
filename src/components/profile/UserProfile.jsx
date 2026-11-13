import { useEffect, useState } from "react";
import { getMatchHistory } from "../../services/statsService.js";
import { CARD_SKINS_SHOP, getSkin } from "../../config/cardSkins.config";
import { RARITY_COLOR } from "../../config/trumpCards.config.js";

const FALLBACK_HEX = "#9ca3af";

/**
 * Mobile-first sizing: base classes are compact, `sm:` restores roomier sizes.
 * Data loading and tab logic are unchanged; the skin inventory now reads its
 * look (previewColor, borderColor, rarity) from cardSkins.config.
 */
export default function UserProfile({ profile, onClose, onEquipSkin }) {
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats"); // 'stats' | 'history' | 'inventory'
  const [equipping, setEquipping] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMatchHistory(profile.id, 20).then((rows) => {
      if (!cancelled) {
        setMatchHistory(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profile.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEquipSkin = async (skinId) => {
    if (!onEquipSkin) return;
    setEquipping(skinId);
    try {
      await onEquipSkin(skinId);
    } catch (err) {
      console.warn("[Lucky9] Could not equip skin:", err);
    } finally {
      setEquipping(null);
    }
  };

  const winRate =
    profile.stats.totalMatches > 0
      ? Math.round((profile.stats.totalWins / profile.stats.totalMatches) * 100)
      : 0;

  // Owned = bought skins + anything unlocked by default in the config
  const ownedSkins = CARD_SKINS_SHOP.filter(
    (skin) => skin.unlockedByDefault || profile.owned.includes(skin.id),
  );
  const equippedSkin = getSkin(profile.equippedSkinId);

  const tabs = [
    { id: "stats", label: "Statistics", short: "Stats", icon: "fa-chart-line" },
    {
      id: "history",
      label: "Match History",
      short: "History",
      icon: "fa-clock-rotate-left",
    },
    {
      id: "inventory",
      label: "Card Skins",
      short: "Skins",
      icon: "fa-layer-group",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Player profile"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md animate-fadeIn sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl
          border border-gold/25 bg-ink/95 animate-fadeUp sm:rounded-2xl"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div className="flex-none border-b border-white/[0.06] px-4 py-3.5 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50
                  bg-gradient-to-br from-gold/20 to-black/60 font-serif text-lg font-medium text-gold-light
                  sm:h-14 sm:w-14 sm:text-2xl"
                style={{ boxShadow: "0 0 24px -8px rgba(217,194,138,0.5)" }}
              >
                {profile.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
                  Player
                </span>
                <h2 className="truncate font-serif text-base font-medium leading-tight tracking-wide text-ivory sm:text-xl">
                  {profile.username}
                </h2>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/60 sm:text-[10px]">
                  {profile.currentRank}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors
                hover:bg-white/5 hover:text-white/80
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              aria-label="Close profile"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-3.5 grid grid-cols-4 gap-2 sm:mt-5 sm:gap-3">
            <QuickStat
              label="Chips"
              value={profile.chips}
              icon="fa-coins"
              valueClass="text-gold-light"
            />
            <QuickStat
              label="Wins"
              value={profile.stats.totalWins}
              valueClass="text-emerald-400/90"
            />
            <QuickStat
              label="Losses"
              value={profile.stats.totalLosses}
              valueClass="text-red-300/80"
            />
            <QuickStat
              label="Win Rate"
              value={`${winRate}%`}
              valueClass="text-ivory"
            />
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          className="flex flex-none border-b border-white/[0.06]"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[9px]
                  font-medium uppercase tracking-[0.2em] transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                  sm:gap-2 sm:py-3 sm:text-[10px]
                  ${
                    active
                      ? "text-gold-light"
                      : "text-ivory-dim/50 hover:text-ivory-dim/90"
                  }`}
              >
                <i
                  className={`fa-solid ${tab.icon} text-[9px] sm:text-[10px]`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <StatTile
                label="Total Matches"
                value={profile.stats.totalMatches}
                icon="fa-gamepad"
              />
              <StatTile
                label="Current Streak"
                value={profile.stats.currentWinStreak}
                icon="fa-fire"
              />
              <StatTile
                label="Best Streak"
                value={profile.stats.highestWinStreak}
                icon="fa-trophy"
              />
              <StatTile label="Level" value={profile.level} icon="fa-star" />
            </div>
          )}

          {/* Match History Tab */}
          {activeTab === "history" && (
            <div className="space-y-2 sm:space-y-2.5">
              {loading ? (
                <EmptyState
                  icon="fa-spinner fa-spin"
                  text="Loading match history…"
                />
              ) : matchHistory.length === 0 ? (
                <EmptyState icon="fa-inbox" text="No matches played yet" />
              ) : (
                matchHistory.map((match) => (
                  <div
                    key={match.match_id}
                    className="relative overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.02]
                      p-2.5 pl-3.5 sm:rounded-xl sm:p-3.5 sm:pl-4"
                  >
                    {/* Result accent bar */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-2 left-0 w-px sm:inset-y-2.5 ${
                        match.won ? "bg-emerald-400/70" : "bg-red-400/60"
                      }`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div
                          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border sm:h-9 sm:w-9 ${
                            match.won
                              ? "border-emerald-400/40 bg-emerald-400/[0.06] text-emerald-400"
                              : "border-red-400/35 bg-red-400/[0.05] text-red-300"
                          }`}
                        >
                          <i
                            className={`fa-solid ${match.won ? "fa-trophy" : "fa-xmark"} text-[10px] sm:text-xs`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-[12px] font-medium tracking-wide text-ivory sm:text-sm">
                            {match.won ? "Victory" : "Defeat"}
                          </p>
                          <p className="truncate font-mono text-[9px] uppercase tracking-[0.15em] text-ivory-dim/50 sm:text-[10px]">
                            Room {match.match_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex-none text-right">
                        <p className="font-mono text-[11px] font-medium tabular-nums text-gold-light sm:text-xs">
                          {match.won ? `+${match.chips_rewarded}` : "0"} chips
                        </p>
                        <p className="text-[9px] text-ivory-dim/50 sm:text-[10px]">
                          {match.total_rounds} rounds ·{" "}
                          {Math.floor(match.duration_seconds / 60)}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] uppercase tracking-[0.25em] text-ivory-dim/50 sm:text-[10px]">
                  {ownedSkins.length} skin{ownedSkins.length !== 1 ? "s" : ""}{" "}
                  owned
                </p>
                <p className="truncate text-[9px] uppercase tracking-[0.2em] text-ivory-dim/40 sm:text-[10px]">
                  Using{" "}
                  <span className="text-gold-light/80">
                    {equippedSkin.name}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                {ownedSkins.map((skin) => {
                  const equipped = profile.equippedSkinId === skin.id;
                  const isEquipping = equipping === skin.id;
                  const color =
                    RARITY_COLOR[String(skin.rarity).toUpperCase()] ??
                    FALLBACK_HEX;
                  return (
                    <div
                      key={skin.id}
                      className="relative overflow-hidden rounded-lg border p-3 sm:rounded-xl sm:p-3.5"
                      style={{
                        borderColor: equipped
                          ? "rgba(217,194,138,0.55)"
                          : "rgba(255,255,255,0.07)",
                        background: equipped
                          ? "linear-gradient(180deg, rgba(184,155,94,0.12) 0%, rgba(11,11,12,0.7) 70%)"
                          : "rgba(255,255,255,0.02)",
                        boxShadow: equipped
                          ? "0 0 22px -10px rgba(217,194,138,0.6)"
                          : "none",
                      }}
                    >
                      {/* Rarity hairline */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-4 top-0 h-px"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${color}99, transparent)`,
                        }}
                      />

                      <div className="flex items-center gap-3">
                        {/* Skin swatch — straight from cardSkins.config */}
                        <SkinSwatch skin={skin} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium tracking-wide text-ivory sm:text-[13px]">
                            {skin.name}
                          </p>
                          <p
                            className="mt-1 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] sm:text-[9px]"
                            style={{ color: `${color}cc` }}
                          >
                            <span
                              className="h-1 w-1 rounded-full"
                              style={{
                                background: color,
                                boxShadow: `0 0 6px ${color}`,
                              }}
                            />
                            {skin.rarity}
                          </p>
                        </div>

                        {equipped ? (
                          <span
                            className="flex-none rounded-full border border-gold/40 bg-gold/[0.08] px-2 py-0.5
                              text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-light sm:text-[9px]"
                          >
                            Equipped
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEquipSkin(skin.id)}
                            disabled={isEquipping}
                            className="flex-none rounded-md border border-gold/30 bg-gold/[0.08] px-2.5 py-1
                              text-[9px] font-semibold uppercase tracking-[0.15em] text-gold-light
                              transition-all hover:bg-gold/[0.15] hover:border-gold/50
                              disabled:cursor-not-allowed disabled:opacity-50 sm:text-[10px] sm:px-3 sm:py-1.5"
                          >
                            {isEquipping ? (
                              <i className="fa-solid fa-spinner fa-spin" />
                            ) : (
                              "Equip"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {ownedSkins.length === 0 && (
                <EmptyState
                  icon="fa-bag-shopping"
                  text="No skins owned yet"
                  sub="Visit the shop to purchase skins"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Helper components ------------------------- */

/**
 * Mini card back built from the skin config:
 *  - skin.previewColor -> gradient classes (e.g. "from-red-800 to-red-950")
 *  - skin.borderColor  -> border color class (e.g. "border-amber-300/60")
 * Make sure Tailwind's `content` globs include src/config/** so these
 * class strings are not purged.
 */
function SkinSwatch({ skin }) {
  const base =
    "relative h-12 w-9 flex-none overflow-hidden rounded-md shadow-[0_6px_14px_-6px_rgba(0,0,0,0.9)] sm:h-14 sm:w-10";

  return (
    <div
      className={`${base} bg-gradient-to-br ${skin.previewColor} border border-white/10`}
      aria-hidden="true"
    >
      {/* Diamond trellis pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
      {/* Center pip */}
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-diamond text-white/20 text-sm sm:text-base" />
      </div>
      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </div>
  );
}

function QuickStat({ label, value, icon, valueClass }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-1.5 py-2 text-center sm:rounded-xl sm:px-3 sm:py-2.5">
      <div
        className={`font-mono text-[13px] font-medium tabular-nums sm:text-lg ${valueClass}`}
      >
        {icon && (
          <i
            className={`fa-solid ${icon} mr-1 text-[8px] text-gold/60 sm:mr-1.5 sm:text-[10px]`}
          />
        )}
        {value}
      </div>
      <div className="mt-0.5 text-[7px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[9px]">
        {label}
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-white/[0.07] p-3 sm:rounded-xl sm:p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(184,155,94,0.08) 0%, rgba(11,11,12,0.6) 65%)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] uppercase tracking-[0.25em] text-ivory-dim/50 sm:text-[10px]">
            {label}
          </p>
          <p className="mt-1 font-serif text-2xl font-medium leading-none tabular-nums text-ivory sm:mt-1.5 sm:text-4xl">
            {value}
          </p>
        </div>
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-gold/35 bg-gold/[0.06] sm:h-11 sm:w-11">
          <i
            className={`fa-solid ${icon} text-[11px] text-gold-light sm:text-base`}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-10">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.04] sm:h-12 sm:w-12">
        <i className={`fa-solid ${icon} text-sm text-gold/70 sm:text-base`} />
      </div>
      <p className="mt-3 text-[11px] tracking-wide text-ivory-dim/70 sm:text-[13px]">
        {text}
      </p>
      {sub && (
        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/40 sm:text-[10px]">
          {sub}
        </p>
      )}
    </div>
  );
}
