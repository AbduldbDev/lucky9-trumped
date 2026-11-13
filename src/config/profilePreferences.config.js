// Profile appearance preferences (local-view settings).

/** Table felt colors the player can pick on the profile page. */
export const TABLE_COLORS = [
  {
    id: "green",
    name: "Forest Green",
    gradient: "from-emerald-700 to-emerald-900",
  },
  {
    id: "purple",
    name: "Royal Purple",
    gradient: "from-purple-700 to-purple-900",
  },
  { id: "blue", name: "Ocean Blue", gradient: "from-blue-700 to-blue-900" },
  { id: "red", name: "Crimson Red", gradient: "from-red-700 to-red-900" },
  { id: "black", name: "Midnight Black", gradient: "from-gray-800 to-black" },
];

/** Valid table_color values for persistence validation (statsService). */
export const TABLE_COLOR_IDS = TABLE_COLORS.map((color) => color.id);

/** Match history rows fetched for the profile page. */
export const MATCH_HISTORY_LIMIT = 20;
