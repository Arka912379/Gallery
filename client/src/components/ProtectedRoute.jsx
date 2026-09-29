import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates a route by login, and optionally by role. A user hitting an admin-only
// route (or vice versa) is bounced to their own home instead of seeing a blank/error page.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center font-semibold">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/gallery'} replace />;
  return children;
}
