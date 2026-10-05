import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
