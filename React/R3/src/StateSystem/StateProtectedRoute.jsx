import React from 'react';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import LoginView from '../Views/LoginView.jsx';

/**
 * Componente Guard para Sistema B (useState puro)
 * Si no está autenticado, fuerza automáticamente la renderización de LoginView
 */
export default function StateProtectedRoute({ children, onNavigateToRegister, onLoginSuccess }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-autumn-terracotta border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
            Verificando sesión en segundo plano...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    );
  }

  return children;
}
