/** Players still in the game (not eliminated, not spectating). */
export const getActivePlayers = (players) =>
  players.filter((p) => !p.isEliminated && !p.isSpectator);
