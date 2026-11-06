import { useEffect, useRef, useState } from "react";
import Lobby from "./components/lobby/Lobby.jsx";
import WaitingRoom from "./components/lobby/WaitingRoom.jsx";
import Table from "./components/table/Table.jsx";
import Shop from "./components/shop/Shop.jsx";
import SplashScreen from "./components/intro/SplashScreen.jsx";
import WelcomeScreen from "./components/intro/WelcomeScreen.jsx";
import LobbySkeleton from "./components/intro/LobbySkeleton.jsx";
import { useGameState } from "./hooks/useGameState.js";
import { PHASES } from "./utils/gameEngine.js";
import { generatePartyCode } from "./utils/partyCode.js";
import { getIntroState, stampVisit } from "./utils/introState.js";
import {
  calcMatchChips,
  equipSkin,
  initProfile,
  purchaseSkin,
  recordMatchResult,
  saveUsername,
} from "./services/statsService.js";
import { AudioProvider } from "./contexts/AudioContext.jsx";

/** Mounted only while inside a room so every room gets a fresh game-state hook. */
function Room({ room, profile, onProfile, onExit }) {
  const game = useGameState({
    partyCode: room.partyCode,
    isHost: room.isHost,
    profile,
  });
  const { view, me, actions } = game;
  const settled = useRef(false);

  // Persist stats + chips once when the match ends.
  useEffect(() => {
    if (view?.phase !== PHASES.GAMEOVER || !me || settled.current) return;
    settled.current = true;
    const won = view.winnerId === me.id;
    const chipsEarned = calcMatchChips({ won });
    recordMatchResult(profile, {
      won,
      chipsEarned,
      trumpsPlayed: me.stats.trumpsPlayed,
      naturals: me.stats.naturals,
    })
      .then(onProfile)
      .catch((e) =>
        console.warn("[Lucky9] Could not save match result:", e.message),
      );
  }, [view?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset settled flag on rematch (back to lobby)
  useEffect(() => {
    if (view?.phase === PHASES.LOBBY) settled.current = false;
  }, [view?.phase]);

  const leave = () => {
    actions.leave();
    onExit();
  };

  if (!view || view.phase === PHASES.LOBBY) {
    return (
      <WaitingRoom
        partyCode={room.partyCode}
        view={view}
        status={game.status}
        isHost={room.isHost}
        selfId={game.selfId}
        onStart={actions.start}
        onLeave={leave}
      />
    );
  }
  return <Table game={game} onLeave={leave} />;
}

export default function App() {
  const [intro] = useState(getIntroState); // { isFirstVisit, showIntro }
  const [profile, setProfile] = useState(null);
  const [room, setRoom] = useState(null); // { partyCode, isHost }
  const [shopOpen, setShopOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(!intro.showIntro);
  const [welcomed, setWelcomed] = useState(!intro.showIntro);

  useEffect(() => {
    stampVisit();
  }, []);

  useEffect(() => {
    initProfile().then(setProfile);
  }, []);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (!profile) {
    return <LobbySkeleton />;
  }

  if (!welcomed) {
    return (
      <WelcomeScreen
        profile={profile}
        isFirstVisit={intro.isFirstVisit}
        onEnter={() => setWelcomed(true)}
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
          onExit={() => setRoom(null)}
        />
      ) : (
        <Lobby
          profile={profile}
          onRename={async (name) =>
            setProfile(await saveUsername(profile, name))
          }
          onCreate={() =>
            setRoom({ partyCode: generatePartyCode(), isHost: true })
          }
          onJoin={(code) => setRoom({ partyCode: code, isHost: false })}
          onOpenShop={() => setShopOpen(true)}
        />
      )}
      {shopOpen && (
        <Shop
          profile={profile}
          onBuy={async (id) => setProfile(await purchaseSkin(profile, id))}
          onEquip={async (id) => setProfile(await equipSkin(profile, id))}
          onClose={() => setShopOpen(false)}
        />
      )}
    </AudioProvider>
  );
}
