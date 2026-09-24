import Header from './Header.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Layout principal que envuelve toda la aplicación.
 * Aplica el fondo del tema, el Header y un contenedor responsive para el contenido.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Contenido de la página
 */
export default function LayoutApp({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen w-full transition-colors duration-300
        ${isDark ? 'tema-oscuro' : 'tema-claro'}`}
    >
      <Header />

      <main className="flex-1 w-full py-5 md:py-8">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10 col-xxl-9 animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </main>

      <footer
        className={`py-4 text-center text-sm transition-colors duration-300 border-t
          ${isDark
            ? 'bg-dark-chocolate border-dark-mostaza/30 text-dark-crema/70'
            : 'bg-light-beige border-light-marron/30 text-light-oliva/80'}`}
      >
        <div className="container">
          <p className="m-0">🍁 Ejercicio 5 · React + Vite + TailwindCSS + Bootstrap</p>
        </div>
      </footer>
    </div>
  );
}
