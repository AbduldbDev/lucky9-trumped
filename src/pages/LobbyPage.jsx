import { useEffect, useState } from "react";
import Lobby from "../components/lobby/Lobby.jsx";
import Shop from "../components/shop/Shop.jsx";
import Room from "../components/room/Room.jsx";
import WelcomeScreen from "../components/intro/WelcomeScreen.jsx";
import LobbySkeleton from "../components/intro/LobbySkeleton.jsx";
import { AudioProvider } from "../contexts/AudioContext.jsx";
import { useIntro } from "../contexts/IntroContext.jsx";
import { useProfile } from "../hooks/useProfile.js";
import { useActiveRoom } from "../hooks/useActiveRoom.js";

export default function LobbyPage() {
  const { profile, setProfile, refresh, equip, buy } = useProfile();
  const { room, createRoom, joinRoom, exitRoom } = useActiveRoom();
  const { welcomePending, dismissWelcome, isFirstVisit } = useIntro();
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    if (!room && profile) refresh();
  }, [room]);

  if (!profile) return <LobbySkeleton />;

  if (welcomePending) {
    return (
      <WelcomeScreen
        profile={profile}
        isFirstVisit={isFirstVisit}
        onEnter={dismissWelcome}
      />
    );
  }

  return (
    <AudioProvider>
      {room ? (
        <Room
          room={room}
          profile={profile}
          onProfile={setProfile}
          onRefresh={refresh}
          onExit={exitRoom}
        />
      ) : (
        <Lobby
          profile={profile}
          onCreate={createRoom}
          onJoin={joinRoom}
          onOpenShop={() => setShopOpen(true)}
          onEquipSkin={equip}
        />
      )}
      {shopOpen && (
        <Shop
          profile={profile}
          onBuy={buy}
          onEquip={equip}
          onClose={() => setShopOpen(false)}
        />
      )}
    </AudioProvider>
  );
}
