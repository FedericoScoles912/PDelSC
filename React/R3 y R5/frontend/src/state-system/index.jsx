import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '../Scripts/hooks/useAuth.js';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import NotFoundScreen from './screens/NotFoundScreen.jsx';

const SCREENS = {
  login: 'login',
  register: 'register',
  dashboard: 'dashboard',
  profile: 'profile',
  notfound: 'notfound',
};

const PATH_TO_SCREEN = {
  '/': 'dashboard',
  '/login': 'login',
  '/register': 'register',
  '/dashboard': 'dashboard',
  '/profile': 'profile',
};

const SCREEN_TO_PATH = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: '/profile',
  notfound: '/404',
};

const PRIVATE_SCREENS = new Set(['dashboard', 'profile']);

/**
 * Sistema B — navegación y control de acceso con useState puro.
 * No hay librería de rutas. Se simulan rutas vía hash y window.history
 * (aunque el control real se hace con el estado).
 *
 * Control de acceso: renderizado condicional según `authenticated`.
 */
export default function StateSystem() {
  const [screenKey, setScreenKey] = useState(() => {
    const initial = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
    return PATH_TO_SCREEN[initial] || 'notfound';
  });

  const { authenticated, loading } = useAuth();

  const navigate = useCallback((toPath) => {
    const next = PATH_TO_SCREEN[toPath] || 'notfound';
    setScreenKey(next);
    const url = SCREEN_TO_PATH[next] || toPath;
    if (typeof window !== 'undefined' && window.location.pathname !== url) {
      window.history.pushState({ screen: next }, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, []);

  /** Protección de pantallas privadas */
  const effectiveScreen = useMemo(() => {
    if (loading) return screenKey;
    if (!authenticated && PRIVATE_SCREENS.has(screenKey)) return 'login';
    if (authenticated && (screenKey === 'login' || screenKey === 'register')) return 'dashboard';
    return screenKey;
  }, [screenKey, authenticated, loading]);

  /** Sincronizar con navegación atrás/adelante */
  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setScreenKey(PATH_TO_SCREEN[p] || 'notfound');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Actualizar URL al cambiar screenKey */
  useEffect(() => {
    const target = SCREEN_TO_PATH[effectiveScreen] || window.location.pathname;
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.replaceState({ screen: effectiveScreen }, '', target);
    }
  }, [effectiveScreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)]">
        <div className="inline-flex items-center gap-3 text-[color:var(--text-secondary)]">
          <span className="w-6 h-6 rounded-full border-2 border-[color:var(--border-strong)] border-t-[color:var(--accent-primary)] animate-spin" />
          Restaurando sesión…
        </div>
      </div>
    );
  }

  const screenProps = { navigate };
  const ScreenCmp = (() => {
    switch (effectiveScreen) {
      case SCREENS.login:    return LoginScreen;
      case SCREENS.register: return RegisterScreen;
      case SCREENS.dashboard:return DashboardScreen;
      case SCREENS.profile:  return ProfileScreen;
      default:               return NotFoundScreen;
    }
  })();

  return <ScreenCmp {...screenProps} />;
}
