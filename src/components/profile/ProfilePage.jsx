import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_SKINS_SHOP } from "../../config/cardSkins.config";
import { useMatchHistory } from "../../hooks/useMatchHistory.js";
import { useUsernameEditor } from "../../hooks/useUsernameEditor.js";
import ProfilePlayerCard from "./ProfilePlayerCard.jsx";
import MatchHistoryList from "./MatchHistoryList.jsx";
import SkinInventoryList from "./SkinInventoryList.jsx";
import TableColorSettings from "./TableColorSettings.jsx";
import { HeaderStat, StatTile } from "./ProfileWidgets.jsx";

// Shared card surface: same as the Lobby panels
const PANEL =
  "overflow-hidden rounded-3xl border bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md";

const TABS = [
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

/**
 * Profile page styled after the Lobby: ambient gold glow, suit watermarks,
 * rounded-3xl glass panels, segmented tabs, gold-faint buttons.
 * Mobile-first: base = phones, `sm:` = tablets, `lg:` = desktop.
 *
 * This file is layout + composition only: data lives in hooks/services,
 * appearance options in config, sections in their own components.
 */
export default function ProfilePage({
  profile,
  onEquipSkin,
  onSetTableColor,
  onRename,
}) {
  const navigate = useNavigate();
  const { matchHistory, loading: historyLoading } = useMatchHistory(profile.id);
  const nameEditor = useUsernameEditor({
    username: profile.username,
    onRename,
  });

  const [activeTab, setActiveTab] = useState("stats");
  const [equipping, setEquipping] = useState(null);
  const [changingColor, setChangingColor] = useState(false);

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
          <ProfilePlayerCard profile={profile} nameEditor={nameEditor}>
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
          </ProfilePlayerCard>

          {/* ── Tabbed panel ────────────────────────────── */}
          <section className={`${PANEL} border-gold/35`}>
            {/* Segmented tabs */}
            <div className="p-1.5 sm:p-2">
              <div
                role="tablist"
                className="grid grid-cols-4 gap-1 rounded-2xl bg-black/40 p-1"
              >
                {TABS.map((tab) => (
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
                <MatchHistoryList
                  matchHistory={matchHistory}
                  loading={historyLoading}
                />
              )}

              {/* Inventory Tab (scrollable list) */}
              {activeTab === "inventory" && (
                <SkinInventoryList
                  profile={profile}
                  ownedSkins={ownedSkins}
                  onEquip={handleEquipSkin}
                  equipping={equipping}
                />
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <TableColorSettings
                  profile={profile}
                  onSetColor={handleSetTableColor}
                  changingColor={changingColor}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
