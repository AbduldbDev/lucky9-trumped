import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LobbySkeleton from '../intro/LobbySkeleton';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LobbySkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
