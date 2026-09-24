import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService, { buildOAuthUrl } from '../services/authService.js';
import { setAccessToken, clearAccessToken, UNAUTHORIZED } from '../services/api.js';
import { normalizeError, readOAuthHash } from '../utils/validators.js';

export const AuthContext = createContext(null);

/**
 * AuthProvider — Estado global de sesión.
 * Expone: user, loading, authenticated, login, register, loginWithProvider, logout, logoutAll, refresh.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback(({ user: u, accessToken }) => {
    setUser(u || null);
    if (accessToken) setAccessToken(accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    clearAccessToken();
  }, []);

  /** Auto-login silencioso al montar la app (y escucha OAuth hash). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hash = readOAuthHash();
        if (hash?.accessToken) {
          if (!cancelled) {
            setSession({ user: hash.user || null, accessToken: hash.accessToken });
          }
          // si hash no trajo user, refresh para obtenerlo
          if (!hash.user) {
            try {
              const data = await authService.refreshSession();
              if (data?.ok && !cancelled) setSession({ user: data.user, accessToken: data.accessToken });
            } catch (_) { /* ignore */ }
          }
          return;
        }

        const data = await authService.refreshSession();
        if (data?.ok && !cancelled) {
          setSession({ user: data.user, accessToken: data.accessToken });
        }
      } catch (_err) {
        // Sesión no válida: mantener como guest
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setSession]);

  /** Escucha evento global si el interceptor no pudo renovar sesión */
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener(UNAUTHORIZED, handler);
    return () => window.removeEventListener(UNAUTHORIZED, handler);
  }, [clearSession]);

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload);
    if (data?.ok) setSession({ user: data.user, accessToken: data.accessToken });
    return data;
  }, [setSession]);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    if (data?.ok) setSession({ user: data.user, accessToken: data.accessToken });
    return data;
  }, [setSession]);

  /** Redirige al flujo OAuth del proveedor */
  const loginWithProvider = useCallback((provider, redirect = '/dashboard') => {
    const url = buildOAuthUrl(provider, redirect);
    window.location.assign(url);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, [clearSession]);

  const logoutAll = useCallback(async () => {
    await authService.logoutAll();
    clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    try {
      const data = await authService.refreshSession();
      if (data?.ok) setSession({ user: data.user, accessToken: data.accessToken });
      return data;
    } catch (e) {
      clearSession();
      throw e;
    }
  }, [setSession, clearSession]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...(patch || {}) } : prev));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authenticated: !!user,
    login,
    register,
    loginWithProvider,
    logout,
    logoutAll,
    refresh,
    updateUser,
    normalizeError,
  }), [user, loading, login, register, loginWithProvider, logout, logoutAll, refresh, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
