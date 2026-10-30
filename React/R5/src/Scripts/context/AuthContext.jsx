import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';
import { oauthService } from '../services/oauthService.js';
import { STORAGE_KEYS, SYSTEMS } from '../utils/constants.js';
import { goTo } from '../utils/helpers.js';

export const AuthContext = createContext(null);

/** Lee el token persistido. */
function readToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/** Guarda (o borra, con null) el token en localStorage. */
function persistToken(token) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  else localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

/**
 * Estado global de sesión, compartido por AMBOS sistemas.
 *
 * Expone exactamente lo pedido: user, isAuthenticated, login(),
 * loginWithProvider(), logout(), register(), linkedAccounts y loading.
 * Se agregan helpers para la gestión de cuentas vinculadas.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras se restaura la sesión
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [hasPassword, setHasPassword] = useState(false);

  /** Carga las cuentas sociales vinculadas del usuario actual. */
  const refreshLinkedAccounts = useCallback(async () => {
    if (!readToken()) {
      setLinkedAccounts([]);
      setHasPassword(false);
      return;
    }

    try {
      const data = await oauthService.getLinkedAccounts();
      setLinkedAccounts(data.accounts ?? []);
      setHasPassword(Boolean(data.hasPassword));
    } catch {
      // Si falla (token vencido, red caída) no rompemos la UI: se deja vacío.
      setLinkedAccounts([]);
      setHasPassword(false);
    }
  }, []);

  /* Restauración de sesión al recargar: valida el token contra la API. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = readToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: profile } = await userService.getProfile();
        if (!cancelled) setUser(profile);
      } catch {
        persistToken(null); // token inválido o expirado
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Login tradicional (email + contraseña). */
  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      persistToken(data.token);
      setUser(data.user);
      void refreshLinkedAccounts();
      return data.user;
    },
    [refreshLinkedAccounts]
  );

  /** Registro tradicional. El backend ya devuelve sesión iniciada. */
  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload);
      persistToken(data.token);
      setUser(data.user);
      void refreshLinkedAccounts();
      return data.user;
    },
    [refreshLinkedAccounts]
  );

  /**
   * Aplica el resultado del canje OAuth (token + user).
   * Lo usa useOAuthCallback después de POST /api/auth/exchange.
   */
  const applyOAuthResult = useCallback(
    (result) => {
      if (!result?.token || !result?.user) return;

      persistToken(result.token);
      setUser(result.user);
      void refreshLinkedAccounts();
    },
    [refreshLinkedAccounts]
  );

  /** Actualiza el usuario en memoria (tras editar el perfil). */
  const updateUser = useCallback((nextUser) => {
    setUser((current) => ({ ...current, ...nextUser }));
  }, []);

  /** Cierra la sesión (local y en el backend). */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // El JWT es stateless: aunque falle la llamada, la sesión local se cierra.
    }
    persistToken(null);
    setUser(null);
    setLinkedAccounts([]);
    setHasPassword(false);
  }, []);

  /**
   * Inicia el login social: redirige el navegador al backend, que a su vez
   * redirige al proveedor. `system` define a qué sistema se vuelve.
   */
  const loginWithProvider = useCallback((providerId, system = SYSTEMS.ROUTER) => {
    goTo(oauthService.buildLoginUrl(providerId, system));
  }, []);

  /** Pide la URL de autorización para vincular un proveedor y devuelve la URL. */
  const requestProviderLink = useCallback(async (providerId, system = SYSTEMS.ROUTER) => {
    const { authUrl } = await oauthService.requestLink(providerId, system);
    return authUrl;
  }, []);

  /** Desvincula una cuenta social. El backend bloquea dejar al usuario sin acceso. */
  const unlinkProvider = useCallback(async (providerId) => {
    const data = await oauthService.unlink(providerId);
    setLinkedAccounts(data.accounts ?? []);
    setHasPassword(Boolean(data.hasPassword));
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      loginWithProvider,
      requestProviderLink,
      unlinkProvider,
      refreshLinkedAccounts,
      linkedAccounts,
      hasPassword,
      applyOAuthResult,
      updateUser,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      loginWithProvider,
      requestProviderLink,
      unlinkProvider,
      refreshLinkedAccounts,
      linkedAccounts,
      hasPassword,
      applyOAuthResult,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
