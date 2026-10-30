import { FiCheckCircle } from 'react-icons/fi';
import { Navigate, Outlet } from 'react-router-dom';

import FullScreenLoader from '../../Components/FullScreenLoader.jsx';
import ThemeToggle from '../../Components/ThemeToggle.jsx';
import { useAuth } from '../../Scripts/hooks/useAuth.js';

/** Puntos que se destacan en el panel de marca (solo desktop). */
const HIGHLIGHTS = [
  'Login tradicional con email y contraseña, hasheada con bcrypt.',
  'OAuth 2.0 con Google, GitHub y LinkedIn sobre la misma cuenta.',
  'Vinculación de cuentas sociales desde el perfil.',
];

/**
 * Layout partido para las vistas públicas del Sistema A (login y registro).
 *
 * - Desktop (lg+): panel de marca a la izquierda, formulario a la derecha.
 * - Mobile: solo el formulario, con el toggle de tema arriba.
 *
 * Si ya hay sesión, no tiene sentido mostrar el login: redirige al panel.
 */
export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullScreenLoader label="Verificando tu sesión…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-on lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-olive/30 blur-3xl"
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
            user-auth-system
          </p>
          <h2 className="mt-8 max-w-md text-3xl font-semibold leading-snug text-balance">
            Una sola API y una sola base de datos, dos formas de construir el frontend.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-90">
            Proyecto educativo de autenticación y gestión de usuarios: sesión tradicional con JWT
            y login social con OAuth 2.0.
          </p>
        </div>

        <ul className="relative flex flex-col gap-3 text-sm">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <FiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0 text-lg opacity-90" />
              <span className="opacity-95">{item}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido */}
      <main className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 px-6 py-5">
          <span className="text-sm font-semibold text-ink lg:hidden">user-auth-system</span>
          <ThemeToggle className="ml-auto" />
        </header>

        <div className="flex flex-1 items-start justify-center px-4 pb-12 sm:items-center sm:px-6">
          <div className="w-full max-w-md animate-pop-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
