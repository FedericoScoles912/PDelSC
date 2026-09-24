import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../Context/ThemeContext.jsx';
import { useTareas } from '../Context/TareasContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';

/**
 * Barra de navegación común a todas las páginas.
 * Incluye logo, enlaces de rutas, toggle de tema y botón de exportar JSON.
 * @component
 */
function Navbar() {
  const { esOscuro, toggleTema } = useTheme();
  const { exportarJSON } = useTareas();
  const { mostrarToast } = useToast();
  const location = useLocation();

  const handleExportar = () => {
    exportarJSON();
    mostrarToast({
      mensaje: 'Tareas exportadas como JSON correctamente',
      tipo: 'exito'
    });
  };

  const isActive = (ruta) =>
    location.pathname === ruta
      ? 'border-b-2 border-white pb-1'
      : 'opacity-90 hover:opacity-100';

  return (
    <nav className="bg-navbar text-otoño-claro-crema shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="row align-items-center g-3">
          <div className="col-12 col-md-4 col-lg-3">
            <Link to="/" className="text-decoration-none text-inherit">
              <h1 className="m-0 fs-4 fw-bold d-flex align-items-center gap-2">
                <span aria-hidden="true">🍂</span>
                <span>Gestor de Tareas</span>
              </h1>
            </Link>
          </div>

          <div className="col-12 col-md-4 col-lg-5">
            <div className="d-flex gap-4 align-items-center justify-content-center justify-content-md-start fs-6">
              <Link to="/" className={`text-decoration-none text-white ${isActive('/')}`}>
                Inicio
              </Link>
              <Link
                to="/crear"
                className={`text-decoration-none text-white ${isActive('/crear')}`}
              >
                Crear tarea
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-4 col-lg-4">
            <div className="d-flex gap-2 align-items-center justify-content-center justify-content-md-end">
              <button
                type="button"
                onClick={handleExportar}
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                title="Exportar tareas como JSON"
              >
                <span aria-hidden="true">⬇️</span>
                <span className="d-none d-sm-inline">Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={toggleTema}
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span aria-hidden="true">{esOscuro ? '☀️' : '🌙'}</span>
                <span className="d-none d-sm-inline">{esOscuro ? 'Claro' : 'Oscuro'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
