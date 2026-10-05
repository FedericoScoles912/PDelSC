import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Scripts/hooks/useAuth.js';

/**
 * HOC / Componente Guard de Rutas Protegidas para Sistema A (React Router)
 * Redirige a /login si no existe sesión válida autenticada
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

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
    // Redirige al login preservando la ruta de destino original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
