import { getActivePlayers } from "../../../utils/tableHelpers.js";

export default function StoodStatus({ allPlayers }) {
  const waiting = getActivePlayers(allPlayers).filter((p) => !p.stood);
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 px-2 sm:px-3 py-1.5 sm:py-3
          border-t border-white/5 text-center pb-[max(0.4rem,env(safe-area-inset-bottom))] sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <i className="fa-solid fa-hand text-gold/40 text-[10px] sm:text-base" />
      <span className="text-[11px] sm:text-xs text-white/40 font-medium">
        You stood
      </span>
      {waiting.length > 0 && (
        <span className="text-[10px] sm:text-[11px] text-white/30">
          · Waiting for{" "}
          <span className="text-gold/70">
            {waiting.map((p) => p.name).join(", ")}
          </span>
        </span>
      )}
    </div>
  );
}
