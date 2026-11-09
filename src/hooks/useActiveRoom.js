import { useCallback, useEffect, useState } from "react";
import { generatePartyCode } from "../utils/partyCode.js";

const STORAGE_KEY = "lucky9.activeRoom";

function readSavedRoom() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed?.partyCode ? parsed : null;
  } catch (e) {
    console.warn("[Lucky9] Could not restore room:", e);
    return null;
  }
}

/**
 * Tracks the room the player is in ({ partyCode, isHost } | null) and
 * persists it to sessionStorage so a page refresh drops them back in.
 */
export function useActiveRoom() {
  // Lazy init restores synchronously, so there's no lobby flash on refresh.
  const [room, setRoom] = useState(readSavedRoom);

  useEffect(() => {
    if (room) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(room));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [room]);

  const createRoom = useCallback(
    () => setRoom({ partyCode: generatePartyCode(), isHost: true }),
    [],
  );
  const joinRoom = useCallback(
    (partyCode) => setRoom({ partyCode, isHost: false }),
    [],
  );
  const exitRoom = useCallback(() => setRoom(null), []);

  return { room, createRoom, joinRoom, exitRoom };
}
