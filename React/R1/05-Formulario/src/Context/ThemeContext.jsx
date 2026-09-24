import { createContext, useContext, useEffect, useState } from 'react';

/**
 * @typedef {Object} ThemeContextType
 * @property {'light'|'dark'} tema - Tema actual de la aplicación
 * @property {Function} toggleTema - Alterna entre modo claro y oscuro
 * @property {boolean} isDark - Indica si el tema actual es oscuro
 */

const ThemeContext = createContext(null);

const STORAGE_KEY = 'app-tema-oton';

/**
 * Provider del contexto de tema (claro/oscuro).
 * Gestiona la persistencia en localStorage y la clase 'dark' en <html>.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Componentes hijos a envolver
 */
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === 'light' || guardado === 'dark') return guardado;
    const prefiereOscuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefiereOscuro ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const toggleTema = () => {
    setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    tema,
    toggleTema,
    isDark: tema === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del tema.
 * Debe usarse dentro de <ThemeProvider>.
 *
 * @returns {ThemeContextType} Estado y acciones del tema
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return ctx;
}
