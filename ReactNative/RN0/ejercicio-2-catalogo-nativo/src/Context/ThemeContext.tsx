import { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type AppColors } from '../Styles/colors';
interface ThemeValue { mode: 'light' | 'dark'; colors: AppColors; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeValue | null>(null);
/** Provee tema basado en el sistema y una acción para modificarlo manualmente. */
export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const system = useColorScheme(); const [mode, setMode] = useState<'light' | 'dark'>(system === 'dark' ? 'dark' : 'light');
  const value = useMemo<ThemeValue>(() => ({ mode, colors: palettes[mode], toggleTheme: () => setMode((current) => current === 'light' ? 'dark' : 'light') }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
/** @returns Tema actual; solo se utiliza dentro de ThemeProvider. */
export function useTheme(): ThemeValue { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme requiere ThemeProvider'); return value; }
