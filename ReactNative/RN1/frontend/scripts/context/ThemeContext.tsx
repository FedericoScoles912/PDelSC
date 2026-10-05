import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, ThemeMode, lightTheme, darkTheme } from '../../styles/theme';
import { THEME_STORAGE_KEY } from '../utils/constants';

export interface ThemeContextType {
  mode: ThemeMode;
  theme: ColorPalette;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (newMode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const initialMode: ThemeMode = systemColorScheme === 'dark' ? 'dark' : 'light';

  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  // Cargar preferencia guardada en AsyncStorage al iniciar
  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode === 'light' || savedMode === 'dark') {
          setModeState(savedMode);
        }
      } catch (error) {
        console.warn('No se pudo cargar la preferencia de tema desde almacenamiento:', error);
      }
    }
    loadSavedTheme();
  }, []);

  const setTheme = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('No se pudo guardar la preferencia de tema:', error);
    }
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setTheme(nextMode);
  };

  const currentTheme: ColorPalette = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: currentTheme,
        isDark: mode === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
