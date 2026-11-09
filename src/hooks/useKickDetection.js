import { useEffect, useRef } from "react";

const RETURN_DELAY_MS = 2500;

/**
 * Detects that the player was kicked from the room and calls onExit
 * shortly after so the overlay has time to be read.
 */
export function useKickDetection({ view, playerId, onExit }) {
  const wasInRoom = useRef(false);
  const inPlayers = !!view?.players?.some((p) => p.id === playerId);

  useEffect(() => {
    if (inPlayers) wasInRoom.current = true;
  }, [inPlayers]);

  const isKicked =
    wasInRoom.current &&
    !inPlayers &&
    !!view?.kickedPlayers?.includes(playerId);

  useEffect(() => {
    if (!isKicked) return;
    const timeout = setTimeout(onExit, RETURN_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [isKicked]);

  return isKicked;
}
