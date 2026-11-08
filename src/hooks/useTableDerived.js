import { useMemo } from "react";
import { PHASES, computeBetTotal } from "../utils/gameEngine.js";

// Null-safe: it is called before Table's `if (!view || !me) return null` guard.
export function useTableDerived({ view, me }) {
  const phase = view?.phase;
  const allPlayers = view?.players;

  const players = useMemo(() => allPlayers ?? [], [allPlayers]);

  const opponents = useMemo(
    () => (me ? players.filter((p) => p.id !== me.id) : players),
    [players, me],
  );

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

  return {
    allPlayers: players,
    opponents,
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
