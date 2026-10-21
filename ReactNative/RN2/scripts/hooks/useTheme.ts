import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '../context/ThemeContext';

/**
 * Hook para acceder al tema activo, paletas y funciones para cambiar de modo.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
}
