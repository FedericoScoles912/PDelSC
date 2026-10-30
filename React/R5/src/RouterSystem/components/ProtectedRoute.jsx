import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../Scripts/hooks/useAuth.js';
import FullScreenLoader from '../../Components/FullScreenLoader.jsx';

/**
 * Ruta protegida del Sistema A.
 *
 * - Mientras se restaura la sesión (loading) no decide nada: muestra espera.
 * - Sin sesión, redirige a /login guardando el origen para volver tras entrar.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader label="Verificando tu sesión…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
