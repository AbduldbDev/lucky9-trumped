import { useCallback, useEffect, useState } from "react";
import {
  equipSkin,
  initProfile,
  purchaseSkin,
  refreshProfile,
  saveUsername,
  setTableColor,
} from "../services/statsService.js";

/**
 * Loads the signed-in player's profile and exposes the profile mutations
 * (equip / buy / table colour / rename) so containers don't repeat the wiring.
 */
export function useProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    initProfile()
      .then(setProfile)
      .catch((err) => {
        // Auth problems are handled by ProtectedRoute.
        console.error("[Lucky9] Failed to load profile:", err);
      });
  }, []);

  const refresh = useCallback(
    () =>
      refreshProfile(profile)
        .then(setProfile)
        .catch((err) =>
          console.warn("[Lucky9] Could not refresh profile:", err),
        ),
    [profile],
  );

  const equip = useCallback(
    async (id) => setProfile(await equipSkin(profile, id)),
    [profile],
  );

  const buy = useCallback(
    async (id) => setProfile(await purchaseSkin(profile, id)),
    [profile],
  );

  const changeTableColor = useCallback(
    async (color) => setProfile(await setTableColor(profile, color)),
    [profile],
  );

  const rename = useCallback(
    async (username) => setProfile(await saveUsername(profile, username)),
    [profile],
  );

  return {
    profile,
    setProfile,
    refresh,
    equip,
    buy,
    setTableColor: changeTableColor,
    rename,
  };
}
