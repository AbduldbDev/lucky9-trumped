// Room sync over Supabase Realtime Broadcast. One channel per Party Code.
//
// Events on the channel:
//   action   client → host   a player's intent (JOIN / HIT / STAND / TRUMP …)
//   state    host   → all    public (masked) game state
//   private  host   → all    one player's secrets, filtered client-side by `toId`

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient.js';

export function useSupabaseRealtime({ partyCode, selfId, onAction, onState, onPrivate }) {
  const [status, setStatus] = useState('IDLE'); // IDLE | SUBSCRIBED | CHANNEL_ERROR | TIMED_OUT | CLOSED
  const channelRef = useRef(null);
  const handlers = useRef({});
  handlers.current = { onAction, onState, onPrivate }; // always call the latest closures

  useEffect(() => {
    if (!supabase || !partyCode) return undefined;

    const channel = supabase.channel(`lucky9:${partyCode}`, {
      config: { broadcast: { self: false, ack: false } },
    });

    channel
      .on('broadcast', { event: 'action' }, ({ payload }) => handlers.current.onAction?.(payload))
      .on('broadcast', { event: 'state' }, ({ payload }) => handlers.current.onState?.(payload))
      .on('broadcast', { event: 'private' }, ({ payload }) => {
        if (payload?.toId === selfId) handlers.current.onPrivate?.(payload);
      })
      .subscribe((s) => setStatus(s));

    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      setStatus('IDLE');
      supabase.removeChannel(channel);
    };
  }, [partyCode, selfId]);

  const send = useCallback((event, payload) => {
    channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  return {
    status,
    sendAction: useCallback((a) => send('action', a), [send]),
    broadcastState: useCallback((s) => send('state', s), [send]),
    sendPrivate: useCallback((p) => send('private', p), [send]),
  };
}
