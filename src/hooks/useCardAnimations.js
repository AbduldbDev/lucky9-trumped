import { useState, useEffect, useRef } from "react";
import { PHASES } from "../utils/gameEngine.js";
import { GAME_CONFIG } from "../config/gameRules.config.js";
/**
 * Hook to manage card dealing and hit animations
 * Returns flying cards array and dealing state
 */
export function useCardAnimations({ view, prevPhase, prevRound }) {
  const [flyingCards, setFlyingCards] = useState([]);
  const [isDealing, setIsDealing] = useState(false);
  const [dealingProgress, setDealingProgress] = useState(0); // Track how many cards have been dealt
  const animationIdRef = useRef(0);
  const dealingTimerRef = useRef(null);

  // Track which rounds have been animated (key: round number, value: true)
  // This prevents re-animation when a player refreshes mid-game
  const animatedRoundsRef = useRef(new Set());

  // Track the previous phase to detect when we enter LOBBY (new game)
  const prevPhaseForResetRef = useRef(null);

  // Clear animation tracking when entering LOBBY phase (new game/rematch)
  useEffect(() => {
    if (!view) return;

    const currentPhase = view.phase;

    // If we transition TO LOBBY phase from any other phase (or initial mount),
    // clear the animation history for the next game
    if (
      currentPhase === PHASES.LOBBY &&
      prevPhaseForResetRef.current !== null &&
      prevPhaseForResetRef.current !== PHASES.LOBBY
    ) {
      animatedRoundsRef.current.clear();
    }

    prevPhaseForResetRef.current = currentPhase;
  }, [view?.phase]);

  // Detect round start (dealing animation)
  useEffect(() => {
    if (!view) return;

    const currentRound = view.round;

    // Skip if this round has already been animated
    if (animatedRoundsRef.current.has(currentRound)) {
      return;
    }

    // Check if this is a legitimate new round trigger:
    // 1. Game starts (lobby -> playing, round 1) OR (null -> playing, round 1)
    // 2. New round starts (round increments during PLAYING phase)
    const justStartedGame =
      (prevPhase === PHASES.LOBBY || prevPhase === null) &&
      view.phase === PHASES.PLAYING &&
      view.round === 1;

    const newRound =
      prevRound !== undefined &&
      prevRound !== null &&
      view.round > prevRound &&
      view.phase === PHASES.PLAYING;

    // If this is a legitimate trigger, play animation
    if (justStartedGame || newRound) {
      // Mark this round as animated
      animatedRoundsRef.current.add(currentRound);

      // Small delay to ensure UI is ready
      setTimeout(() => {
        triggerDealingAnimation();
      }, 100);
      return;
    }

    // Otherwise, this might be a mid-game refresh or mount
    // Skip if players already have cards (mid-game refresh case)
    const activePlayers = view.players.filter(
      (p) => !p.isEliminated && !p.isSpectator,
    );
    const someoneHasCards = activePlayers.some(
      (p) => p.hand && p.hand.length > 0,
    );

    if (someoneHasCards) {
      // Mark round as animated to prevent future triggers
      animatedRoundsRef.current.add(currentRound);
      return;
    }
  }, [view?.phase, view?.round, prevPhase, prevRound]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (dealingTimerRef.current) {
        clearTimeout(dealingTimerRef.current);
      }
    };
  }, []);

  const triggerDealingAnimation = () => {
    if (!view) return;

    const activePlayers = view.players.filter(
      (p) => !p.isEliminated && !p.isSpectator,
    );

    setIsDealing(true);
    setDealingProgress(0);

    const cards = [];
    const DELAY_PER_CARD = GAME_CONFIG.DELAY_PER_CARD_ANIMATION;

    // Deal cards one at a time, cycling through players
    // Pattern: P1 card1 (0ms), P2 card1 (500ms), P3 card1 (1000ms), P1 card2 (1500ms), P2 card2 (2000ms)...
    const totalCardsPerPlayer = 2;

    for (let cardIndex = 0; cardIndex < totalCardsPerPlayer; cardIndex++) {
      activePlayers.forEach((player, playerIndex) => {
        const cardNumber = cardIndex * activePlayers.length + playerIndex;
        const delay = cardNumber * DELAY_PER_CARD;

        cards.push({
          id: `deal-${animationIdRef.current++}`,
          playerId: player.id,
          delay,
          type: "deal",
          cardNumber, // Track which card this is for progress
        });
      });
    }

    setFlyingCards(cards);

    // Update progress as cards are dealt
    cards.forEach((card) => {
      setTimeout(() => {
        setDealingProgress(card.cardNumber + 1);
      }, card.delay + 600); // Add animation duration (600ms)
    });

    // Clear after all animations complete
    const maxDelay = Math.max(...cards.map((c) => c.delay));
    dealingTimerRef.current = setTimeout(() => {
      setFlyingCards([]);
      setIsDealing(false);
      setDealingProgress(0);
    }, maxDelay + 800);
  };

  const triggerHitAnimation = (playerId) => {
    const newCard = {
      id: `hit-${animationIdRef.current++}`,
      playerId,
      delay: 0,
      type: "hit",
    };

    setFlyingCards((prev) => [...prev, newCard]);

    // Remove after animation
    setTimeout(() => {
      setFlyingCards((prev) => prev.filter((c) => c.id !== newCard.id));
    }, 700);
  };

  return {
    flyingCards,
    triggerHitAnimation,
    isDealing,
    dealingProgress,
  };
}
