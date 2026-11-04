// Turn sequence, hit/stand, trump plays, timers, rematch — wired to realtime channel.
//
// Model: the room HOST is authoritative. It owns the full state (deck, every hand),
// runs `gameReducer`, then broadcasts masked state + per-player secrets.
// Guests send actions to the host and render whatever the host sends back.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PHASES,
  applyPrivate,
  createInitialState,
  createPlayer,
  gameReducer,
  getPrivate,
  maskState,
  viewFor,
} from '../utils/gameEngine.js';
import { useSupabaseRealtime } from './useSupabaseRealtime.js';

export function useGameState({ partyCode, isHost, profile }) {
  const selfId = profile.id;
  const fullRef   = useRef(null); // host only: complete (unmasked) state
  const publicRef = useRef(null); // guest only: last public masked state
  const privateRef = useRef(null); // guest only: my private packet
  const rtRef      = useRef(null);
  const [view, setView] = useState(null);

  // Host: commit a new full state, update own view, push to all clients.
  const commit = useCallback(
    (next) => {
      fullRef.current = next;
      setView(viewFor(next, selfId));
      const rt = rtRef.current;
      if (!rt) return;
      rt.broadcastState(maskState(next));
      next.players.forEach((p) => {
        rt.sendPrivate(getPrivate(next, p.id));
      });
    },
    [selfId],
  );

  const hostApply = useCallback(
    (action) => {
      const cur = fullRef.current;
      if (!cur) return;
      const next = gameReducer(cur, action);
      if (next !== cur || action.type === 'JOIN') commit(next);
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

  const me = { id: selfId, name: profile.username, skinId: profile.equippedSkinId };

  // Host: create the room as soon as we have a party code.
  useEffect(() => {
    if (isHost && partyCode && !fullRef.current) {
      commit(createInitialState({ partyCode, hostPlayer: createPlayer(me) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, partyCode]);

  // Guest: announce ourselves once the channel is live.
  useEffect(() => {
    if (!isHost && rt.status === 'SUBSCRIBED') {
      rt.sendAction({ type: 'JOIN', player: me });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, rt.status]);

  // Guest: tell the host we're leaving if the tab closes.
  useEffect(() => {
    if (isHost) return undefined;
    const bye = () => rtRef.current?.sendAction({ type: 'LEAVE', id: selfId });
    window.addEventListener('beforeunload', bye);
    return () => window.removeEventListener('beforeunload', bye);
  }, [isHost, selfId]);

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
    view?.lastResult?.winnerIds?.length === 1 ? view.lastResult.winnerIds[0] : null;

  const actions = {
    start:      ()                         => dispatch({ type: 'START' }),
    nextRound:  ()                         => dispatch({ type: 'NEXT_ROUND', winnerId: lastWinnerId }),
    hit:        ()                         => dispatch({ type: 'HIT' }),
    stand:      ()                         => dispatch({ type: 'STAND' }),
    timeout:    ()                         => dispatch({ type: 'TIMEOUT' }),
    resolveShowdown: ()                   => dispatch({ type: 'RESOLVE_SHOWDOWN' }),
    playTrump:  (trumpId, opts = {})       => dispatch({ type: 'TRUMP', trumpId, ...opts }),
    rematchVote:(accept)                   => dispatch({ type: 'REMATCH_VOTE', accept }),
    reset:      ()                         => dispatch({ type: 'RESET' }),
    leave:      ()                         => dispatch({ type: 'LEAVE', id: selfId }),
  };

  const current = view?.players?.[view.turnIndex];
  const isMyTurn = view?.phase === PHASES.PLAYING && current?.id === selfId;
  const turnKey  = `${view?.round ?? 0}-${view?.turnIndex ?? -1}`;

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
