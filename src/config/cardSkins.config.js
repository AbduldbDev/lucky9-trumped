// Shop inventory for purchasing and equipping custom card design skins.
// Keep ids in sync with the `card_skins` seed in supabase/migrations/001_schema.sql
// (the server reads prices from that table, not from the client).

export const CARD_SKINS_SHOP = [
  {
    id: "classic_red",
    name: "Classic Velvet Red",
    rarity: "Common",
    price: 0, // Free / Default
    unlockedByDefault: true,
    previewColor: "from-red-800 to-red-950",
    borderColor: "border-amber-300/60",
  },
  {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon",
    rarity: "Rare",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-cyan-900 to-fuchsia-950",
    borderColor: "border-cyan-400",
  },
  {
    id: "dragon_gold",
    name: "Imperial Dragon Gold",
    rarity: "Legendary",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-amber-700 to-yellow-950",
    borderColor: "border-yellow-400",
  },

  {
    id: "royal_purple",
    name: "Royal Amethyst",
    rarity: "Rare",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-purple-800 to-indigo-950",
    borderColor: "border-purple-400",
  },
  {
    id: "emerald_luxe",
    name: "Emerald Dynasty",
    rarity: "Rare",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-emerald-800 to-green-950",
    borderColor: "border-emerald-400",
  },
  {
    id: "midnight_obsidian",
    name: "Midnight Obsidian",
    rarity: "Epic",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-slate-800 to-black",
    borderColor: "border-slate-400",
  },
  {
    id: "sakura_bliss",
    name: "Sakura Blossom",
    rarity: "Epic",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-pink-700 to-rose-950",
    borderColor: "border-pink-400",
  },
  {
    id: "celestial_diamond",
    name: "Celestial Diamond",
    rarity: "Legendary",
    price: 0,
    unlockedByDefault: false,
    previewColor: "from-sky-700 to-blue-950",
    borderColor: "border-sky-300",
  },
];

export const getSkin = (id) =>
  CARD_SKINS_SHOP.find((s) => s.id === id) ?? CARD_SKINS_SHOP[0];
