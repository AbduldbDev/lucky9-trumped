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
  const [target1, setTarget1] = useState(null); // First target for TWO_PLAYERS

  // Clear aiming when turn ends
  useEffect(() => {
    if (!isMyTurn && aiming) {
      setAiming(null);
      setTarget1(null);
    }
  }, [isMyTurn, aiming]);

  const aimCfg = aiming ? TRUMP_CARDS_CATALOG[aiming] : null;
  const targeting = aimCfg?.targetType === "SINGLE_PLAYER";
  const twoPlayerTargeting = aimCfg?.targetType === "TWO_PLAYERS";

  const onTarget = (p) => {
    if (p.isEliminated || p.isSpectator) return;

    // Handle TWO_PLAYERS targeting (like BOND)
    if (twoPlayerTargeting) {
      // First target selection
      if (!target1) {
        setTarget1(p.id);
        return;
      }

      // Second target selection
      if (target1 === p.id) {
        // Can't target same player twice
        return;
      }

      // Both targets selected, play the trump
      actions.playTrump(aiming, { targetId: target1, target2Id: p.id });
      setAiming(null);
      setTarget1(null);
      return;
    }

    // Handle SINGLE_PLAYER targeting
    if (!targeting) return;

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
    setTarget1(null); // Reset first target
    // Don't notify server - we don't pause during targeting selection
  };

  const cancelAim = () => {
    if (aiming || target1) {
      // Don't notify server - we don't pause during targeting selection
      setAiming(null);
      setTarget1(null);
    }
  };

  return {
    aiming,
    aimCfg,
    targeting,
    twoPlayerTargeting,
    target1,
    setAiming: startAiming,
    onTarget,
    cancelAim,
  };
}
