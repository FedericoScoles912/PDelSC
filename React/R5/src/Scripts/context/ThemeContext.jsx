import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../utils/constants.js';

export const ThemeContext = createContext(null);

/** Tema inicial: el guardado en localStorage o la preferencia del sistema. */
function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Provee el modo claro/oscuro de forma global.
 *
 * El tema se aplica como clase `dark` en <html>, que es lo que Tailwind usa
 * (`darkMode: 'class'`). La preferencia se persiste en localStorage y se
 * aplica antes del primer paint desde index.html para evitar el flash.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  /** Alterna entre claro y oscuro. */
  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, setTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
