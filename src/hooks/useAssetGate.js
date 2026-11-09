import { useCallback, useEffect, useState } from "react";
import { PHASES } from "../utils/gameEngine.js";

/**
 * Tracks whether table assets have finished loading for the current match.
 * Resets whenever the room goes back to the lobby so each match reloads.
 */
export function useAssetGate(phase) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (phase === PHASES.LOBBY) setAssetsLoaded(false);
  }, [phase]);

  const markLoaded = useCallback(() => setAssetsLoaded(true), []);

  return { assetsLoaded, markLoaded };
}
