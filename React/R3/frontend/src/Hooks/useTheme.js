import { useContext } from 'react';
import { ThemeContext } from '../Contexts/ThemeContext.jsx';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
export default useTheme;
