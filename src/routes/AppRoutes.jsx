import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthScreen from "../components/auth/AuthScreen.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import PublicRoute from "../components/auth/PublicRoute.jsx";
import RootRedirect from "../components/auth/RootRedirect.jsx";
import Leaderboard from "../components/leaderboard/Leaderboard.jsx";
import SplashScreen from "../components/intro/SplashScreen.jsx";
import LobbyPage from "../pages/LobbyPage.jsx";
import ProfileRoutePage from "../pages/ProfileRoutePage.jsx";
import { useIntro } from "../contexts/IntroContext.jsx";

export default function AppRoutes() {
  const { splashDone, completeSplash } = useIntro();
  const navigate = useNavigate();

  if (!splashDone) {
    return (
      <SplashScreen
        onDone={() => {
          completeSplash();
          navigate("/auth", { replace: true });
        }}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthScreen />
          </PublicRoute>
        }
      />

      <Route
        path="/lobby"
        element={
          <ProtectedRoute>
            <LobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRoutePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
