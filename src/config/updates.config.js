/**
 * Put this file at: src/config/updates.config.js
 *
 * To announce an update, add a new object at the TOP of the list.
 * Each `id` must be unique and never reused: it is what the browser remembers.
 * type: "new" | "improved" | "fixed"
 */
export const UPDATES = [
  {
    id: "2026-11-09",
    version: "0.0.1",
    date: "Nov 9, 2026",
    title: "New features, better balance, and smoother gameplay",
    items: [
      // NEW
      {
        type: "new",
        text: "Added an opponent turn timer to display the remaining time for each player's turn.",
      },
      {
        type: "new",
        text: "Redesigned the active Trump Card display on the game table to improve visibility of active cards and their effects.",
      },
      {
        type: "new",
        text: "Added a consecutive timeout elimination system. Players who time out twice in a row will be automatically eliminated from the match.",
      },
      {
        type: "new",
        text: "Added a leaderboard system showcasing the top 10 players with at least 5 completed matches.",
      },
      {
        type: "new",
        text: "Added a kick feature that allows lobby hosts to remove players from the lobby.",
      },

      // IMPROVED
      {
        type: "improved",
        text: "Rebalanced Trump Card rarity classifications and updated the Trump Card guides to reflect the changes.",
      },
      {
        type: "improved",
        text: "Changed Checker Trump Card rarity from Legendary to Rare.",
      },
      {
        type: "improved",
        text: "Optimized the mobile interface, including player seats, card positioning, spacing, and component sizing for a better mobile experience.",
      },
      {
        type: "improved",
        text: "Refined gameplay UI elements, player information, active turn indicators, and overall visual presentation.",
      },
    ],
  },
];
