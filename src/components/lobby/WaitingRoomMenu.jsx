import Shop from "../shop/Shop.jsx";
import LeaderboardModal from "../leaderboard/LeaderboardModal.jsx";
import { useModal } from "../../hooks/useModal.js";
import { useAudio } from "../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../config/audio.config.js";

export default function WaitingRoomMenu({ profile, onBuy, onEquip }) {
  const audio = useAudio();
  const { active, open, close } = useModal();

  const openPanel = (name) => {
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
    open(name);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => openPanel("shop")}
          className="group flex items-center gap-2 rounded-2xl border border-gold/25 bg-black/30 px-3 py-2.5 text-left transition-all hover:border-gold/50 hover:bg-black/50 active:scale-[0.98] sm:gap-2.5 sm:px-3.5 sm:py-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-xs text-gold">
            <i className="fa-solid fa-store" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-ivory sm:text-sm">
              Casino Shop
            </span>
            <span className="block truncate text-[10px] text-white/35 sm:text-[11px]">
              Buy & equip skins
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => openPanel("leaderboard")}
          className="group flex items-center gap-2 rounded-2xl border border-purple-500/25 bg-black/30 px-3 py-2.5 text-left transition-all hover:border-purple-500/40 hover:bg-black/50 active:scale-[0.98] sm:gap-2.5 sm:px-3.5 sm:py-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/25 bg-purple-500/10 text-xs text-purple-400">
            <i className="fa-solid fa-trophy" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-ivory sm:text-sm">
              Leaderboard
            </span>
            <span className="block truncate text-[10px] text-white/35 sm:text-[11px]">
              Top win rates
            </span>
          </span>
        </button>
      </div>

      {active === "shop" && (
        <Shop
          profile={profile}
          onBuy={onBuy}
          onEquip={onEquip}
          onClose={close}
        />
      )}
      {active === "leaderboard" && (
        <LeaderboardModal selfId={profile.id} onClose={close} />
      )}
    </>
  );
}
