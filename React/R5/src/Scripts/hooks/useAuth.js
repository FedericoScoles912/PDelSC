import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Acceso al estado global de sesión.
 *
 * Devuelve: user, isAuthenticated, loading, login, register, logout,
 * loginWithProvider, requestProviderLink, unlinkProvider,
 * refreshLinkedAccounts, linkedAccounts, hasPassword, applyOAuthResult,
 * updateUser.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}
