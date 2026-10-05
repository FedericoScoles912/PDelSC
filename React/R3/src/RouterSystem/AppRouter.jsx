import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import Navbar from '../Components/Navbar.jsx';
import LoginView from '../Views/LoginView.jsx';
import RegisterView from '../Views/RegisterView.jsx';
import DashboardView from '../Views/DashboardView.jsx';
import ProfileView from '../Views/ProfileView.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

/**
 * Layout principal del Sistema A con Navbar integrada al Router
 */
function RouterLayout({ onSwitchSystem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-autumn-beige-50 dark:bg-autumn-darkbg transition-colors">
      <Navbar
        systemName="Sistema A · React Router"
        activeSystem="router"
        onSwitchSystem={onSwitchSystem}
        onNavigate={(path) => navigate(path)}
        activeRoute={location.pathname}
      />

      <main className="flex-1">
        <Routes>
          {/* Rutas Públicas (redirigen al dashboard si ya hay sesión) */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginView
                  onNavigateToRegister={() => navigate('/register')}
                  onLoginSuccess={() => navigate('/dashboard')}
                />
              )
            }
          />

          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterView
                  onNavigateToLogin={() => navigate('/login')}
                  onRegisterSuccess={() => navigate('/dashboard')}
                />
              )
            }
          />

          {/* Rutas Protegidas mediante ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView
                  systemName="Sistema A · React Router"
                  onNavigateToProfile={() => navigate('/profile')}
                  onSwitchSystem={onSwitchSystem}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileView
                  onNavigateToDashboard={() => navigate('/dashboard')}
                />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Sistema A Completo: Enrutamiento gestionado con React Router v6
 */
export default function AppRouter({ onSwitchSystem }) {
  return (
    <BrowserRouter>
      <RouterLayout onSwitchSystem={onSwitchSystem} />
    </BrowserRouter>
  );
}
