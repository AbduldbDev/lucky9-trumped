// Turn sequence, hit/stand, trump plays, timers, rematch — wired to realtime channel.
//
// Model: the room HOST is authoritative. It owns the full state (deck, every hand),
// runs `gameReducer`, then broadcasts masked state + per-player secrets.
//
// State persistence: the full state is saved to Supabase `game_rooms` on every
// commit so that a page refresh does not disconnect anyone.  On reload the
// host reads `full_state` from the database; guests read `public_state`.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PHASES,
  applyPrivate,
  createInitialState,
  createPlayer,
  gameReducer,
  getPrivate,
  maskState,
  viewFor,
} from "../utils/gameEngine.js";
import { useSupabaseRealtime } from "./useSupabaseRealtime.js";
import { supabase } from "../services/supabaseClient.js";

export function useGameState({ partyCode, isHost, profile }) {
  const selfId = profile.id;
  const fullRef = useRef(null); // host only: complete (unmasked) state
  const publicRef = useRef(null); // guest only: last public masked state
  const privateRef = useRef(null); // guest only: my private packet
  const rtRef = useRef(null);
  const loadedRef = useRef(false); // guard: initial DB load done
  const [view, setView] = useState(null);

  const me = {
    id: selfId,
    name: profile.username,
    skinId: profile.equippedSkinId,
  };

  // ── Host: commit a new full state, update own view, push to clients + DB ──
  const commit = useCallback(
    (next) => {
      fullRef.current = next;
      setView(viewFor(next, selfId));
      const masked = maskState(next);
      const rt = rtRef.current;
      if (rt) {
        rt.broadcastState(masked);
        next.players.forEach((p) => {
          rt.sendPrivate(getPrivate(next, p.id));
        });
      }
      // Persist to database (fire-and-forget so realtime stays snappy)
      if (supabase && partyCode) {
        supabase
          .from("game_rooms")
          .upsert({
            party_code: partyCode,
            host_id: selfId,
            full_state: next,
            public_state: masked,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error("[Lucky9] DB persist error:", error.message);
              // Try again once if it failed
              supabase
                .from("game_rooms")
                .upsert({
                  party_code: partyCode,
                  host_id: selfId,
                  full_state: next,
                  public_state: masked,
                  updated_at: new Date().toISOString(),
                })
                .catch((retryError) => {
                  console.error(
                    "[Lucky9] DB persist retry failed:",
                    retryError,
                  );
                });
            }
          });
      }
    },
    [selfId, partyCode],
  );

  const hostApply = useCallback(
    (action) => {
      const cur = fullRef.current;
      if (!cur) return;

      // Special handling for JOIN: always ensure player gets state
      if (action.type === "JOIN") {
        const next = gameReducer(cur, action);
        const isReconnect = next === cur;

        // Commit for new joins
        if (!isReconnect) {
          commit(next);
        } else {
          // For reconnects, manually broadcast state to the rejoining player
          const rt = rtRef.current;
          if (rt) {
            const masked = maskState(cur);
            rt.broadcastState(masked);
            // Send private data to all players (including the reconnecting one)
            cur.players.forEach((p) => {
              rt.sendPrivate(getPrivate(cur, p.id));
            });
          }
        }
        return;
      }

      // Normal action handling
      const next = gameReducer(cur, action);
      if (next !== cur) commit(next);
    },
    [commit],
  );

  const rt = useSupabaseRealtime({
    partyCode,
    selfId,
    onAction: isHost ? hostApply : undefined,
    onState: isHost
      ? undefined
      : (pub) => {
          publicRef.current = pub;
          setView(applyPrivate(pub, privateRef.current, selfId));
        },
    onPrivate: isHost
      ? undefined
      : (priv) => {
          privateRef.current = priv;
          setView(applyPrivate(publicRef.current, priv, selfId));
        },
  });
  rtRef.current = rt;

  // ── Host: load existing state from DB (handles page refresh) ──────────────
  // If a room already exists in the database we resume it; otherwise we
  // create a fresh initial state.  This runs once on mount.
  useEffect(() => {
    if (!isHost || !partyCode || loadedRef.current) return;
    loadedRef.current = true;

    if (supabase) {
      supabase
        .from("game_rooms")
        .select("full_state")
        .eq("party_code", partyCode)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.warn("[Lucky9] Failed to load room state:", error.message);
            // Create fresh state on error
            commit(
              createInitialState({ partyCode, hostPlayer: createPlayer(me) }),
            );
            return;
          }

          if (data?.full_state) {
            // Resume existing game
            fullRef.current = data.full_state;
            setView(viewFor(data.full_state, selfId));
            // Immediately broadcast to any waiting clients
            if (rt.status === "SUBSCRIBED") {
              const masked = maskState(data.full_state);
              rt.broadcastState(masked);
              data.full_state.players.forEach((p) => {
                rt.sendPrivate(getPrivate(data.full_state, p.id));
              });
            }
          } else {
            // No existing room — create fresh
            commit(
              createInitialState({ partyCode, hostPlayer: createPlayer(me) }),
            );
          }
        });
    } else {
      // Supabase not configured — in-memory only
      commit(createInitialState({ partyCode, hostPlayer: createPlayer(me) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, partyCode]);

  // ── Host: re-broadcast state once realtime connects (handles refresh) ─────
  // After a page refresh the host loads state from DB, then this effect
  // fires when the realtime channel comes online, pushing state to all guests.
  // In LOBBY phase, re-broadcast periodically to ensure all guests stay synced.
  useEffect(() => {
    if (!isHost || !fullRef.current || rt.status !== "SUBSCRIBED")
      return undefined;

    // Immediate broadcast when connection is established
    const broadcast = () => {
      if (!fullRef.current) return;
      const masked = maskState(fullRef.current);
      rt.broadcastState(masked);
      fullRef.current.players.forEach((p) => {
        rt.sendPrivate(getPrivate(fullRef.current, p.id));
      });
    };

    broadcast();

    // In LOBBY phase, re-broadcast every 3 seconds to handle race conditions
    // Stop once game starts
    if (fullRef.current.phase === PHASES.LOBBY) {
      const intervalId = setInterval(() => {
        if (fullRef.current?.phase === PHASES.LOBBY) {
          broadcast();
        }
      }, 3000);

      return () => clearInterval(intervalId);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, rt.status]);

  // ── Guest: load public state from DB (handles page refresh) ───────────────
  // Gives the guest an immediate view before the host re-broadcasts.
  useEffect(() => {
    if (isHost || !partyCode || loadedRef.current) return;
    loadedRef.current = true;

    if (supabase) {
      supabase
        .from("game_rooms")
        .select("public_state")
        .eq("party_code", partyCode)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.warn("[Lucky9] Failed to load room state:", error.message);
            return;
          }

          if (data?.public_state) {
            publicRef.current = data.public_state;
            setView(
              applyPrivate(data.public_state, privateRef.current, selfId),
            );
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, partyCode]);

  // ── Guest: announce ourselves once the channel is live ────────────────────
  // JOIN is a no-op if we're already in the game (reconnect), but it triggers
  // the host to re-broadcast state + our private packet.
  // We retry every 2 seconds until we receive state to handle race conditions.
  useEffect(() => {
    if (isHost || rt.status !== "SUBSCRIBED") return undefined;

    // Send initial JOIN immediately
    rt.sendAction({ type: "JOIN", player: me });

    // Set up retry interval in case the host missed it or wasn't ready
    const retryInterval = setInterval(() => {
      // Stop retrying once we have a valid view with players
      if (view?.players?.length > 0) {
        clearInterval(retryInterval);
        return;
      }
      // Re-send JOIN to ensure host knows about us
      rt.sendAction({ type: "JOIN", player: me });
    }, 2000);

    return () => clearInterval(retryInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, rt.status, view?.players?.length]);

  // ── Browser refresh/close handling ─────────────────────────────────────────
  // We DO NOT send LEAVE on beforeunload/unload because we want players to be
  // able to refresh without being kicked. The game will treat a disconnect as
  // temporary, and players can rejoin by refreshing or navigating back.
  // Only the explicit leave() action marks a player as having left intentionally.

  const dispatch = useCallback(
    (action) => {
      const full = { ...action, by: selfId };
      if (isHost) hostApply(full);
      else rtRef.current?.sendAction(full);
    },
    [isHost, hostApply, selfId],
  );

  // Derive the last round's winner for NEXT_ROUND
  const lastWinnerId =
    view?.lastResult?.winnerIds?.length === 1
      ? view.lastResult.winnerIds[0]
      : null;

  const actions = {
    start: () => dispatch({ type: "START" }),
    nextRound: () => dispatch({ type: "NEXT_ROUND", winnerId: lastWinnerId }),
    hit: () => dispatch({ type: "HIT" }),
    stand: () => dispatch({ type: "STAND" }),
    timeout: () => dispatch({ type: "TIMEOUT" }),
    resolveShowdown: () => dispatch({ type: "RESOLVE_SHOWDOWN" }),
    playTrump: (trumpId, opts = {}) =>
      dispatch({ type: "TRUMP", trumpId, ...opts }),
    respondCounter: (requestId, useShatter) =>
      dispatch({ type: "RESPOND_COUNTER", requestId, useShatter }),
    rematchVote: (accept) => dispatch({ type: "REMATCH_VOTE", accept }),
    checkRematchTimer: () => dispatch({ type: "CHECK_REMATCH_TIMER" }),
    reset: () => dispatch({ type: "RESET" }),
    leave: () => dispatch({ type: "LEAVE", id: selfId, intentional: true }),
    ready: () => dispatch({ type: "READY" }),
    unready: () => dispatch({ type: "UNREADY" }),
  };

  const current = view?.players?.[view.turnIndex];
  const isMyTurn = view?.phase === PHASES.PLAYING && current?.id === selfId;
  const turnKey = `${view?.round ?? 0}-${view?.turnIndex ?? -1}`;

  return {
    view,
    status: rt.status,
    selfId,
    isHost,
    isMyTurn,
    turnKey,
    me: view?.players?.find((p) => p.id === selfId) ?? null,
    actions,
  };
}
