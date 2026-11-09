import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LobbySkeleton from "../intro/LobbySkeleton.jsx";

export default function PublicRoute({ children, redirectTo = "/lobby" }) {
  const { user, loading } = useAuth();

  if (loading) return <LobbySkeleton />;
  if (user) return <Navigate to={redirectTo} replace />;

  return children;
}
