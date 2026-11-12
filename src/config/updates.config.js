export const UPDATES = [
  {
    id: "2026-11-12",
    version: "0.0.3",
    date: "Nov 12, 2026",
    title: "Devour Update!",
    released: false,
    items: [
      {
        type: "new",
        text: "Added DEVOUR Trump Card (MYTHIC): Steal up to 2 lives from a selected player and transfer them to yourself. If countered by MIRROR, the effect is reversed and you must transfer up to 2 of your lives to the target instead. Players reduced to 0 lives by Devour are not eliminated by this card.",
      },
      {
        type: "new",
        text: "Added REBIRTH Trump Card (MYTHIC): Discard all Trump Cards in your hand, including Rebirth, and draw the same number of random new Trump Cards.",
      },
      {
        type: "new",
        text: "Added AEGIS Trump Card (LEGENDARY): Halve the life penalty when you lose this round's showdown (deductions round up). Lasts for the current round and can be destroyed by SHATTER.",
      },
      {
        type: "new",
        text: "Casino Shop and Leaderboard are now available from the waiting room. Buy and equip card skins before the match starts, and check the hall of fame without leaving the room.",
      },
      {
        type: "improved",
        text: "MIRROR Trump Card balance change: MIRROR can no longer be used to counter EXCHANGE or FRIENDSHIP CARD — those can only be blocked with SHATTER.",
      },
    ],
  },
  {
    id: "2026-11-10",
    version: "0.0.2",
    date: "Nov 10, 2026",
    title: "Trump Card Update!",
    released: true,
    items: [
      // NEW
      {
        type: "new",
        text: "Added animated card dealing system with cards flying from a central deck to each player's seat sequentially, with sound effects for each card dealt.",
      },
      {
        type: "new",
        text: "Added opponent stats modal accessible by clicking on player seat icons, displaying player stats, equipped card skins, win rate, and match history.",
      },
      {
        type: "new",
        text: "Added SACRIFICE Trump Card (COMMON): Exchange 2 lives for 2 trump cards. Can only be used when you have more than 1 life remaining.",
      },
      {
        type: "new",
        text: "Added LOCKDOWN Trump Card (LEGENDARY): Disable all trump card usage for a specific player for the remainder of the round. This effect can be countered by SHATTER or MIRROR.",
      },
      {
        type: "new",
        text: "Added MIRROR Trump Card (RARE): Reflect counterable trump cards back to the attacker. Must be used from hand when targeted, with special 3-button counter prompt interface.",
      },
      {
        type: "new",
        text: "Added ODDS Trump Card (COMMON): Check if the next card in the deck is greater than 5 or equal to/below 5, helping with strategic hit decisions.",
      },
      {
        type: "new",
        text: "Added visual indicators for locked trump cards when LOCKDOWN is active, with lock icons and disabled states.",
      },
      {
        type: "new",
        text: "Added dealing status banner and visual feedback during card distribution, with disabled controls and paused timer.",
      },
    ],
  },
  {
    id: "2026-11-09",
    version: "0.0.1",
    date: "Nov 9, 2026",
    title: "New features, better balance, and smoother gameplay",
    released: true,
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
      {
        type: "new",
        text: "Added a Flip Cards feature that allows players to flip all their cards simultaneously to reveal their card backs. This visual effect is only visible to the player who activates it and does not affect other players' views or gameplay.",
      },
      {
        type: "new",
        text: "Added glowing effects to Card Skins, giving each skin a unique glow that matches its artwork and color theme. These visual effects enhance card appearances with ambient lighting and highlights, making equipped skins more visually distinctive on the game table.",
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
