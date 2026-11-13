// Trump Shop configuration — chip-priced bundles of random Trump Cards.
//
// This file drives the shop UI (names, quantities, prices) and the host-side
// validation of every purchase. The SAME bundles must be seeded into the
// `trump_shop_items` table (see supabase/migrations/012_trump_shop.sql) — the
// DATABASE is the authoritative price source: the purchase RPC never trusts a
// client-submitted price or quantity. Keep both sides in sync.
//
// Use the term "Trump" (never "Pack"). Add/remove/modify bundles freely here
// and in the SQL seed; nothing else needs to change.

export const TRUMP_SHOP_ITEMS = [
  {
    id: "starter",
    name: "Starter",
    quantity: 1, // random Trumps granted
    price: 150, // chips
  },
  {
    id: "duo",
    name: "Duo",
    quantity: 2,
    price: 280,
  },
  {
    id: "value",
    name: "Value",
    quantity: 5,
    price: 650,
  },
  {
    id: "mega",
    name: "Mega",
    quantity: 7,
    price: 850,
  },
];

/** Lookup a bundle by id (returns undefined for unknown ids). */
export function getShopItem(bundleId) {
  return TRUMP_SHOP_ITEMS.find((item) => item.id === bundleId);
}

/** Human-friendly plural label, e.g. "1 Random Trump" / "2 Random Trumps". */
export function quantityLabel(quantity) {
  return `${quantity} Random Trump${quantity === 1 ? "" : "s"}`;
}
