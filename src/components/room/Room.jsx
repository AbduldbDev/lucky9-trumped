import { useEffect } from "react";
import WaitingRoom from "../lobby/WaitingRoom.jsx";
import KickedOverlay from "../lobby/KickedOverlay.jsx";
import Table from "../table/Table.jsx";
import AssetLoader from "../intro/AssetLoader.jsx";
import { useGameState } from "../../hooks/useGameState.js";
import { useMatchTimer } from "../../hooks/useMatchTimer.js";
import { useMatchSettlement } from "../../hooks/useMatchSettlement.js";
import { useKickDetection } from "../../hooks/useKickDetection.js";
import { useAssetGate } from "../../hooks/useAssetGate.js";
import { PHASES } from "../../utils/gameEngine.js";

/** Mounted only while inside a room so every room gets a fresh game-state hook. */
export default function Room({
  room,
  profile,
  onProfile,
  onRefresh,
  onExit,
  onBuy,
  onEquip,
}) {
  const game = useGameState({
    partyCode: room.partyCode,
    isHost: room.isHost,
    profile,
  });
  const { view, me, actions } = game;

  const getDurationSeconds = useMatchTimer({
    phase: view?.phase,
    partyCode: room.partyCode,
  });

  useMatchSettlement({
    view,
    me,
    profile,
    partyCode: room.partyCode,
    getDurationSeconds,
    onProfile,
  });

  const { assetsLoaded, markLoaded } = useAssetGate(view?.phase);

  const leave = () => {
    actions.leave();
    onRefresh();
    onExit();
  };

  const handleEquip = async (skinId) => {
    await onEquip(skinId);
    actions.setSkin(skinId);
  };

  const isKicked = useKickDetection({
    view,
    playerId: profile.id,
    onExit,
  });

  // Rematch failed: return everyone to the lobby.
  useEffect(() => {
    if (view?.rematchFailed) leave();
  }, [view?.rematchFailed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lobby phase -> waiting room (or kicked notice)
  if (!view || view.phase === PHASES.LOBBY) {
    if (isKicked) return <KickedOverlay />;

    return (
      <WaitingRoom
        partyCode={room.partyCode}
        view={view}
        status={game.status}
        isHost={room.isHost}
        selfId={game.selfId}
        onStart={actions.start}
        onLeave={leave}
        profile={profile}
        onBuy={onBuy}
        onEquip={handleEquip}
        onReady={actions.ready}
        onUnready={actions.unready}
        onKick={actions.kick}
      />
    );
  }

  if (!assetsLoaded) {
    return (
      <AssetLoader
        selectedSkinId={profile.equippedSkin}
        onComplete={markLoaded}
      />
    );
  }

  return (
    <Table
      game={game}
      onLeave={leave}
      tableColor={profile.tableColor || "green"}
    />
  );
}
