import Card from "../../cards/Card.jsx";

export default function PlayerHand({ me, amSpectator }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col justify-center px-3 pb-2 pt-1 sm:py-2">
      <div className="hidden sm:block text-[9px] text-white/25 uppercase tracking-luxe text-center mb-1">
        Hand
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 w-max mx-auto sm:mx-0">
          {amSpectator ? (
            <div className="text-xs text-red-400/60 py-4">
              <i className="fa-solid fa-skull mr-1" />
              Out
            </div>
          ) : me.hand.length === 0 ? (
            <div className="w-14 h-20 rounded-md border border-white/5 bg-white/5" />
          ) : (
            me.hand.map((c, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5 shrink-0"
              >
                <Card card={c} size="md" skinId={me.skinId} />
                {i === 0 && (
                  <span className="text-[8px] uppercase tracking-wider text-white/25">
                    Hole
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
