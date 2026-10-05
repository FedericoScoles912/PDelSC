import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [loading, setLoading] = useState(true);

  // Al recargar la página, validar el token existente contra la API y restaurar la sesión
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getProfile();
        if (isMounted && response?.ok && response?.user) {
          setUser(response.user);
        } else {
          // Token inválido o respuesta errónea
          handleLogout();
        }
      } catch (error) {
        console.warn('[AuthContext] Sesión expirada o token no válido:', error.message);
        if (isMounted) {
          handleLogout();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Limpia el estado de autenticación y remueve el token de localStorage
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Iniciar sesión
   * @param {{ email: string, password: string }} credentials
   */
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data?.token && data?.user) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Registrar nuevo usuario
   * @param {{ name: string, email: string, password: string }} userData
   */
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data?.token && data?.user) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Actualizar perfil de usuario
   * @param {{ name: string, email: string, password?: string }} updatedData
   */
  const updateProfile = async (updatedData) => {
    const data = await authService.updateProfile(updatedData);
    if (data?.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      handleLogout();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
