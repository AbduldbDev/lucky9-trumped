import { forwardRef } from "react";
import Card from "../../cards/Card.jsx"; // adjust path

const CentralDeck = forwardRef(
  ({ deckCount, view, skinId = "classic_red" }, ref) => {
    if (!view || deckCount === undefined) return null;

    return (
      <div ref={ref} className="relative w-11 h-16">
        {/* Deck stack effect */}
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded border border-white/5 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded border border-white/5 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Top card uses the shared skin renderer */}
        <div className="relative w-full h-full rounded shadow-xl">
          <Card faceDown skinId={skinId} size="deck" />
        </div>

        {/* Deck count badge */}
        {deckCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-gold/40 bg-black/90 shadow-lg">
            <span className="text-[9px] font-bold text-gold">{deckCount}</span>
          </div>
        )}
      </div>
    );
  },
);

CentralDeck.displayName = "CentralDeck";
export default CentralDeck;
