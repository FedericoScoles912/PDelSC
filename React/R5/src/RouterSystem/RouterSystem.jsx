import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/AppLayout.jsx';
import AuthLayout from './components/AuthLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';

/**
 * SISTEMA A - "router-system"
 *
 * Navegación real con React Router. Rutas:
 *   /login            público (layout partido)
 *   /register         público (layout partido)
 *   /auth/callback    retorno del proveedor OAuth (pantalla de espera)
 *   /dashboard        protegida
 *   /profile          protegida (además recibe el retorno de la vinculación)
 *   /                 redirige al panel
 *   *                404
 */
export default function RouterSystem() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/auth/callback" element={<OAuthCallback />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
