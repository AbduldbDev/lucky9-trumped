import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Lobby from "./components/lobby/Lobby.jsx";
import WaitingRoom from "./components/lobby/WaitingRoom.jsx";
import Table from "./components/table/Table.jsx";
import Shop from "./components/shop/Shop.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";
import SplashScreen from "./components/intro/SplashScreen.jsx";
import WelcomeScreen from "./components/intro/WelcomeScreen.jsx";
import LobbySkeleton from "./components/intro/LobbySkeleton.jsx";
import AssetLoader from "./components/intro/AssetLoader.jsx";
import AuthScreen from "./components/auth/AuthScreen.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuth, AuthProvider } from "./contexts/AuthContext.jsx";
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
  refreshProfile,
  setTableColor,
} from "./services/statsService.js";
import { AudioProvider } from "./contexts/AudioContext.jsx";

/** Mounted only while inside a room so every room gets a fresh game-state hook. */
function Room({ room, profile, onProfile, onExit }) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const game = useGameState({
    partyCode: room.partyCode,
    isHost: room.isHost,
    profile,
  });
  const { view, me, actions } = game;
  const settled = useRef(false);
  const startedAt = useRef(null);
  const startKey = `lucky9.matchStart.${room.partyCode}`;
  const showLoader = useRef(false);

  useEffect(() => {
    const phase = view?.phase;
    if (!phase) return;

    if (phase === PHASES.LOBBY) {
      // Back in lobby (new match / rematch): clear the timer.
      startedAt.current = null;
      sessionStorage.removeItem(startKey);
      return;
    }

    if (startedAt.current == null) {
      const saved = Number(sessionStorage.getItem(startKey));
      startedAt.current = saved > 0 ? saved : Date.now();
      sessionStorage.setItem(startKey, String(startedAt.current));
    }
  }, [view?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist stats + chips once when the match ends.
  useEffect(() => {
    if (view?.phase !== PHASES.GAMEOVER || !me || settled.current) return;
    settled.current = true;
    const won = view.winnerId === me.id;
    const chipsEarned = calcMatchChips({ won });

    const durationSeconds = startedAt.current
      ? Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000))
      : 0;

    // Each player saves their own match result
    recordMatchResult(profile, {
      won,
      chipsEarned,
      trumpsPlayed: me.stats.trumpsPlayed,
      naturals: me.stats.naturals,
      matchCode: room.partyCode,
      totalRounds: view.round || 1,
      durationSeconds,
      winnerId: view.winnerId,
    })
      .then(onProfile)
      .catch((e) =>
        console.warn("[Lucky9] Could not save match result:", e.message),
      );
  }, [view?.phase, view?.round]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset settled flag on rematch (back to lobby)
  useEffect(() => {
    if (view?.phase === PHASES.LOBBY) {
      settled.current = false;
      // Reset asset loader flag when back in lobby
      showLoader.current = false;
      setAssetsLoaded(false);
    }
  }, [view?.phase]);

  // Trigger asset loading when game starts (phase changes from LOBBY)
  useEffect(() => {
    if (view?.phase && view.phase !== PHASES.LOBBY && !showLoader.current) {
      showLoader.current = true;
      setAssetsLoaded(false);
    }
  }, [view?.phase]);

  // Handle rematch failure - return all players to lobby
  useEffect(() => {
    if (view?.rematchFailed) {
      // Clear room and return to lobby
      leave();
    }
  }, [view?.rematchFailed]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    actions.leave();
    // Refresh profile when leaving to get latest stats/chips
    refreshProfile(profile)
      .then(onProfile)
      .catch((e) => console.warn("[Lucky9] Could not refresh profile:", e));
    onExit();
  };

  // Show waiting room in lobby phase
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
        onReady={actions.ready}
        onUnready={actions.unready}
      />
    );
  }

  // Show asset loader when game starts and assets not loaded yet
  if (!assetsLoaded) {
    return (
      <AssetLoader
        selectedSkinId={profile.equippedSkin}
        onComplete={() => setAssetsLoaded(true)}
      />
    );
  }

  // Show table when assets are loaded
  return (
    <Table
      game={game}
      onLeave={leave}
      tableColor={profile.tableColor || "blue"}
    />
  );
}

/** Main App component with routing */
function AppContent() {
  const [intro] = useState(getIntroState); // { isFirstVisit, showIntro }
  const [splashDone, setSplashDone] = useState(!intro.showIntro);
  const navigate = useNavigate();

  useEffect(() => {
    stampVisit();
  }, []);

  // Show splash screen first time
  if (!splashDone) {
    return (
      <SplashScreen
        onDone={() => {
          setSplashDone(true);
          navigate("/auth");
        }}
      />
    );
  }

  return (
    <Routes>
      {/* Auth route - public */}
      <Route path="/auth" element={<AuthScreen />} />

      {/* Protected routes */}
      <Route
        path="/lobby"
        element={
          <ProtectedRoute>
            <LobbyContainer intro={intro} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileContainer />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to lobby if authenticated, otherwise to auth */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Root redirect based on auth status */
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LobbySkeleton />;
  }

  return <Navigate to={user ? "/lobby" : "/auth"} replace />;
}

/** Lobby container with game state */
function LobbyContainer({ intro }) {
  const [profile, setProfile] = useState(null);
  const [room, setRoom] = useState(null); // { partyCode, isHost }
  const [shopOpen, setShopOpen] = useState(false);
  const [welcomed, setWelcomed] = useState(!intro.showIntro);

  useEffect(() => {
    initProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("[Lucky9] Failed to load profile:", err);
        // If profile load fails, user might not be authenticated
        // This will be handled by ProtectedRoute
      });
  }, []);

  // Refresh profile data when returning to lobby (no active room)
  useEffect(() => {
    if (!room && profile) {
      refreshProfile(profile)
        .then(setProfile)
        .catch((err) =>
          console.warn("[Lucky9] Could not refresh profile:", err),
        );
    }
  }, [room]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load active room from sessionStorage on mount (persist across refreshes)
  useEffect(() => {
    try {
      const savedRoom = sessionStorage.getItem("lucky9.activeRoom");
      if (savedRoom) {
        const parsed = JSON.parse(savedRoom);
        if (parsed.partyCode) {
          setRoom(parsed);
        }
      }
    } catch (e) {
      console.warn("[Lucky9] Could not restore room:", e);
    }
  }, []);

  // Save room to sessionStorage whenever it changes
  useEffect(() => {
    if (room) {
      sessionStorage.setItem("lucky9.activeRoom", JSON.stringify(room));
    } else {
      sessionStorage.removeItem("lucky9.activeRoom");
    }
  }, [room]);

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
          onCreate={() =>
            setRoom({ partyCode: generatePartyCode(), isHost: true })
          }
          onJoin={(code) => setRoom({ partyCode: code, isHost: false })}
          onOpenShop={() => setShopOpen(true)}
          onEquipSkin={async (id) => setProfile(await equipSkin(profile, id))}
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

/** Profile container */
function ProfileContainer() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    initProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("[Lucky9] Failed to load profile:", err);
      });
  }, []);

  if (!profile) {
    return <LobbySkeleton />;
  }

  return (
    <AudioProvider>
      <ProfilePage
        profile={profile}
        onEquipSkin={async (id) => setProfile(await equipSkin(profile, id))}
        onSetTableColor={async (color) =>
          setProfile(await setTableColor(profile, color))
        }
      />
    </AudioProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
