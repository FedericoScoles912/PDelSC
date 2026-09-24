import { useTheme } from '../Context/ThemeContext.jsx';
import ThemeToggle from '../Components/ThemeToggle.jsx';

/**
 * Cabecera/navbar común a toda la aplicación.
 * Incluye logo/título, menú de ejercicios y el toggle de tema.
 *
 * @param {Object} props
 * @param {string} props.ejercicioActivo - ID del ejercicio seleccionado actualmente
 * @param {Function} props.onSeleccionarEjercicio - Callback (id) => void al elegir un ejercicio
 * @param {Array<{id:string,nombre:string,numero:number}>} props.ejercicios - Listado de ejercicios
 */
export default function Header({ ejercicioActivo, onSeleccionarEjercicio, ejercicios }) {
  const { isDark } = useTheme();

  return (
    <header
      className={`w-full shadow-md sticky top-0 z-50 transition-colors duration-300
        ${isDark ? 'bg-dark-chocolate border-b border-dark-mostaza/40' : 'bg-light-beige border-b border-light-marron/40'}`}
    >
      <div className="container">
        <div className="row g-0 align-items-center py-3">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-2xl">🍂</span>
              <h1
                className={`m-0 text-xl font-bold
                  ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}
              >
                Ejercicios React
              </h1>
            </div>
          </div>

          <div className="col-12 col-md-6 mt-3 mt-md-0">
            <nav className="d-flex flex-wrap gap-2">
              {ejercicios.map((ej) => {
                const activo = ejercicioActivo === ej.id;
                return (
                  <button
                    key={ej.id}
                    onClick={() => onSeleccionarEjercicio(ej.id)}
                    className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 border-0
                      ${activo
                        ? isDark
                          ? 'bg-dark-mostaza text-dark-chocolate shadow'
                          : 'bg-light-terracota text-light-crema shadow'
                        : isDark
                          ? 'bg-dark-gris text-dark-crema hover:bg-dark-mostaza/30'
                          : 'bg-light-crema text-light-oliva hover:bg-light-marron/20'
                      }`}
                  >
                    <span className="fw-bold me-1">{ej.numero}.</span>
                    {ej.nombre}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="col-12 col-md-2 d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
