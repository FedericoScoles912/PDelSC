import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../Scripts/hooks/useAuth.js';

/**
 * Sistema A · ProtectedRoute:
 *  Envuelve rutas privadas. Si el usuario no está autenticado, usa <Navigate />
 *  para redirigir a /login, conservando la ruta original en `state.from`.
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-[color:var(--text-secondary)]">
          <span className="w-6 h-6 rounded-full border-2 border-[color:var(--border-strong)] border-t-[color:var(--accent-primary)] animate-spin" />
          Restaurando sesión…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
}
