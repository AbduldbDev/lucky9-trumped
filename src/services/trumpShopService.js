// Trump Shop purchases: chip-priced bundles of random Trump Cards.
//
// The purchase itself is validated and deducted SERVER-SIDE by the
// `purchase_trump_bundle` Postgres RPC (prices come from the
// `trump_shop_items` table — never from the client). The returned receipt
// (purchase id + quantity) is then handed to the room host, which verifies
// the receipt (`verify_trump_purchase`) and rolls the actual Trump Cards
// into the player's match inventory using the game's existing rarity logic.

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/** Map raw RPC error codes to player-friendly messages. */
function friendlyError(raw) {
  const msg = String(raw?.message ?? raw ?? "");
  if (msg.includes("INSUFFICIENT_CHIPS")) return "Not enough chips.";
  if (msg.includes("UNKNOWN_BUNDLE")) return "That shop item no longer exists.";
  if (msg.includes("NO_PROFILE")) return "Profile not found.";
  return msg || "Purchase failed.";
}

/** Map raw verify-rejection reasons to player-friendly messages. */
const VERIFY_REASONS = {
  NOT_FOUND: "Purchase receipt not found.",
  ALREADY_CONSUMED: "This purchase was already delivered.",
  USER_MISMATCH: "This purchase belongs to another player.",
  ROOM_MISMATCH: "This purchase belongs to a different room.",
};

/**
 * Buy a Trump bundle. Deducts chips atomically and returns a receipt the
 * host can verify:
 *   { ok, purchase_id, bundle_id, quantity, price, chips_remaining }
 * Throws Error with a friendly message on any failure (no chips deducted).
 */
export async function purchaseTrumpBundle(bundleId, partyCode) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured.");
  }

  const { data, error } = await supabase.rpc("purchase_trump_bundle", {
    p_bundle_id: bundleId,
    p_party_code: partyCode ?? null,
  });

  if (error) throw new Error(friendlyError(error));
  if (!data?.ok) throw new Error("Purchase failed.");
  return data;
}

/**
 * HOST ONLY: consume a purchase receipt exactly once before granting the
 * rolled cards. Returns `{ ok: true, quantity, price }` on success, or
 * `{ ok: false, reason }` when the receipt is missing/already used.
 * Rejections never throw — an invalid receipt is a normal no-op, not an error.
 */
export async function verifyTrumpPurchase(purchaseId, userId, partyCode) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, reason: "SUPABASE_UNCONFIGURED" };
  }

  const { data, error } = await supabase.rpc("verify_trump_purchase", {
    p_purchase_id: purchaseId,
    p_user_id: userId,
    p_party_code: partyCode,
  });

  if (error) return { ok: false, reason: error.message };

  if (data?.ok) {
    return { ok: true, quantity: data.quantity, price: data.price };
  }

  const reason = data?.reason ?? "UNKNOWN";
  console.warn(
    "[Lucky9] Trump purchase verification rejected:",
    VERIFY_REASONS[reason] ?? reason,
  );
  return { ok: false, reason };
}
