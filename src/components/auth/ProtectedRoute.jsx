import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LobbySkeleton from "../intro/LobbySkeleton.jsx";

/** Guards routes that require a signed-in user. */
export default function ProtectedRoute({ children, redirectTo = "/auth" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LobbySkeleton />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
