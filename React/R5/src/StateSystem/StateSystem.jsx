import { useCallback, useMemo, useState } from 'react';

import FullScreenLoader from '../Components/FullScreenLoader.jsx';
import ThemeToggle from '../Components/ThemeToggle.jsx';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import SystemHeader from './components/SystemHeader.jsx';
import { PROTECTED_VIEWS, PUBLIC_VIEWS, VIEWS, resolveInitialView } from './navigation.js';
import DashboardView from './views/DashboardView.jsx';
import LoginView from './views/LoginView.jsx';
import OAuthCallbackView from './views/OAuthCallbackView.jsx';
import ProfileView from './views/ProfileView.jsx';
import RegisterView from './views/RegisterView.jsx';

/**
 * SISTEMA B - "state-system"
 *
 * No hay React Router. Toda la navegación es una única variable de estado:
 *
 *   const [view, setView] = useState(resolveInitialView)
 *
 * Las reglas de acceso se aplican al calcular la vista efectiva:
 *  - una vista protegida sin sesión cae en el login;
 *  - una vista pública con sesión iniciada cae en el panel.
 *
 * El estado de sesión sí es compartido (mismo AuthContext y mismo token), por
 * eso al cambiar de Sistema A a B se mantiene la sesión.
 */
export default function StateSystem() {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState(resolveInitialView);

  /** Equivalente a navigate(): cambia la vista activa y nada más. */
  const navigate = useCallback((nextView) => setView(nextView), []);

  const effectiveView = useMemo(() => {
    if (!isAuthenticated && PROTECTED_VIEWS.includes(view)) return VIEWS.LOGIN;
    if (isAuthenticated && PUBLIC_VIEWS.includes(view)) return VIEWS.DASHBOARD;
    return view;
  }, [view, isAuthenticated]);

  if (loading) return <FullScreenLoader label="Verificando tu sesión…" />;

  // El retorno de OAuth tiene su propia pantalla completa.
  if (effectiveView === VIEWS.OAUTH) {
    return <OAuthCallbackView navigate={navigate} />;
  }

  const isAuthView = effectiveView === VIEWS.LOGIN || effectiveView === VIEWS.REGISTER;

  if (isAuthView) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <header className="flex items-center justify-between gap-4 px-6 py-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            user-auth-system
          </span>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-start justify-center px-4 pb-12 sm:items-center sm:px-6">
          <div className="w-full max-w-md animate-pop-in">
            {effectiveView === VIEWS.LOGIN ? (
              <LoginView navigate={navigate} />
            ) : (
              <RegisterView navigate={navigate} />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SystemHeader currentView={effectiveView} onNavigate={navigate} />

      <main className="container-fluid mx-auto max-w-[1200px] px-6 py-8">
        {effectiveView === VIEWS.PROFILE ? (
          <ProfileView />
        ) : (
          <DashboardView navigate={navigate} />
        )}
      </main>
    </div>
  );
}
