import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);
const STORAGE_KEY = 'app.theme';

function applyThemeAttribute(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function detectInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (_) {}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * ThemeProvider — Provee tema claro/oscuro persistido.
 * Consumir con useTheme() hook.
 */
export function ThemeProvider({ children, initialTheme }) {
  const [theme, setThemeState] = useState(initialTheme || detectInitialTheme);

  useEffect(() => {
    applyThemeAttribute(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState((prev) => {
      if (next === 'toggle') return prev === 'light' ? 'dark' : 'light';
      return next === 'dark' ? 'dark' : 'light';
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggle: () => setTheme('toggle'),
  }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeContext;
