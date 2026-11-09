import { useState, useEffect } from "react";
import { TRUMP_CARDS_CATALOG } from "../config/trumpCards.config.js";

/**
 * Hook for managing trump card targeting logic
 * @param {Object} params - Targeting parameters
 * @param {boolean} params.isMyTurn - Whether it's the current player's turn
 * @param {Object} params.actions - Game actions object
 * @returns {Object} Targeting state and handlers
 */
export function useTrumpTargeting({ isMyTurn, actions }) {
  const [aiming, setAiming] = useState(null);

  // Clear aiming when turn ends
  useEffect(() => {
    if (!isMyTurn && aiming) {
      setAiming(null);
    }
  }, [isMyTurn, aiming]);

  const aimCfg = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;
  const targeting = aimCfg?.targetType === "SINGLE_PLAYER";

  const onTarget = (p) => {
    if (!targeting || p.isEliminated || p.isSpectator) return;

    // BUGFIX: Prevent targeting players with full hands for cards that would add cards
    const MAX_CARDS = 5; // GAME_CONFIG.MAX_CARDS_IN_HAND

    // List of trump cards that add cards to target's hand
    const cardsAddingToTarget = ["TARGET"]; // FORCE_DRAW

    if (cardsAddingToTarget.includes(aiming) && p.hand.length >= MAX_CARDS) {
      // Player has full hand, can't target them
      return;
    }

    actions.playTrump(aiming, { targetId: p.id });
    setAiming(null);
    // Trump card play will automatically clear targeting on server
  };

  const startAiming = (trumpId) => {
    setAiming(trumpId);
    // Don't notify server - we don't pause during targeting selection
  };

  const cancelAim = () => {
    if (aiming) {
      // Don't notify server - we don't pause during targeting selection
      setAiming(null);
    }
  };

  return {
    aiming,
    aimCfg,
    targeting,
    setAiming: startAiming,
    onTarget,
    cancelAim,
  };
}
