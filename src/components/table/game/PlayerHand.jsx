import Card from "../../cards/Card.jsx";

export default function PlayerHand({ me, amSpectator, flipped, onToggleFlip }) {
  return (
    <div className="flex-1 min-w-0  flex flex-col justify-center px-3 pb-2 pt-1 sm:py-2">
      <div className="overflow-x-auto overflow-y-hidden no-scrollbar pt-2">
        <div className="flex gap-1.5 w-max mx-auto sm:mx-0">
          {amSpectator ? (
            <div className="text-xs text-red-400/60 py-4">
              <i className="fa-solid fa-skull mr-1" />
              Out
            </div>
          ) : me.hand.length === 0 ? (
            <div className="w-14 h-20 rounded-md border border-white/5 bg-white/5" />
          ) : (
            <>
              {me.hand.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5 shrink-0"
                >
                  <div
                    className="card-flip-container"
                    style={{ perspective: "1000px" }}
                  >
                    <div
                      className="card-flip-inner"
                      style={{
                        position: "relative",
                        width: "56px",
                        height: "80px",
                        transition: "transform 0.6s",
                        transformStyle: "preserve-3d",
                        transform: flipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      }}
                    >
                      {/* Front */}
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <Card card={c} size="md" skinId={me.skinId} />
                      </div>

                      {/* Back */}
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <Card
                          card={c}
                          faceDown={true}
                          size="md"
                          skinId={me.skinId}
                        />
                      </div>
                    </div>
                  </div>

                  {i === 0 && (
                    <span className="text-[8px] uppercase tracking-wider text-white/25">
                      Hole
                    </span>
                  )}
                </div>
              ))}

              {/* Flip button */}
              <button
                onClick={onToggleFlip}
                style={{
                  width: "56px",
                  height: "80px",
                }}
                className="flex h-20 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-white/40 transition-all hover:border-white/20 hover:bg-black/50 hover:text-white/70 active:scale-95"
                title="Flip card (Only visible to you)"
              >
                <i
                  className={`fa-solid ${flipped ? "fa-eye" : "fa-eye-slash"} text-sm`}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
