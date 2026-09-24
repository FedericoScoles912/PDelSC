import { useTheme } from '../Context/ThemeContext.jsx';
import ThemeToggle from '../Components/ThemeToggle.jsx';

export default function Header() {
  const { isDark } = useTheme();

  return (
    <header
      className={`w-full shadow-md sticky top-0 z-50 transition-colors duration-300
        ${isDark ? 'bg-dark-chocolate border-b border-dark-mostaza/40' : 'bg-light-beige border-b border-light-marron/40'}`}
    >
      <div className="container">
        <div className="row g-0 align-items-center py-3">
          <div className="col-10">
            <div className="d-flex align-items-center gap-2">
              <span className="text-2xl">🍂</span>
              <h1
                className={`m-0 text-xl font-bold
                  ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}
              >
                Ejercicio 2 · Tarjeta de presentación
              </h1>
            </div>
          </div>

          <div className="col-2 d-flex justify-content-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
