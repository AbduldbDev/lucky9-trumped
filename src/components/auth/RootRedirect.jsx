import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LobbySkeleton from "../intro/LobbySkeleton.jsx";

/** Sends "/" to the lobby when signed in, otherwise to auth. */
export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <LobbySkeleton />;

  return <Navigate to={user ? "/lobby" : "/auth"} replace />;
}
