import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/** Map raw RPC error codes to player-friendly messages. */
function friendlyError(raw) {
  const msg = String(raw?.message ?? raw ?? "");
  if (msg.includes("INSUFFICIENT_CHIPS")) return "Not enough chips.";
  if (msg.includes("UNKNOWN_BUNDLE")) return "That shop item no longer exists.";
  if (msg.includes("NO_PROFILE")) return "Profile not found.";
  return msg || "Purchase failed.";
}

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
