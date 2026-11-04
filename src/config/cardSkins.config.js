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
    price: 1500,
    unlockedByDefault: false,
    previewColor: "from-amber-700 to-yellow-950",
    borderColor: "border-yellow-400",
  },
];

export const getSkin = (id) =>
  CARD_SKINS_SHOP.find((s) => s.id === id) ?? CARD_SKINS_SHOP[0];
