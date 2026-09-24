import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * Provider que maneja el tema claro/oscuro de la aplicación.
 * Persiste la selección en localStorage.
 * @component
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem('tema-app');
    return guardado || 'claro';
  });

  useEffect(() => {
    localStorage.setItem('tema-app', tema);
    const root = document.documentElement;
    if (tema === 'oscuro') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [tema]);

  /**
   * Alterna entre tema claro y oscuro.
   */
  const toggleTema = () => {
    setTema((prev) => (prev === 'claro' ? 'oscuro' : 'claro'));
  };

  /**
   * Indica si el tema actual es oscuro.
   * @type {boolean}
   */
  const esOscuro = tema === 'oscuro';

  return (
    <ThemeContext.Provider value={{ tema, esOscuro, toggleTema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de tema.
 * @returns {{ tema: string, esOscuro: boolean, toggleTema: Function, setTema: Function }}
 */
export function useTheme() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return contexto;
}

export default ThemeContext;
