import { useMemo } from "react";
import { PHASES, computeBetTotal } from "../utils/gameEngine.js";

// Null-safe: it is called before Table's `if (!view || !me) return null` guard.
/**
 * Filter player cards based on dealing progress
 * Returns how many cards should be visible for a given player
 */
function getVisibleCardCount(
  playerIndex,
  totalPlayers,
  dealingProgress,
  isDealing,
) {
  // When not dealing, show all cards normally
  if (!isDealing) {
    return 999; // Return large number to show all cards
  }

  // During dealing, show cards progressively (including at progress 0, show 0 cards)
  // Dealing pattern: P0C0(0), P1C0(1), P2C0(2), P0C1(3), P1C1(4), P2C1(5)
  const firstCardPosition = playerIndex;
  const secondCardPosition = totalPlayers + playerIndex;

  let visibleCards = 0;
  if (dealingProgress > firstCardPosition) visibleCards++;
  if (dealingProgress > secondCardPosition) visibleCards++;

  return visibleCards;
}

export function useTableDerived({
  view,
  me,
  isDealing = false,
  dealingProgress = 0,
}) {
  const phase = view?.phase;
  const allPlayers = view?.players;

  const players = useMemo(() => allPlayers ?? [], [allPlayers]);

  // Get active players for dealing calculation
  const activePlayers = useMemo(
    () => players.filter((p) => !p.isEliminated && !p.isSpectator),
    [players],
  );

  const opponents = useMemo(() => {
    if (!me) return players;

    return players
      .filter((p) => p.id !== me.id)
      .map((opp) => {
        if (!isDealing) return opp;

        const playerIndex = activePlayers.findIndex((p) => p.id === opp.id);
        if (playerIndex === -1) return opp; // Not active

        const visibleCount = getVisibleCardCount(
          playerIndex,
          activePlayers.length,
          dealingProgress,
          isDealing,
        );

        return {
          ...opp,
          hand: opp.hand.slice(0, visibleCount),
        };
      });
  }, [players, me, isDealing, dealingProgress, activePlayers]);

  const nameOf = useMemo(
    () => (id) => players.find((p) => p.id === id)?.name ?? "?",
    [players],
  );

  const turnPlayer = players[view?.turnIndex];
  const revealed = phase === PHASES.SHOWDOWN || phase === PHASES.GAMEOVER;
  const bet = computeBetTotal(view?.betModifiers ?? 0, view?.round ?? 1);
  const result = view?.lastResult ?? null;

  const amSpectator = !!me && !!(me.isSpectator || me.isEliminated);
  const isPlaying = phase === PHASES.PLAYING;
  const showControls = !!me && !amSpectator && isPlaying && !me.stood;
  const showStood = !!me && !amSpectator && isPlaying && !!me.stood;

  // Filter me's cards during dealing
  const meFiltered = useMemo(() => {
    if (!me || !isDealing) return me;

    const playerIndex = activePlayers.findIndex((p) => p.id === me.id);
    if (playerIndex === -1) return me; // Not active

    const visibleCount = getVisibleCardCount(
      playerIndex,
      activePlayers.length,
      dealingProgress,
      isDealing,
    );

    return {
      ...me,
      hand: me.hand.slice(0, visibleCount),
    };
  }, [me, isDealing, dealingProgress, activePlayers]);

  return {
    allPlayers: players,
    opponents,
    me: meFiltered,
    turnPlayer,
    revealed,
    bet,
    result,
    nameOf,
    amSpectator,
    showControls,
    showStood,
  };
}
