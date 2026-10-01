import { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes } from '../Styles/colors';

const ThemeContext = createContext(null);
/** Provee una paleta otoñal y permite alternar el modo inicial del sistema. */
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState(systemScheme === 'dark' ? 'dark' : 'light');
  const value = useMemo(() => ({ mode, colors: palettes[mode], toggleTheme: () => setMode((current) => current === 'light' ? 'dark' : 'light') }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
/** Devuelve el tema actual y su acción de cambio. */
export const useTheme = () => useContext(ThemeContext);
