// Profile, chips, shop purchases, and lifetime stats.
// SRD §1: winners earn 100-120 chips per match; starting chips = 0.
// SRD §9: Supabase tables — profiles, user_inventory, player_stats, match_history.
//
// Two modes:
//   "cloud" — Supabase anonymous auth + tables from 001_schema.sql
//   "local" — localStorage fallback when Supabase isn't configured

import { GAME_CONFIG } from "../config/gameRules.config.js";
import { CARD_SKINS_SHOP } from "../config/cardSkins.config.js";
import { supabase } from "./supabaseClient.js";

const LOCAL_KEY = "lucky9.profile.v2";

const emptyStats = () => ({
  totalMatches: 0,
  totalWins: 0,
  totalLosses: 0,
  currentWinStreak: 0,
  highestWinStreak: 0,
  favoriteTrumpCard: "BET_UP",
});

// ─── LOCAL MODE ─────────────────────────────────────────────────────────────
function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY));
    if (raw?.id) return raw;
  } catch {
    /* ignore */
  }

  const id = crypto.randomUUID();
  const fresh = {
    id,
    username: "Player" + id.slice(0, 4).toUpperCase(),
    avatarUrl: "default_avatar.png",
    chips: GAME_CONFIG.STARTING_CHIPS, // SRD: 0
    level: 1,
    currentRank: "Rookie",
    equippedSkinId: "classic_red",
    owned: CARD_SKINS_SHOP.filter((s) => s.unlockedByDefault).map((s) => s.id),
    stats: emptyStats(),
  };
  writeLocal(fresh);
  return fresh;
}

function writeLocal(p) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ─── CLOUD MODE ─────────────────────────────────────────────────────────────
async function loadCloud() {
  const { data: auth } = await supabase.auth.getSession();
  let session = auth.session;
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    session = data.session;
  }
  const uid = session.user.id;

  const [{ data: prof, error: e1 }, { data: inv }, { data: st }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("user_inventory").select("item_id").eq("user_id", uid),
      supabase.from("player_stats").select("*").eq("user_id", uid).single(),
    ]);
  if (e1) throw e1;

  return {
    id: uid,
    username: prof.username,
    avatarUrl: prof.avatar_url,
    chips: prof.chips,
    level: prof.level ?? 1,
    currentRank: prof.current_rank ?? "Rookie",
    equippedSkinId: prof.equipped_skin_id,
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
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────
let mode = "cloud";

export async function initProfile() {
  if (supabase) {
    try {
      const p = await loadCloud();
      mode = "cloud";
      return { ...p, mode };
    } catch (err) {
      console.warn(
        "[Lucky9] Supabase unavailable, using local profile:",
        err.message ?? err,
      );
    }
  }
  mode = "local";
  return { ...readLocal(), mode };
}

export const getMode = () => mode;

export async function saveUsername(profile, username) {
  const name = String(username).trim().slice(0, 20);
  if (!name) return profile;
  if (mode === "cloud") {
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
  const next = { ...readLocal(), username: name };
  writeLocal(next);
  return { ...profile, username: name };
}

export async function purchaseSkin(profile, itemId) {
  const skin = CARD_SKINS_SHOP.find((s) => s.id === itemId);
  if (!skin) throw new Error("Unknown skin.");
  if (profile.owned.includes(itemId)) throw new Error("Already owned.");
  if (profile.chips < skin.price) throw new Error("Not enough chips.");

  if (mode === "cloud") {
    const { data, error } = await supabase.rpc("purchase_skin", {
      p_item_id: itemId,
    });
    if (error) throw new Error(error.message);
    return { ...profile, chips: data, owned: [...profile.owned, itemId] };
  }
  const next = {
    ...readLocal(),
    chips: profile.chips - skin.price,
    owned: [...profile.owned, itemId],
  };
  writeLocal(next);
  return { ...profile, chips: next.chips, owned: next.owned };
}

export async function equipSkin(profile, itemId) {
  if (!profile.owned.includes(itemId)) throw new Error("Skin not owned.");
  if (mode === "cloud") {
    const { error } = await supabase.rpc("equip_skin", { p_item_id: itemId });
    if (error) throw new Error(error.message);
  } else {
    writeLocal({ ...readLocal(), equippedSkinId: itemId });
  }
  return { ...profile, equippedSkinId: itemId };
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
  { won, chipsEarned, trumpsPlayed, naturals },
) {
  if (mode === "cloud") {
    const { data, error } = await supabase.rpc("record_match", {
      p_won: won,
      p_chips: chipsEarned,
      p_trumps: trumpsPlayed,
      p_naturals: naturals,
    });
    if (error) throw new Error(error.message);
    const next = {
      ...profile,
      chips: data,
      stats: bumpStats(profile.stats, { won }),
    };
    return next;
  }

  const local = readLocal();
  const next = {
    ...local,
    chips: local.chips + chipsEarned,
    stats: bumpStats(local.stats, { won }),
  };
  writeLocal(next);
  return { ...profile, chips: next.chips, stats: next.stats };
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
