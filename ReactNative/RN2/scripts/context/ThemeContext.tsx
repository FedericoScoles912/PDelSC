import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '../types/theme';
import { storageService } from '../services/storageService';
import {
  AppTheme,
  lightColors,
  darkColors,
  spacing,
  borderRadius,
  typography,
  breakpoints,
} from '../../styles/theme';

export interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    storageService.getThemeMode().then((saved) => {
      if (isMounted) {
        setModeState(saved);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemScheme === 'dark';
  }, [mode, systemScheme]);

  const theme: AppTheme = useMemo(() => {
    return {
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      borderRadius,
      typography,
      breakpoints,
    };
  }, [isDark]);

  const setThemeMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await storageService.setThemeMode(newMode);
  };

  const toggleTheme = async () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  if (!isLoaded) {
    // Renderear con el tema del sistema mientras se recupera la preferencia
  }

  const value = useMemo(
    () => ({
      mode,
      isDark,
      theme,
      setThemeMode,
      toggleTheme,
    }),
    [mode, isDark, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
