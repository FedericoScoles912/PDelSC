import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '../context/ThemeContext';

/**
 * Hook para acceder a la paleta de colores activa y función para alternar temas.
 * @throws Error si se usa fuera de un ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider.');
  }
  return context;
}
