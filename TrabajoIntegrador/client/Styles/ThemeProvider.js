/**
 * ThemeProvider.js
 * Resuelve el esquema de color efectivo (claro/oscuro) y expone los tokens
 * de diseño a través del hook useTheme().
 *
 * Sincroniza NativeWind para que las clases `dark:` funcionen:
 *  - En web aplica la clase `dark` en <html>.
 *  - En nativo usa el setter de colorScheme de NativeWind (si está disponible).
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { themes, palette, chartColors, spacing } from './theme';

// Import tolerante: si NativeWind no expone el setter, seguimos funcionando.
let nwColorScheme;
try {
  // eslint-disable-next-line global-require
  ({ colorScheme: nwColorScheme } = require('nativewind'));
} catch {
  nwColorScheme = undefined;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const mode = useSelector((s) => s.theme?.mode ?? 'system');
  const systemScheme = useRNColorScheme();
  const scheme = mode === 'system' ? (systemScheme || 'light') : mode;

  useEffect(() => {
    try {
      nwColorScheme?.set?.(scheme);
      if (Platform.OS === 'web' && globalThis.document?.documentElement) {
        globalThis.document.documentElement.classList.toggle('dark', scheme === 'dark');
      }
    } catch {
      /* noop: la app sigue usando los tokens JS */
    }
  }, [scheme]);

  const value = useMemo(() => {
    const tokens = themes[scheme] || themes.light;
    return {
      scheme,
      isDark: scheme === 'dark',
      tokens,
      palette,
      chartColors,
      spacing,
      /** Clases NativeWind comunes para superficies. */
      ui: {
        screen: 'flex-1 bg-warm-50 dark:bg-warm-950',
        surface: 'bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700',
        textPrimary: 'text-warm-900 dark:text-warm-50',
        textMuted: 'text-warm-600 dark:text-warm-400',
      },
    };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** @returns {{scheme:'light'|'dark', isDark:boolean, tokens:object, palette:object, chartColors:string[], spacing:object, ui:object}} */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}

export default ThemeProvider;
