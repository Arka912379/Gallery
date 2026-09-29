import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import UserSignup from './pages/UserSignup';
import AdminSignup from './pages/AdminSignup';
import Gallery from './pages/Gallery';
import AddPhoto from './pages/AddPhoto';
import ShowPhoto from './pages/ShowPhoto';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center font-semibold">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/gallery'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/admin-signup" element={<AdminSignup />} />

      <Route
        path="/gallery"
        element={
          <ProtectedRoute role="user">
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-photo"
        element={
          <ProtectedRoute role="user">
            <AddPhoto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/photos/:id"
        element={
          <ProtectedRoute role="user">
            <ShowPhoto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute role="user">
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="user">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard section="overview" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/photos"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard section="photos" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard section="users" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/favorites"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard section="favorites" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
