import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { CARD_SKINS_SHOP, getSkin } from "../../config/cardSkins.config";
import { RARITY_COLOR } from "../../config/trumpCards.config.js";
import { GAME_CONFIG } from "../../config/gameRules.config.js";

const FALLBACK_HEX = "#9ca3af";

const TABLE_COLORS = [
  {
    id: "green",
    name: "Forest Green",
    gradient: "from-emerald-700 to-emerald-900",
  },
  {
    id: "purple",
    name: "Royal Purple",
    gradient: "from-purple-700 to-purple-900",
  },
  { id: "blue", name: "Ocean Blue", gradient: "from-blue-700 to-blue-900" },
  { id: "red", name: "Crimson Red", gradient: "from-red-700 to-red-900" },
  { id: "black", name: "Midnight Black", gradient: "from-gray-800 to-black" },
];

// Shared card surface: same as the Lobby panels
const PANEL =
  "overflow-hidden rounded-3xl border bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md";

// Thin gold scrollbar for the scrollable lists
const SCROLL =
  "overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.35)_transparent]";

/**
 * Profile page styled after the Lobby: ambient gold glow, suit watermarks,
 * rounded-3xl glass panels, segmented tabs, gold-faint buttons.
 * Mobile-first: base = phones, `sm:` = tablets, `lg:` = desktop.
 * Match history and skins are scrollable lists. Data loading and handlers are unchanged.
 */
export default function ProfilePage({ profile, onEquipSkin, onSetTableColor }) {
  const navigate = useNavigate();
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [equipping, setEquipping] = useState(null);
  const [changingColor, setChangingColor] = useState(false);

  useEffect(() => {
    loadMatchHistory();
  }, [profile.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMatchHistory = async () => {
    try {
      const { data, error } = await supabase.rpc("get_match_history", {
        p_user_id: profile.id,
        p_limit: 20,
      });

      if (error) throw error;
      setMatchHistory(data || []);
    } catch (err) {
      console.warn("[Lucky9] Could not load match history:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSetTableColor = async (color) => {
    if (!onSetTableColor) {
      console.error("[ProfilePage] onSetTableColor prop is missing!");
      return;
    }

    setChangingColor(true);
    try {
      await onSetTableColor(color);
    } catch (err) {
      console.error("[Lucky9] Could not set table color:", err);
    } finally {
      setChangingColor(false);
    }
  };

  const winRate =
    profile.stats.totalMatches > 0
      ? Math.round((profile.stats.totalWins / profile.stats.totalMatches) * 100)
      : 0;

  // Only show items in user_inventory that match shop items
  const ownedSkins = CARD_SKINS_SHOP.filter((skin) =>
    profile.owned.includes(skin.id),
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
    {
      id: "settings",
      label: "Settings",
      short: "Settings",
      icon: "fa-sliders",
    },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto">
      {/* ── Ambient background (same as Lobby) ───────────── */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_60%)]" />
        {["♠", "♥", "♣", "♦"].map((s, i) => (
          <div
            key={s}
            className="absolute select-none font-serif text-[5rem] leading-none text-white/[0.03] sm:text-[11rem]"
            style={{
              [i < 2 ? "top" : "bottom"]: "2.5rem",
              [i % 2 === 0 ? "left" : "right"]: "2.5rem",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-10 pt-5 sm:px-8 sm:pt-8 lg:px-12"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
      >
        {/* ── Hero / Logo (from Lobby) ─────────────────── */}
        <header className="mx-auto mb-4 flex w-full max-w-md flex-col items-center text-center sm:mb-6">
          <div className="mb-2.5 flex items-center gap-2.5 text-sm tracking-[0.5em] text-gold/60 sm:mb-3 sm:gap-3 sm:text-lg sm:tracking-[0.6em]">
            <span>♠</span>
            <span className="text-red-500/60">♥</span>
            <span>♣</span>
            <span className="text-red-500/60">♦</span>
          </div>

          <h1 className="text-gold-shimmer font-serif text-3xl font-black leading-none tracking-[0.12em] sm:text-5xl sm:tracking-[0.15em]">
            LUCKY 9
          </h1>

          <div className="mt-3 flex w-full items-center gap-3 sm:mt-4 sm:gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            <p className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.35em] text-gold-light/70 sm:text-[10px] sm:tracking-[0.5em]">
              Trump Card Edition
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </header>

        {/* Back button */}
        <button
          onClick={() => navigate("/lobby")}
          className="mb-3 flex items-center gap-2 text-[11px] text-white/50 transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:mb-5 sm:text-xs"
        >
          <i className="fa-solid fa-arrow-left text-[9px] sm:text-[10px]" />
          Back to Lobby
        </button>

        <div className="space-y-3 sm:space-y-4">
          {/* ── Player card ─────────────────────────────── */}
          <section className={`${PANEL} border-gold/25`}>
            <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3.5 sm:gap-4 sm:px-5 sm:pb-3.5 sm:pt-4">
              {/* Avatar */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold-faint/60 to-black/60 font-serif text-lg font-bold text-gold-light shadow-[0_0_16px_-8px_rgba(212,175,55,0.2)] sm:h-14 sm:w-14 sm:text-2xl">
                {(profile.username[0] || "?").toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-[9px] sm:tracking-[0.25em]">
                  Player
                </span>
                <h2 className="truncate font-serif text-sm font-bold leading-tight text-ivory sm:text-xl">
                  {profile.username}
                </h2>
                <p className="mt-0.5 truncate text-[9px] uppercase tracking-wider text-white/40 sm:text-[11px] sm:tracking-widest">
                  {profile.currentRank} · Level {profile.level}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-black/30">
              <HeaderStat
                label="Chips"
                value={profile.chips}
                icon="fa-coins"
                valueClass="text-gold-light"
              />
              <HeaderStat
                label="Wins"
                value={profile.stats.totalWins}
                valueClass="text-emerald-400/90"
              />
              <HeaderStat
                label="Losses"
                value={profile.stats.totalLosses}
                valueClass="text-red-400/80"
              />
              <HeaderStat
                label="Win Rate"
                value={`${winRate}%`}
                valueClass="text-gold"
              />
            </div>
          </section>

          {/* ── Tabbed panel ────────────────────────────── */}
          <section className={`${PANEL} border-gold/35`}>
            {/* Segmented tabs */}
            <div className="p-1.5 sm:p-2">
              <div
                role="tablist"
                className="grid grid-cols-4 gap-1 rounded-2xl bg-black/40 p-1"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:gap-1.5 sm:py-2.5 sm:text-xs
                    ${
                      activeTab === tab.id
                        ? "bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 text-gold-light shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]"
                        : "text-white/35 hover:text-white/70"
                    }`}
                  >
                    <i
                      className={`fa-solid ${tab.icon} text-[8px] sm:text-[11px]`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3.5 pb-3.5 pt-1.5 sm:px-5 sm:pb-5 sm:pt-2">
              {/* Stats Tab */}
              {activeTab === "stats" && (
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3">
                  <StatTile
                    label="Total Matches"
                    value={profile.stats.totalMatches}
                    icon="fa-gamepad"
                  />
                  <StatTile
                    label="Current Streak"
                    value={profile.stats.currentWinStreak}
                    icon="fa-fire-flame-curved"
                  />
                  <StatTile
                    label="Best Streak"
                    value={profile.stats.highestWinStreak}
                    icon="fa-trophy"
                  />
                  <StatTile
                    label="Level"
                    value={profile.level}
                    icon="fa-star"
                  />
                  <StatTile
                    label="Total Wins"
                    value={profile.stats.totalWins}
                    icon="fa-crown"
                  />
                  <StatTile
                    label="Total Losses"
                    value={profile.stats.totalLosses}
                    icon="fa-xmark"
                  />
                </div>
              )}

              {/* Match History Tab (scrollable) */}
              {activeTab === "history" && (
                <div
                  className={`${SCROLL} max-h-[48dvh] space-y-1.5 sm:max-h-[420px] sm:space-y-2`}
                >
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
                        className={`rounded-xl border px-2.5 py-2 sm:rounded-2xl sm:px-3.5 sm:py-3 ${
                          match.won
                            ? "border-emerald-500/25 bg-emerald-950/20"
                            : "border-red-500/25 bg-red-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border sm:h-9 sm:w-9 ${
                                match.won
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                  : "border-red-500/30 bg-red-500/10 text-red-400"
                              }`}
                            >
                              <i
                                className={`fa-solid ${match.won ? "fa-trophy" : "fa-xmark"} text-[10px] sm:text-xs`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-ivory sm:text-xs">
                                {match.won ? "Victory" : "Defeat"}
                              </p>
                              <p className="truncate text-[9px] text-white/35 sm:text-[11px]">
                                Room: {match.match_code}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-mono text-[11px] font-semibold text-gold sm:text-xs">
                              {match.won ? `+${match.chips_rewarded}` : "0"}{" "}
                              chips
                            </p>
                            <p className="text-[9px] text-white/35 sm:text-[11px]">
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

              {/* Inventory Tab (scrollable list) */}
              {activeTab === "inventory" && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35 sm:text-[11px]">
                      {ownedSkins.length} skin
                      {ownedSkins.length !== 1 ? "s" : ""} owned
                    </p>
                    <p className="truncate text-[9px] uppercase tracking-[0.2em] text-white/30 sm:text-[11px]">
                      Using{" "}
                      <span className="text-gold-light/80">
                        {equippedSkin.name}
                      </span>
                    </p>
                  </div>

                  <div className={`${SCROLL} max-h-[45vh] sm:max-h-[400px]`}>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                      {ownedSkins.map((skin) => {
                        const equipped = profile.equippedSkinId === skin.id;
                        const isEquipping = equipping === skin.id;
                        const color =
                          RARITY_COLOR[String(skin.rarity).toUpperCase()] ??
                          FALLBACK_HEX;
                        return (
                          <div
                            key={skin.id}
                            className={`rounded-xl border px-2.5 py-2 sm:rounded-2xl sm:px-3.5 sm:py-3 ${
                              equipped
                                ? "border-gold/50 bg-gradient-to-br from-gold-faint/30 to-black/30"
                                : "border-gold/20 bg-black/30"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                              <SkinSwatch skin={skin} />

                              <div className="min-w-0 flex-1 basis-20">
                                <p className="truncate text-[11px] font-semibold text-ivory sm:text-xs">
                                  {skin.name}
                                </p>
                                <p
                                  className="mt-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-wider sm:text-[10px]"
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
                                <span className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold sm:text-[10px]">
                                  Equipped
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleEquipSkin(skin.id)}
                                  disabled={isEquipping}
                                  className="min-w-[56px] shrink-0 rounded-lg border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 px-2.5 py-1 text-[10px] font-bold tracking-wide text-gold-light transition-all hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:py-1.5 sm:text-[11px]"
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
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div>
                    <h3 className="text-[11px] font-semibold text-ivory sm:text-xs">
                      Table Color
                    </h3>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/40 sm:text-xs">
                      Choose your preferred table felt color. This setting only
                      affects your view.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-5">
                    {TABLE_COLORS.map((color) => {
                      const selected = profile.tableColor === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => handleSetTableColor(color.id)}
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
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ────────────────────────────────── */

function HeaderStat({ label, value, icon, valueClass }) {
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

function StatTile({ label, value, icon }) {
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

/**
 * Card-back preview. Uses the skin's image (backSvg); if it is missing or fails
 * to load, falls back to the skin's gradient (previewColor).
 */
function SkinSwatch({ skin }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(skin.backSvg) && !imgError;

  const base =
    "relative h-12 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.9)] sm:h-14 sm:w-10";

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
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-diamond text-sm text-white/20 sm:text-base" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
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
