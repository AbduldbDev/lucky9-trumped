export const CARD_SKINS_SHOP = [
  // COMMON
  {
    id: "classic_red",
    name: "Classic Velvet Red",
    rarity: "COMMON",
    price: 0,
    unlockedByDefault: true,
    previewColor: "from-red-800 to-red-950",
    borderColor: "border-amber-300/60",
  },

  // UNCOMMON
  {
    id: "sakura_bliss",
    name: "Sakura Blossom",
    rarity: "UNCOMMON",
    price: 500,
    unlockedByDefault: false,
    previewColor: "from-pink-700 to-rose-950",
    borderColor: "border-pink-400",
  },

  // RARE
  {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon",
    rarity: "RARE",
    price: 1000,
    unlockedByDefault: false,
    previewColor: "from-cyan-900 to-fuchsia-950",
    borderColor: "border-cyan-400",
  },
  {
    id: "royal_purple",
    name: "Royal Amethyst",
    rarity: "RARE",
    price: 1000,
    unlockedByDefault: false,
    previewColor: "from-purple-800 to-indigo-950",
    borderColor: "border-purple-400",
  },
  {
    id: "emerald_luxe",
    name: "Emerald Dynasty",
    rarity: "RARE",
    price: 1000,
    unlockedByDefault: false,
    previewColor: "from-emerald-800 to-green-950",
    borderColor: "border-emerald-400",
  },

  // EPIC
  {
    id: "frozen_dominion",
    name: "Frozen Dominion",
    rarity: "EPIC",
    price: 2000,
    unlockedByDefault: false,
    previewColor: "from-cyan-700 to-blue-950",
    borderColor: "border-cyan-200",
  },
  {
    id: "crimson_reaper",
    name: "Crimson Reaper",
    rarity: "EPIC",
    price: 2000,
    unlockedByDefault: false,
    previewColor: "from-rose-800 to-neutral-950",
    borderColor: "border-rose-500",
  },

  // LEGENDARY
  {
    id: "dragon_gold",
    name: "Imperial Dragon Gold",
    rarity: "LEGENDARY",
    price: 3500,
    unlockedByDefault: false,
    previewColor: "from-amber-700 to-yellow-950",
    borderColor: "border-yellow-400",
  },
  {
    id: "celestial_diamond",
    name: "Celestial Diamond",
    rarity: "LEGENDARY",
    price: 3500,
    unlockedByDefault: false,
    previewColor: "from-sky-700 to-blue-950",
    borderColor: "border-sky-300",
  },
  {
    id: "phoenix_ascendant",
    name: "Phoenix Ascendant",
    rarity: "LEGENDARY",
    price: 3500,
    unlockedByDefault: false,
    previewColor: "from-orange-600 to-red-950",
    borderColor: "border-orange-400",
  },

  // MYTHIC
  {
    id: "midnight_obsidian",
    name: "Midnight Obsidian",
    rarity: "MYTHIC",
    price: 6000,
    unlockedByDefault: false,
    previewColor: "from-slate-800 to-black",
    borderColor: "border-slate-400",
  },
  {
    id: "void_emperor",
    name: "Void Emperor",
    rarity: "MYTHIC",
    price: 6000,
    unlockedByDefault: false,
    previewColor: "from-violet-900 to-black",
    borderColor: "border-violet-500",
  },
];

export const getSkin = (id) =>
  CARD_SKINS_SHOP.find((s) => s.id === id) ?? CARD_SKINS_SHOP[0];
