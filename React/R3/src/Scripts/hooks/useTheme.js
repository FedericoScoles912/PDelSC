import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

/**
 * Custom hook para acceder al contexto del tema visual (claro / oscuro)
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
}
