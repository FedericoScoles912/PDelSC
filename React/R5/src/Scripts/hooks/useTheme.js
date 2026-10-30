import { useContext } from 'react';

import { ThemeContext } from '../context/ThemeContext.jsx';

/** Acceso al tema global (claro/oscuro) y a su toggle. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }
  return context;
}
