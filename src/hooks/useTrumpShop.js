import { useCallback, useEffect, useRef, useState } from "react";
import { TRUMP_SHOP_ITEMS } from "../config/trumpShop.config.js";
import { purchaseTrumpBundle } from "../services/trumpShopService.js";

// How long to wait for the host's verified grant before warning the buyer.
const RESULT_TIMEOUT_MS = 12000;

/**
 * Trump Shop orchestration (one instance per room, owned by Room).
 *
 * Flow: confirm → `purchase_trump_bundle` RPC (server-side price validation,
 * atomic chip deduction) → dispatch BUY_TRUMPS with the receipt id → the room
 * host verifies the receipt against the DB, rolls the random Trump Cards with
 * the existing rarity logic, and grants them. The rolled cards arrive through
 * this player's private packet (`personalNotifications`, type TRUMP_SHOP) and
 * are surfaced here as the reward result.
 */
export function useTrumpShop({
  partyCode,
  profile,
  view,
  dispatch,
  setProfile,
}) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { purchaseId, bundleName, cards, price }
  const pendingRef = useRef(null); // { purchaseId, price, timer }

  const clearPending = useCallback(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      pendingRef.current = null;
    }
  }, []);

  const openShop = useCallback(() => {
    setError("");
    setOpen(true);
  }, []);

  const closeShop = useCallback(() => {
    setOpen(false);
    setError("");
    setResult(null);
  }, []);

  // Watch the private packet for the host's grant for our pending purchase.
  useEffect(() => {
    if (!open || !pendingRef.current || !view) return;
    const list = Array.isArray(view.personalNotifications)
      ? view.personalNotifications
      : [];
    const pending = pendingRef.current;
    const match = list.find(
      (n) => n.type === "TRUMP_SHOP" && n.purchaseId === pending.purchaseId,
    );
    if (!match) return;

    clearPending();
    setBusyId(null);
    setResult({
      purchaseId: match.purchaseId,
      bundleName: match.bundleName,
      cards: match.cards ?? [],
      price: pending.price,
    });
  }, [view?.personalNotifications, open, clearPending]);

  const purchase = useCallback(
    async (bundleId) => {
      const item = TRUMP_SHOP_ITEMS.find((i) => i.id === bundleId);
      if (!item) {
        setError("Unknown shop item.");
        return;
      }
      if (busyId) return; // re-click / re-entry protection
      if ((profile?.chips ?? 0) < item.price) {
        setError("Not enough chips.");
        return;
      }

      setBusyId(bundleId);
      setError("");
      try {
        const receipt = await purchaseTrumpBundle(bundleId, partyCode);

        // Chips were deducted server-side — reflect the new balance at once.
        setProfile?.((prev) =>
          prev ? { ...prev, chips: receipt.chips_remaining } : prev,
        );

        // Arm the pending watchdog, then hand the receipt to the host.
        const pending = {
          purchaseId: receipt.purchase_id,
          price: receipt.price,
          timer: null,
        };
        pending.timer = setTimeout(() => {
          if (pendingRef.current?.purchaseId !== receipt.purchase_id) return;
          pendingRef.current = null;
          setBusyId(null);
          setError(
            "Payment confirmed, but the cards did not arrive in time. They may still appear — if not, the host may have disconnected.",
          );
        }, RESULT_TIMEOUT_MS);
        pendingRef.current = pending;

        dispatch({
          type: "BUY_TRUMPS",
          purchaseId: receipt.purchase_id,
          bundleId,
        });
      } catch (e) {
        setBusyId(null);
        setError(e.message || "Purchase failed.");
      }
    },
    [busyId, profile?.chips, partyCode, dispatch, setProfile],
  );

  // Clear the watchdog on unmount
  useEffect(() => clearPending, [clearPending]);

  return {
    open,
    openShop,
    closeShop,
    bundles: TRUMP_SHOP_ITEMS,
    busyId,
    error,
    result,
    purchase,
    clearResult: () => setResult(null),
  };
}
