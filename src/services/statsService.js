// Profile, chips, shop purchases, and lifetime stats.
// SRD §1: winners earn 100-120 chips per match; starting chips = 1000.
// SRD §9: Supabase tables — profiles, user_inventory, player_stats, match_history.
//
// Cloud-only mode: requires authenticated Supabase user

import { GAME_CONFIG } from "../config/gameRules.config.js";
import { CARD_SKINS_SHOP } from "../config/cardSkins.config.js";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const emptyStats = () => ({
  totalMatches: 0,
  totalWins: 0,
  totalLosses: 0,
  currentWinStreak: 0,
  highestWinStreak: 0,
  favoriteTrumpCard: "BET_UP",
});

// ─── CLOUD MODE ─────────────────────────────────────────────────────────────
async function loadCloud() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  try {
    const { data: auth } = await supabase.auth.getSession();
    const session = auth.session;

    if (!session) {
      throw new Error("Not authenticated");
    }

    const uid = session.user.id;

    const [{ data: prof, error: e1 }, { data: inv }, { data: st }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("user_inventory").select("item_id").eq("user_id", uid),
        supabase
          .from("player_stats")
          .select("*")
          .eq("user_id", uid)
          .maybeSingle(),
      ]);

    // If profile doesn't exist, create it (handle_new_user trigger might have failed)
    if (!prof) {
      console.log("[Lucky9] Profile not found, creating manually...");
      const username =
        session.user.user_metadata?.username || "player_" + uid.slice(0, 8);

      // Create profile
      const { error: profError } = await supabase.from("profiles").insert({
        id: uid,
        username,
        chips: 100,
        table_color: "green",
      });

      if (profError && profError.code !== "23505") {
        // Ignore duplicate key errors
        throw profError;
      }

      // Add default skin
      await supabase
        .from("user_inventory")
        .insert({
          user_id: uid,
          item_id: "classic_red",
          item_type: "CARD_SKIN",
        })
        .catch(() => {}); // Ignore if already exists

      // Create stats
      await supabase
        .from("player_stats")
        .insert({
          user_id: uid,
        })
        .catch(() => {}); // Ignore if already exists

      // Reload profile
      const { data: newProf, error: newError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (newError) throw newError;

      return {
        id: uid,
        username: newProf.username,
        avatarUrl: newProf.avatar_url,
        chips: newProf.chips,
        level: newProf.level ?? 1,
        currentRank: newProf.current_rank ?? "Rookie",
        equippedSkinId: newProf.equipped_skin_id,
        owned: ["classic_red"],
        stats: emptyStats(),
      };
    }

    if (e1) throw e1;

    return {
      id: uid,
      username: prof.username,
      avatarUrl: prof.avatar_url,
      chips: prof.chips,
      level: prof.level ?? 1,
      currentRank: prof.current_rank ?? "Rookie",
      equippedSkinId: prof.equipped_skin_id,
      tableColor: prof.table_color ?? "blue",
      owned: (inv ?? []).map((r) => r.item_id),
      stats: st
        ? {
            totalMatches: st.total_matches,
            totalWins: st.total_wins,
            totalLosses: st.total_losses,
            currentWinStreak: st.current_win_streak,
            highestWinStreak: st.highest_win_streak,
            favoriteTrumpCard: st.favorite_trump_card ?? "BET_UP",
          }
        : emptyStats(),
    };
  } catch (error) {
    console.error("[Lucky9] Failed to load profile:", error.message ?? error);
    throw error;
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────
export async function initProfile() {
  const p = await loadCloud();
  return { ...p, mode: "cloud" };
}

export async function refreshProfile(currentProfile) {
  try {
    // Reload profile from database to get latest data
    const uid = currentProfile.id;

    const [{ data: prof }, { data: inv }, { data: st }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("user_inventory").select("item_id").eq("user_id", uid),
      supabase.from("player_stats").select("*").eq("user_id", uid).single(),
    ]);

    return {
      ...currentProfile,
      username: prof.username,
      avatarUrl: prof.avatar_url,
      chips: prof.chips,
      level: prof.level ?? 1,
      currentRank: prof.current_rank ?? "Rookie",
      equippedSkinId: prof.equipped_skin_id,
      tableColor: prof.table_color ?? "blue",
      owned: (inv ?? []).map((r) => r.item_id),
      stats: st
        ? {
            totalMatches: st.total_matches,
            totalWins: st.total_wins,
            totalLosses: st.total_losses,
            currentWinStreak: st.current_win_streak,
            highestWinStreak: st.highest_win_streak,
            favoriteTrumpCard: st.favorite_trump_card ?? "BET_UP",
          }
        : (currentProfile.stats ?? emptyStats()),
    };
  } catch (error) {
    console.error("[Lucky9] Failed to refresh profile:", error);
    return currentProfile; // Return current profile if refresh fails
  }
}

export async function saveUsername(profile, username) {
  const name = String(username).trim().slice(0, 20);
  if (!name) return profile;

  const { error } = await supabase
    .from("profiles")
    .update({ username: name })
    .eq("id", profile.id);
  if (error)
    throw new Error(
      error.code === "23505" ? "That name is taken." : error.message,
    );
  return { ...profile, username: name };
}

export async function purchaseSkin(profile, itemId) {
  const skin = CARD_SKINS_SHOP.find((s) => s.id === itemId);
  if (!skin) throw new Error("Unknown skin.");
  if (profile.owned.includes(itemId)) throw new Error("Already owned.");
  if (profile.chips < skin.price) throw new Error("Not enough chips.");

  const { data, error } = await supabase.rpc("purchase_skin", {
    p_item_id: itemId,
  });
  if (error) throw new Error(error.message);
  return { ...profile, chips: data, owned: [...profile.owned, itemId] };
}

export async function equipSkin(profile, itemId) {
  if (!profile.owned.includes(itemId)) throw new Error("Skin not owned.");

  const { error } = await supabase.rpc("equip_skin", { p_item_id: itemId });
  if (error) throw new Error(error.message);

  return { ...profile, equippedSkinId: itemId };
}

export async function setTableColor(profile, color) {
  console.log("[statsService] setTableColor called with:", {
    profileId: profile.id,
    color,
    currentTableColor: profile.tableColor,
  });

  const validColors = ["green", "purple", "blue", "red", "black"];
  if (!validColors.includes(color)) {
    console.error("[statsService] Invalid color:", color);
    throw new Error("Invalid table color.");
  }

  console.log("[statsService] Updating database...");
  const { error } = await supabase
    .from("profiles")
    .update({ table_color: color })
    .eq("id", profile.id);

  if (error) {
    console.error("[statsService] Database error:", error);
    throw new Error(error.message);
  }

  console.log("[statsService] Database updated successfully");
  const updatedProfile = { ...profile, tableColor: color };
  console.log("[statsService] Returning updated profile:", updatedProfile);
  return updatedProfile;
}

/**
 * SRD §1: Winners earn 100–120 chips per match.
 * Calculated as a random value in that range (100 + random 0–20).
 */
export function calcMatchChips({ won }) {
  if (!won || !GAME_CONFIG.ENABLE_CHIP_REWARDS) return 0;
  return (
    GAME_CONFIG.WIN_REWARD_MIN +
    Math.floor(
      Math.random() *
        (GAME_CONFIG.WIN_REWARD_MAX - GAME_CONFIG.WIN_REWARD_MIN + 1),
    )
  );
}

/** Persist a finished match and return the updated profile. */
export async function recordMatchResult(
  profile,
  {
    won,
    chipsEarned,
    trumpsPlayed,
    naturals,
    matchCode,
    totalRounds,
    durationSeconds,
    winnerId,
  },
) {
  // Record match result and update stats for current player
  const { data: newChips, error } = await supabase.rpc("record_match", {
    p_won: won,
    p_chips: chipsEarned,
    p_trumps: trumpsPlayed,
    p_naturals: naturals,
  });
  if (error) throw new Error(error.message);

  // Save match history for this player
  if (matchCode) {
    const { error: historyError } = await supabase
      .from("match_history")
      .insert({
        match_code: matchCode,
        winner_id: winnerId,
        player_id: profile.id,
        won: won,
        total_rounds: totalRounds || 1,
        duration_seconds: durationSeconds || 0,
        chips_rewarded: won ? chipsEarned : 0,
      });

    if (historyError) {
      console.warn(
        "[Lucky9] Could not save match history:",
        historyError.message,
      );
    }
  }

  // Reload fresh stats and chips from database to ensure sync
  const [{ data: freshStats }, { data: freshProfile }] = await Promise.all([
    supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase.from("profiles").select("chips").eq("id", profile.id).single(),
  ]);

  return {
    ...profile,
    chips: freshProfile?.chips ?? newChips,
    stats: freshStats
      ? {
          totalMatches: freshStats.total_matches,
          totalWins: freshStats.total_wins,
          totalLosses: freshStats.total_losses,
          currentWinStreak: freshStats.current_win_streak,
          highestWinStreak: freshStats.highest_win_streak,
          favoriteTrumpCard: freshStats.favorite_trump_card ?? "BET_UP",
        }
      : bumpStats(profile.stats, { won }),
  };
}

function bumpStats(s, { won }) {
  const newStreak = won ? s.currentWinStreak + 1 : 0;
  return {
    ...s,
    totalMatches: s.totalMatches + 1,
    totalWins: s.totalWins + (won ? 1 : 0),
    totalLosses: s.totalLosses + (won ? 0 : 1),
    currentWinStreak: newStreak,
    highestWinStreak: Math.max(s.highestWinStreak, newStreak),
  };
}
